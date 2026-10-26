from __future__ import annotations

import math
import string
from datetime import date
from typing import Any

from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel, Field

from app.config import settings
from app.routes.learning import _make_plan, _profile
from app.services.adaptive import GAME_IDS, choose_item, update_skill
from app.services.supabase import get_admin_client, get_user_id

router = APIRouter(prefix="/api/placement", tags=["placement"])

COUNT = len(GAME_IDS)


class PlacementRequest(BaseModel):
    action: str
    grade_tier: str | None = None
    history: list[dict[str, Any]] = Field(default_factory=list)


def _public(question: dict[str, Any]) -> dict[str, Any]:
    return {key: value for key, value in question.items() if key not in {"answer", "difficulty"}}


def _choices(answer: str, distractors: list[str] | None = None) -> list[str]:
    result = []
    for option in [answer, *(distractors or []), *string.ascii_uppercase]:
        option = str(option).strip().upper()
        if option and option not in result:
            result.append(option)
        if len(result) == 3:
            break
    return result


def _question_from_row(row: dict[str, Any], candidates: list[dict[str, Any]]) -> dict[str, Any]:
    payload = row.get("payload") or {}
    game = row["game_type"]
    question: dict[str, Any] = {
        "id": row["id"], "game_type": game, "difficulty": float(row["difficulty"]),
    }
    if game == "monkeyMixUpGame":
        template = payload.get("template")
        answer = str(payload.get("answer", "")).upper()
        if not isinstance(template, list) or not answer or None not in template:
            raise HTTPException(503, "A vowel question in Supabase is missing its template or answer.")
        question.update({"type": "vowel", "prompt": f"Tap the missing vowel. It makes the {payload.get('sound', '')} sound.",
                         "template": template, "answer": answer,
                         "word": "".join(answer if letter is None else str(letter) for letter in template),
                         "choices": ["A", "E", "I", "O", "U"]})
    elif game == "syllableSafariGame":
        syllables = payload.get("syllables")
        word = str(payload.get("word", "")).upper()
        if not isinstance(syllables, list) or not word:
            raise HTTPException(503, "A syllable question in Supabase is missing its word or syllables.")
        answer = str(len(syllables))
        question.update({"type": "choice", "prompt": "How many word parts do you hear?", "word": word,
                         "choices": [str(max(1, len(syllables) - 1)), answer, str(len(syllables) + 1)],
                         "answer": answer})
    elif game == "lizardLookoutsGame":
        word = str(payload.get("word", "")).upper()
        answer = str(payload.get("target", "")).upper()
        if not word or not answer:
            raise HTTPException(503, "A letter-recognition question in Supabase is missing its word or target.")
        distractors = [str(item).upper() for item in payload.get("distractors", [])]
        question.update({"type": "choice", "prompt": f"Find the letter {answer} in this word.", "word": word,
                         "choices": _choices(answer, distractors), "answer": answer})
    elif game == "lionsLettersGame":
        word = str(payload.get("word", "")).upper()
        answer = str(payload.get("letter", "")).upper()
        if not word or not answer:
            raise HTTPException(503, "A handwriting question in Supabase is missing its word or letter.")
        question.update({"type": "choice", "prompt": "Which letter starts this word?", "word": word,
                         "choices": _choices(answer), "answer": answer})
    elif game == "cheetahChallengeGame":
        word = str(payload.get("word", "")).upper()
        if not word:
            raise HTTPException(503, "A reading question in Supabase is missing its word.")
        alternatives = [str((item.get("payload") or {}).get("word", "")).upper()
                        for item in candidates if item.get("id") != row.get("id")]
        question.update({"type": "choice", "prompt": "Tap the word shown.", "word": word,
                         "choices": [word, *dict.fromkeys(item for item in alternatives if item and item != word)][:3],
                         "answer": word})
    elif game == "parrotPairsGame":
        first = str(payload.get("first", "")).upper()
        second = str(payload.get("second", "")).upper()
        difference = str(payload.get("different", "")).upper()
        if not first or not second or not difference:
            raise HTTPException(503, "A letter-order question in Supabase is missing its word pair or difference.")
        if difference.startswith("EXTRA "):
            answer = difference.removeprefix("EXTRA ").strip()
            prompt = "Which letter appears only in the first word?"
            distractors = [*first, *second]
        else:
            pair = difference.split(" ORDER", 1)[0].replace("/", " ").split()
            if len(pair) < 2:
                raise HTTPException(503, "A letter-order question in Supabase has an unsupported difference format.")
            prompt = "Which letter is in the second word at the changing spot?"
            answer = pair[1]
            distractors = [pair[0], *first, *second]
        question.update({"type": "choice", "prompt": prompt, "word": f"{first}   {second}",
                         "choices": _choices(answer, distractors), "answer": answer})
    else:
        raise HTTPException(503, "Supabase has an unsupported game type in the placement question bank.")
    return question


def _candidates(db: Any, game_type: str, grade_tier: str) -> list[dict[str, Any]]:
    rows = db.table("diagnostic_questions").select(
        "id, game_type, grade_tier, difficulty, world, payload"
    ).eq("game_type", game_type).eq("grade_tier", grade_tier).lte("world", 1).order("difficulty").execute().data or []
    if not rows:
        raise HTTPException(503, f"No placement questions are available in Supabase for {game_type} ({grade_tier}).")
    return rows


