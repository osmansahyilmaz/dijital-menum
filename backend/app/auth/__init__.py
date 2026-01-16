"""
Phase-2: Authentication module.
Provides JWT verification and user identity extraction.
"""

from app.auth.dependencies import get_current_user
from app.auth.jwt import verify_supabase_jwt

__all__ = ["get_current_user", "verify_supabase_jwt"]
