from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any
from function_llm_proxy.app.config import settings
from function_llm_proxy.app.dependencies import get_current_user
from function_llm_proxy.app.services.usage_service import usage_service
from function_llm_proxy.app.services.proxy_service import proxy_service
from function_llm_proxy.app.models import UsageRecord, SetLimitRequest

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    docs_url="/docs"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.CORS_ORIGINS.split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/v1/health")
def health():
    return {"status": "ok", "version": settings.APP_VERSION}

# === Usage endpoints ===
@app.get("/v1/usage/me", response_model=UsageRecord)
async def get_my_usage(user: Dict = Depends(get_current_user)):
    return await usage_service.get_today(user)

@app.put("/v1/usage/me/limit", response_model=UsageRecord)
async def set_my_limit(req: SetLimitRequest, user: Dict = Depends(get_current_user)):
    roles = user.get("roles", []) or user.get("roles", [])
    if "proxy.admin" not in roles:
        raise HTTPException(status_code=403, detail="Insufficient privileges to set limits")
    return await usage_service.set_limit_today(user, req.limit_tokens)

# === Azure OpenAI-compatible proxy endpoints (no chat) ===
# We mirror the SDK paths so you can point AzureOpenAI(azure_endpoint=PROXY_BASE, ...) directly at this proxy.

@app.post("/openai/deployments/{deployment}/responses")
async def proxy_responses(
    deployment: str,
    request: Request,
    body: Dict[str, Any],
    user: Dict = Depends(get_current_user)
):
    usage = await usage_service.get_today(user)
    remaining = usage.limit_tokens - usage.consumed_tokens
    if remaining <= 0:
        raise HTTPException(status_code=429, detail="Daily token quota reached")
    path = f"/openai/deployments/{deployment}/responses"
    payload, delta = await proxy_service.forward(path, request.url.query, body)
    await usage_service.add_usage(user, delta)
    return payload

@app.post("/openai/deployments/{deployment}/completions")
async def proxy_completions(
    deployment: str,
    request: Request,
    body: Dict[str, Any],
    user: Dict = Depends(get_current_user)
):
    usage = await usage_service.get_today(user)
    remaining = usage.limit_tokens - usage.consumed_tokens
    if remaining <= 0:
        raise HTTPException(status_code=429, detail="Daily token quota reached")
    path = f"/openai/deployments/{deployment}/completions"
    payload, delta = await proxy_service.forward(path, request.url.query, body)
    await usage_service.add_usage(user, delta)
    return payload

@app.post("/openai/deployments/{deployment}/embeddings")
async def proxy_embeddings(
    deployment: str,
    request: Request,
    body: Dict[str, Any],
    user: Dict = Depends(get_current_user)
):
    usage = await usage_service.get_today(user)
    remaining = usage.limit_tokens - usage.consumed_tokens
    if remaining <= 0:
        raise HTTPException(status_code=429, detail="Daily token quota reached")
    path = f"/openai/deployments/{deployment}/embeddings"
    payload, delta = await proxy_service.forward(path, request.url.query, body)
    await usage_service.add_usage(user, delta)
    return payload