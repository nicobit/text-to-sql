from typing import Optional
from pydantic import AnyHttpUrl
from pydantic_settings import BaseSettings, SettingsConfigDict
import os

class Settings(BaseSettings):
    # FastAPI
    APP_NAME: str = "Azure OpenAI LLM Proxy"
    APP_VERSION: str = "0.1.1"
    DEBUG: bool = False

    # Entra ID (Azure AD)
    TENANT_ID: str = os.getenv("AZURE_TENANT_ID")
    AUDIENCE: str  = os.getenv("AZURE_CLIENT_ID")  # aka Client ID or App ID URI expected in 'aud'
    ISSUER: Optional[str] = None  # If None, inferred from TENANT_ID

    # Azure OpenAI (upstream)
    AZURE_OPENAI_ENDPOINT: AnyHttpUrl
    AZURE_OPENAI_API_VERSION: str
    AZURE_OPENAI_API_KEY: str  # service‑to‑service key held by the proxy

    # Usage / quotas
    DEFAULT_DAILY_TOKEN_LIMIT: int = 20_000
    HARD_CAP_OUTPUT: bool = True

    # Azure Table Storage (for usage ledger)
    AZURE_STORAGE_ACCOUNT_NAME: str
    AZURE_STORAGE_ACCOUNT_KEY: str
    USAGE_TABLE_NAME: str = "UsageDaily"

    # CORS
    CORS_ORIGINS: str = "*"

    # Pydantic v2 settings config
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    @property
    def issuer(self) -> str:
        return self.ISSUER or f"https://login.microsoftonline.com/{self.TENANT_ID}/v2.0"

settings = Settings()
