"""Аутентификация пользователей (D4): пароли (bcrypt) и JWT-токены.

Flow:
    register → хешируем пароль (bcrypt), сохраняем password_hash в users,
    выдаём access-токен (JWT HS256) с sub=user_id и сроком жизни.
    login    → сверяем пароль с хешем, выдаём новый access-токен.
    запрос   → заголовок Authorization: Bearer <token>; get_current_user
               верифицирует подпись/срок и возвращает профиль пользователя.

Секрет подписи берётся из DIET_JWT_SECRET. При отсутствии — генерируется
случайный ephemeral ключ (с предупреждением): подходит для локальной
разработки, но токены инвалидируются при рестарте процесса. В проде
DIET_JWT_SECRET обязателен.
"""

from __future__ import annotations

import os
import secrets
import warnings
from datetime import datetime, timedelta, timezone
from typing import Any

import bcrypt
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from . import db

# Срок жизни access-токена. В MVP нет refresh-токенов — по истечении пользователь
# логинится снова. 7 дней — разумный компромисс между удобством и безопасностью.
ACCESS_TOKEN_EXPIRE_MINUTES = 7 * 24 * 60

# Bearer-схема для FastAPI: автоматически документирует requirement в OpenAPI и
# парсит заголовок Authorization. auto_error=False — чтобы самим вернуть 401 с
# понятным сообщением, а не дефолтный «Not authenticated».
_bearer = HTTPBearer(auto_error=False)

# Алгоритм подписи JWT (симметричный — один секрет и для подписи, и для проверки).
_JWT_ALGORITHM = "HS256"


# ───────────────────────── секрет ──────────────────────────────────────────


def _get_secret_key() -> str:
    """Секрет для подписи JWT из DIET_JWT_SECRET.

    Без env-переменной — случайный ephemeral ключ + предупреждение. Это НЕ
    безопасно для продакшена (токены валидны только в рамках одного запуска),
    но избавляет от падения при локальной разработке без .env.
    """
    key = os.environ.get("DIET_JWT_SECRET")
    if key:
        return key
    ephemeral = secrets.token_urlsafe(48)
    warnings.warn(
        "DIET_JWT_SECRET не задан — используется случайный ephemeral ключ. "
        "Все токены станут невалидными при рестарте. Задайте DIET_JWT_SECRET "
        "в .env для стабильной работы.",
        RuntimeWarning,
        stacklevel=2,
    )
    return ephemeral


# ───────────────────────── пароли ──────────────────────────────────────────


def hash_password(password: str) -> str:
    """bcrypt-хеш пароля. Возвращает строку для сохранения в password_hash."""
    # bcrypt работает с байтами; сохраняем как utf-8-строку для БД.
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, password_hash: str | None) -> bool:
    """Проверить пароль против хеша. None-хеш (нет пароля) → всегда False."""
    if not password_hash:
        return False
    try:
        return bcrypt.checkpw(password.encode("utf-8"),
                              password_hash.encode("utf-8"))
    except (ValueError, TypeError):
        # битый хеш — считаем пароль неверным, не падаем.
        return False


# ───────────────────────── токены ──────────────────────────────────────────


def create_access_token(user_id: int,
                        expires_minutes: int = ACCESS_TOKEN_EXPIRE_MINUTES) -> str:
    """Создать JWT с sub=user_id и сроком жизни exp.

    Stateless: всё, что нужно для проверки — подпись и exp. Никакой серверной
    сессии не держим; отозвать токен до истечения нельзя (это компромисс MVP).
    """
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user_id),
        "iat": now,
        "exp": now + timedelta(minutes=expires_minutes),
    }
    return jwt.encode(payload, _get_secret_key(), algorithm=_JWT_ALGORITHM)


def _decode_token(token: str) -> dict[str, Any]:
    """Декодировать и верифицировать JWT. Кидает jwt.* при ошибке."""
    return jwt.decode(token, _get_secret_key(), algorithms=[_JWT_ALGORITHM])


# ───────────────────────── FastAPI-зависимость ─────────────────────────────


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
) -> dict:
    """Зависимость: возвращает профиль текущего пользователя из Bearer-токена.

    401, если токена нет / он битый / истёк / пользователь не найден в БД.
    Возвращает полный словарь пользователя (id, name, condition_key, ...).
    """
    cred_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Не передан access-токен (Authorization: Bearer <token>)",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if credentials is None or not credentials.credentials:
        raise cred_error

    token = credentials.credentials
    try:
        payload = _decode_token(token)
    except jwt.ExpiredSignatureError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Срок действия токена истёк",
            headers={"WWW-Authenticate": "Bearer"},
        ) from e
    except jwt.PyJWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Невалидный access-токен",
            headers={"WWW-Authenticate": "Bearer"},
        ) from e

    try:
        user_id = int(payload["sub"])
    except (KeyError, ValueError, TypeError) as e:
        raise cred_error from e

    with db.transaction() as conn:
        user = db.get_user(conn, user_id)
    if user is None:
        # Токен валиден, но пользователя удалили — считаем невалидным.
        raise cred_error
    return user
