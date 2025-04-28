from azure.identity import ManagedIdentityCredential
from azure.identity import DefaultAzureCredential
from azure.keyvault.secrets import SecretClient


class SecretService:
    _cache = {}

    @staticmethod
    def credential():
        """Create Managed Identity credential if using managed identity."""
        return DefaultAzureCredential()
        return ManagedIdentityCredential()

    @staticmethod
    def get_secret_value(vault_url: str, secret_name: str) -> str:
        """Retrieve the secret value from Azure Key Vault, with caching."""
        cache_key = (vault_url, secret_name)
        if cache_key in SecretService._cache:
            return SecretService._cache[cache_key]

        credential = SecretService.credential()
        client = SecretClient(vault_url=vault_url, credential=credential)
        secret = client.get_secret(secret_name)
        SecretService._cache[cache_key] = secret.value
        return secret.value