def _next_question(db: Any, user_id: str, game_type: str, grade_tier: str) -> dict[str, Any]:
    candidates = _candidates(db, game_type, grade_tier)
    skill = db.table("student_skill_levels").select("skill_rating").eq(
        "student_id", user_id).eq("game_type", game_type).maybe_single().execute()
    skill_row = skill.data if skill is not None else None
    theta = float(skill_row.get("skill_rating", 0)) if isinstance(skill_row, dict) else 0.0
    selected = choose_item(theta, candidates)
    return _question_from_row(selected, candidates)


def _evaluate(db: Any, history: list[dict[str, Any]], initial_band: str) -> tuple[str, int, list[dict[str, Any]]]:
    if len(history) > COUNT:
        raise HTTPException(400, "There are too many answers. Restart the diagnostic.")
    band, score, scored = initial_band, 0, []
    for index, answer in enumerate(history):
        game_type = GAME_IDS[index]
        question_id = answer.get("question_id")
        if not isinstance(question_id, int) or not isinstance(answer.get("answer"), str):
            raise HTTPException(400, "The diagnostic answers are out of order. Restart it.")
        row_result = db.table("diagnostic_questions").select(
            "id, game_type, grade_tier, difficulty, world, payload"
        ).eq("id", question_id).maybe_single().execute()
        row = row_result.data if row_result is not None else None
        if not isinstance(row, dict) or row.get("game_type") != game_type or row.get("grade_tier") != band or int(row.get("world") or 1) > 1:
            raise HTTPException(400, "That placement question is not available in the current sequence. Restart the diagnostic.")
        question = _question_from_row(row, _candidates(db, game_type, band))
        duration = answer.get("duration_ms")
        if not isinstance(duration, int) or duration < 0 or duration > 600_000:
            raise HTTPException(400, "The answer time is invalid.")
        correct = answer["answer"] == question["answer"]
        score += int(correct)
        scored.append({"question": question, "correct": correct, "duration": duration})
        band = "g35" if (band == "k2" and correct) or (band == "g35" and correct) else "k2"
    return band, score, scored


@router.post("")
def placement_action(body: PlacementRequest, authorization: str | None = Header(default=None)) -> dict[str, Any]:
    user_id = get_user_id(authorization)
    db = get_admin_client()
    profile = _profile(db, user_id)
    if body.action == "reset":
        if not settings.ENABLE_DEV_DIAGNOSTIC_RESET:
            raise HTTPException(404, "Placement reset is disabled on this backend.")
        db.table("profiles").update({
            "diagnostic_completed": False,
            "current_world": 1,
            "flagged_for_review": False,
        }).eq("id", user_id).execute()
        db.table("daily_lesson_plans").update({"status": "expired"}) \
            .eq("student_id", user_id).eq("plan_date", date.today().isoformat()).execute()
        return {"reset": True}
    if body.action == "start":
        if profile.get("diagnostic_completed"):
            raise HTTPException(409, "This diagnostic is already complete.")
        band = body.grade_tier if body.grade_tier in {"k2", "g35"} else "k2"
        db.table("profiles").update({"grade_tier": band}).eq("id", user_id).execute()
        question = _next_question(db, user_id, GAME_IDS[0], band)
        return {"question": _public(question), "question_number": 1, "total": COUNT}
    if body.action != "answer":
        raise HTTPException(400, "Unknown placement action.")
    if profile.get("diagnostic_completed"):
        raise HTTPException(409, "The diagnostic is already complete.")
    initial_band = profile.get("grade_tier") if profile.get("grade_tier") in {"k2", "g35"} else "k2"
    band, correct_count, scored = _evaluate(db, body.history, initial_band)
    if len(scored) < COUNT:
        q = _next_question(db, user_id, GAME_IDS[len(scored)], band)
        return {"correct": scored[-1]["correct"], "question": _public(q), "question_number": len(scored) + 1,
                "total": COUNT, "current_band": band}

    ratings: dict[str, float] = {}
    session_rows = []
    skill_rows = []
    for item in scored:
        question = item["question"]
        theta = update_skill(0, float(question["difficulty"]), float(item["correct"]))
        game = question["game_type"]
        ratings[game] = round(theta, 2)
        session_rows.append({"student_id": user_id, "game_type": game, "question_id": question["id"],
            "accuracy": float(item["correct"]), "completion_time_ms": item["duration"],
            "attempt_count": 1, "error_type": None if item["correct"] else "placement_missed"})
        skill_rows.append({"student_id": user_id, "game_type": game, "skill_rating": round(theta, 2),
            "needs_intervention": theta < 0, "last_error_type": None if item["correct"] else "placement_missed"})
    db.table("game_sessions").insert(session_rows).execute()
    db.table("student_skill_levels").upsert(skill_rows, on_conflict="student_id,game_type").execute()
    first_game = GAME_IDS[0] if correct_count <= 2 else GAME_IDS[4] if correct_count <= 4 else GAME_IDS[1]
    db.table("profiles").update({"grade_tier": band, "diagnostic_completed": True,
        "current_world": 1, "flagged_for_review": correct_count <= 2}).eq("id", user_id).execute()
    _make_plan(db, user_id, {**profile, "grade_tier": band, "current_world": 1, "diagnostic_completed": True})
    return {"complete": True, "correct": correct_count, "total": COUNT, "grade_tier": band,
            "start_lesson_id": first_game,
            "skills": [{"game_type": game, "skill_rating": rating,
                        "mastery_percent": round(100 / (1 + math.exp(-rating)))} for game, rating in ratings.items()]}
