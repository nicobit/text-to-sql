# app/auth/jwt.py
import time
import json
import httpx
import jwt
from jwt import PyJWKClient
from typing import Dict, Any, Optional
from functools import lru_cache
from function_llm_proxy.app.config import get_settings

OIDC_TEMPLATE = "https://login.microsoftonline.com/{tenant}/v2.0/.well-known/openid-configuration"

class AADValidator:
    def __init__(self, tenant_id: str, audience: str, allowed_tenants: str):
        self.tenant_id = tenant_id
        self.audience = audience
        self.allowed_tenants = [t.strip() for t in allowed_tenants.split(",")] if allowed_tenants else ["*"]
        self._jwks_clients: Dict[str, PyJWKClient] = {}
        self._oidc_cache: Dict[str, Dict[str, Any]] = {}
        self._oidc_exp: Dict[str, float] = {}

    async def _get_oidc(self, tenant: str) -> Dict[str, Any]:
        now = time.time()
        if tenant in self._oidc_cache and self._oidc_exp.get(tenant, 0) > now:
            return self._oidc_cache[tenant]
        url = OIDC_TEMPLATE.format(tenant=tenant)
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(url)
            resp.raise_for_status()
            data = resp.json()
        # Cache 24h
        self._oidc_cache[tenant] = data
        self._oidc_exp[tenant] = now + 24 * 3600
        return data

    async def _get_jwks_client(self, tenant: str) -> PyJWKClient:
        if tenant in self._jwks_clients:
            return self._jwks_clients[tenant]
        oidc = await self._get_oidc(tenant)
        jwks_uri = oidc["jwks_uri"]
        self._jwks_clients[tenant] = PyJWKClient(jwks_uri)
        return self._jwks_clients[tenant]

    def _tenant_allowed(self, tid: str) -> bool:
        if "*" in self.allowed_tenants:
            return True
        return tid in self.allowed_tenants or tid == self.tenant_id

    async def validate(self, authorization: Optional[str]) -> Dict[str, Any]:
        if not authorization or not authorization.lower().startswith("bearer "):
            raise PermissionError("Missing or invalid Authorization header.")
        token = authorization.split(" ", 1)[1].strip()

        # Decode unverified to discover tenant (tid/iss)
        unverified = jwt.decode(token, options={"verify_signature": False})
        tid = unverified.get("tid") or get_settings().TENANT_ID
        if not tid or not self._tenant_allowed(tid):
            raise PermissionError("Tenant not allowed.")

        jwks = await self._get_jwks_client(tid)
        signing_key = jwks.get_signing_key_from_jwt(token)
        oidc = await self._get_oidc(tid)
        issuer = oidc["issuer"]

        claims = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            audience=self.audience,
            issuer=issuer
        )
        # user identity (prefer oid/sub/upn/email)
        user_id = claims.get("oid") or claims.get("sub") or claims.get("preferred_username") or claims.get("upn") or claims.get("email")
        if not user_id:
            raise PermissionError("Cannot determine user identity from token.")
        return {"claims": claims, "user_id": user_id, "tenant_id": tid}

@lru_cache()
def get_validator() -> AADValidator:
    s = get_settings()
    return AADValidator(s.TENANT_ID, s.AUDIENCE, s.ALLOWED_TENANTS)
