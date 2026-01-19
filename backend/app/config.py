"""
Environment configuration with validation.
"""

from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Core settings
    ENV: str
    LOG_LEVEL: str
    FRONTEND_ORIGIN: str
    
    # Supabase Auth & Storage
    SUPABASE_URL: str | None = None
    SUPABASE_ANON_KEY: str | None = None
    SUPABASE_JWT_SECRET: str | None = None
    SUPABASE_SERVICE_ROLE_KEY: str | None = None
    SUPABASE_STORAGE_BUCKET: str | None = None

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"  # Ignore extra fields in .env
    )


@lru_cache
def get_settings() -> Settings:
    """Return cached settings instance. Fails fast if env vars missing."""
    return Settings()
