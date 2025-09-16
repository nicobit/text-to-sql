from abc import ABC, abstractmethod
from typing import Optional
from app.models import UsageRecord

class UsageRepository(ABC):
    @abstractmethod
    async def get(self, user_id: str, date: str) -> Optional[UsageRecord]:
        ...

    @abstractmethod
    async def upsert_add_tokens(self, user_id: str, date: str, add_tokens: int, default_limit: int) -> UsageRecord:
        ...

    @abstractmethod
    async def set_limit(self, user_id: str, date: str, limit_tokens: int) -> UsageRecord:
        ...
