"""Тесты гликемической нагрузки (diet.gi).

Проверяем формулу ГН и её ключевое свойство — аддитивность (мясо даёт ГН=0,
рис — основную ГН блюда), а также метки low/medium/high.
"""

import pytest

from diet.gi import glycemic_load, gl_label


# ───────────────────────── базовая формула ─────────────────────────

class TestGlycemicLoad:
    def test_white_rice_big_portion_high(self):
        """150 г белого риса (ГИ=73, углев=28/100г варёного) → ГН≈30.7 (высокая)."""
        gl = glycemic_load(73, 28, 150)
        assert gl == pytest.approx(30.7, abs=0.1)
        assert gl_label(gl)[0] == "high"

    def test_white_rice_small_portion_moderate(self):
        """50 г того же риса → ГН≈10.2 (умеренная) — маленькая порция допустима."""
        gl = glycemic_load(73, 28, 50)
        assert gl == pytest.approx(10.2, abs=0.1)
        assert gl_label(gl)[0] in ("medium", "low")

    def test_meat_zero_gl(self):
        """Мясо: ГИ≈0 и углеводов 0 → ГН=0 (не повышает глюкозу)."""
        assert glycemic_load(0, 0, 200) == 0.0

    def test_meat_zero_gl_even_with_some_carbs(self):
        """ГИ=0 → ГН=0 даже если углеводы ненулевые (белковый продукт)."""
        assert glycemic_load(0, 5, 200) == 0.0

    def test_brown_rice_lower_than_white(self):
        """Бурый рис (ГИ=50) при той же порции даёт меньшую ГН, чем белый (ГИ=73)."""
        gl_brown = glycemic_load(50, 23, 50)
        gl_white = glycemic_load(73, 28, 50)
        assert gl_brown < gl_white

    def test_watermelon_high_gi_low_gl(self):
        """Арбуз: высокий ГИ, но мало углеводов → низкая ГН (классический пример)."""
        gl = glycemic_load(72, 8, 100)
        assert gl < 10
        assert gl_label(gl)[0] == "low"

    def test_zero_grams(self):
        """Нулевая порция → ГН=0."""
        assert glycemic_load(75, 80, 0) == 0.0

    def test_zero_carbs(self):
        """Нет углеводов → ГН=0."""
        assert glycemic_load(75, 0, 100) == 0.0

    def test_proportional_to_grams(self):
        """ГН линейна по массе порции (удвоение граммов = удвоение ГН)."""
        gl1 = glycemic_load(70, 50, 100)
        gl2 = glycemic_load(70, 50, 200)
        assert gl2 == pytest.approx(gl1 * 2, abs=0.1)


class TestAdditivity:
    """Ключевое свойство ГН: сумма по ингредиентам = ГН блюда."""

    def test_rice_plus_meat(self):
        """«рис + мясо»: мясо не «разбавляет» ГН смеси, просто добавляет 0."""
        gl_rice = glycemic_load(73, 28, 150)   # ≈30.7
        gl_meat = glycemic_load(0, 0, 200)     # = 0
        assert gl_rice + gl_meat == pytest.approx(30.7, abs=0.1)

    def test_meal_sum_equals_total(self):
        """Сумма ГН порций = ГН всего приёма (аддитивность)."""
        items = [
            glycemic_load(75, 74, 60),  # рис
            glycemic_load(0, 0, 200),   # мясо
            glycemic_load(50, 7, 100),  # овощи
        ]
        assert sum(items) == pytest.approx(items[0] + items[2], abs=0.1)


class TestGlLabel:
    def test_low(self):
        assert gl_label(5)[0] == "low"
        assert gl_label(10)[0] == "low"

    def test_medium(self):
        assert gl_label(11)[0] == "medium"
        assert gl_label(19)[0] == "medium"

    def test_high(self):
        assert gl_label(20)[0] == "high"
        assert gl_label(50)[0] == "high"
