"""Тесты проверок гликемической нагрузки (diet.checks).

Проверяем пороговые срабатывания check_gl_portion / check_gl_meal /
check_gl_day для диабета (нормы meal=15, day=80) и отсутствие норм
у здорового.
"""

import pytest

from diet.checks import (
    check_gl_portion,
    check_gl_meal,
    check_gl_day,
    gl_targets_for,
)

COND = "diabetes_t2"


class TestGlTargets:
    def test_diabetes_has_targets(self):
        t = gl_targets_for(COND)
        assert t == {"meal": 15, "day": 80}

    @pytest.mark.parametrize("cond", ["healthy", "obesity", "ckd", "cvd"])
    def test_other_conditions_no_targets(self, cond):
        """Только диабет имеет нормы ГН; остальные — пустой словарь."""
        assert gl_targets_for(cond) == {}


class TestCheckGlPortion:
    def test_high_portion_danger(self):
        """Рис 150 г (ГИ=73, углев=28): ГН≈30.7 ≥ 1.5×15=22.5 → danger."""
        results = check_gl_portion(73, 28, 150, "Рис", COND)
        assert len(results) == 1
        assert results[0].level == "danger"
        assert results[0].nutrient == "gl"

    def test_moderate_portion_warn(self):
        """ГН чуть выше нормы (16-22) → warn, не danger."""
        # ГИ=73, углев=28, ~80 г → ГН≈16.4
        results = check_gl_portion(73, 28, 80, "Рис", COND)
        assert len(results) == 1
        assert results[0].level == "warn"

    def test_safe_portion_info(self):
        """ГН ниже нормы, но ненулевая → info (не спамим warn)."""
        results = check_gl_portion(73, 28, 30, "Рис", COND)  # ГН≈6.1
        assert len(results) == 1
        assert results[0].level == "info"

    def test_zero_gl_silent(self):
        """Мясо (ГН=0) → никаких предупреждений (не шумим)."""
        results = check_gl_portion(0, 0, 200, "Мясо", COND)
        assert results == []

    def test_healthy_no_targets(self):
        """Для здорового нормы ГН нет → пустой список."""
        results = check_gl_portion(73, 28, 150, "Рис", "healthy")
        assert results == []


class TestCheckGlMeal:
    def test_over_limit_warn(self):
        """ГН приёма 17 (норма 15) → warn."""
        results = check_gl_meal(17, COND, "обед")
        assert len(results) == 1
        assert results[0].level == "warn"

    def test_far_over_limit_danger(self):
        """ГН приёма 30 ≥ 1.5×15=22.5 → danger."""
        results = check_gl_meal(30, COND, "обед")
        assert results[0].level == "danger"

    def test_within_limit_silent(self):
        """ГН приёма 10 ≤ 15 → тихо."""
        assert check_gl_meal(10, COND, "обед") == []

    def test_meal_name_in_message(self):
        """Название приёма попадает в сообщение."""
        results = check_gl_meal(30, COND, "ужин")
        assert "ужин" in results[0].message


class TestCheckGlDay:
    def test_over_day_limit(self):
        """ГН дня 95 > 80 → warn (не 1.2× = 96, значит warn)."""
        results = check_gl_day(95, COND)
        assert len(results) == 1
        assert results[0].level == "warn"

    def test_far_over_day_limit_danger(self):
        """ГН дня 100 ≥ 1.2×80=96 → danger."""
        results = check_gl_day(100, COND)
        assert results[0].level == "danger"

    def test_within_day_limit_silent(self):
        """ГН дня 70 ≤ 80 → тихо."""
        assert check_gl_day(70, COND) == []

    def test_healthy_no_day_targets(self):
        """Для здорового нет дневной нормы ГН."""
        assert check_gl_day(200, "healthy") == []
