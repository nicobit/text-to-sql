from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict

app = FastAPI()
registry: Dict[str, dict] = {}

class Agent(BaseModel):
    id: str
    name: str
    description: str
    endpoint: str
    capabilities: List[str]
    status: str
    version: str

@app.post("/register")
def register_agent(agent: Agent):
    registry[agent.id] = agent.dict()
    return {"message": "Agent registered."}

@app.get("/agents")
def get_agents():
    return list(registry.values())

@app.get("/agents/{agent_id}")
def get_agent(agent_id: str):
    if agent_id not in registry:
        raise HTTPException(status_code=404, detail="Agent not found.")
    return registry[agent_id]