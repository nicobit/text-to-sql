import os

# OPEN AI
OPEN_AI_KEY = os.getenv("AZURE_OPENAI_KEY")
EMBEDDING_MODEL = os.getenv("EMDEDDING_MODEL","text-embedding-ada-002")
COMPLETION_MODEL = os.getenv("COMPLETION_MODEL","gpt-35-turbo") 
OPENAI_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT")
OPEN_AI_VERSION = os.getenv("AZURE_OPENAI_VERSION", "2025-01-01-preview")

# AZURE INFO
TENANT_ID = os.getenv("AZURE_AD_TENANT_ID")
CLIENT_ID = os.getenv("AZURE_AD_CLIENT_ID")  # App ID of the backend API

# MANAGE SECRETS FOR CONNECTION STRING

CONNECTION_STRING_RETRIEVER = os.getenv("CONNECTION_STRING_RETRIEVER", "keyvault")  # Options: keyvault, connection_string, keyvault_connection_string


# USED FOR CONNECTION_STRING_RETRIEVER = "connection_string"
SQL_CONNECTION_STRING = os.getenv("SQL_CONNECTION_STRING","")

# USED FOR CONNECTION_STRING_RETRIEVER = "keyvault" or "keyvault_connection_string"
KEY_VAULT_URI = os.getenv("KEY_VAULT_URI","")  # Key Vault URI for Azure Key Vault

# USED FOR CONNECTION_STRING_RETRIEVER = "keyvault_connection_string"
SQL_CONNECTION_STRING_SECRET_NAME = os.getenv("SQL_CONNECTION_STRING_SECRET_NAME","")  # Secret name in Key Vault for SQL connection string

# USED FOR CONNECTION_STRING_RETRIEVER = "keyvault"
ODBC_DRIVER = os.getenv("ODBC_DRIVER","ODBC Driver 17 for SQL Server")  # ODBC driver for SQL connection string
DATABASE_DNS_SECRET_NAME = os.getenv("DATABASE_DNS_SECRET_NAME","")  # Secret name in Key Vault for database DNS
PASSWORD_SECRET_NAME = os.getenv("PASSWORD_SECRET_NAME","")  # Secret name in Key Vault for password
USERNAME_SECRET_NAME = os.getenv("USERNAME_SECRET_NAME","")  # Secret name in Key Vault for username
DATABASE_NAME = os.getenv("DATABASE_NAME","")  # Database name for SQL connection string. If not provided



# CORS
CORS_ALLOWED_ORIGINS = os.getenv("CORS_ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:5173,http://example.com")

# APPLICATION INSIGHTS
APPLICATIONINSIGHTS_CONNECTION_STRING = os.getenv("APPLICATIONINSIGHTS_CONNECTION_STRING")


SEARCH_INDEX_NAME = os.environ.get("AZURE_SEARCH_INDEX_NAME", "nl2sql-index")
SEARCH_SERVICE_ENDPOINT = os.environ.get("AZURE_SEARCH_SERVICE_ENDPOINT")
SEARCH_API_KEY = os.environ.get("AZURE_SEARCH_API_KEY")
OPENAI_DEPLOYMENT = os.getenv("AZURE_OPENAI_DEPLOYMENT")

ROWS_LIMIT = os.getenv("AZURE_OPENAI_DEPLOYMENT","100")

BLOB_STORAGE_CONNECTION_STRING = os.getenv("BLOB_STORAGE_CONNECTION_STRING")




