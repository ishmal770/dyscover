from __future__ import annotations

import math
from datetime import UTC, date, datetime, timedelta
from typing import Any

from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel, Field
from supabase import Client

from app.services.adaptive import (
    EPSILON,
    GAME_IDS,
    GAMES,
    apply_override,
    choose_item,
    update_skill,
)
from app.services.supabase import get_admin_client, get_user_id

router = APIRouter(prefix="/api", tags=["learning"])
EXPERT_ROLES = {"teacher", "therapist", "parent"}


class ActionRequest(BaseModel):
    action: str
    grade_tier: str | None = None
    history: list[dict[str, Any]] = Field(default_factory=list)
    game_type: str | None = None
    accuracy: float | None = None
    completion_time_ms: int | None = None
    attempt_count: int = 1
    error_type: str | None = None
    question_id: int | None = None
    student_id: str | None = None
    notes: str | None = None
    focus_skill: str | None = None


def _rows(response: Any) -> list[dict[str, Any]]:
    return response.data or []


def _one(response: Any) -> dict[str, Any] | None:
    data = response.data
    if isinstance(data, list):
        return data[0] if data else None
    return data


def _mastery_percent(rating: Any) -> int:
    return round(100 / (1 + math.exp(-float(rating))))


def _profile(db: Client, user_id: str) -> dict[str, Any]:
    result = db.table("profiles").select(
        "id, full_name, role, grade_tier, current_world, diagnostic_completed, flagged_for_review"
    ).eq("id", user_id).maybe_single().execute()
    profile = _one(result)
    if not profile:
        raise HTTPException(409, "Your profile is not ready. Sign out and back in, then try again.")
    return profile


def _active_focus(db: Client, student_id: str) -> str | None:
    result = db.table("expert_feedback").select("focus_skill, focus_until") \
        .eq("student_id", student_id).not_.is_("focus_skill", "null") \
        .order("created_at", desc=True).limit(1).execute()
    item = _one(result)
    if not item or not item.get("focus_until"):
        return None
    try:
        until = datetime.fromisoformat(item["focus_until"])
        return item.get("focus_skill") if until > datetime.now(UTC) else None
    except (ValueError, TypeError):
        return None


def _make_plan(db: Client, student_id: str, profile: dict[str, Any]) -> dict[str, Any]:
    today = date.today().isoformat()
    current = _one(db.table("daily_lesson_plans").select("*").eq("student_id", student_id)
                   .eq("plan_date", today).maybe_single().execute())
    world = max(1, int(profile.get("current_world") or 1))
    if current and int(current.get("world") or 1) >= world:
        return current

    skills = _rows(db.table("student_skill_levels").select("game_type, skill_rating, needs_intervention")
                   .eq("student_id", student_id).execute())
    ratings = {row["game_type"]: float(row["skill_rating"]) for row in skills}
    focus = _active_focus(db, student_id)
    ranked = sorted(GAME_IDS, key=lambda game: (game != focus, ratings.get(game, -1)))
    deficient = [game for game in ranked if ratings.get(game, -1) < 1]
    pool = deficient or ranked
    start = 0 if focus else (date.today().toordinal() % len(pool))
    rotated = pool[start:] + pool[:start]
    selected = rotated[: min(3, len(rotated))]
    items = [{
        "game_type": game, "title": GAMES[game]["title"], "skill": GAMES[game]["skill"],
        "lesson_id": game, "world": world, "target_minutes": 5, "status": "pending",
        "reason": "Priority practice set by your learning expert." if game == focus else
            "Extra practice for a skill that needs support." if ratings.get(game, -1) < 0 else "Keep this skill growing.",
        "order": index + 1,
    } for index, game in enumerate(selected)]
    if current:
        old_items = current.get("items") or []
        items = old_items + [new for new in items if not any(
            old.get("game_type") == new["game_type"] and old.get("status") != "completed" for old in old_items
        )]
    result = db.table("daily_lesson_plans").upsert({
        "student_id": student_id, "plan_date": today, "world": world,
        "target_minutes": min(20, 15 if not current else int(current.get("target_minutes") or 15) + 5),
        "status": "active", "items": items,
    }, on_conflict="student_id,plan_date").select("*").single().execute()
    return _one(result) or {}


def _recommendation(db: Client, profile: dict[str, Any], plan: dict[str, Any]) -> dict[str, Any]:
    focus = _active_focus(db, profile["id"])
    pending = [item for item in plan.get("items", []) if item.get("status") != "completed"]
    game = focus or (pending[0].get("game_type") if pending else None) or "monkeyMixUpGame"
    skill = _one(db.table("student_skill_levels").select("skill_rating")
                 .eq("student_id", profile["id"]).eq("game_type", game).maybe_single().execute())
    theta = float(skill.get("skill_rating", 0)) if skill else 0
    candidates = _rows(db.table("diagnostic_questions").select("id, game_type, difficulty, world")
                       .eq("game_type", game).eq("grade_tier", profile["grade_tier"])
                       .lte("world", max(1, int(profile.get("current_world") or 1))).limit(100).execute())
    candidates = apply_override(candidates, {"focus_skill": focus} if focus else None)
    question = choose_item(theta, candidates) if candidates else None
    return {
        "game_type": game, "title": GAMES[game]["title"], "skill": GAMES[game]["skill"],
        "question_id": question.get("id") if question else None,
        "difficulty": question.get("difficulty") if question else None,
        "selection": "expert_focus" if focus == game else "epsilon_greedy_80_20" if question else "local_game_bank",
        "explore_probability": EPSILON,
    }


