import httpx, asyncio, json
from typing import List, Dict, Any

class MCPClient:
    """Tiny helper to fetch tool list and call tools over HTTP+SSE."""
    def __init__(self, base_url: str):
        self.base = base_url.rstrip("/")

    async def list_tools(self) -> List[Dict[str, Any]]:
        async with httpx.AsyncClient() as c:
            r = await c.post(f"{self.base}/messages",
                             json={"jsonrpc":"2.0","id":1,
                                   "method":"tools/list","params":{}})
            r.raise_for_status()
            return r.json()["result"]          # MCP spec :contentReference[oaicite:4]{index=4}

    async def call_tool(self, name: str, params: Dict[str, Any]):
        """Fire-and-forget version – no streaming for brevity."""
        async with httpx.AsyncClient() as c:
            r = await c.post(f"{self.base}/messages",
                             json={"jsonrpc":"2.0","id":42,
                                   "method":name,"params":params})
            r.raise_for_status()
            return r.json()["result"]
