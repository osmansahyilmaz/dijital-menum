"""
Environment configuration with validation.
Phase-1: Only ENV, LOG_LEVEL, FRONTEND_ORIGIN allowed.
"""

from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    ENV: str
    LOG_LEVEL: str
    FRONTEND_ORIGIN: str
    
    # Phase-2: Supabase Auth
    SUPABASE_URL: str | None = None

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache
def get_settings() -> Settings:
    """Return cached settings instance. Fails fast if env vars missing."""
    return Settings()
