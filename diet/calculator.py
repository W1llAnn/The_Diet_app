"""Расчёт нормы калорий и БЖУ.

Доступны две формулы базового обмена (BMR):
    - WHO:  уравнения Скофилда, официальный стандарт ФАО/ВОЗ/ООН.
            Зависит от пола и возрастной группы, использует вес (кг) и рост (м).
    - mifflin: формула Миффлина-Сан Жеора. Современная альтернатива,
            чаще точнее для современных людей (Скофилд иногда завышает).

Расчёт БЖУ зависит от ДВУХ параметров:
    - condition:  нозологическая группа (диабет, ХБП, ожирение, ССЗ, здоровый);
    - life_stage: стадия жизни (спортсмен, пожилой, беременная, кормящая, ...).

Цепочка расчёта:
    BMR  → TDEE (= BMR × коэффициент активности)
        → целевые ккал (TDEE + поправка на цель + прибавка стадии жизни,
                         не ниже минимума)
        → БЖУ (с приоритетом CKD по белку — см. _calc_protein)
"""

from __future__ import annotations

from dataclasses import dataclass, field

from .profile import (
    ACTIVITY_LEVELS,
    FEMALE,
    GOALS,
    MALE,
    MIN_KCAL,
    UserProfile,
)
from .conditions import (
    CONDITIONS,
    PROTEIN_GKG as COND_PROTEIN_GKG,
    PROTEIN_PERCENT,
    VALID_CONDITIONS,
    get_condition,
)
from .life_stages import (
    LIFE_STAGES,
    PROTEIN_ADD_G,
    PROTEIN_GKG as STAGE_PROTEIN_GKG,
    VALID_LIFE_STAGES,
    get_life_stage,
)

# Калорийность 1 грамма макронутриента, ккал/г.
KCAL_PER_GRAM = {"protein": 4.0, "fat": 9.0, "carbs": 4.0}

# Жиры как доля энергии во всех группах (≤30%, ВОЗ/AHA).
FAT_SHARE = 0.30


# --- Уравнения Скофилда (ФАО/ВОЗ/ООН, 1985), ккал; W=кг, H=метры ----------------
# Источник: FAO "Energy and protein requirements", Annex 1.
# (коэффициенты взяты прямо из таблицы, проверены по примеру в Annex 1.B)
_WHO_BMR = {
    MALE: {
        (10, 18): lambda W, H: 16.6 * W + 77.0 * H + 572.0,
        (18, 30): lambda W, H: 15.4 * W - 27.0 * H + 717.0,
        (30, 60): lambda W, H: 11.3 * W + 16.0 * H + 901.0,
        (60, 200): lambda W, H: 8.8 * W + 1128.0 * H - 1071.0,
    },
    FEMALE: {
        (10, 18): lambda W, H: 7.4 * W + 482.0 * H + 217.0,
        (18, 30): lambda W, H: 13.3 * W + 334.0 * H + 35.0,
        (30, 60): lambda W, H: 8.7 * W - 25.0 * H + 865.0,
        (60, 200): lambda W, H: 9.2 * W + 637.0 * H - 302.0,
    },
}

VALID_FORMULAS = ("who", "mifflin")


@dataclass
class NutritionResult:
    """Итог расчёта — норма калорий и БЖУ."""

    formula: str          # формула, по которой считали итог (who / mifflin)
    condition: str        # нозологическая группа
    condition_label: str  # читаемое название группы
    life_stage: str       # стадия жизни
    life_stage_label: str # читаемое название стадии
    notes: str | None     # текстовые рекомендации (склейка condition + life_stage)
    warnings: list[str] = field(default_factory=list)  # тревожные комбинации

    bmr_mifflin: float = 0.0
    bmr_who: float = 0.0

    bmr: float = 0.0
    tdee: float = 0.0
    tdee_mifflin: float = 0.0
    tdee_who: float = 0.0

    activity_label: str = ""
    goal_label: str = ""
    target_kcal: float = 0.0

    protein_g: float = 0.0
    fat_g: float = 0.0
    carbs_g: float = 0.0

    @property
    def protein_kcal(self) -> float:
        return round(self.protein_g * KCAL_PER_GRAM["protein"])

    @property
    def fat_kcal(self) -> float:
        return round(self.fat_g * KCAL_PER_GRAM["fat"])

    @property
    def carbs_kcal(self) -> float:
        return round(self.carbs_g * KCAL_PER_GRAM["carbs"])

    def summary(self) -> dict:
        """Плоский словарь для вывода в таблицу pandas."""
        return {
            "Группа здоровья": self.condition_label,
            "Стадия жизни": self.life_stage_label,
            "Формула BMR": self.formula,
            "BMR по ВОЗ, ккал": round(self.bmr_who),
            "BMR по Миффлину, ккал": round(self.bmr_mifflin),
            "BMR используемый, ккал": round(self.bmr),
            "Расход за день (TDEE), ккал": round(self.tdee),
            "Уровень активности": self.activity_label,
            "Цель": self.goal_label,
            "Целевые калории, ккал/день": round(self.target_kcal),
            "Белки, г": round(self.protein_g),
            "Жиры, г": round(self.fat_g),
            "Углеводы, г": round(self.carbs_g),
        }

    def comparison(self) -> dict:
        """Сравнение двух формул BMR/TDEE (для отдельной таблицы)."""
        return {
            "BMR, ккал": {
                "ВОЗ (Скофилд)": round(self.bmr_who),
                "Миффлин-Сан Жеор": round(self.bmr_mifflin),
            },
            "Расход за день (TDEE), ккал": {
                "ВОЗ (Скофилд)": round(self.tdee_who),
                "Миффлин-Сан Жеор": round(self.tdee_mifflin),
            },
        }


