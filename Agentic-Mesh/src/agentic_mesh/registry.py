from typing import Dict, Type
from agents.base import BaseAgent

_AGENTS: Dict[str, BaseAgent] = {}

def register_agent(cls: Type[BaseAgent]):
    inst = cls()
    _AGENTS[inst.name] = inst
    return cls

def get_agent(name: str) -> BaseAgent:
    return _AGENTS[name]

def list_agent_metadata():
    return [
        {"name": ag.name, "description": ag.description, "parameters": ag.schema}
        for ag in _AGENTS.values()
    ]