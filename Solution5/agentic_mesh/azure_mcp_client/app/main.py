# app/main.py
from fastapi import FastAPI, HTTPException
from app.mcp import mcp_client
from pydantic import BaseModel
import uvicorn, asyncio, logging
from fastapi.responses import StreamingResponse
import os, asyncio, contextlib, logging
from mcp.client.sse import sse_client
from mcp.client.session import ClientSession
MCP_URL = os.getenv("MCP_SERVER_URL", "http://azure_mcp_server:5008/sse")

log = logging.getLogger("mcp")

app = FastAPI(title="FastAPI MCP Proxy")

my_mcp = None

class InvokeRequest(BaseModel):
    params: dict = {}

@app.on_event("startup")
async def startup():
    log.info("Initializing MCP client")
    # open the SSE connection once for all requests
    #global my_mcp
    #if my_mcp is None:
        #log.info("Initializing MCP client")
        #my_mcp = await mcp_client.__aenter__()
        #log.info("MCP client initialized")
        # mcp_client = MCPClient(MCP_URL)  # singleton
        # app.state.mcp = await mcp_client.__aenter__()
        # log.info("MCP client initialized")
        ##############
        # 1 open a shared AsyncClient
        # self._http = httpx.AsyncClient(timeout=None)     # timeout=None for long SSE
        # 2 pass it into aconnect_sse - client, method, url
        # self._ctx = aconnect_sse(self._http, "GET", self.url)
        # event_source = await self._ctx.__aenter__()
        # 3 wrap the reader in an MCP ClientSession
        # self.session = ClientSession(event_source.aiter_sse(), self._http)
        # await self.session.initialize()    
        ##############
        

@app.on_event("shutdown")
async def shutdown():
    global my_mcp
    await my_mcp.__aexit__(None, None, None)

@app.get("/tools")
async def list_tools():
    MCP_URL = os.getenv("MCP_SERVER_URL", "http://azure_mcp_server:5008/sse")
    log.error("Initializing MCP client")
    log.error("MCP_URL: %s", MCP_URL)
    async with sse_client(MCP_URL) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()          # required once
            tools = await session.list_tools()  # ToolListResult
    return {"tools": [t.model_dump() for t in tools.tools]}

@app.post("/invoke/{tool_name}")
async def invoke(tool_name: str, body: InvokeRequest):
    global my_mcp
    try:
        if(my_mcp is None):
            log.info("Initializing MCP client")
            my_mcp = await mcp_client.__aenter__()
            log.info("MCP client initialized")
        result = await my_mcp.invoke(tool_name, body.params)
        return result.model_dump()
    except Exception as exc:
        logging.exception("Tool failed")
        raise HTTPException(500, str(exc))
    

@app.get("/stream/{tool}")
async def stream(tool: str):
    global my_mcp
    if(app.state.mcp is None):
            log.info("Initializing MCP client")
            app.state.mcp = await mcp_client.__aenter__()
            log.info("MCP client initialized")
    async def event_gen():
        async for part in app.state.mcp.invoke(tool, {}):   # returns an async iterator
            yield f"data: {part.json()}\n\n"
    return StreamingResponse(event_gen(), media_type="text/event-stream")


if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8081, reload=True)
