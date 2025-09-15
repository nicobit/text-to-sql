import os, logging, asyncio
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from app.mcp import MCPClient
from app.selector import choose_tool, choose_by_embedding

logging.basicConfig(level=os.getenv("LOG_LEVEL","INFO").upper())
log = logging.getLogger("api")

MCP_URL = os.getenv("MCP_SERVER_URL","http://azure_mcp_server:5008")
mcp     = MCPClient(MCP_URL)

app = FastAPI(title="Tool Selector API")

class Q(BaseModel):
    question: str

class Invoke(BaseModel):
    tool: str
    params: dict

@app.get("/tools")
async def tools():
    return await mcp.list_tools()

@app.post("/choose")
async def choose(body: Q):
    tools = await mcp.list_tools()
    try:
        tool, params = await choose_tool(body.question, tools)
    except Exception as e:
        log.warning("Function-calling failed – %s. Falling back.", e)
        tool, params = await choose_by_embedding(body.question, tools)
    return {"tool": tool, "params": params}

@app.post("/invoke")
async def invoke(body: Invoke):
    try:
        result = await mcp.call_tool(body.tool, body.params)
        return {"result": result}
    except Exception as exc:
        raise HTTPException(400, str(exc))