def calc_bmr_mifflin(profile: UserProfile) -> float:
    """BMR по формуле Миффлина-Сан Жеора."""
    base = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age
    return base + 5 if profile.sex == MALE else base - 161


def _who_equation(sex: str, age: int):
    """Выбирает уравнение Скофилда по полу и возрастной группе."""
    for (lo, hi), eq in _WHO_BMR[sex].items():
        if lo <= age < hi:
            return eq
    raise ValueError(f"Нет уравнения ВОЗ для возраста {age}")


def calc_bmr_who(profile: UserProfile) -> float:
    """BMR по официальным уравнениям ФАО/ВОЗ/ООН (Скофилд).

    Рост в формулах берётся в метрах.
    """
    eq = _who_equation(profile.sex, profile.age)
    return eq(profile.weight, profile.height / 100.0)


def calc_tdee(bmr: float, activity_key: str) -> float:
    """Суточный расход энергии = BMR × коэффициент активности."""
    return bmr * ACTIVITY_LEVELS[activity_key]["factor"]


def calc_target_kcal(tdee: float, profile: UserProfile, kcal_add: float = 0) -> float:
    """Целевая калорийность: TDEE + поправка на цель + прибавка стадии жизни,
    но не ниже безопасного минимума."""
    delta = GOALS[profile.goal]["kcal_delta"]
    target = tdee + delta + kcal_add
    return max(target, MIN_KCAL[profile.sex])


def _calc_protein(profile: UserProfile, condition_key: str, life_stage_key: str,
                  condition_kcal_basis: float) -> tuple[float, str | None]:
    """Считает белок (г) с приоритетом разрешения конфликтов.

    Возвращает (граммы белка, основание решения — для предупреждения, если есть).

    ПРИОРИТЕТ:
        1. CKD всегда выигрывает по белку (0.8 г/кг) — защита почек.
           Если при этом выбрана стадия жизни с повышенным белком —
           возвращаем предупреждение.
        2. Иначе: стадия жизни (если не default) перекрывает condition,
           т.к. это активная потребность живого человека.
        3. Иначе: condition (его gkg или percent).
    """
    cond_cfg = get_condition(condition_key)
    stage_cfg = get_life_stage(life_stage_key)
    warning = None

    is_ckd = (condition_key == "ckd")

    # 1) CKD имеет абсолютный приоритет по белку
    if is_ckd:
        protein_g = cond_cfg["protein_gkg"] * profile.weight
        if stage_cfg["protein_mode"] in (STAGE_PROTEIN_GKG, PROTEIN_ADD_G):
            warning = (
                f"При ХБП белок ограничен до {cond_cfg['protein_gkg']} г/кг "
                f"вне зависимости от стадии жизни ({stage_cfg['label']}). "
                f"Стадию/диализ уточняет нефролог."
            )
        return protein_g, warning

    # 2) Стадия жизни
    mode = stage_cfg["protein_mode"]
    if mode == STAGE_PROTEIN_GKG:
        return stage_cfg["protein_gkg"] * profile.weight, None
    if mode == PROTEIN_ADD_G:
        # прибавка к БАЗЕ — базе служит белок по condition (percent/gkg)
        base = _protein_from_condition(profile, cond_cfg, condition_kcal_basis)
        return base + stage_cfg["protein_add_g"], None

    # 3) Condition
    return _protein_from_condition(profile, cond_cfg, condition_kcal_basis), None


def _protein_from_condition(profile: UserProfile, cond_cfg: dict, kcal_basis: float) -> float:
    """Белок по настройкам condition: либо г/кг, либо % от энергии."""
    if cond_cfg["protein_mode"] == COND_PROTEIN_GKG:
        return cond_cfg["protein_gkg"] * profile.weight
    # PROTEIN_PERCENT
    return (kcal_basis * cond_cfg["protein_pct"]) / KCAL_PER_GRAM["protein"]


