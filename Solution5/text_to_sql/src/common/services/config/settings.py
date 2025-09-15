from __future__ import annotations
from dataclasses import dataclass
from functools import lru_cache
from typing import Callable, Any, TypeVar
from .factory import make_provider

_provider = make_provider()
T = TypeVar("T")

# --------------------------------------------------------

def _get(key: str, *, default: T | None = None, cast: Callable[[Any], T] | None = None) -> T:
    try:
        value = _provider.get(key)
    except KeyError:
        if default is None:
            raise
        value = default
    return cast(value) if cast else value

# --------------------------------------------------------
@dataclass(frozen=True, slots=True)
class AzureSettings:
    tenant_id: str = _get("AZURE_TENANT_ID")
    client_id: str = _get("AZURE_CLIENT_ID")
    client_secret: str = _get("AZURE_CLIENT_SECRET")

@dataclass(frozen=True, slots=True)
class DatabaseSettings:
    odbc_driver: str = _get("ODBC_DRIVER", default="ODBC Driver 17 for SQL Server")
    database_dns_secret_name: str = _get("DATABASE_DNS", default="")
    password_secret_name: str = _get("PASSWORD", default="")
    username_secret_name: str = _get("USERNAME", default="")
    database_name: str = _get("DATABASE_NAME", default="")
    rows_limit: int = _get("ROWS_LIMIT", default=1000, cast=int)

@dataclass(frozen=True, slots=True)
class StorageSettings:
    blob_storage_connection_string_secret_name: str = _get("BLOB_STORAGE_CONNECTION_STRING")
   

@dataclass(frozen=True, slots=True)
class OpenAISettings:
    endpoint: str = _get("OPENAI_ENDPOINT", default="https://api.openai.com/v1")
    api_key: str = _get("OPENAI_KEY")
    version: str = _get("OPENAI_VERSION")
    embedding_model: str = _get("EMBEDDING_MODEL", default="text-embedding-ada-002")
    completion_model: str = _get("COMPLETION_MODEL", default="gpt-35-turbo")

@dataclass(frozen=True, slots=True)
class SearchAISettings:
    search_endpoint: str = _get("SEARCH_ENDPOINT", default="https://api.search.ai/v1")
    search_api_key: str = _get("SEARCH_API_KEY")
    search_version: str = _get("SEARCH_VERSION")
    search_model: str = _get("SEARCH_MODEL", default="text-search-ada-001")

@dataclass(frozen=True, slots=True)
class ApplicationInsightSettings:
    connection_string: str = _get("APPLICATION_INSIGHT_CONNECTION_STRING", default="")


@dataclass(frozen=True, slots=True)
class FeatureFlags:
    use_cheap_embeddings: bool = _get(
        "USE_CHEAP_EMBEDDINGS",
        default="false",
        cast=lambda s: str(s).lower() in {"1", "true", "yes"},
    )

@dataclass(frozen=True, slots=True)
class AppSettings:
    azure: AzureSettings
    database: DatabaseSettings
    storage: StorageSettings
    search_ai: SearchAISettings
    openai: OpenAISettings
    flags: FeatureFlags
    application_insight: ApplicationInsightSettings 

@lru_cache
def load_settings() -> AppSettings:
    return AppSettings(
        azure=AzureSettings(),
        database=DatabaseSettings(),
        storage=StorageSettings(),
        search_ai=SearchAISettings(),
        openai=OpenAISettings(),
        flags=FeatureFlags(),
        application_insight=ApplicationInsightSettings(),
    )