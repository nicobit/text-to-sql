import os




TENANT_ID = os.getenv("AZURE_TENANT_ID")
CLIENT_ID = os.getenv("AZURE_CLIENT_ID")  # App ID of the backend API

CONNECTION_STRING_RETRIEVER = os.getenv("CONNECTION_STRING_RETRIEVER", "keyvault")  # Options: keyvault, connection_string, keyvault_connection_string
KEY_VAULT_URI = os.getenv("KEY_VAULT_URI","")  # Key Vault URI for Azure Key Vault
ODBC_DRIVER = os.getenv("ODBC_DRIVER","ODBC Driver 17 for SQL Server")  # ODBC driver for SQL connection string
DATABASE_DNS_SECRET_NAME = os.getenv("DATABASE_DNS_SECRET_NAME","")  # Secret name in Key Vault for database DNS
PASSWORD_SECRET_NAME = os.getenv("PASSWORD_SECRET_NAME","")  # Secret name in Key Vault for password
USERNAME_SECRET_NAME = os.getenv("USERNAME_SECRET_NAME","")  # Secret name in Key Vault for username
DATABASE_NAME = os.getenv("DATABASE_NAME","")  # Database name for SQL connection string. If not provided
BLOB_STORAGE_CONNECTION_STRING_SECRET_NAME = os.getenv("BLOB_STORAGE_CONNECTION_STRING_SECRET_NAME")

SQL_CONNECTION_STRING = os.getenv("SQL_CONNECTION_STRING","")
SQL_CONNECTION_STRING_SECRET_NAME = os.getenv("SQL_CONNECTION_STRING_SECRET_NAME","")  # Secret name in Key Vault for SQL connection string


KEY_VAULT_CORE_URI = os.getenv("KEY_VAULT_CORE_URI")

OPENAI_KEY_SECRET_NAME = os.getenv("AZURE_OPENAI_KEY_SECRET_NAME")
OPENAI_ENDPOINT_SECRET_NAME = os.getenv("AZURE_OPENAI_ENDPOINT_SECRET_NAME")
OPENAI_VERSION_SECRET_NAME = os.getenv("AZURE_OPENAI_VERSION_SECRET_NAME")
EMBEDDING_MODEL = os.getenv("EMDEDDING_MODEL","text-embedding-ada-002")
COMPLETION_MODEL = os.getenv("COMPLETION_MODEL","gpt-35-turbo") 


BLOB_STORAGE_CONNECTION_STRING_SECRET_NAME = os.getenv("BLOB_STORAGE_CONNECTION_STRING_SECRET_NAME")

SEARCH_INDEX_NAME = os.environ.get("AZURE_SEARCH_INDEX_NAME", "nl-to-sql")
SEARCH_SERVICE_ENDPOINT_SECRET_NAME = os.environ.get("AZURE_SEARCH_SERVICE_ENDPOINT_SECRET_NAME")
SEARCH_API_KEY_SECRET_NAME = os.environ.get("AZURE_SEARCH_API_KEY_SECRET_NAME")


ROWS_LIMIT = os.getenv("ROWS_LIMIT","100")

# CORS
CORS_ALLOWED_ORIGINS = os.getenv("CORS_ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:5173,http://example.com")

# APPLICATION INSIGHTS
APPLICATIONINSIGHTS_CONNECTION_STRING = os.getenv("APPLICATIONINSIGHTS_CONNECTION_STRING")









