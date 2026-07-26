/**
 * Расчёт нормы калорий, БЖУ и клетчатки.
 *
 * Портировано 1:1 с diet/calculator.py (Python). Вся арифметика идентична:
 * формулы ВОЗ (Скофилд) и Миффлина-Сан Жеора, приоритеты белка (CKD > стадия
 * жизни > condition), клетчатка по норме группы (не ниже 25 г/день).
 *
 * Цепочка:
 *   BMR → TDEE (× factor активности) → целевые ккал (+Δ цели, ≥ минимума)
 *       → БЖУ (белок по приоритету, жиры 30%, углеводы остаток)
 *       → клетчатка (от калорий, ≥ 25 г)
 */

// --- Константы -------------------------------------------------------------

const KCAL_PER_GRAM = { protein: 4.0, fat: 9.0, carbs: 4.0 } as const;
const FAT_SHARE = 0.30; // жиры как доля энергии (≤30%, ВОЗ/AHA)
const MIN_FIBER_G = 25.0; // минимум клетчатки для взрослых (DRI)
const MIN_KCAL = { male: 1500, female: 1200, other: 1200 } as const;

// --- Справочники (перенесены из profile.py / conditions.py / life_stages.py) -

export const ACTIVITY_LEVELS: Record<string, { label: string; factor: number }> = {
  // базовые (используются в онбординге)
  sedentary: { label: 'Сидячий', factor: 1.20 },
  light: { label: 'Лёгкая', factor: 1.375 },
  moderate: { label: 'Умеренная', factor: 1.55 },
  high: { label: 'Высокая', factor: 1.725 },
  very_high: { label: 'Очень высокая', factor: 1.90 },
  // онбординг использует 'very'/'extra' — маппим на ближайшие
  very: { label: 'Высокая', factor: 1.725 },
  extra: { label: 'Очень высокая', factor: 1.90 },
  // детальные пресеты
  light_cardio: { label: 'Лёгкая: кардио', factor: 1.375 },
  light_strength: { label: 'Лёгкая: силовые', factor: 1.35 },
  light_mixed: { label: 'Лёгкая: смесь', factor: 1.375 },
  moderate_cardio: { label: 'Умеренная: кардио', factor: 1.60 },
  moderate_strength: { label: 'Умеренная: силовые', factor: 1.50 },
  moderate_mixed: { label: 'Умеренная: смесь', factor: 1.55 },
  high_cardio: { label: 'Высокая: кардио', factor: 1.75 },
  high_strength: { label: 'Высокая: силовые', factor: 1.65 },
  high_mixed: { label: 'Высокая: смесь', factor: 1.725 },
};

export const GOALS: Record<string, { label: string; kcal_delta: number }> = {
  maintain: { label: 'Поддержание веса', kcal_delta: 0 },
  lose: { label: 'Снижение веса', kcal_delta: -500 },
  gain: { label: 'Набор веса', kcal_delta: 300 },
};

// Маппинг ключей онбординга → ключи калькулятора.
const CONDITION_MAP: Record<string, string> = {
  healthy: 'healthy',
  diabetes: 'diabetes_t2',
  obesity: 'obesity',
  hypertension: 'cvd',
  kidney: 'ckd',
  // онбординг может прислать и прямые ключи калькулятора
  diabetes_t2: 'diabetes_t2',
  cvd: 'cvd',
  ckd: 'ckd',
  // неизвестные → здоровый
};

type ProteinMode = 'percent' | 'gkg' | 'add_g' | null;

interface ConditionCfg {
  label: string;
  protein_mode: 'percent' | 'gkg';
  protein_pct?: number; // при percent
  protein_gkg?: number; // при gkg
  fiber_per_kcal: number;
}

const CONDITIONS: Record<string, ConditionCfg> = {
  healthy: { label: 'Здоровый', protein_mode: 'percent', protein_pct: 0.15, fiber_per_kcal: 0.014 },
  diabetes_t2: { label: 'Сахарный диабет 2 типа', protein_mode: 'percent', protein_pct: 0.18, fiber_per_kcal: 0.015 },
  obesity: { label: 'Ожирение / снижение веса', protein_mode: 'gkg', protein_gkg: 1.3, fiber_per_kcal: 0.015 },
  ckd: { label: 'Хроническая болезнь почек', protein_mode: 'gkg', protein_gkg: 0.8, fiber_per_kcal: 0.012 },
  cvd: { label: 'ССЗ / гипертония', protein_mode: 'percent', protein_pct: 0.15, fiber_per_kcal: 0.014 },
};

