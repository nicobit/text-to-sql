import os

OPENAI_API_KEY     = os.getenv("OPENAI_API_KEY")
REDIS_CONN         = os.getenv("REDIS_CONNECTION")
COSMOS_ENDPOINT    = os.getenv("COSMOS_ENDPOINT")
COSMOS_KEY         = os.getenv("COSMOS_KEY")
COSMOS_DB          = os.getenv("COSMOS_DB")
COSMOS_CONTAINER   = os.getenv("COSMOS_CONTAINER")
SEARCH_SERVICE     = os.getenv("COG_SEARCH_SERVICE")
SEARCH_KEY         = os.getenv("COG_SEARCH_KEY")
SEARCH_INDEX       = os.getenv("COG_SEARCH_INDEX")
BLOB_CONN          = os.getenv("BLOB_CONN")
BLOB_CONTAINER     = os.getenv("BLOB_CONTAINER")
MAX_ITERATIONS     = 3
TOP_K_MEMORY       = 5