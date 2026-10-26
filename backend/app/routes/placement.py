from __future__ import annotations

import math
from typing import Any

from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel, Field

from app.routes.learning import _make_plan, _profile
from app.services.adaptive import GAME_IDS, update_skill
from app.services.supabase import get_admin_client, get_user_id

router = APIRouter(prefix="/api/placement", tags=["placement"])

# A short initial baseline covers each of the six skills. The answers stay on
# this server; clients receive only prompts and choices.
QUESTIONS: dict[str, list[dict[str, Any]]] = {
    "k2": [
        {"id": "k2-parrot-cat", "game_type": GAME_IDS[0], "type": "word", "prompt": "Listen, then tap the word you hear.", "word": "cat", "choices": ["cut", "cat", "cot"], "answer": "cat", "difficulty": -1},
        {"id": "k2-syllable-tiger", "game_type": GAME_IDS[1], "type": "choice", "prompt": "How many word parts do you hear?", "word": "tiger", "choices": ["1", "2", "3"], "answer": "2", "difficulty": -1},
        {"id": "k2-monkey-sun", "game_type": GAME_IDS[2], "type": "vowel", "prompt": "Tap the missing vowel.", "word": "sun", "choices": ["A", "E", "I", "O", "U"], "template": ["S", None, "N"], "answer": "U", "difficulty": -1},
        {"id": "k2-cheetah-dog", "game_type": GAME_IDS[3], "type": "word", "prompt": "Listen, then tap the word you hear.", "word": "dog", "choices": ["dig", "dug", "dog"], "answer": "dog", "difficulty": -1},
        {"id": "k2-lizard-bat", "game_type": GAME_IDS[4], "type": "choice", "prompt": "Tap the first letter in this word.", "word": "bat", "choices": ["b", "d", "p"], "answer": "b", "difficulty": -1},
        {"id": "k2-lion-sun", "game_type": GAME_IDS[5], "type": "choice", "prompt": "Tap the first letter in this word.", "word": "sun", "choices": ["s", "m", "t"], "answer": "s", "difficulty": -1},
    ],
    "g35": [
        {"id": "g35-parrot-angle", "game_type": GAME_IDS[0], "type": "word", "prompt": "Listen, then tap the word you hear.", "word": "angle", "choices": ["angel", "angry", "angle"], "answer": "angle", "difficulty": 1},
        {"id": "g35-syllable-butterfly", "game_type": GAME_IDS[1], "type": "choice", "prompt": "How many word parts do you hear?", "word": "butterfly", "choices": ["2", "3", "4"], "answer": "3", "difficulty": 1},
        {"id": "g35-monkey-frog", "game_type": GAME_IDS[2], "type": "vowel", "prompt": "Tap the missing vowel.", "word": "frog", "choices": ["A", "E", "I", "O", "U"], "template": ["F", "R", None, "G"], "answer": "O", "difficulty": 1},
        {"id": "g35-cheetah-bridge", "game_type": GAME_IDS[3], "type": "word", "prompt": "Listen, then tap the word you hear.", "word": "bridge", "choices": ["bridge", "bright", "bride"], "answer": "bridge", "difficulty": 1},
        {"id": "g35-lizard-drift", "game_type": GAME_IDS[4], "type": "choice", "prompt": "Tap the first letter in this word.", "word": "drift", "choices": ["b", "d", "p"], "answer": "d", "difficulty": 1},
        {"id": "g35-lion-planet", "game_type": GAME_IDS[5], "type": "choice", "prompt": "Tap the first letter in this word.", "word": "planet", "choices": ["p", "q", "b"], "answer": "p", "difficulty": 1},
    ],
}
COUNT = len(GAME_IDS)


class PlacementRequest(BaseModel):
    action: str
    grade_tier: str | None = None
    history: list[dict[str, Any]] = Field(default_factory=list)


def _public(question: dict[str, Any]) -> dict[str, Any]:
    return {key: value for key, value in question.items() if key not in {"answer", "difficulty"}}


def _evaluate(history: list[dict[str, Any]], initial_band: str) -> tuple[str, int, list[dict[str, Any]]]:
    if len(history) > COUNT:
        raise HTTPException(400, "There are too many answers. Restart the diagnostic.")
    band, score, scored = initial_band, 0, []
    for index, answer in enumerate(history):
        question = QUESTIONS[band][index]
        if answer.get("question_id") != question["id"] or not isinstance(answer.get("answer"), str):
            raise HTTPException(400, "The diagnostic answers are out of order. Restart it.")
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
    if body.action == "start":
        if profile.get("diagnostic_completed"):
            raise HTTPException(409, "This diagnostic is already complete.")
        band = body.grade_tier if body.grade_tier in QUESTIONS else "k2"
        db.table("profiles").update({"grade_tier": band}).eq("id", user_id).execute()
        return {"question": _public(QUESTIONS[band][0]), "question_number": 1, "total": COUNT}
    if body.action != "answer":
        raise HTTPException(400, "Unknown placement action.")
    if profile.get("diagnostic_completed"):
        raise HTTPException(409, "The diagnostic is already complete.")
    initial_band = profile.get("grade_tier") if profile.get("grade_tier") in QUESTIONS else "k2"
    band, correct_count, scored = _evaluate(body.history, initial_band)
    if len(scored) < COUNT:
        q = QUESTIONS[band][len(scored)]
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
        session_rows.append({"student_id": user_id, "game_type": game, "question_id": None,
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
