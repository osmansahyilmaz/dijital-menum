"""
Health check endpoint.
Phase-1: Deterministic, no external dependencies.
"""

from fastapi import APIRouter

router = APIRouter(prefix="/api", tags=["health"])


@router.get("/health")
def health_check() -> dict:
    """Return health status. Deterministic, no DB or external calls."""
    return {"status": "ok"}
