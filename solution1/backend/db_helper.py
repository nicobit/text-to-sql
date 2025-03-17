import logging
import os
from azure.identity import ManagedIdentityCredential
from azure.keyvault.secrets import SecretClient
from sqlalchemy import create_engine, text
from sqlalchemy.engine import URL
from opencensus.ext.azure.log_exporter import AzureLogHandler

# Set up your Application Insights Instrumentation Key
APP_INSIGHT_CONNECTION_STRING = os.getenv("APP_INSIGHT_CONNECTION_STRING")

# Create the logger
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# Add Azure Log Handler to the logger
handler = AzureLogHandler(connection_string=f'{APP_INSIGHT_CONNECTION_STRING}')
logger.addHandler(handler)

def use_key_vault_to_get_connection_string():
# Environment Variable to decide if Managed Identity is to be used or not
    return os.getenv("USE_KEY_VAULT_TO_GET_CONNECTION_STRING", "false").lower() == "true"

# Key Vault and SQL Details
def key_vault_uri():
    return os.getenv("KEY_VAULT_URI")  # Azure Key Vault URI

def sql_connection_string_secret_name():
    return os.getenv("SQL_CONNECTION_STRING_SECRET_NAME")  # Secret name in Key Vault

def credential():
# Create Managed Identity credential if using managed identity
    return ManagedIdentityCredential()

def get_connection_string():
    """Retrieve connection string using Managed Identity or from Key Vault."""
    if use_key_vault_to_get_connection_string():
        # Fetch the connection string from Key Vault
        try:
            logger.info("Fetching SQL connection string from Azure Key Vault using Managed Identity.")
            client = SecretClient(vault_url=key_vault_uri(), credential=credential())
            secret = client.get_secret(sql_connection_string_secret_name())
            connection_string = secret.value
            logger.info("Connection string retrieved successfully from Key Vault.")
            return connection_string
        except Exception as e:
            logger.error(f"Error fetching connection string from Key Vault: {str(e)}")
            raise
    else:
        # If not using Key Vault, fallback to environment variable (or direct connection string)
        connection_string = os.getenv("SQL_CONNECTION_STRING")
        if not connection_string:
            logger.error("SQL connection string not found in environment variables.")
            raise ValueError("SQL connection string is not available.")
        logger.info("Using connection string from environment variables.")
        return connection_string
    

