"""Тесты HTTP API (diet.api) на временной SQLite-базе через TestClient.

Стратегия изоляции БД: monkeypatch'им diet.db.DEFAULT_DB_PATH на временный
файл (через фикстуру tmp_path pytest), тогда все эндпоинты (открытие
соединений, init_db при старте) идут во временную базу — продакшен
data/diet.db не затрагивается. DIET_DB_URL и DIET_JWT_SECRET фиксируем
детерминированно, чтобы токены были стабильны между тестами.

Клиент создаётся через `with TestClient(app)` — так срабатывает lifespan
(init_db) уже после monkeypatch, то есть схема создаётся в tmp-базе.
"""

import pytest
from fastapi.testclient import TestClient

from diet import db
from diet.api import app

# Стабильный тестовый секрет JWT (32+ байта, чтобы PyJWT не предупреждал).
_TEST_JWT_SECRET = "test-secret-fixed-and-long-enough-for-hs256-aaaa-bbbb"

# Базовый профиль для регистрации/расчёта (enum-значения — строки, валидные
# для доменных справочников).
PROFILE = {
    "sex": "female", "age": 30, "weight": 70, "height": 165,
    "activity": "light", "goal": "maintain",
    "condition": "diabetes_t2",
}


@pytest.fixture
def client(monkeypatch, tmp_path):
    """TestClient + изолированная tmp-БД + стабильный JWT-секрет."""
    monkeypatch.delenv("DIET_DB_URL", raising=False)
    monkeypatch.setenv("DIET_JWT_SECRET", _TEST_JWT_SECRET)
    tmp_db_path = str(tmp_path / "api_test.db")
    monkeypatch.setattr(db, "DEFAULT_DB_PATH", tmp_db_path)
    with TestClient(app) as c:  # вход => lifespan => init_db(tmp)
        yield c


# ───────────────────────── helpers ─────────────────────────────────────────

def _seed_product(pid: str, name: str, *, carbs=10, gi=50, kcal=100,
                  sugars=0, sodium=0, label="allowed") -> str:
    """Вставляет продукт напрямую в БД (минуя API). Возвращает его id."""
    real_id = db.make_product_id("test", pid)
    with db.transaction() as conn:
        db.upsert_product(conn, {
            "id": pid, "source": "test", "name": name,
            "brands": "", "category": "Test",
            "gi": gi, "gi_reason": "test", "diabetes_label": label,
            "diabetes_reason": "test",
            "kcal": kcal, "protein_g": 5, "fat_g": 2, "carbs_g": carbs,
            "fiber_g": 1, "sugars_g": sugars, "sodium_mg": sodium,
        })
    return real_id


def _register(client, email="user@example.com", password="secret123",
              profile=None):
    """Регистрирует пользователя, возвращает (user_dict, token)."""
    body = {**(profile or PROFILE), "email": email, "password": password}
    r = client.post("/v1/auth/register", json=body)
    assert r.status_code == 200, r.text
    data = r.json()
    return data["user"], data["access_token"]


def _auth(token: str) -> dict:
    """Заголовок авторизации для запроса."""
    return {"Authorization": f"Bearer {token}"}


# ───────────────────────── health ──────────────────────────────────────────

class TestHealth:
    def test_health(self, client):
        r = client.get("/health")
        assert r.status_code == 200
        assert r.json() == {"status": "ok"}


# ───────────────────────── D2: продукты (публичные) ────────────────────────

class TestProducts:
    def test_search_finds_product(self, client):
        _seed_product("1", "Рис Краснодарский", carbs=83, gi=75, kcal=350)
        r = client.get("/v1/products", params={"search": "рис"})
        assert r.status_code == 200
        items = r.json()["items"]
        assert len(items) == 1
        assert "Краснодарский" in items[0]["name"]
        assert "name_lower" not in items[0]

    def test_search_empty_query_rejected(self, client):
        # min_length=1 → пустой поиск даёт 422.
        r = client.get("/v1/products", params={"search": ""})
        assert r.status_code == 422

    def test_get_product_ok(self, client):
        pid = _seed_product("1", "Яблоко", carbs=12, gi=36)
        r = client.get(f"/v1/products/{pid}")
        assert r.status_code == 200
        body = r.json()
        assert body["name"] == "Яблоко"
        assert body["carbs_g"] == 12

    def test_get_product_404(self, client):
        r = client.get("/v1/products/несуществующий-id")
        assert r.status_code == 404


