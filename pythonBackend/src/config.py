import os

from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    DATABASE_URL: str
    APP_DATA_PATH: str
    HOSTNAME: str
    PORT: int

    class Config:
        env_file = os.path.join(os.path.dirname(__file__), ".env")
        env_file_encoding = 'utf-8'

# Singleton instance
settings = Settings()
