from abc import ABC, abstractmethod
from typing import Any

class SettingsProvider(ABC):
    """Interface all providers must implement."""

    @abstractmethod
    def get(self, key: str) -> Any: ...

    @abstractmethod
    def set(self, key: str, value: str) -> None: ...