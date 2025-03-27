import os

# OpenAI settings
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "your-openai-api-key-here")

# Azure Cognitive Search settings
AZURE_SEARCH_ENDPOINT = os.getenv("AZURE_SEARCH_ENDPOINT", "https://your-search-service.search.windows.net")
AZURE_SEARCH_API_KEY = os.getenv("AZURE_SEARCH_API_KEY", "your-azure-search-api-key-here")
AZURE_SEARCH_INDEX_NAME = os.getenv("AZURE_SEARCH_INDEX_NAME", "your-index-name")

# Azure SQL Database settings
AZURE_SQL_SERVER = os.getenv("AZURE_SQL_SERVER", "your-sql-server.database.windows.net")
AZURE_SQL_DATABASE = os.getenv("AZURE_SQL_DATABASE", "your-database-name")
AZURE_SQL_USER = os.getenv("AZURE_SQL_USER", "your-db-user")
AZURE_SQL_PASSWORD = os.getenv("AZURE_SQL_PASSWORD", "your-db-password")