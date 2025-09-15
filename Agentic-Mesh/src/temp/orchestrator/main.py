
from orchestrator.registry_client import get_agents, find_agent_by_capability
from orchestrator.planner_interface import plan_with_llm, get_plan
from semantic_kernel import Kernel
import asyncio
from fastapi import FastAPI, Request
import httpx
import asyncio

app = FastAPI()
kernel = Kernel()

@app.post("/task")
async def handle_task(goal: str):
    plan = await plan_with_llm(kernel, goal)
    print("Plan steps:", [s.description for s in plan.steps])
    agents = get_agents()
    return {
        "plan": [s.description for s in plan.steps],
        "agents": agents
    }

@app.post("/execute")
async def orchestrate(request: Request):
    body = await request.json()
    goal = body.get("goal")
    plan = await get_plan(kernel, goal)

    results = []
    for step in plan.steps:
        print(f"Executing step: {step.description}")
        # hardcoded capability match (can be improved)
        agent = find_agent_by_capability("store_memory")
        if agent:
            async with httpx.AsyncClient() as client:
                res = await client.post(f"{agent['endpoint']}store", params={"key": "goal", "value": step.description})
                results.append(res.json())
        else:
            results.append({"error": "No agent found"})
    return {"goal": goal, "results": results}