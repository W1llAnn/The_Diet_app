"""Модель данных человека и справочники (активность, цель).

Это вход для калькулятора КБЖУ. Никаких расчётов тут нет — только данные.
"""

from __future__ import annotations

from dataclasses import dataclass


# Пол: "male" / "female"
MALE = "male"
FEMALE = "female"
SEXES = (MALE, FEMALE)


# Уровень активности -> коэффициент для расчёта TDEE.
#
# Базовые «универсальные» уровни (sedentary / light / moderate / high /
# very_high) — стандартные значения из литературы по нутрициологии (Harris-
# Benedict PAL). Их можно использовать как раньше, без уточнения типа
# тренировок.
#
# Детальные пресеты (`*_cardio` / `*_strength` / `*_mixed`) различают ТИП
# нагрузки при одной и той же частоте:
#   - кардио (бег, велосипед, плавание) сжигает больше за минуту → фактор чуть
#     выше «универсального»;
#   - силовые (штанга, тренажёры) расходуют меньше в момент, но дают EPOC
#     (послетренировочный обмен) и сохраняют мышцы → фактор чуть ниже, но всё
#     равно выше сидячего;
#   - смесь — середина, совпадает с универсальным уровнем.
# Источник ориентировки разницы: Ainsworth Compendium (MET), обзоры EPOC.
ACTIVITY_LEVELS = {
    # --- базовые универсальные уровни (обратная совместимость) ---
    "sedentary": {"label": "Сидячий (офис, без спорта)", "factor": 1.20},
    "light": {"label": "Небольшая (1-3 тренировки/нед, смешанные)", "factor": 1.375},
    "moderate": {"label": "Умеренная (3-5 тренировок/нед, смешанные)", "factor": 1.55},
    "high": {"label": "Высокая (6-7 тренировок/нед, смешанные)", "factor": 1.725},
    "very_high": {"label": "Очень высокая (тяжёлый труд/спорт 2x/день)", "factor": 1.90},
    # --- лёгкая нагрузка, 1-3 тренировки/нед ---
    "light_cardio": {"label": "Лёгкая: кардио 1-3/нед", "factor": 1.375},
    "light_strength": {"label": "Лёгкая: силовые 1-3/нед", "factor": 1.35},
    "light_mixed": {"label": "Лёгкая: смесь 1-3/нед", "factor": 1.375},
    # --- умеренная нагрузка, 3-5 тренировок/нед ---
    "moderate_cardio": {"label": "Умеренная: кардио 3-5/нед", "factor": 1.60},
    "moderate_strength": {"label": "Умеренная: силовые 3-5/нед", "factor": 1.50},
    "moderate_mixed": {"label": "Умеренная: смесь 3-5/нед", "factor": 1.55},
    # --- высокая нагрузка, 6-7 тренировок/нед ---
    "high_cardio": {"label": "Высокая: кардио 6-7/нед", "factor": 1.75},
    "high_strength": {"label": "Высокая: силовые 6-7/нед", "factor": 1.65},
    "high_mixed": {"label": "Высокая: смесь 6-7/нед", "factor": 1.725},
}


# Цель по весу: поддержание / снижение / набор.
GOALS = {
    "maintain": {"label": "Поддержание веса", "kcal_delta": 0},
    "lose": {"label": "Снижение веса", "kcal_delta": -500},
    "gain": {"label": "Набор веса", "kcal_delta": 300},
}


# Минимально безопасный порог калорийности (защита от экстремальных дефицитов).
MIN_KCAL = {MALE: 1500, FEMALE: 1200}


@dataclass
class UserProfile:
    """Антропометрия и цель человека.

    Параметры
    ----------
    sex : str          пол, "male" или "female"
    age : int          возраст, полных лет
    weight : float     вес, кг
    height : float     рост, см
    activity : str     ключ из ACTIVITY_LEVELS
    goal : str         ключ из GOALS
    """

    sex: str
    age: int
    weight: float
    height: float
    activity: str
    goal: str

    def validate(self) -> None:
        """Проверка, что значения в разумных пределах и ключи известны."""
        if self.sex not in SEXES:
            raise ValueError(
                f"Пол должен быть одним из {SEXES}, получено: {self.sex!r}"
            )
        if self.activity not in ACTIVITY_LEVELS:
            raise ValueError(
                f"Активность должна быть одной из {list(ACTIVITY_LEVELS)}, "
                f"получено: {self.activity!r}"
            )
        if self.goal not in GOALS:
            raise ValueError(
                f"Цель должна быть одной из {list(GOALS)}, получено: {self.goal!r}"
            )
        if not (10 <= self.age <= 120):
            raise ValueError(f"Возраст {self.age} вне разумного диапазона (10-120)")
        if not (30 <= self.weight <= 400):
            raise ValueError(f"Вес {self.weight} кг вне разумного диапазона (30-400)")
        if not (100 <= self.height <= 250):
            raise ValueError(f"Рост {self.height} см вне разумного диапазона (100-250)")
