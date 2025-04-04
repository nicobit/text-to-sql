from azure.identity import ManagedIdentityCredential
from azure.keyvault.secrets import SecretClient
from sqlalchemy import create_engine, text
from sqlalchemy.engine import URL
from nb_logger import NBLogger  as logger
import settings


class ConnectionStringRetriever:
    def __init__(self):
        self.connection_string = ""

    def use_key_vault_to_get_connection_string():
    # Environment Variable to decide if Managed Identity is to be used or not
        return settings.USE_KEY_VAULT_TO_GET_CONNECTION_STRING.lower() == "true"

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
                    client = SecretClient(vault_url=settings.KEY_VAULT_URI, credential=self.credential())
                    secret = client.get_secret(settings.SQL_CONNECTION_STRING_SECRET_NAME)
                    self.connection_string = secret.value
                    logger.info("Connection string retrieved successfully from Key Vault.")
                    
                except Exception as e:
                    logger.error(f"Error fetching connection string from Key Vault: {str(e)}")
                    raise
            else:
                # If not using Key Vault, fallback to environment variable (or direct connection string)
                self.connection_string = settings.SQL_CONNECTION_STRING
                if not self.connection_string:
                    logger.error("SQL connection string not found in environment variables.")
                    raise ValueError("SQL connection string is not available.")
                logger.info("Using connection string from environment variables.")
        return self.connection_string



    

