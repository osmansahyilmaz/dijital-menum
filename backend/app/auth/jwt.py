"""
Phase-2: JWT verification using Supabase JWKS.
Verifies Supabase-issued JWTs without issuing or storing tokens.
"""

import os
from typing import Any
from functools import lru_cache

import httpx
import jwt
from jwt import PyJWKClient
from fastapi import HTTPException, status

from app.logging import logger


# Cache the JWKS client to avoid repeated fetches
_jwks_client: PyJWKClient | None = None


def _get_supabase_url() -> str:
    """Get Supabase URL from environment."""
    url = os.getenv("SUPABASE_URL")
    if not url:
        raise ValueError("SUPABASE_URL environment variable is required")
    return url


@lru_cache(maxsize=1)
def _get_jwks_client() -> PyJWKClient:
    """Get cached JWKS client for Supabase public keys."""
    supabase_url = _get_supabase_url()
    # Supabase JWKS endpoint
    jwks_url = f"{supabase_url}/auth/v1/.well-known/jwks.json"
    return PyJWKClient(jwks_url)


def verify_supabase_jwt(token: str) -> dict[str, Any]:
    """
    Verify a Supabase JWT and return the decoded payload.
    
    Args:
        token: The JWT string to verify
        
    Returns:
        Decoded JWT payload containing user claims
        
    Raises:
        HTTPException: 401 if token is invalid, expired, or malformed
    """
    try:
        jwks_client = _get_jwks_client()
        
        # Get the signing key from JWKS
        signing_key = jwks_client.get_signing_key_from_jwt(token)
        
        # Decode and verify the token
        supabase_url = _get_supabase_url()
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            audience="authenticated",
            issuer=f"{supabase_url}/auth/v1",
        )
        
        return payload
        
    except jwt.ExpiredSignatureError:
        logger.warning("JWT verification failed: token expired")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError as e:
        logger.warning(f"JWT verification failed: invalid token - {type(e).__name__}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except ValueError as e:
        logger.error(f"JWT verification configuration error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication configuration error",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except httpx.HTTPError as e:
        logger.error(f"Failed to fetch JWKS: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication service unavailable",
            headers={"WWW-Authenticate": "Bearer"},
        )
