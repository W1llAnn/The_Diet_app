"""Тесты слоя базы данных (diet.db) на временной SQLite-базе.

Каждый тест получает чистую временную БД через фикстуру tmp_db — продакшен
data/diet.db не затрагивается. DIET_DB_URL принудительно чистим, чтобы тесты
шли в SQLite даже если в окружении задан PostgreSQL.
"""

import os
import tempfile

import pandas as pd
import pytest

from diet import db


@pytest.fixture
def tmp_db(monkeypatch):
    """Чистая временная SQLite-база + инициализированная схема.

    monkeypatch чистит DIET_DB_URL, чтобы тесты не ушли в PostgreSQL,
    даже если переменная задана в окружении.
    """
    monkeypatch.delenv("DIET_DB_URL", raising=False)
    with tempfile.TemporaryDirectory() as td:
        path = os.path.join(td, "test.db")
        db.init_db(path)
        yield path


# ───────────────────────── helper ──────────────────────────────────────────

def _add_product(conn, pid, name, carbs=10, gi=50, kcal=100,
                 diabetes_label="allowed"):
    """Быстро добавить тестовый продукт. Возвращает реальный id в БД.

    pid используется как orig_id; реальный id строится через make_product_id
    ('test-{pid}'), т.к. upsert_product сам добавляет source-префикс.
    """
    real_id = db.make_product_id("test", pid)
    db.upsert_product(conn, {
        "id": pid, "source": "test", "name": name,
        "brands": "", "category": "Test",
        "gi": gi, "gi_reason": "test", "diabetes_label": diabetes_label,
        "diabetes_reason": "test",
        "kcal": kcal, "protein_g": 5, "fat_g": 2, "carbs_g": carbs,
        "fiber_g": 1, "sugars_g": 0,
    })
    return real_id


# ───────────────────────── schema / init ───────────────────────────────────

class TestSchema:
    def test_init_creates_tables(self, tmp_db):
        with db.connect(tmp_db) as conn:
            cur = conn.execute(
                "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
            )
            tables = {r[0] for r in cur.fetchall()}
        assert {"products", "users", "diary_entries"} <= tables

    def test_init_idempotent(self, tmp_db):
        """Повторный init_db не падает и не дублирует таблицы."""
        db.init_db(tmp_db)  # второй раз
        with db.connect(tmp_db) as conn:
            n = conn.execute(
                "SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name='products'"
            ).fetchone()[0]
        assert n == 1

    def test_foreign_keys_enforced(self, tmp_db):
        """diary_entries с несуществующим product_id должен нарушить FK."""
        with db.transaction(tmp_db) as conn:
            _add_product(conn, "p1", "Тест")
        with db.transaction(tmp_db) as conn:
            uid = db.add_user(conn, _dummy_profile_result()[0],
                              _dummy_profile_result()[1])
        # INSERT с product_id, которого нет → IntegrityError
        import sqlite3
        with pytest.raises(sqlite3.IntegrityError):
            with db.transaction(tmp_db) as conn:
                db.add_entry(conn, uid, "несуществующий", 100)  # нет test- префикса


# ───────────────────────── products ────────────────────────────────────────

class TestProducts:
    def test_make_product_id_deterministic(self):
        assert db.make_product_id("usda", 123) == "usda-123"
        assert db.make_product_id("off", "4601234") == "off-4601234"

    def test_upsert_and_get(self, tmp_db):
        with db.transaction(tmp_db) as conn:
            pid = _add_product(conn, "1", "Яблоко", carbs=12, gi=36)
        with db.connect(tmp_db) as conn:
            p = db.get_product(conn, pid)
        assert p is not None
        assert p["name"] == "Яблоко"
        assert p["carbs_g"] == 12
        assert p["gi"] == 36
        assert p["name_lower"] == "яблоко"

    def test_upsert_replaces(self, tmp_db):
        """Повторный upsert с тем же id обновляет данные."""
        with db.transaction(tmp_db) as conn:
            pid = _add_product(conn, "1", "Яблоко", carbs=12)
            _add_product(conn, "1", "Яблоко зелёное", carbs=14)
        with db.connect(tmp_db) as conn:
            p = db.get_product(conn, pid)
        assert p["name"] == "Яблоко зелёное"
        assert p["carbs_g"] == 14

    def test_get_missing_returns_none(self, tmp_db):
        with db.connect(tmp_db) as conn:
            assert db.get_product(conn, "нет такого") is None