def _build_warnings(profile: UserProfile, condition_key: str, life_stage_key: str,
                    goal: str, protein_warning: str | None) -> list[str]:
    """Собирает список предупреждений о рискованных комбинациях."""
    warnings = []
    if protein_warning:
        warnings.append(protein_warning)
    if life_stage_key == "pregnant" and goal == "lose":
        warnings.append(
            "Похудение во время беременности не рекомендуется — нужна "
            "консультация врача. Расчёт дан, но применять с осторожностью."
        )
    if life_stage_key in ("pregnant", "lactating") and condition_key in ("diabetes_t2", "ckd"):
        warnings.append(
            f"{get_life_stage(life_stage_key)['label']} + "
            f"{get_condition(condition_key)['label']} — сложная комбинация, "
            f"требует ведения под контролем врача."
        )
    return warnings


def calc_macros(profile: UserProfile, target_kcal: float, condition_key: str,
                life_stage_key: str) -> tuple[float, float, float, str | None]:
    """Распределение БЖУ в граммах.

    Белок — по приоритету (см. _calc_protein).
    Жиры — FAT_SHARE от энергии. Углеводы — остаток.
    Возвращает (белок, жиры, углеводы, protein_warning).
    """
    protein_g, protein_warning = _calc_protein(
        profile, condition_key, life_stage_key, target_kcal
    )
    protein_kcal = protein_g * KCAL_PER_GRAM["protein"]

    fat_g = (target_kcal * FAT_SHARE) / KCAL_PER_GRAM["fat"]
    fat_kcal = fat_g * KCAL_PER_GRAM["fat"]

    carbs_kcal = target_kcal - protein_kcal - fat_kcal
    carbs_g = carbs_kcal / KCAL_PER_GRAM["carbs"]

    return protein_g, fat_g, carbs_g, protein_warning


def _join_notes(cond_cfg: dict, stage_cfg: dict) -> str | None:
    """Склеивает заметки condition и life_stage (если есть)."""
    parts = []
    if cond_cfg.get("notes"):
        parts.append(cond_cfg["notes"])
    if stage_cfg.get("notes"):
        parts.append(stage_cfg["notes"])
    return "\n\n".join(parts) if parts else None


def calculate(profile: UserProfile, formula: str = "who",
              condition: str = "healthy", life_stage: str = "default") -> NutritionResult:
    """Полный расчёт нормы калорий и БЖУ для профиля.

    formula:    "who" (по умолчанию) или "mifflin".
    condition:  нозологическая группа (healthy / diabetes_t2 / obesity / ckd / cvd).
    life_stage: стадия жизни (default / athlete_endurance / athlete_strength /
                older_adult / pregnant / lactating).
    """
    if formula not in VALID_FORMULAS:
        raise ValueError(f"formula должна быть одной из {VALID_FORMULAS}")
    profile.validate()
    cond_cfg = get_condition(condition)
    stage_cfg = get_life_stage(life_stage)

    bmr_mifflin = calc_bmr_mifflin(profile)
    bmr_who = calc_bmr_who(profile)

    tdee_mifflin = calc_tdee(bmr_mifflin, profile.activity)
    tdee_who = calc_tdee(bmr_who, profile.activity)

    if formula == "who":
        bmr, tdee = bmr_who, tdee_who
    else:
        bmr, tdee = bmr_mifflin, tdee_mifflin

    kcal_add = stage_cfg.get("kcal_add", 0)
    target_kcal = calc_target_kcal(tdee, profile, kcal_add=kcal_add)
    protein_g, fat_g, carbs_g, protein_warning = calc_macros(
        profile, target_kcal, condition, life_stage
    )

    warnings = _build_warnings(
        profile, condition, life_stage, profile.goal, protein_warning
    )

    return NutritionResult(
        formula=formula,
        condition=condition,
        condition_label=cond_cfg["label"],
        life_stage=life_stage,
        life_stage_label=stage_cfg["label"],
        notes=_join_notes(cond_cfg, stage_cfg),
        warnings=warnings,
        bmr_mifflin=bmr_mifflin,
        bmr_who=bmr_who,
        bmr=bmr,
        tdee=tdee,
        tdee_mifflin=tdee_mifflin,
        tdee_who=tdee_who,
        activity_label=ACTIVITY_LEVELS[profile.activity]["label"],
        goal_label=GOALS[profile.goal]["label"],
        target_kcal=target_kcal,
        protein_g=protein_g,
        fat_g=fat_g,
        carbs_g=carbs_g,
    )
