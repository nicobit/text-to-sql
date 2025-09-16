import datetime as dt
from typing import Optional
from azure.data.tables import TableServiceClient, UpdateMode
from app.config import settings
from app.models import UsageRecord
from .base import UsageRepository


class AzureTableUsageRepository(UsageRepository):
    def __init__(self):
        self._svc = TableServiceClient(
            endpoint=f"https://{settings.AZURE_STORAGE_ACCOUNT_NAME}.table.core.windows.net",
            credential=settings.AZURE_STORAGE_ACCOUNT_KEY,
        )
        self._table = self._svc.get_table_client(settings.USAGE_TABLE_NAME)
        try:
            self._table.create_table()
        except Exception:
            pass  # already exists

    def _pk(self, user_id: str) -> str:
        return user_id

    def _rk(self, date: str) -> str:
        return date

    async def get(self, user_id: str, date: str) -> Optional[UsageRecord]:
        try:
            entity = self._table.get_entity(
                partition_key=self._pk(user_id),
                row_key=self._rk(date)
            )
            return UsageRecord(
                user_id=user_id,
                date=date,
                consumed_tokens=int(entity.get("consumed_tokens", 0)),
                limit_tokens=int(entity.get("limit_tokens", settings.DEFAULT_DAILY_TOKEN_LIMIT)),
            )
        except Exception:
            return None

    async def upsert_add_tokens(self, user_id: str, date: str, add_tokens: int, default_limit: int) -> UsageRecord:
        existing = await self.get(user_id, date)
        if existing:
            new_total = existing.consumed_tokens + max(0, add_tokens)
            entity = {
                "PartitionKey": self._pk(user_id),
                "RowKey": self._rk(date),
                "consumed_tokens": new_total,
                "limit_tokens": existing.limit_tokens or default_limit,
            }
        else:
            entity = {
                "PartitionKey": self._pk(user_id),
                "RowKey": self._rk(date),
                "consumed_tokens": max(0, add_tokens),
                "limit_tokens": default_limit,
            }
        self._table.upsert_entity(entity, mode=UpdateMode.MERGE)
        return UsageRecord(
            user_id=user_id,
            date=date,
            consumed_tokens=int(entity["consumed_tokens"]),
            limit_tokens=int(entity["limit_tokens"]),
        )

    async def set_limit(self, user_id: str, date: str, limit_tokens: int) -> UsageRecord:
        existing = await self.get(user_id, date)
        consumed = existing.consumed_tokens if existing else 0
        entity = {
            "PartitionKey": self._pk(user_id),
            "RowKey": self._rk(date),
            "consumed_tokens": consumed,
            "limit_tokens": int(limit_tokens),
        }
        self._table.upsert_entity(entity, mode=UpdateMode.MERGE)
        return UsageRecord(
            user_id=user_id,
            date=date,
            consumed_tokens=consumed,
            limit_tokens=int(limit_tokens)
        )