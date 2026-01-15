"""
Centralized logging configuration.
Phase-1: Structured JSON output, no print() usage.
"""

import logging
import sys
from app.config import get_settings


def setup_logging() -> logging.Logger:
    """Configure and return the application logger."""
    settings = get_settings()

    # Create logger
    logger = logging.getLogger("dijital_menum")
    logger.setLevel(settings.LOG_LEVEL.upper())

    # Prevent duplicate handlers
    if logger.handlers:
        return logger

    # Console handler with structured format
    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(settings.LOG_LEVEL.upper())

    # Structured log format
    formatter = logging.Formatter(
        fmt='{"time": "%(asctime)s", "level": "%(levelname)s", "message": "%(message)s", "module": "%(module)s"}',
        datefmt="%Y-%m-%dT%H:%M:%S"
    )
    handler.setFormatter(formatter)
    logger.addHandler(handler)

    return logger


# Single logger instance
logger = setup_logging()