# ───────────────────────── D4: аутентификация ──────────────────────────────

class TestAuth:
    def test_register_returns_token_and_profile(self, client):
        user, token = _register(client)
        assert token
        assert user["email"] == "user@example.com"
        assert user["target_kcal"] > 0
        assert user["condition_key"] == "diabetes_t2"
        # password_hash не утекает в ответ.
        assert "password_hash" not in user

    def test_register_duplicate_email_conflict(self, client):
        _register(client, email="dup@example.com")
        r = client.post("/v1/auth/register", json={
            **PROFILE, "email": "dup@example.com", "password": "secret123",
        })
        assert r.status_code == 409

    def test_register_short_password_rejected(self, client):
        r = client.post("/v1/auth/register", json={
            **PROFILE, "email": "x@example.com", "password": "short",
        })
        assert r.status_code == 422

    def test_register_invalid_activity_enum(self, client):
        # Enum-валидация: несуществующая активность → 422 от Pydantic, а не от
        # ручного обработчика.
        r = client.post("/v1/auth/register", json={
            **PROFILE, "activity": "nonexistent",
            "email": "y@example.com", "password": "secret123",
        })
        assert r.status_code == 422

    def test_login_correct_password(self, client):
        _register(client, email="login@example.com", password="secret123")
        r = client.post("/v1/auth/login", json={
            "email": "login@example.com", "password": "secret123",
        })
        assert r.status_code == 200, r.text
        assert r.json()["access_token"]

    def test_login_wrong_password(self, client):
        _register(client, email="login@example.com", password="secret123")
        r = client.post("/v1/auth/login", json={
            "email": "login@example.com", "password": "WRONG",
        })
        assert r.status_code == 401

    def test_login_unknown_email(self, client):
        r = client.post("/v1/auth/login", json={
            "email": "nobody@example.com", "password": "whatever",
        })
        assert r.status_code == 401

    def test_me_without_token_401(self, client):
        r = client.get("/v1/auth/me")
        assert r.status_code == 401

    def test_me_with_garbage_token_401(self, client):
        r = client.get("/v1/auth/me", headers={"Authorization": "Bearer garbage"})
        assert r.status_code == 401

    def test_me_returns_profile(self, client):
        user, token = _register(client)
        r = client.get("/v1/auth/me", headers=_auth(token))
        assert r.status_code == 200
        assert r.json()["id"] == user["id"]


# ───────────────────────── D2: дневник (защищённый) ────────────────────────

