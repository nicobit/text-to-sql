from pydantic import BaseModel
from typing import Optional, Dict, Any


class UsageRecord(BaseModel):
    user_id: str
    date: str  # YYYY-MM-DD
    consumed_tokens: int
    limit_tokens: int


class ProxyResponse(BaseModel):
    data: Dict[str, Any]
    usage_delta: int


class SetLimitRequest(BaseModel):
    limit_tokens: int