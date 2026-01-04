from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Supabase
    SUPABASE_URL: str
    SUPABASE_SECRET_KEY: str  # service_role key (starts with eyJ...)

    # JWT
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_HOURS: int = 24

    # Google OAuth
    GOOGLE_CLIENT_ID: str
    GOOGLE_CLIENT_SECRET: str

    # Microsoft OAuth
    MICROSOFT_CLIENT_ID: str
    MICROSOFT_CLIENT_SECRET: str

    # Claude
    ANTHROPIC_API_KEY: str

    # App URLs
    BACKEND_URL: str = "http://localhost:8000"
    FRONTEND_URL: str = "http://localhost:5173"

    # Encryption key for OAuth tokens
    ENCRYPTION_KEY: str

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
