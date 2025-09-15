from __future__ import annotations
from functools import lru_cache
from azure.identity import DefaultAzureCredential
from azure.keyvault.secrets import SecretClient
from .provider_base import SettingsProvider

class MultiKeyVaultProvider(SettingsProvider):
    """Fan‑out provider that searches several vaults.
    Optionally declare one vault as *default* for un‑prefixed names.
    """

    def __init__(self, vault_map: dict[str, str], *, default_alias: str | None = None):
        if default_alias and default_alias not in vault_map:
            raise ValueError(f"default_alias {default_alias!r} not in vault_map")
        self._default = default_alias
        self._clients = {
            alias: SecretClient(vault_url=url, credential=DefaultAzureCredential())
            for alias, url in vault_map.items()
        }

    # -------- helpers -----------------------------------------------------
    def _split(self, name: str):
        return name.split(":", 1) if ":" in name else (None, name)

    def _ordered_clients(self, alias: str | None):
        if alias:
            yield self._clients[alias]
        else:
            if self._default:
                yield self._clients[self._default]
            for a, c in self._clients.items():
                if a != self._default:
                    yield c

    # -------- public API --------------------------------------------------
    @lru_cache
    def get(self, name: str) -> str:
        alias, bare = self._split(name)
        for client in self._ordered_clients(alias):
            try:
                return client.get_secret(bare).value
            except Exception:
                continue
        raise KeyError(f"Secret {name!r} not found in configured vaults")

    def set(self, name: str, value: str) -> None:
        alias, bare = self._split(name)
        if not alias:
            if not self._default:
                raise ValueError("set() needs a vault prefix because no default vault configured")
            alias = self._default
        self._clients[alias].set_secret(bare, value)