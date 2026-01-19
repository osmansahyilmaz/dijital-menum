"""
Phase-2: JWT verification using Supabase JWKS or JWT Secret.
Supports both RS256 (default) and HS256 (legacy/secret) algorithms.
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
    """Get cached JWKS client for Supabase public keys (RS256)."""
    supabase_url = _get_supabase_url()
    jwks_url = f"{supabase_url}/auth/v1/.well-known/jwks.json"
    return PyJWKClient(jwks_url)


def _get_jwt_secret() -> str:
    """Get JWT secret from environment (Supabase JWT Secret) for HS256."""
    secret = os.getenv("SUPABASE_JWT_SECRET")
    if not secret:
        # Fallback to anon key if secret not explicitly set
        secret = os.getenv("SUPABASE_ANON_KEY")
    if not secret:
        raise ValueError("SUPABASE_JWT_SECRET or SUPABASE_ANON_KEY required for HS256 verification")
    return secret


def verify_supabase_jwt(token: str) -> dict[str, Any]:
    """
    Verify a Supabase JWT and return the decoded payload.
    Auto-detects algorithm (RS256 or HS256) from token header.
    
    Args:
        token: The JWT string to verify
        
    Returns:
        Decoded JWT payload containing user claims
        
    Raises:
        HTTPException: 401 if token is invalid, expired, or malformed
    """
    try:
        # Decode header to check algorithm without verifying signature yet
        header = jwt.get_unverified_header(token)
        algorithm = header.get("alg")
        
        supabase_url = _get_supabase_url()
        issuer = f"{supabase_url}/auth/v1"
        
        if algorithm == "HS256":
            # Use JWT Secret for HS256
            secret = _get_jwt_secret()
            payload = jwt.decode(
                token,
                secret,
                algorithms=["HS256"],
                audience="authenticated",
                issuer=issuer,
            )
        elif algorithm in ["RS256", "ES256"]:
            # Use JWKS for Asymmetric algorithms (RSA or ECDSA)
            jwks_client = _get_jwks_client()
            signing_key = jwks_client.get_signing_key_from_jwt(token)
            payload = jwt.decode(
                token,
                signing_key.key,
                algorithms=[algorithm],
                audience="authenticated",
                issuer=issuer,
            )
        else:
            logger.warning(f"Unsupported JWT algorithm: {algorithm}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Unsupported JWT algorithm: {algorithm}",
                headers={"WWW-Authenticate": "Bearer"},
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
        logger.warning(f"JWT verification failed: invalid token - {type(e).__name__}: {e}")
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