class TestSearch:
    def test_case_insensitive_cyrillic(self, tmp_db):
        """КРИТИЧНО: lower() в SQLite не работает с кириллицей, поэтому поиск
        идёт по колонке name_lower. Проверяем, что заглавные кириллические
        названия находятся."""
        with db.transaction(tmp_db) as conn:
            _add_product(conn, "1", "Рис Краснодарский", carbs=83, gi=75, kcal=350)
            _add_product(conn, "2", "Говядина", carbs=0, gi=0, kcal=200)
        with db.connect(tmp_db) as conn:
            df = db.search_products(conn, "рис", limit=10)
        assert len(df) == 1
        assert "Краснодарский" in df.iloc[0]["name"]

    def test_prioritizes_filled_nutrients(self, tmp_db):
        """Продукты с заполненным КБЖУ всплывают выше, чем без него."""
        with db.transaction(tmp_db) as conn:
            _add_product(conn, "1", "Рис Краснодарский", carbs=None, gi=75, kcal=None)
            _add_product(conn, "2", "Рис длиннозерный", carbs=78, gi=75, kcal=350)
        with db.connect(tmp_db) as conn:
            df = db.search_products(conn, "рис", limit=2)
        # первый должен быть с заполненным КБЖУ (id=2)
        assert df.iloc[0]["name"] == "Рис длиннозерный"

    def test_word_boundary_over_substring(self, tmp_db):
        """«рис» не должен давать «ирис» (подстрока без границы слова)."""
        with db.transaction(tmp_db) as conn:
            _add_product(conn, "1", "Рис", carbs=80, gi=75)
            _add_product(conn, "2", "Ирис", carbs=95, gi=70)
        with db.connect(tmp_db) as conn:
            df = db.search_products(conn, "рис", limit=2)
        names = df["name"].tolist()
        assert "Рис" in names
        # «Ирис» может попасть в выборку как подстрока, но не первым
        assert names[0] == "Рис"


# ───────────────────────── users + diary ───────────────────────────────────

def _dummy_profile_result():
    """Возвращает (profile, result) для тестов users/diary."""
    from diet import UserProfile, calculate
    profile = UserProfile(sex="female", age=30, weight=70, height=165,
                          activity="light", goal="maintain")
    result = calculate(profile, formula="who", condition="diabetes_t2")
    return profile, result


class TestUsers:
    def test_add_and_get_user(self, tmp_db):
        profile, result = _dummy_profile_result()
        with db.transaction(tmp_db) as conn:
            uid = db.add_user(conn, profile, result, name="Анна")
        with db.connect(tmp_db) as conn:
            u = db.get_user(conn, uid)
        assert u["name"] == "Анна"
        assert u["condition_key"] == "diabetes_t2"
        assert u["target_kcal"] == result.target_kcal
        assert u["protein_g"] == result.protein_g


class TestDiaryEntries:
    def test_add_entry_and_list(self, tmp_db):
        profile, result = _dummy_profile_result()
        with db.transaction(tmp_db) as conn:
            pid = _add_product(conn, "p1", "Рис", carbs=74, gi=75)
            uid = db.add_user(conn, profile, result)
            eid = db.add_entry(conn, uid, pid, 100, meal="lunch", day="2026-01-01")
        assert eid > 0
        with db.connect(tmp_db) as conn:
            df = db.entries_for_day(conn, uid, "2026-01-01")
        assert len(df) == 1
        assert df.iloc[0]["grams"] == 100
        assert df.iloc[0]["meal"] == "lunch"

    def test_day_totals_includes_gl(self, tmp_db):
        """Итоги дня содержат ГН, посчитанную на лету."""
        profile, result = _dummy_profile_result()
        with db.transaction(tmp_db) as conn:
            pid_rice = _add_product(conn, "p1", "Рис", carbs=74, gi=75, kcal=333)
            pid_meat = _add_product(conn, "p2", "Мясо", carbs=0, gi=0, kcal=150)
            uid = db.add_user(conn, profile, result)
            db.add_entry(conn, uid, pid_rice, 60, meal="lunch", day="2026-01-01")
            db.add_entry(conn, uid, pid_meat, 200, meal="lunch", day="2026-01-01")
        with db.connect(tmp_db) as conn:
            totals = db.day_totals(conn, uid, "2026-01-01")
        # ГН риса: 75/100 * 74 * 60/100 = 33.3; мясо = 0
        assert "gl" in totals
        assert totals["gl"] == pytest.approx(33.3, abs=0.1)
        assert totals["kcal"] == pytest.approx(333 * 0.6 + 150 * 2, abs=1)

    def test_meal_totals_isolates_meal(self, tmp_db):
        """meal_totals считает только указанный приём пищи."""
        profile, result = _dummy_profile_result()
        with db.transaction(tmp_db) as conn:
            pid = _add_product(conn, "p1", "Рис", carbs=74, gi=75, kcal=333)
            uid = db.add_user(conn, profile, result)
            db.add_entry(conn, uid, pid, 60, meal="lunch", day="2026-01-01")
            db.add_entry(conn, uid, pid, 60, meal="breakfast", day="2026-01-01")
        with db.connect(tmp_db) as conn:
            lunch = db.meal_totals(conn, uid, "2026-01-01", "lunch")
        # только обед, без завтрака
        assert lunch["gl"] == pytest.approx(33.3, abs=0.1)

    def test_day_history(self, tmp_db):
        """История возвращает по строке на день."""
        profile, result = _dummy_profile_result()
        with db.transaction(tmp_db) as conn:
            pid = _add_product(conn, "p1", "Рис", carbs=74, gi=75, kcal=333)
            uid = db.add_user(conn, profile, result)
            db.add_entry(conn, uid, pid, 60, meal="lunch", day="2026-01-01")
        with db.connect(tmp_db) as conn:
            hist = db.day_history(conn, uid, days=3)
        assert len(hist) == 3
        assert set(hist.columns) >= {"day", "kcal", "protein_g", "fat_g",
                                     "carbs_g", "fiber_g", "gl"}
