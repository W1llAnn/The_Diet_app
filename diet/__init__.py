"""Diet — приложение для расчёта питания (КБЖУ) и диет.

Модуль нормы калорий и БЖУ с двумя формулами BMR, нозологическими группами
и стадиями жизни:

    from diet import UserProfile, calculate, CONDITIONS, LIFE_STAGES

    profile = UserProfile(sex="female", age=30, weight=70, height=165,
                          activity="light", goal="lose")
    result = calculate(profile, formula="who",
                       condition="diabetes_t2", life_stage="pregnant")
    print(result.summary())
    print(result.warnings)   # рискованные комбинации

condition:  нозологическая группа (healthy / diabetes_t2 / obesity / ckd / cvd).
life_stage: стадия жизни (default / athlete_endurance / athlete_strength /
            older_adult / pregnant / lactating).

При конфликте белка между болезнью и стадией жизни приоритет у CKD (защита почек).
"""

from .profile import (
    ACTIVITY_LEVELS,
    GOALS,
    UserProfile,
)
from .conditions import (
    CONDITIONS,
    VALID_CONDITIONS,
    get_condition,
)
from .life_stages import (
    LIFE_STAGES,
    VALID_LIFE_STAGES,
    get_life_stage,
)
from .calculator import (
    NutritionResult,
    VALID_FORMULAS,
    calculate,
    calc_bmr_mifflin,
    calc_bmr_who,
)
from .food_db import (
    FoodItem,
    NUTRIENT_COLS,
    load_foods,
    search,
    search_for_diabetes,
    LABEL_ICONS,
    to_fooditem,
)
from .checks import (
    CheckResult,
    check_day,
    check_portion,
    resolve_limits,
    check_gl_portion,
    check_gl_meal,
    check_gl_day,
    gl_targets_for,
)
from .diary import (
    FoodLog,
    suggest,
    COL_LABELS,
)
from .gi import (
    glycemic_load,
    gl_label,
)
from . import db

__all__ = [
    "UserProfile",
    "calculate",
    "NutritionResult",
    "VALID_FORMULAS",
    "calc_bmr_mifflin",
    "calc_bmr_who",
    "ACTIVITY_LEVELS",
    "GOALS",
    "CONDITIONS",
    "VALID_CONDITIONS",
    "get_condition",
    "LIFE_STAGES",
    "VALID_LIFE_STAGES",
    "get_life_stage",
    # база продуктов и дневник
    "FoodItem",
    "NUTRIENT_COLS",
    "load_foods",
    "search",
    "search_for_diabetes",
    "LABEL_ICONS",
    "to_fooditem",
    "CheckResult",
    "check_day",
    "check_portion",
    "resolve_limits",
    # гликемическая нагрузка
    "check_gl_portion",
    "check_gl_meal",
    "check_gl_day",
    "gl_targets_for",
    "glycemic_load",
    "gl_label",
    "FoodLog",
    "suggest",
    "COL_LABELS",
    # база данных
    "db",
]
