"""
Finclusion AI — Configuration
All settings are read from environment variables / .env file.
"""
from functools import lru_cache
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Application
    app_name: str = "Finclusion AI"
    app_version: str = "1.0.0"
    debug: bool = False
    allowed_origins: str = "http://localhost:5173,http://127.0.0.1:5173,*"
    app_secret: str = "change-me"

    # AI
    ai_provider: Literal["openai", "fingpt", "ollama", "none"] = "none"
    llm_api_key: str = ""
    llm_base_url: str = ""
    model_id: str = "gpt-4o-mini"

    # FinGPT
    huggingface_token: str = ""
    fingpt_model_id: str = "FinGPT/fingpt-forecaster_dow30_llama2-7b_lora"

    # News & Market APIs
    news_api_key: str = ""
    news_api_url: str = "https://newsapi.org/v2/everything"
    finnhub_api_key: str = ""
    alpha_vantage_api_key: str = ""

    # Database
    database_url: str = "sqlite+aiosqlite:///./finclusion.db"

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
