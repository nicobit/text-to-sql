from fastapi import FastAPI
import requests
import uuid

app = FastAPI()
AGENT_ID = "memory-agent-" + str(uuid.uuid4())

@app.on_event("startup")
def register():
    agent = {
        "id": AGENT_ID,
        "name": "MemoryAgent",
        "description": "Stores and retrieves short-term memory",
        "endpoint": "http://localhost:8001/",
        "capabilities": ["store_memory", "get_memory"],
        "status": "active",
        "version": "1.0.0"
    }
    requests.post("http://localhost:8000/register", json=agent)

@app.get("/capabilities")
def capabilities():
    return {"functions": ["store_memory", "get_memory"]}

@app.post("/store")
def store_memory(key: str, value: str):
    from memory.redis_memory import RedisMemory
    RedisMemory().store(key, {"value": value})
    return {"status": "ok"}



@app.get("/retrieve")
def get_memory(key: str):
    from memory.redis_memory import RedisMemory
    value = RedisMemory().retrieve(key)
    return {"value": value}

@app.get("/get")
def get(key: str):
    return RedisMemory().retrieve(key)