class TestDiary:
    def test_protected_endpoints_require_token(self, client):
        # diary/day-summary/checks без токена → 401.
        assert client.post("/v1/diary", json={
            "product_id": "x", "grams": 100,
        }).status_code == 401
        assert client.get(
            "/v1/day-summary", params={"day": "2026-01-01"}
        ).status_code == 401
        assert client.get(
            "/v1/checks", params={"day": "2026-01-01"}
        ).status_code == 401

    def test_add_entry_and_summary(self, client):
        _, token = _register(client)
        pid = _seed_product("1", "Рис", carbs=74, gi=75, kcal=333)

        r = client.post("/v1/diary", json={
            "product_id": pid, "grams": 100, "meal": "lunch",
            "day": "2026-01-01",
        }, headers=_auth(token))
        assert r.status_code == 200, r.text
        assert r.json()["id"] > 0

        r = client.get("/v1/day-summary",
                       params={"day": "2026-01-01"}, headers=_auth(token))
        assert r.status_code == 200
        body = r.json()
        assert body["totals"]["kcal"] == pytest.approx(333, abs=1)
        # ГН риса 100 г: 75/100 * 74 * 100/100 = 55.5
        assert body["totals"]["gl"] == pytest.approx(55.5, abs=0.1)
        assert len(body["entries"]) == 1
        assert body["entries"][0]["grams"] == 100

    def test_add_entry_unknown_product(self, client):
        _, token = _register(client)
        r = client.post("/v1/diary", json={
            "product_id": "нет-такого", "grams": 100, "day": "2026-01-01",
        }, headers=_auth(token))
        assert r.status_code == 404

    def test_add_entry_bad_day(self, client):
        _, token = _register(client)
        pid = _seed_product("1", "Рис", carbs=74)
        r = client.post("/v1/diary", json={
            "product_id": pid, "grams": 100, "day": "01-01-2026",
        }, headers=_auth(token))
        assert r.status_code == 422

    def test_users_isolated(self, client):
        """Каждый пользователь видит только свой дневник."""
        _, token_a = _register(client, email="a@example.com")
        _, token_b = _register(client, email="b@example.com")
        pid = _seed_product("1", "Рис", carbs=74, gi=75, kcal=333)

        client.post("/v1/diary", json={
            "product_id": pid, "grams": 100, "day": "2026-01-01",
        }, headers=_auth(token_a))

        summary_b = client.get("/v1/day-summary",
                               params={"day": "2026-01-01"},
                               headers=_auth(token_b)).json()
        assert summary_b["entries"] == []
        assert summary_b["totals"]["kcal"] == 0


# ───────────────────────── D3: расчёты (публичные) ─────────────────────────

class TestCalculate:
    def test_calculate_returns_norms(self, client):
        r = client.post("/v1/calculate", json=PROFILE)
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["Целевые калории, ккал/день"] > 0
        assert "warnings" in body
        assert body["bmr"] > 0

    def test_calculate_invalid_condition_enum(self, client):
        bad = {**PROFILE, "condition": "cancer"}
        r = client.post("/v1/calculate", json=bad)
        assert r.status_code == 422


# ───────────────────────── D3: проверки (защищённые) ───────────────────────

class TestChecks:
    def test_checks_sugar_exceed(self, client):
        """Сахар за день выше лимита для диабета → danger в проверках."""
        _, token = _register(client)
        # Лимит sugars_g для diabetes_t2 = 30 г/день. 200 г варенья × 50 г/100 г
        # = 100 г сахара — превышение.
        pid = _seed_product("sugar", "Варенье", carbs=70, gi=55,
                            sugars=50, kcal=250)
        client.post("/v1/diary", json={
            "product_id": pid, "grams": 200, "meal": "breakfast",
            "day": "2026-01-01",
        }, headers=_auth(token))

        r = client.get("/v1/checks",
                       params={"day": "2026-01-01"}, headers=_auth(token))
        assert r.status_code == 200
        body = r.json()
        assert body["condition"] == "diabetes_t2"
        levels = [c["level"] for c in body["checks"]]
        nutrients = [c["nutrient"] for c in body["checks"]]
        assert "sugars_g" in nutrients
        assert "danger" in levels

    def test_checks_gl_day(self, client):
        """Высокая ГН за день при диабете → предупреждение."""
        _, token = _register(client)
        pid = _seed_product("rice", "Рис", carbs=80, gi=85, kcal=350)
        # 300 г риса → ГН = 85/100 * 80 * 300/100 = 204 >> нормы диабета (<80).
        client.post("/v1/diary", json={
            "product_id": pid, "grams": 300, "meal": "lunch",
            "day": "2026-01-01",
        }, headers=_auth(token))
        r = client.get("/v1/checks",
                       params={"day": "2026-01-01"}, headers=_auth(token))
        body = r.json()
        gl_checks = [c for c in body["checks"] if c["nutrient"] == "gl"]
        assert gl_checks, "должна быть проверка ГН за день"