def _dashboard(db: Client, user_id: str) -> dict[str, Any]:
    profile = _profile(db, user_id)
    plan = _make_plan(db, user_id, profile) if profile.get("diagnostic_completed") else None
    skills = _rows(db.table("student_skill_levels").select("*").eq("student_id", user_id).execute())
    feedback = _rows(db.table("expert_feedback").select("notes, focus_skill, focus_until, created_at")
                     .eq("student_id", user_id).order("created_at", desc=True).limit(10).execute())
    return {"profile": profile, "plan": plan,
            "skills": [{**row, "mastery_percent": _mastery_percent(row["skill_rating"])} for row in skills],
            "expert_feedback": feedback,
            "recommendation": _recommendation(db, profile, plan) if plan else None}


def _world_progression(db: Client, student_id: str, profile: dict[str, Any]) -> int:
    if int(profile.get("current_world") or 1) >= 2:
        return int(profile["current_world"])
    skill_rows = _rows(db.table("student_skill_levels").select("game_type, skill_rating")
                       .eq("student_id", student_id).execute())
    ratings = {row["game_type"]: float(row["skill_rating"]) for row in skill_rows}
    if not all(ratings.get(game, -99) >= 1 for game in GAME_IDS):
        return 1
    sessions = _rows(db.table("game_sessions").select("game_type, accuracy")
                      .eq("student_id", student_id).order("created_at", desc=True).limit(300).execute())
    for game in GAME_IDS:
        recent = [float(row["accuracy"]) for row in sessions if row["game_type"] == game][:3]
        if len(recent) < 3 or sum(recent) / len(recent) < .75:
            return 1
    db.table("profiles").update({"current_world": 2}).eq("id", student_id).execute()
    return 2


def _expert_dashboard(db: Client, expert_id: str, target_id: str | None) -> dict[str, Any]:
    expert = _profile(db, expert_id)
    if expert.get("role") not in EXPERT_ROLES:
        raise HTTPException(403, "This account is not set up as a teacher, therapist, or parent.")
    assigned = _rows(db.table("expert_students").select("student_id").eq("expert_id", expert_id).execute())
    ids = list({row["student_id"] for row in assigned})
    if target_id:
        if target_id not in ids:
            raise HTTPException(403, "You can only view students assigned to your account.")
        ids = [target_id]
    if not ids:
        return {"students": [], "selected": None}
    profiles = _rows(db.table("profiles").select(
        "id, full_name, grade_tier, current_world, diagnostic_completed, flagged_for_review"
    ).in_("id", ids).execute())
    skills = _rows(db.table("student_skill_levels").select("*").in_("student_id", ids).execute())
    sessions = _rows(db.table("game_sessions").select("*").in_("student_id", ids)
                     .order("created_at", desc=True).limit(400).execute())
    plans = _rows(db.table("daily_lesson_plans").select("*").in_("student_id", ids)
                  .order("plan_date", desc=True).limit(100).execute())
    feedback = _rows(db.table("expert_feedback").select("*").in_("student_id", ids)
                     .order("created_at", desc=True).limit(100).execute())
    summaries = _rows(db.table("student_game_summary").select("*").in_("student_id", ids).execute())
    errors = _rows(db.table("student_error_summary").select("*").in_("student_id", ids).execute())
    students = [{**profile,
        "skills": [{**row, "mastery_percent": _mastery_percent(row["skill_rating"])}
                   for row in skills if row["student_id"] == profile["id"]],
        "sessions": [row for row in sessions if row["student_id"] == profile["id"]],
        "plans": [row for row in plans if row["student_id"] == profile["id"]],
        "feedback": [row for row in feedback if row["student_id"] == profile["id"]],
        "summaries": [row for row in summaries if row["student_id"] == profile["id"]],
        "errors": [row for row in errors if row["student_id"] == profile["id"]],
    } for profile in profiles]
    return {"students": students, "selected": next((s for s in students if s["id"] == target_id), None)}


