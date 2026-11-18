"""Application configuration settings."""

import os
import shutil
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "AI-Based Menopause Symptom Tracking & Clinical Summary System"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    # Database
    # Defaults to Neon PostgreSQL database, configurable via DATABASE_URL env var
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://neondb_owner:npg_hkEws3i9tTcM@ep-twilight-voice-a1kgbfeb-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
    )

    # Security & JWT
    SECRET_KEY: str = os.getenv("SECRET_KEY", "menopause-super-secret-production-key-2026-secure")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # External LLM (used strictly for final narrative summarization)
    GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY", None)

    # Local OCR & Document Extraction
    TESSERACT_CMD: str = os.getenv("TESSERACT_CMD", shutil.which("tesseract") or "/opt/homebrew/bin/tesseract")
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", os.path.abspath("./backend/uploads"))

    # CORS
    BACKEND_CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:5173", "*"]

    model_config = SettingsConfigDict(env_file=".env", extra="allow")


settings = Settings()

# Ensure uploads directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