interface LifeStageCfg {
  label: string;
  protein_mode: ProteinMode;
  protein_gkg?: number;
  protein_add_g?: number;
  kcal_add: number;
}

const LIFE_STAGES: Record<string, LifeStageCfg> = {
  default: { label: 'Обычный взрослый', protein_mode: null, kcal_add: 0 },
  athlete_endurance: { label: 'Спортсмен на выносливость', protein_mode: 'gkg', protein_gkg: 1.3, kcal_add: 0 },
  athlete_strength: { label: 'Спортсмен-силовик', protein_mode: 'gkg', protein_gkg: 1.8, kcal_add: 0 },
  older_adult: { label: 'Пожилой (60+)', protein_mode: 'gkg', protein_gkg: 1.1, kcal_add: 0 },
  pregnant: { label: 'Беременность (2-3 триместр)', protein_mode: 'add_g', protein_add_g: 25, kcal_add: 340 },
  lactating: { label: 'Кормление грудью', protein_mode: 'add_g', protein_add_g: 25, kcal_add: 500 },
};

// --- Типы -------------------------------------------------------------------

export interface CalcInput {
  sex: 'male' | 'female' | 'other' | null;
  age: number;
  weight: number; // кг — берётся ПОСЛЕДНИЙ вес из weight_log
  height: number; // см
  activity: string | null;
  goal: string | null;
  condition?: string | null;
  life_stage?: string | null;
  formula?: 'who' | 'mifflin';
}

export interface CalcResult {
  target_kcal: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
  fiber_g: number;
  bmr: number;
  tdee: number;
  condition_label: string;
  activity_label: string;
  goal_label: string;
  warnings: string[];
}

// --- Формулы BMR ------------------------------------------------------------

function calcBmrMifflin(sex: string, weight: number, height: number, age: number): number {
  const base = 10 * weight + 6.25 * height - 5 * age;
  return sex === 'male' ? base + 5 : base - 161;
}

// Уравнения Скофилда (ФАО/ВОЗ/ООН). W=кг, H=метры.
function whoEquation(sex: string, age: number, W: number, Hm: number): number {
  if (sex === 'male') {
    if (age >= 10 && age < 18) return 16.6 * W + 77.0 * Hm + 572.0;
    if (age >= 18 && age < 30) return 15.4 * W - 27.0 * Hm + 717.0;
    if (age >= 30 && age < 60) return 11.3 * W + 16.0 * Hm + 901.0;
    if (age >= 60) return 8.8 * W + 1128.0 * Hm - 1071.0;
  } else {
    // female / other считаем по женской формуле (мягкое допущение для 'other')
    if (age >= 10 && age < 18) return 7.4 * W + 482.0 * Hm + 217.0;
    if (age >= 18 && age < 30) return 13.3 * W + 334.0 * Hm + 35.0;
    if (age >= 30 && age < 60) return 8.7 * W - 25.0 * Hm + 865.0;
    if (age >= 60) return 9.2 * W + 637.0 * Hm - 302.0;
  }
  // возраст вне табличных диапазонов (< 10) — калькулятор не для детей,
  // возвращаем mifflin как разумный fallback
  return calcBmrMifflin(sex, W, Hm * 100, age);
}

function calcBmrWho(sex: string, age: number, weight: number, heightCm: number): number {
  return whoEquation(sex, age, weight, heightCm / 100.0);
}

// --- Белок (приоритет: CKD > стадия жизни > condition) ----------------------

function proteinFromCondition(weight: number, cond: ConditionCfg, kcalBasis: number): number {
  if (cond.protein_mode === 'gkg') return (cond.protein_gkg ?? 0) * weight;
  return (kcalBasis * (cond.protein_pct ?? 0)) / KCAL_PER_GRAM.protein;
}

