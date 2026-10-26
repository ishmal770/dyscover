import math
import random

LEARNING_RATE = 0.35
EPSILON = 0.20
MIN_THETA = -3.0
MAX_THETA = 3.0


def clamp_theta(theta: float) -> float:
    return max(MIN_THETA, min(MAX_THETA, theta))


def expected_success(theta: float, difficulty: float) -> float:
    return 1.0 / (1.0 + math.exp(-(theta - difficulty)))


def update_skill(theta: float, difficulty: float, actual_score: float) -> float:
    expected = expected_success(theta, difficulty)
    return clamp_theta(theta + LEARNING_RATE * (actual_score - expected))


def choose_item(theta: float, candidates: list[dict]) -> dict:
    if not candidates:
        raise ValueError("No candidate questions")

    if random.random() < EPSILON:
        return random.choice(candidates)

    return min(candidates, key=lambda q: abs(float(q["difficulty"]) - theta))


def apply_override(candidates: list[dict], override: dict | None) -> list[dict]:
    if not override:
        return candidates
    filtered = [c for c in candidates if c["game_type"] == override["focus_skill"]]
    return filtered or candidates


GAMES = {
    "parrotPairsGame": {"title": "Parrot Pairs", "skill": "Letter order"},
    "syllableSafariGame": {"title": "Syllable Safari", "skill": "Syllables"},
    "monkeyMixUpGame": {"title": "Monkey Mix-Up", "skill": "Vowel sounds"},
    "cheetahChallengeGame": {"title": "Cheetah Challenge", "skill": "Reading speed"},
    "lizardLookoutsGame": {"title": "Lizard Lookouts", "skill": "Letter recognition"},
    "lionsLettersGame": {"title": "Lion's Letters", "skill": "Handwriting"},
}
GAME_IDS = tuple(GAMES)
