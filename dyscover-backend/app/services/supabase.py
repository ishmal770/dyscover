from __future__ import annotations

from functools import lru_cache

from fastapi import HTTPException
from supabase import Client, create_client

from app.config import settings


@lru_cache(maxsize=1)
def get_admin_client() -> Client:
    key = settings.SUPABASE_SERVICE_ROLE_KEY
    if not settings.SUPABASE_URL or not key:
        raise HTTPException(503, "The learning service is not configured with Supabase credentials.")
    return create_client(settings.SUPABASE_URL, key)


@lru_cache(maxsize=1)
def _auth_client() -> Client:
    key = settings.SUPABASE_KEY
    if not settings.SUPABASE_URL or not key:
        raise HTTPException(503, "The learning service is not configured with Supabase credentials.")
    return create_client(settings.SUPABASE_URL, key)


def get_user_id(authorization: str | None) -> str:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(401, "Please sign in first.")
    token = authorization.split(" ", 1)[1].strip()
    try:
        user = _auth_client().auth.get_user(token).user
    except Exception as exc:  # auth errors are intentionally returned without provider details
        raise HTTPException(401, "Your sign-in has expired. Sign in again.") from exc
    if not user:
        raise HTTPException(401, "Please sign in first.")
    return str(user.id)
