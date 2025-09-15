import os
from .provider_base import SettingsProvider

class EnvProvider(SettingsProvider):
    """Reads & writes plain environment variables."""

    def get(self, key: str) -> str:
        try:
            return os.environ[key]
        except KeyError as err:
            raise KeyError(f"Required env var {key} is missing") from err

    def set(self, key: str, value: str) -> None:
        os.environ[key] = value