function calcProtein(
  weight: number, conditionKey: string, lifeStageKey: string, kcalBasis: number,
): { protein: number; warning: string | null } {
  const cond = CONDITIONS[conditionKey] ?? CONDITIONS.healthy;
  const stage = LIFE_STAGES[lifeStageKey] ?? LIFE_STAGES.default;

  // 1) CKD имеет абсолютный приоритет
  if (conditionKey === 'ckd') {
    let warning: string | null = null;
    if (stage.protein_mode === 'gkg' || stage.protein_mode === 'add_g') {
      warning = `При ХБП белок ограничен до ${cond.protein_gkg} г/кг вне зависимости от стадии жизни (${stage.label}). Стадию/диализ уточняет нефролог.`;
    }
    return { protein: (cond.protein_gkg ?? 0.8) * weight, warning };
  }

  // 2) Стадия жизни
  if (stage.protein_mode === 'gkg') {
    return { protein: (stage.protein_gkg ?? 0) * weight, warning: null };
  }
  if (stage.protein_mode === 'add_g') {
    const base = proteinFromCondition(weight, cond, kcalBasis);
    return { protein: base + (stage.protein_add_g ?? 0), warning: null };
  }

  // 3) Condition
  return { protein: proteinFromCondition(weight, cond, kcalBasis), warning: null };
}

// --- Главный расчёт ---------------------------------------------------------

export function calculate(input: CalcInput): CalcResult {
  const {
    sex, age, weight, height, activity, goal,
    condition, life_stage, formula = 'who',
  } = input;

  const sexKey = (sex ?? 'female') as 'male' | 'female';
  const activityKey = activity ?? 'sedentary';
  const goalKey = goal ?? 'maintain';

  // Маппинг ключей онбординга → калькулятор
  const condKey = CONDITION_MAP[condition ?? 'healthy'] ?? 'healthy';
  const stageKey = life_stage ?? 'default';
  const actCfg = ACTIVITY_LEVELS[activityKey] ?? ACTIVITY_LEVELS.sedentary;
  const goalCfg = GOALS[goalKey] ?? GOALS.maintain;

  // BMR
  const bmrMifflin = calcBmrMifflin(sexKey, weight, height, age);
  const bmrWho = calcBmrWho(sexKey, age, weight, height);
  const bmr = formula === 'mifflin' ? bmrMifflin : bmrWho;

  // TDEE
  const tdee = bmr * actCfg.factor;
  const tdeeMifflin = bmrMifflin * actCfg.factor;
  const tdeeWho = bmrWho * actCfg.factor;
  const tdeeUsed = formula === 'mifflin' ? tdeeMifflin : tdeeWho;

  // Целевые ккал = TDEE + Δ цели + прибавка стадии, не ниже минимума
  const stage = LIFE_STAGES[stageKey] ?? LIFE_STAGES.default;
  const minKcal = MIN_KCAL[sexKey] ?? 1200;
  const targetKcal = Math.max(tdeeUsed + goalCfg.kcal_delta + stage.kcal_add, minKcal);

  // БЖУ
  const { protein: proteinG, warning } = calcProtein(weight, condKey, stageKey, targetKcal);
  const proteinKcal = proteinG * KCAL_PER_GRAM.protein;
  const fatG = (targetKcal * FAT_SHARE) / KCAL_PER_GRAM.fat;
  const fatKcal = fatG * KCAL_PER_GRAM.fat;
  const carbsKcal = targetKcal - proteinKcal - fatKcal;
  const carbsG = carbsKcal / KCAL_PER_GRAM.carbs;

  // Клетчатка
  const cond = CONDITIONS[condKey] ?? CONDITIONS.healthy;
  const fiberG = Math.max(targetKcal * cond.fiber_per_kcal, MIN_FIBER_G);

  // Предупреждения
  const warnings: string[] = [];
  if (warning) warnings.push(warning);
  if (stageKey === 'pregnant' && goalKey === 'lose') {
    warnings.push('Похудение во время беременности не рекомендуется — нужна консультация врача.');
  }

  return {
    target_kcal: targetKcal,
    protein_g: proteinG,
    fat_g: fatG,
    carbs_g: carbsG,
    fiber_g: fiberG,
    bmr,
    tdee: tdeeUsed,
    condition_label: cond.label,
    activity_label: actCfg.label,
    goal_label: goalCfg.label,
    warnings,
  };
}
