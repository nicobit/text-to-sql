from semantic_kernel import Kernel
from semantic_kernel.planners import SequentialPlanner

async def plan_with_llm(kernel: Kernel, goal: str):
    planner = SequentialPlanner(kernel)
    plan = await planner.create_plan(goal)
    return plan

async def get_plan(kernel: Kernel, goal: str):
    planner = SequentialPlanner(kernel)
    return await planner.create_plan(goal)