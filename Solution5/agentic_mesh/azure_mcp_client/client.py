import asyncio, os, logging
from urllib.parse import urlparse, urlunparse
from mcp.client.sse import sse_client
from mcp.client.session import ClientSession

logging.basicConfig(level=os.getenv("LOG_LEVEL", "INFO").upper())
log = logging.getLogger("orchestrator")

def ensure_sse(url: str) -> str:
    p = urlparse(url)
    return urlunparse(p._replace(path="/sse" if p.path in ("", "/") else p.path))

async def main() -> None:
    raw = os.environ.get("MCP_SERVER_URL")
    if not raw:
        raise RuntimeError("Set MCP_SERVER_URL (e.g. http://azure_mcp_server:5008/sse)")
    url = ensure_sse(raw)

    async with sse_client(url) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()          # required once
            
            tools = await session.list_tools()  # ToolListResult
            log.info("Server exposes %d tools: %s",
                     len(tools.tools),
                     [t.name for t in tools.tools])

if __name__ == "__main__":
    asyncio.run(main())
