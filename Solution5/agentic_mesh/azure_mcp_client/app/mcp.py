# app/mcp.py
import os, asyncio, contextlib, logging
import httpx
from httpx_sse import aconnect_sse
from mcp.client.sse import sse_client
from mcp.client.session import ClientSession

log = logging.getLogger("mcp")

MCP_URL = os.getenv("MCP_SERVER_URL", "http://azure_mcp_server:5008/sse")

class MCPClient:
    def __init__(self, url: str):
        self.url = url
        self._http: httpx.AsyncClient | None = None
        self._ctx = None
        self.session: ClientSession | None = None


    async def __aenter__(self):
        # 1 open a shared AsyncClient
        # self._http = httpx.AsyncClient(timeout=None)     # timeout=None for long SSE
        # 2 pass it into aconnect_sse - client, method, url
        # self._ctx = aconnect_sse(self._http, "GET", self.url)
        # event_source = await self._ctx.__aenter__()
        # 3 wrap the reader in an MCP ClientSession
        # self.session = ClientSession(event_source.aiter_sse(), self._http)
        # await self.session.initialize()    

        async with sse_client(self.url) as (read, write):
            async with ClientSession(read, write) as session:
                await session.initialize() 
                          # MCP handshake
        return self

    async def list_tools(self):
        return await self.session.list_tools()

    async def call_tool(self, name: str, params: dict):
        return await self.session.call_tool(name, params)

    async def __aexit__(self, *exc):
        await self.session.aclose()
        await self._ctx.__aexit__(*exc)
        await self._http.aclose()

mcp_client = MCPClient(MCP_URL)  # singleton
