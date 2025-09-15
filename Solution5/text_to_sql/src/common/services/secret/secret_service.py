from azure.identity import ManagedIdentityCredential
from azure.identity import DefaultAzureCredential
from azure.keyvault.secrets import SecretClient
from text_to_sql.core.log.logger import Logger
import os


logger = Logger().log()

class SecretService:
    _cache = {}

    @staticmethod
    def credential():
        """Create Managed Identity credential if using managed identity."""
        
        VSCODE = os.getenv("VSCODE", "").strip().lower() == "true"
        if VSCODE:
            return DefaultAzureCredential()
        else:
            return ManagedIdentityCredential()
       

    @staticmethod
    def get_secret_value(vault_url: str, secret_name: str) -> str:
        """Retrieve the secret value from Azure Key Vault, with caching."""
        cache_key = (vault_url, secret_name)
        if cache_key in SecretService._cache:
            return SecretService._cache[cache_key]

        try:
            credential = SecretService.credential()
            client = SecretClient(vault_url=vault_url, credential=credential)
            secret = client.get_secret(secret_name)
            SecretService._cache[cache_key] = secret.value
            return secret.value
        except Exception as e:
            logger.error(f"Error retrieving secret {secret_name} from Key Vault: {e}")
            #raise SecretServiceError(f"Error retrieving secret {secret_name} from Key Vault") from e
