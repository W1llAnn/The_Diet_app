-- Схема базы данных The Diet App.
--
-- Диалект-нейтральный DDL, совместимый с SQLite (локальная разработка)
-- и PostgreSQL (продакшен, managed). Отличия вынесены в db.py
-- (AUTOINCREMENT ↔ SERIAL, INSERT OR REPLACE ↔ ON CONFLICT).
--
-- ГН НЕ хранится: она считается на лету (gi/100 * carbs * grams/100),
-- т.к. зависит от порции и аддитивна по ингредиентам/дню.


-- ───────────────────────── products ─────────────────────────
-- Справочник продуктов (~31 тыс. строк из unified_foods.csv).
-- Уже содержит gi, food_group, diabetes_label — результат работы gi.py.
CREATE TABLE IF NOT EXISTS products (
    id              TEXT PRIMARY KEY,        -- '{source}-{orig_id}' (детерминированный)
    source          TEXT NOT NULL,           -- 'usda' / 'off'
    orig_id         TEXT,                    -- исходный id (fdc_id / штрихкод)
    name            TEXT NOT NULL,
    name_lower      TEXT NOT NULL,           -- name в нижнем регистре (Python-side, для поиска)
    brands          TEXT DEFAULT '',
    category        TEXT DEFAULT '',         -- food_group (классификация food_groups.classify)
    gi              INTEGER DEFAULT 0,       -- гликемический индекс 0..100
    gi_reason       TEXT DEFAULT '',
    diabetes_label  TEXT DEFAULT '',         -- recommended/allowed/caution/forbidden
    diabetes_reason TEXT DEFAULT '',
    -- нутриенты на 100 г (NULL = нет данных):
    kcal            REAL,
    protein_g       REAL,
    fat_g           REAL,
    carbs_g         REAL,
    fiber_g         REAL,
    sugars_g        REAL,
    sat_fat_g       REAL,
    sodium_mg       REAL,
    potassium_mg    REAL,
    phosphorus_mg   REAL,
    calcium_mg      REAL,
    iron_mg         REAL,
    vitc_mg         REAL
);

-- Полнотекстовый поиск по названию: ищем по name_lower (Python-side lower,
-- т.к. SQLite lower() не работает с кириллицей). ILIKE в pg избыточен.
CREATE INDEX IF NOT EXISTS idx_products_name_lower
    ON products (name_lower);

-- Быстрая фильтрация по группе здоровья (диабет-поиск и т.п.).
CREATE INDEX IF NOT EXISTS idx_products_diabetes_label
    ON products (diabetes_label);


-- ───────────────────────── users ─────────────────────────
-- Профили пользователей: антропометрия + рассчитанные нормы (КБЖУ + клетчатка).
-- condition_key/life_stage — параметры расчёта; target_* — результат calculator.py.
CREATE TABLE IF NOT EXISTS users (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    name            TEXT DEFAULT '',
    -- аутентификация (D4): NULL для профилей без входа (старые данные).
    email           TEXT DEFAULT NULL,       -- логин; уникальность проверяется в Python
    password_hash   TEXT DEFAULT NULL,       -- bcrypt-хеш; NULL — нельзя залогиниться
    -- антропометрия (как в UserProfile):
    sex             TEXT NOT NULL,           -- 'male' / 'female'
    age             INTEGER NOT NULL,
    weight          REAL NOT NULL,           -- кг
    height          REAL NOT NULL,           -- см
    activity        TEXT NOT NULL,           -- ключ из ACTIVITY_LEVELS
    goal            TEXT NOT NULL,           -- 'maintain' / 'lose' / 'gain'
    -- параметры расчёта:
    condition_key   TEXT NOT NULL DEFAULT 'healthy',  -- ключ из CONDITIONS
    life_stage      TEXT NOT NULL DEFAULT 'default',  -- ключ из LIFE_STAGES
    formula         TEXT NOT NULL DEFAULT 'who',      -- 'who' / 'mifflin'
    -- рассчитанные нормы (NutritionResult):
    target_kcal     REAL NOT NULL,
    protein_g       REAL NOT NULL,
    fat_g           REAL NOT NULL,
    carbs_g         REAL NOT NULL,
    fiber_g         REAL NOT NULL,
    created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
    updated_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);


-- ───────────────────────── diary_entries ─────────────────────────
-- Записи дневника: что съел пользователь (одна строка = одна порция продукта).
CREATE TABLE IF NOT EXISTS diary_entries (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id      TEXT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    grams           REAL NOT NULL,           -- масса порции, г
    meal            TEXT NOT NULL DEFAULT 'snack',  -- breakfast/lunch/dinner/snack
    day             TEXT NOT NULL,           -- 'YYYY-MM-DD'
    created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);

-- Основной запрос — итоги по пользователю за день: (user_id, day).
CREATE INDEX IF NOT EXISTS idx_diary_user_day
    ON diary_entries (user_id, day);

-- История по дате (неделя/месяц).
CREATE INDEX IF NOT EXISTS idx_diary_day
    ON diary_entries (day);
