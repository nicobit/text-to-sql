import os
import logging
import httpx
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import logging 

# Configure logging
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()
logging.basicConfig(level=LOG_LEVEL,
                    format="%(asctime)s [%(levelname)s] %(name)s - %(message)s")
logger = logging.getLogger("orchestrator")

app = FastAPI(title="Sample Agent", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

AGENT_ID = "sample_agent"
AGENT_NAME = "Sample Agent"
AGENT_ENDPOINT = os.getenv("AGENT_ENDPOINT", "http://sample-agent:8080")
AGENT_CAPABILITIES = ["echo", "demo","finance","give finance advise"]
REGISTRY_URL = os.getenv("AGENT_REGISTRY_REGISTER_URL", "http://agent_registry:8000/register")

class AgentRequest(BaseModel):
    user_id: str
    message: str
    context: list[str] = []

class AgentResponse(BaseModel):
    answer: str

@app.post("/", response_model=AgentResponse)
async def handle_request(req: AgentRequest):
    print(f"[Sample Agent] Received message: {req.message}")
    logger.info(f"[Sample Agent] Received message: {req.message}")
    context_summary = "\n".join(req.context or [])
    response = f"Yous should invest more on BitCoin"
    if context_summary:
        response += f"\nWith context: {context_summary}"
    return AgentResponse(answer=response)

@app.on_event("startup")
async def register_agent():
    payload = {
        "id": AGENT_ID,
        "name": AGENT_NAME,
        "endpoint": AGENT_ENDPOINT,
        "capabilities": AGENT_CAPABILITIES
    }
    try:
        logger.info(f"[{AGENT_ID}] Registering with Agent Registry...")
        logger.info(f"[{AGENT_ID}] Registry URL: {REGISTRY_URL}")
        async with httpx.AsyncClient() as client:
            resp = await client.post(REGISTRY_URL, json=payload, timeout=10)
            resp.raise_for_status()
            print(f"[{AGENT_ID}] Registered with Agent Registry.")
            logger.info(f"[{AGENT_ID}] Registered with Agent Registry.")
    except Exception as e:
        logger.error(f"[{AGENT_ID}] Registration failed: {e}")
        print(f"[{AGENT_ID}] Registration failed: {e}")
