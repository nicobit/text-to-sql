import requests

REGISTRY_URL = "http://localhost:8000"

def get_all_agents():
    response = requests.get(f"{REGISTRY_URL}/agents")
    return response.json()

def find_agent_by_capability(capability: str):
    agents = get_all_agents()
    for agent in agents:
        if capability in agent["capabilities"]:
            return agent
    return None