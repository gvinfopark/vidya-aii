"""
app/config.py — Centralized settings loaded from environment variables (.env)
"""
import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    MONGODB_URL: str = os.getenv(
        "MONGODB_URL",
    )
    MONGODB_DB_NAME: str = os.getenv("MONGODB_DB_NAME", "vidhyadb")

    JWT_SECRET: str = os.getenv("JWT_SECRET", "dev-secret-change-me")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    JWT_EXPIRE_MINUTES: int = int(os.getenv("JWT_EXPIRE_MINUTES", "10080"))  # 7 days

    ADMIN_EMAIL: str = os.getenv("ADMIN_EMAIL", "admin@vidhya.com")
    ADMIN_PASSWORD: str = os.getenv("ADMIN_PASSWORD", "Vidhya@Admin123")
    ADMIN_NAME: str = os.getenv("ADMIN_NAME", "Vidhya Admin")

    CORS_ORIGINS: list = os.getenv(
        "CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000"
    ).split(",")


settings = Settings()
