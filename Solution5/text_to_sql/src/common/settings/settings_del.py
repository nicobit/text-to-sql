import os





class EnvironmentSettingsProvider(SettingsProvider):
    """Provider that retrieves settings from environment variables."""
    def get(self, key, default=None):
        return os.getenv(key, default)


class Settings:
    """Settings manager that uses a provider to retrieve configuration values."""
    _instance = None

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super(Settings, cls).__new__(cls, *args, **kwargs)
        return cls._instance

    def __init__(self, provider=None):
        if not hasattr(self, 'provider'):
            self.provider = provider or EnvironmentSettingsProvider()

    def get(self, key, default=None):
        return self.provider.get(key, default)

    @property
    def tenant_id(self):
        return self.get("AZURE_TENANT_ID")

    @property
    def client_id(self):
        return self.get("AZURE_CLIENT_ID")

    @property
    def connection_string_retriever(self):
        return self.get("CONNECTION_STRING_RETRIEVER", "keyvault")

    @property
    def key_vault_uri(self):
        return self.get("KEY_VAULT_URI", "")

    @property
    def odbc_driver(self):
        return self.get("ODBC_DRIVER", "ODBC Driver 17 for SQL Server")

    @property
    def database_dns_secret_name(self):
        return self.get("DATABASE_DNS_SECRET_NAME", "")

    @property
    def password_secret_name(self):
        return self.get("PASSWORD_SECRET_NAME", "")

    @property
    def username_secret_name(self):
        return self.get("USERNAME_SECRET_NAME", "")

    @property
    def database_name(self):
        return self.get("DATABASE_NAME", "")

    @property
    def blob_storage_connection_string_secret_name(self):
        return self.get("BLOB_STORAGE_CONNECTION_STRING_SECRET_NAME")

    @property
    def sql_connection_string(self):
        return self.get("SQL_CONNECTION_STRING", "")

    @property
    def sql_connection_string_secret_name(self):
        return self.get("SQL_CONNECTION_STRING_SECRET_NAME", "")

    @property
    def key_vault_core_uri(self):
        return self.get("KEY_VAULT_CORE_URI")

    @property
    def openai_key_secret_name(self):
        return self.get("AZURE_OPENAI_KEY_SECRET_NAME")

    @property
    def openai_endpoint_secret_name(self):
        return self.get("AZURE_OPENAI_ENDPOINT_SECRET_NAME")

    @property
    def openai_version_secret_name(self):
        return self.get("AZURE_OPENAI_VERSION_SECRET_NAME")

    @property
    def embedding_model(self):
        return self.get("EMDEDDING_MODEL", "text-embedding-ada-002")

    @property
    def completion_model(self):
        return self.get("COMPLETION_MODEL", "gpt-35-turbo")

    @property
    def search_index_name(self):
        return self.get("AZURE_SEARCH_INDEX_NAME", "nl-to-sql")

    @property
    def search_service_endpoint_secret_name(self):
        return self.get("AZURE_SEARCH_SERVICE_ENDPOINT_SECRET_NAME")

    @property
    def search_api_key_secret_name(self):
        return self.get("AZURE_SEARCH_API_KEY_SECRET_NAME")

    @property
    def rows_limit(self):
        return self.get("ROWS_LIMIT", "100")

    @property
    def cors_allowed_origins(self):
        return self.get("CORS_ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:5173,http://example.com")

    @property
    def application_insights_connection_string(self):
        return self.get("APPLICATIONINSIGHTS_CONNECTION_STRING")


