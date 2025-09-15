# Minimal MCP schema representation
from typing import List
from pydantic import BaseModel

class MCPAgent(BaseModel):
    id: str
    name: str
    endpoint: str
    capabilities: List[str]
