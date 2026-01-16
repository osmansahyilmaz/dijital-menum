"""
Phase-2: FastAPI dependencies for authentication.
Provides reusable dependencies for protected routes.
"""

from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.auth.jwt import verify_supabase_jwt


# HTTP Bearer token extractor
security = HTTPBearer()


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)]
) -> str:
    """
    FastAPI dependency that extracts and validates the current user from JWT.
    
    Args:
        credentials: Bearer token from Authorization header
        
    Returns:
        user_id (sub claim) from the verified JWT
        
    Raises:
        HTTPException: 401 if token is missing, invalid, or user_id not found
    """
    token = credentials.credentials
    
    # Verify the JWT and get payload
    payload = verify_supabase_jwt(token)
    
    # Extract user ID from 'sub' claim
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token: missing user identifier",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user_id


# Type alias for cleaner route signatures
CurrentUser = Annotated[str, Depends(get_current_user)]
