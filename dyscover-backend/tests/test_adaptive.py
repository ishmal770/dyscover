from app.services.adaptive import choose_item, expected_success, update_skill


def test_expected_success_at_equal_skill_and_difficulty():
    assert abs(expected_success(0.0, 0.0) - 0.5) < 1e-9


def test_hard_win_raises_skill():
    assert update_skill(0.0, 1.5, 1.0) > 0.0


def test_easy_loss_lowers_skill():
    assert update_skill(0.0, -1.5, 0.0) < 0.0


def test_choice_uses_only_available_questions():
    choices = [{"id": "easy", "difficulty": -1.0}, {"id": "hard", "difficulty": 1.0}]
    for _ in range(50):
        assert choose_item(0.0, choices) in choices