@router.post("/learning")
def learning_action(body: ActionRequest, authorization: str | None = Header(default=None)) -> dict[str, Any]:
    user_id = get_user_id(authorization)
    db = get_admin_client()
    profile = _profile(db, user_id)

    if body.action in {"student_dashboard", "daily_plan", "next_content"}:
        if body.action == "daily_plan" and not profile.get("diagnostic_completed"):
            raise HTTPException(409, "Complete the placement diagnostic to get a daily plan.")
        return _dashboard(db, user_id)

    if body.action == "record_session":
        game = body.game_type
        accuracy = body.accuracy
        duration = body.completion_time_ms
        if game not in GAME_IDS or accuracy is None or not 0 <= accuracy <= 1 or duration is None or duration < 0 or body.attempt_count < 1:
            raise HTTPException(400, "The game result is invalid.")
        if not profile.get("diagnostic_completed"):
            raise HTTPException(409, "Complete the placement diagnostic first.")
        difficulty = 0.0
        if body.question_id is not None:
            question = _one(db.table("diagnostic_questions").select("id, difficulty, world")
                            .eq("id", body.question_id).eq("game_type", game)
                            .eq("grade_tier", profile["grade_tier"])
                            .lte("world", profile.get("current_world") or 1).maybe_single().execute())
            if not question:
                raise HTTPException(400, "That question is not available for this student.")
            difficulty = float(question["difficulty"])
        previous = _one(db.table("student_skill_levels").select("skill_rating")
                         .eq("student_id", user_id).eq("game_type", game).maybe_single().execute())
        theta = update_skill(float(previous["skill_rating"]) if previous else 0.0, difficulty, accuracy)
        db.table("game_sessions").insert({
            "student_id": user_id, "game_type": game, "question_id": body.question_id,
            "accuracy": accuracy, "completion_time_ms": duration, "attempt_count": body.attempt_count,
            "error_type": (body.error_type or "")[:80] or None,
        }).execute()
        db.table("student_skill_levels").upsert({
            "student_id": user_id, "game_type": game, "skill_rating": round(theta, 2),
            "needs_intervention": theta < -.5, "last_error_type": body.error_type,
            "updated_at": datetime.now(UTC).isoformat(),
        }, on_conflict="student_id,game_type").execute()
        recent = _rows(db.table("game_sessions").select("accuracy").eq("student_id", user_id)
                       .eq("game_type", game).order("created_at", desc=True).limit(3).execute())
        if len(recent) == 3 and all(float(item["accuracy"]) < .5 for item in recent):
            db.table("profiles").update({"flagged_for_review": True}).eq("id", user_id).execute()
        plan = _one(db.table("daily_lesson_plans").select("items").eq("student_id", user_id)
                    .eq("plan_date", date.today().isoformat()).maybe_single().execute())
        if plan and isinstance(plan.get("items"), list):
            marked = False
            items = []
            for item in plan["items"]:
                if not marked and item.get("game_type") == game and item.get("status") != "completed":
                    item = {**item, "status": "completed"}
                    marked = True
                items.append(item)
            status = "completed" if all(item.get("status") == "completed" for item in items) else "active"
            db.table("daily_lesson_plans").update({"items": items, "status": status}) \
                .eq("student_id", user_id).eq("plan_date", date.today().isoformat()).execute()
        world = _world_progression(db, user_id, profile)
        profile["current_world"] = world
        plan = _make_plan(db, user_id, profile)
        return {"saved": True, "skill_rating": round(theta, 2), "mastery_percent": round(100 / (1 + math.exp(-theta))),
                "needs_intervention": theta < -.5, "current_world": world, "daily_plan": plan,
                "recommendation": _recommendation(db, profile, plan)}

    if body.action == "expert_dashboard":
        return _expert_dashboard(db, user_id, body.student_id)

    if body.action == "expert_feedback":
        if profile.get("role") not in EXPERT_ROLES:
            raise HTTPException(403, "This account is not an expert account.")
        student_id = body.student_id
        note = (body.notes or "").strip()[:2000]
        focus = body.focus_skill if body.focus_skill in GAME_IDS else None
        if not student_id or not note:
            raise HTTPException(400, "Choose an assigned student and enter a note.")
        assignment = _one(db.table("expert_students").select("student_id").eq("expert_id", user_id)
                          .eq("student_id", student_id).maybe_single().execute())
        if not assignment:
            raise HTTPException(403, "That student is not assigned to you.")
        until = (datetime.now(UTC) + timedelta(days=7)).isoformat() if focus else None
        db.table("expert_feedback").insert({"expert_id": user_id, "student_id": student_id,
            "notes": note, "focus_skill": focus, "focus_level": 2 if focus else None, "focus_until": until}).execute()
        if focus:
            plan = _one(db.table("daily_lesson_plans").select("items").eq("student_id", student_id)
                        .eq("plan_date", date.today().isoformat()).maybe_single().execute())
            if plan and isinstance(plan.get("items"), list):
                rest = [item for item in plan["items"] if item.get("game_type") != focus]
                existing = next((item for item in plan["items"] if item.get("game_type") == focus), None)
                focus_item = {**(existing or {}), "game_type": focus, "title": GAMES[focus]["title"],
                    "skill": GAMES[focus]["skill"], "lesson_id": focus, "world": profile.get("current_world") or 1,
                    "target_minutes": 5, "status": "pending", "reason": "Priority practice assigned by your learning expert.", "order": 1}
                db.table("daily_lesson_plans").update({"items": [focus_item, *rest], "status": "active"}) \
                    .eq("student_id", student_id).eq("plan_date", date.today().isoformat()).execute()
        return {"saved": True, "focus_skill": focus, "focus_until": until}

    raise HTTPException(400, "Unknown adaptive learning action.")
