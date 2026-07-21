"""Справочник жизненных стадий (групп здоровых людей с особыми потребностями).

Ортогонален нозологическим группам (conditions.py): стадия жизни описывает
состояние ЗДОРОВОГО человека, требующее корректировки БЖУ/калорий, а condition —
заболевание. Они сочетаются в calculate(profile, ..., condition, life_stage).

Каждая стадия задаёт:
    - protein_mode: как менять белок —
        "gkg":   граммы на кг веса (спортсмены, пожилые);
        "add_g": прибавка в граммах к расчётному белку (беременность, лактация);
        None:    не менять (default).
    - protein_gkg / protein_add_g: соответствующее значение;
    - kcal_add: прибавка калорий поверх расчёта цели (беременность/лактация);
    - notes / source: пояснения.

Приоритет разрешения конфликтов (см. calculator.py): при CKD белок заболевания
всегда перекрывает стадию жизни (защита почек).
"""

from __future__ import annotations

PROTEIN_GKG = "gkg"     # белок в г/кг веса (как в conditions.py)
PROTEIN_ADD_G = "add_g"  # прибавка белка в граммах к расчётному


LIFE_STAGES = {
    "default": {
        "label": "Обычный взрослый",
        "protein_mode": None,
        "kcal_add": 0,
        "notes": None,
        "source": None,
    },
    "athlete_endurance": {
        "label": "Спортсмен на выносливость",
        # ISSN: 1.0-1.6 г/кг для выносливости; берём середину.
        "protein_mode": PROTEIN_GKG,
        "protein_gkg": 1.3,
        "kcal_add": 0,
        "notes": (
            "Повышенный белок для восстановления и адаптации к нагрузкам. "
            "Равномерное распределение по приёмам пищи (0.25 г/кг на приём)."
        ),
        "source": "ISSN Position Stand: Protein & Exercise (1.0-1.6 г/кг)",
    },
    "athlete_strength": {
        "label": "Спортсмен-силовик / набор массы",
        # ISSN: 1.6-2.0 г/кг для силовых/гипертрофии; берём 1.8.
        "protein_mode": PROTEIN_GKG,
        "protein_gkg": 1.8,
        "kcal_add": 0,
        "notes": (
            "Высокий белок для поддержки мышечной гипертрофии. На фазе набора "
            "обычно нужен и профицит калорий (goal='gain')."
        ),
        "source": "ISSN Position Stand: Protein & Exercise (1.6-2.0 г/кг)",
    },
    "older_adult": {
        "label": "Пожилой (60+)",
        # PROT-AGE: 1.0-1.2 г/кг для защиты от саркопении.
        "protein_mode": PROTEIN_GKG,
        "protein_gkg": 1.1,
        "kcal_add": 0,
        "notes": (
            "Повышенный белок против саркопении (потери мышечной массы). "
            "Желательно 25-30 г качественного белка на приём пищи + силовая "
            "активность."
        ),
        "source": "PROT-AGE Study Group; ESPEN (1.0-1.2 г/кг)",
    },
    "pregnant": {
        "label": "Беременность (2-3 триместр)",
        # RDA/NAM: +25 г белка, +340 ккал (усреднённо для 2-3 триместра).
        "protein_mode": PROTEIN_ADD_G,
        "protein_add_g": 25,
        "kcal_add": 340,
        "notes": (
            "Дополнительно +340 ккал и +25 г белка ко второй половине беременности. "
            "Худеть во время беременности нельзя — нужна консультация врача."
        ),
        "source": "NAM (IOM); RDA (+25 г белка, +340 ккал)",
    },
    "lactating": {
        "label": "Кормление грудью (лактация)",
        # RDA/NAM: +15-25 г белка (берём 25), +500 ккал.
        "protein_mode": PROTEIN_ADD_G,
        "protein_add_g": 25,
        "kcal_add": 500,
        "notes": (
            "Дополнительно +500 ккал и +25 г белка для продукции молока. "
            "Жёсткий дефицит калорий может снизить лактацию."
        ),
        "source": "NAM (IOM); RDA (+25 г белка, +500 ккал)",
    },
}


VALID_LIFE_STAGES = tuple(LIFE_STAGES.keys())


def get_life_stage(key: str) -> dict:
    """Возвращает настройки стадии жизни по ключу, с проверкой."""
    if key not in LIFE_STAGES:
        raise ValueError(
            f"Неизвестная стадия жизни: {key!r}. Доступно: {list(VALID_LIFE_STAGES)}"
        )
    return LIFE_STAGES[key]
