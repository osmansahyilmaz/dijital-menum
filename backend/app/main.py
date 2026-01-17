"""
FastAPI application entry point.
Phase-1: Single instance, CORS, health endpoint only.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.logging import logger
from app.api.health import router as health_router
from app.api.menus import router as menus_router
from app.api.images import router as images_router


def create_app() -> FastAPI:
    """Create and configure FastAPI application."""
    settings = get_settings()

    app = FastAPI(
        title="Dijital Menum API",
        description="QR Code Menu MVP - Phase 1",
        version="0.1.0"
    )

    # CORS configuration - no wildcards
    allowed_origins = [settings.FRONTEND_ORIGIN]

    # Allow localhost only in local environment
    if settings.ENV == "local":
        allowed_origins.extend([
            "http://localhost:5173",
            "http://127.0.0.1:5173",
        ])

    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE"],
        allow_headers=["*"],
    )

    # Include routers
    app.include_router(health_router)
    app.include_router(menus_router)  # Phase-2: Menu routes with auth
    app.include_router(images_router)  # Phase-4: Image upload

    logger.info(f"Application started in {settings.ENV} mode")

    return app


# Single FastAPI instance
app = create_app()
