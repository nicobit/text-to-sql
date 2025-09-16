import time
import httpx
from functools import lru_cache
from typing import Dict, Any
from jose import jwt
from fastapi import HTTPException, status
from app.config import settings

_OIDC_DISCOVERY = (
    f"https://login.microsoftonline.com/{settings.TENANT_ID}/v2.0/.well-known/openid-configuration"
)


class AzureADVerifier:
    def __init__(self):
        self._jwks_uri = None
        self._jwks_cache: Dict[str, Any] = {}
        self._jwks_expiry = 0

    async def _fetch_openid(self) -> Dict[str, Any]:
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.get(_OIDC_DISCOVERY)
            r.raise_for_status()
            return r.json()

    async def _get_jwks(self) -> Dict[str, Any]:
        now = int(time.time())
        if self._jwks_cache and now < self._jwks_expiry:
            return self._jwks_cache
        if not self._jwks_uri:
            oidc = await self._fetch_openid()
            self._jwks_uri = oidc["jwks_uri"]
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.get(self._jwks_uri)
            r.raise_for_status()
            data = r.json()
            # cache for 24h
            self._jwks_cache = data
            self._jwks_expiry = now + 24 * 3600
            return data

    async def verify(self, token: str) -> Dict[str, Any]:
        if not token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing token"
            )
        jwks = await self._get_jwks()
        try:
            unverified = jwt.get_unverified_header(token)
            kid = unverified.get("kid")
            key = next((k for k in jwks["keys"] if k["kid"] == kid), None)
            if not key:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="JWK not found for token",
                )
            claims = jwt.decode(
                token,
                key,
                algorithms=[key.get("alg", "RS256")],
                audience=settings.AUDIENCE,
                issuer=settings.issuer,
                options={"verify_at_hash": False},
            )
            return claims
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid token: {e}",
            )


verifier = AzureADVerifier()