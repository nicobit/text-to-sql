import logging
import os
from azure.identity import ManagedIdentityCredential
from azure.keyvault.secrets import SecretClient
from sqlalchemy import create_engine, text
from sqlalchemy.engine import URL
from nb_logger import NBLogger  as logger


class ConnectionStringRetriever:
    def __init__(self):
        self.connection_string = ""

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

    def get_value(self):
        if self.connection_string:
            return self.connection_string
        else:
            if self.use_key_vault_to_get_connection_string():
                # Fetch the connection string from Key Vault
                try:
                    logger.info("Fetching SQL connection string from Azure Key Vault using Managed Identity.")
                    client = SecretClient(vault_url=self.key_vault_uri(), credential=self.credential())
                    secret = client.get_secret(self.sql_connection_string_secret_name())
                    self.connection_string = secret.value
                    logger.info("Connection string retrieved successfully from Key Vault.")
                    
                except Exception as e:
                    logger.error(f"Error fetching connection string from Key Vault: {str(e)}")
                    raise
            else:
                # If not using Key Vault, fallback to environment variable (or direct connection string)
                self.connection_string = os.getenv("SQL_CONNECTION_STRING")
                if not self.connection_string:
                    logger.error("SQL connection string not found in environment variables.")
                    raise ValueError("SQL connection string is not available.")
                logger.info("Using connection string from environment variables.")
        return self.connection_string



    

