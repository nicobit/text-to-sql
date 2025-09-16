import httpx
from fastapi import HTTPException
from typing import Dict, Any, Tuple
from urllib.parse import urljoin
from app.config import settings
from app.utils.token_usage import extract_token_usage


class ProxyService:
    def __init__(self):
        self._base = str(settings.AZURE_OPENAI_ENDPOINT).rstrip("/") + "/"
        self._headers = {
            "api-key": settings.AZURE_OPENAI_API_KEY,
            "Content-Type": "application/json"
        }

    def _absolute_upstream(self, incoming_path: str, incoming_query: str | None) -> str:
        """
        Build the full Azure OpenAI URL by mirroring the incoming SDK-style path & query.
        The proxy now exposes Azure-compatible paths like:
        /openai/deployments/{deployment}/responses?api-version=...
        so we simply join to the upstream base and preserve the querystring.
        """
        upstream = urljoin(self._base, incoming_path.lstrip("/"))
        if incoming_query:
            return f"{upstream}?{incoming_query}"
        return upstream

    async def forward(self, path: str, query: str | None, body: Dict[str, Any]) -> Tuple[Dict[str, Any], int]:
        url = self._absolute_upstream(path, query)
        async with httpx.AsyncClient(timeout=120) as client:
            r = await client.post(url, headers=self._headers, json=body)
            if r.status_code >= 400:
                raise HTTPException(status_code=r.status_code, detail=r.text)
            payload = r.json()
            delta = extract_token_usage(payload)
            return payload, int(delta)


proxy_service = ProxyService()