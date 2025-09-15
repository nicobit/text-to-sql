# Terminal 1: Run the registry
uvicorn registry.app:app --port 8000

# Terminal 2: Run the memory agent
uvicorn agents.memory_agent.main:app --port 8001

# Terminal 3: Run orchestrator
uvicorn orchestrator.main:app --port 8002

# Terminal 4: Optional dummy tool
uvicorn tools.dummy_tool.main:app --port 8003


# Agentic Mesh (MVP)

## Services

- Registry: `localhost:8000`
- Memory Agent: `localhost:8001`
- Orchestrator: `localhost:8002`
- Dummy Tool: `localhost:8003` (optional)

## Start Services

```bash
uvicorn registry.app:app --port 8000
uvicorn agents.memory_agent.main:app --port 8001
uvicorn orchestrator.main:app --port 8002
uvicorn tools.dummy_tool.main:app --port 8003