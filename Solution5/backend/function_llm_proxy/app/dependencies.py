from fastapi import Depends, Header, HTTPException
from typing import Dict
from app.auth import verifier

async def get_current_user(authorization: str = Header(None)) -> Dict:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Authorization: Bearer <token> required")
    token = authorization.split(" ", 1)[1]
    claims = await verifier.verify(token)
    # Prefer AAD 'oid' (stable object id) as user id
    if "oid" not in claims:
        raise HTTPException(status_code=401, detail="Missing 'oid' claim in token")
    return claims
