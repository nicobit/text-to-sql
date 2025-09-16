import datetime as dt
from typing import Dict
from app.repositories.azure_table import AzureTableUsageRepository
from app.config import settings
from app.models import UsageRecord


class UsageService:
    def __init__(self):
        self.repo = AzureTableUsageRepository()

    def _today(self) -> str:
        # Use local Europe/Zurich day boundary if needed; here UTC date for simplicity.
        return dt.datetime.utcnow().strftime("%Y-%m-%d")

    async def get_today(self, user: Dict) -> UsageRecord:
        user_id = user["oid"]
        date = self._today()
        rec = await self.repo.get(user_id, date)
        if not rec:
            rec = UsageRecord(
                user_id=user_id,
                date=date,
                consumed_tokens=0,
                limit_tokens=settings.DEFAULT_DAILY_TOKEN_LIMIT
            )
        return rec

    async def add_usage(self, user: Dict, tokens: int) -> UsageRecord:
        user_id = user["oid"]
        date = self._today()
        return await self.repo.upsert_add_tokens(
            user_id, date, tokens, settings.DEFAULT_DAILY_TOKEN_LIMIT
        )

    async def set_limit_today(self, user: Dict, limit_tokens: int) -> UsageRecord:
        user_id = user["oid"]
        date = self._today()
        return await self.repo.set_limit(user_id, date, limit_tokens)


usage_service = UsageService()