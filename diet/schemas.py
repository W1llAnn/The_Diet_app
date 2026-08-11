"""Pydantic-схемы HTTP API (D5): валидация входов и описание ответов.

Эндпоинты принимают enum'ы с настоящими ключами из доменных справочников
(SEXES, ACTIVITY_LEVELS, GOALS, VALID_CONDITIONS, VALID_LIFE_STAGES,
VALID_FORMULAS), а не произвольные строки — FastAPI отдаёт чёткое 422 с
перечнем допустимых значений ещё до входа в эндпоинт, и OpenAPI документирует
enum'ы в сваггере. Раньше валидация падала внутри calculate() с менее
аккуратным сообщением.

`day` приводится к datetime.date — Pydantic сам проверяет формат ISO-даты,
что убирает ручную проверку date.fromisoformat в эндпоинтах.
"""

from __future__ import annotations

from datetime import date
from enum import Enum

from pydantic import BaseModel, EmailStr, Field

from .calculator import VALID_FORMULAS
from .conditions import VALID_CONDITIONS
from .life_stages import VALID_LIFE_STAGES
from .profile import ACTIVITY_LEVELS, GOALS, SEXES


# ───────────────────────── enums из доменных справочников ──────────────────


class SexEnum(str, Enum):
    MALE = "male"
    FEMALE = "female"


# Значения enum'ов ниже берём прямо из справочников, чтобы схема не разъехалась
# с доменной логикой при добавлении новых ключей.
ActivityEnum = Enum(  # type: ignore[valid-type]
    "ActivityEnum", {k: k for k in ACTIVITY_LEVELS}, type=str,
)
GoalEnum = Enum(  # type: ignore[valid-type]
    "GoalEnum", {k: k for k in GOALS}, type=str,
)
ConditionEnum = Enum(  # type: ignore[valid-type]
    "ConditionEnum", {k: k for k in VALID_CONDITIONS}, type=str,
)
LifeStageEnum = Enum(  # type: ignore[valid-type]
    "LifeStageEnum", {k: k for k in VALID_LIFE_STAGES}, type=str,
)
FormulaEnum = Enum(  # type: ignore[valid-type]
    "FormulaEnum", {k: k for k in VALID_FORMULAS}, type=str,
)


class MealEnum(str, Enum):
    BREAKFAST = "breakfast"
    LUNCH = "lunch"
    DINNER = "dinner"
    SNACK = "snack"


# ───────────────────────── общие части ─────────────────────────────────────


class ProfileFields(BaseModel):
    """Антропометрия + параметры расчёта — общая часть для расчёта и регистрации.

    Не используется напрямую как эндпоинт-вход, от него наследуются CalculateIn
    и RegisterIn, чтобы не дублировать список полей.
    """

    sex: SexEnum = Field(..., description="male / female")
    age: int = Field(..., ge=10, le=120)
    weight: float = Field(..., ge=30, le=400, description="вес, кг")
    height: float = Field(..., ge=100, le=250, description="рост, см")
    activity: ActivityEnum = Field(..., description="ключ из ACTIVITY_LEVELS")
    goal: GoalEnum = Field(..., description="maintain / lose / gain")
    formula: FormulaEnum = Field(FormulaEnum.who, description="who / mifflin")
    condition: ConditionEnum = Field(
        ConditionEnum.healthy,
        description="healthy / diabetes_t2 / obesity / ckd / cvd",
    )
    life_stage: LifeStageEnum = Field(
        LifeStageEnum.default,
        description="default / athlete_endurance / ...",
    )


# ───────────────────────── расчёт ──────────────────────────────────────────


class CalculateIn(ProfileFields):
    """Вход для POST /v1/calculate — расчёт нормы без сохранения."""

    name: str | None = Field(None, description="не используется при расчёте")


class CalculateOut(BaseModel):
    """Ответ POST /v1/calculate — итог NutritionResult + warnings/bmr/tdee.

    Берём ключи из result.summary() (русские названия для UI) + технические
    поля. extra='allow' — summary() может вернуть больше ключей, чем перечислено;
    все они попадут в ответ без ошибок сериализации.
    """

    model_config = {"extra": "allow"}
    warnings: list[str] = Field(default_factory=list)
    bmr: int = 0
    tdee: int = 0


# ───────────────────────── аутентификация ──────────────────────────────────


class RegisterIn(ProfileFields):
    """Регистрация: профиль + email/пароль. Норма КБЖУ считается сервером."""

    name: str = Field("", description="как зовут пользователя")
    email: EmailStr = Field(..., description="логин (уникальный)")
    password: str = Field(..., min_length=8, description="минимум 8 символов")


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    """Профиль пользователя в ответах (без password_hash)."""

    id: int
    name: str = ""
    email: str | None = None
    sex: str
    age: int
    weight: float
    height: float
    activity: str
    goal: str
    condition_key: str
    life_stage: str
    formula: str
    target_kcal: float
    protein_g: float
    fat_g: float
    carbs_g: float
    fiber_g: float


class TokenOut(BaseModel):
    """Ответ register/login: access-токен + профиль пользователя."""

    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ───────────────────────── дневник ─────────────────────────────────────────


class DiaryEntryIn(BaseModel):
    """Запись в дневник: порция продукта. user_id берётся из токена."""

    product_id: str
    grams: float = Field(..., gt=0)
    meal: MealEnum = MealEnum.SNACK
    day: date | None = Field(
        None, description="YYYY-MM-DD; по умолчанию сегодня (UTC)"
    )


class DiaryEntryOut(BaseModel):
    id: int
    product_id: str
    grams: float
    meal: str
    day: str
    name: str | None = None


class CheckOut(BaseModel):
    """Одно предупреждение проверки (CheckResult → JSON)."""

    level: str
    nutrient: str
    value: float
    limit: float
    message: str


class DaySummaryOut(BaseModel):
    """Ответ /v1/day-summary: итоги + порции + проверки."""

    day: str
    totals: dict
    entries: list[dict]
    checks: list[CheckOut]


class ChecksOut(BaseModel):
    """Ответ /v1/checks: только проверки дня."""

    day: str
    condition: str
    checks: list[CheckOut]
