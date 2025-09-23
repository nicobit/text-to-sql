# app/config.py
import os
from functools import lru_cache
from app.settings import TENANT_ID, CLIENT_ID,  OPENAI_KEY_SECRET_NAME,EMBEDDING_MODEL,COMPLETION_MODEL,OPENAI_ENDPOINT_SECRET_NAME, OPENAI_VERSION_SECRET_NAME, KEY_VAULT_CORE_URI
from app.utils.nb_logger import NBLogger
from app.services.secret_service import SecretService

class Settings:
    TENANT_ID: str = TENANT_ID
    AUDIENCE: str = "api://" + CLIENT_ID + "," + CLIENT_ID # This is the App ID of the backend API registered in AAD
    ALLOWED_TENANTS: str = os.getenv("ALLOWED_TENANTS", "*")

    AZURE_OPENAI_ENDPOINT: str = SecretService.get_secret_value(KEY_VAULT_CORE_URI, OPENAI_ENDPOINT_SECRET_NAME)
    AZURE_OPENAI_API_VERSION: str = SecretService.get_secret_value(KEY_VAULT_CORE_URI, OPENAI_VERSION_SECRET_NAME)
    AZURE_OPENAI_API_KEY: str = SecretService.get_secret_value(KEY_VAULT_CORE_URI, OPENAI_KEY_SECRET_NAME)
    AZURE_OPENAI_KEY_VIA_KV: bool = os.getenv("AZURE_OPENAI_KEY_VIA_KV", "false").lower() == "false" #orginal managed in different way now is taken from keyvault
    KEY_VAULT_URI: str = KEY_VAULT_CORE_URI
    KEY_VAULT_SECRET_NAME: str = OPENAI_KEY_SECRET_NAME
    
    STORAGE_ACCOUNT_NAME: str = os.getenv("STORAGE_ACCOUNT_NAME", "")
    USAGE_TABLE_NAME: str = os.getenv("USAGE_TABLE_NAME", "UsageTokens")
    AUDIT_BLOB_CONTAINER: str = os.getenv("AUDIT_BLOB_CONTAINER", "auditlogs")
    ENABLE_BLOB_AUDIT: bool = os.getenv("ENABLE_BLOB_AUDIT", "false").lower() == "true"

    DEFAULT_DAILY_QUOTA: int = int(os.getenv("DEFAULT_DAILY_QUOTA", "200000"))
    ENFORCE_QUOTA: bool = os.getenv("ENFORCE_QUOTA", "true").lower() == "true"

@lru_cache()
def get_settings() -> Settings:
    return Settings()
