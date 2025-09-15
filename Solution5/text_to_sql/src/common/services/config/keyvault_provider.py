from azure.identity import DefaultAzureCredential
from azure.keyvault.secrets import SecretClient
from .provider_base import SettingsProvider

class KeyVaultProvider(SettingsProvider):
    def __init__(self, vault_url: str, *, credential=None):
        self._client = SecretClient(
            vault_url=vault_url,
            credential=credential or DefaultAzureCredential()
        )

    def get(self, key: str) -> str:
        return self._client.get_secret(key).value

    def set(self, key: str, value: str) -> None:
        self._client.set_secret(key, value)