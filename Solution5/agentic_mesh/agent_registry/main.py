from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import os
import json

app = FastAPI(title="Agent Registry", version="1.0.0")

REGISTRY_FILE = "agents.json"

class Agent(BaseModel):
    id: str
    name: str
    endpoint: str
    capabilities: List[str]

@app.get("/agents", response_model=List[Agent])
def get_agents():
    if not os.path.exists(REGISTRY_FILE):
        return []
    with open(REGISTRY_FILE, "r") as f:
        return json.load(f)

@app.post("/register", response_model=dict)
def register_agent(agent: Agent):
    agents = []
    if os.path.exists(REGISTRY_FILE):
        with open(REGISTRY_FILE, "r") as f:
            agents = json.load(f)
    agents = [a for a in agents if a["id"] != agent.id]
    agents.append(agent.dict())
    with open(REGISTRY_FILE, "w") as f:
        json.dump(agents, f, indent=2)
    return {"status": "registered", "agent_id": agent.id}
