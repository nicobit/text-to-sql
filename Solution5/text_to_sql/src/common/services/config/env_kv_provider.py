from __future__ import annotations
import os
from functools import lru_cache
from azure.identity import DefaultAzureCredential
from azure.keyvault.secrets import SecretClient
from .provider_base import SettingsProvider

class EnvRefKeyVaultProvider(SettingsProvider):
    """Indirection provider:  FOO→ uses env var FOO_SECRET → secret in Key Vault."""

    def __init__(self, vault_url: str, *, env_suffix: str = "_SECRET", credential=None):
        self._suffix = env_suffix
        self._client = SecretClient(vault_url=vault_url,
                                    credential=credential or DefaultAzureCredential())

    def _env_var(self, key: str) -> str:
        return f"{key}{self._suffix}"

    def _secret_name_for(self, key: str) -> str:
        env_var = self._env_var(key)
        try:
            return os.environ[env_var]
        except KeyError as e:
            raise KeyError(f"Env var {env_var} missing – it must hold the Key Vault secret name for {key}") from e

    @lru_cache
    def get(self, key: str) -> str:
        return self._client.get_secret(self._secret_name_for(key)).value

    def set(self, key: str, value: str) -> None:
        self._client.set_secret(self._secret_name_for(key), value)