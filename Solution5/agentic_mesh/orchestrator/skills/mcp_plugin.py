# app/skills/mcp_plugin.py
from __future__ import annotations
import os
import json
import asyncio
import logging
import string
from typing import Dict, List, Any, Annotated

from zeroconf.asyncio import AsyncZeroconf, AsyncServiceBrowser
from mcp.client.sse import sse_client  # ✅ MCP transport helper
from mcp.client.session import ClientSession  # ✅ High-level API
from semantic_kernel import Kernel
from semantic_kernel.functions import kernel_function

# Configure logging
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()
logging.basicConfig(level=LOG_LEVEL, format="%(asctime)s [%(levelname)s] %(name)s - %(message)s")
logger = logging.getLogger(__name__)

# Placeholder for Bearer token (to be replaced with a real token)
_BEARER = "Bearer eyFakeToken"  # TODO: Inject real AAD token


class MCPPlugin:
    """
    Semantic-Kernel plug-in that discovers MCP servers via Zeroconf and
    exposes ListServers, ListTools, and CallTool through the official MCP client.
    """

    def __init__(self, kernel: Kernel) -> None:
        self._kernel = kernel
        self._servers: Dict[str, Dict[str, Any]] = {}  # Stores discovered MCP servers
        self._sessions: Dict[str, ClientSession] = {}  # Persistent connections
        self._zc: AsyncZeroconf | None = None

        self._servers = self.load_mcp_servers_from_env()
        # Load static MCP server registry from environment variable
        #for entry in filter(None, os.getenv("MCP_SERVERS", "").split(",")):
        #    name, url = entry.split(":", 1)
        #    logger.info("Adding MCP server %s → %s", name.strip(), url.strip())
        #    self._servers[name.strip()] = url.strip()


    def load_mcp_servers_from_env(self) -> Dict[str, Dict[str, Any]]:
        """
        Parses the MCP_SERVERS environment variable into a structured dictionary.
        Format: name|url|tag1+tag2,name2|url2|tag3+tag4
        """
        servers: Dict[str, Dict[str, Any]] = {}

        raw_servers = os.getenv("MCP_SERVERS", "")
        if not raw_servers:
            logger.warning("No MCP_SERVERS environment variable set.")
            return servers

        entries = [entry.strip() for entry in raw_servers.split(",") if entry.strip()]
        
        for entry in entries:
            try:
                name, url, tag_str = entry.split("|")
                tags = [tag.strip() for tag in tag_str.split("+")]
                servers[name.strip()] = {
                    "url": url.strip(),
                    "tags": tags
                }
                logger.info("Loaded MCP server: %s → %s [%s]", name, url, ", ".join(tags))
            except ValueError:
                logger.warning("Invalid MCP_SERVERS entry (skipped): %s", entry)

        return servers

    # ── FastAPI / SK lifecycle ────────────────────────────────────────────────
    async def async_setup(self, seconds: int = 3) -> None:
        """Set up Zeroconf discovery and open persistent sessions."""
        self._zc = AsyncZeroconf()
        AsyncServiceBrowser(
            self._zc.zeroconf,
            "_mcp._tcp.local.",
            handlers=[self._on_service],
        )
        await asyncio.sleep(seconds)  # Allow time for discovery responses
        # Open persistent SSE sessions for known servers
        await asyncio.gather(*(self._open_session(name, info["url"]) for name, info in self._servers.items()))


    async def async_shutdown(self) -> None:
        """Clean up resources during shutdown."""
        await asyncio.gather(*(session.aclose() for session in self._sessions.values()))
        if self._zc:
            await self._zc.async_close()

    # Zeroconf callback
    async def _on_service(self, zc, srv_type, name, state) -> None:
        """Handle discovered MCP servers via Zeroconf."""
        info = await zc.get_service_info(srv_type, name)
        if info and info.addresses:
            host = ".".join(map(str, info.addresses[0]))
            url = f"http://{host}:{info.port}"
            if name not in self._servers:
                logger.info("Discovered MCP server %s → %s", name, url)
                
                # Store in new format with default tags
                self._servers[name] = {
                    "url": url,
                    "tags": ["discovered"]  # Default tag for Zeroconf-discovered servers
                }

                await self._open_session(name, url)


    # ── MCP client helpers ───────────────────────────────────────────────────
    async def _open_session(self, name: str, base_url: str) -> None:
        """Create a long-lived ClientSession for the given server."""
        if name in self._sessions:
            return
        sse_url = base_url.rstrip("/") + "/sse"
        logger.info("Opening SSE session to %s", sse_url)

        async def _connect() -> ClientSession:
            async with sse_client(sse_url) as (reader, writer):
                session = ClientSession(reader, writer)
                await session.initialize()
                return session

        self._sessions[name] = await _connect()

    async def _ensure_session(self, name: str) -> ClientSession:
        """Ensure a session exists for the given MCP server name."""
        if name not in self._sessions:
            if name in self._servers:
                url = self._servers[name]["url"]
                logger.info("Opening new session to %s", url)
                await self._open_session(name, url)
            else:
                raise ValueError(f"Unknown MCP server '{name}'")
        return self._sessions[name]


    # ── SK-exposed functions ────────────────────────────────────────────────
    @kernel_function(
    name="ListServers",
    description="Step 1: Retrieve a list of available MCP servers with their names, URLs, and tags. Use this first to decide where tools are hosted."
    )
    def list_servers(self) -> List[Dict[str, str]]:
        """Return all known MCP servers with metadata."""
        servers = [
            {
                "name": name,
                "url": info["url"],
                "tags": ", ".join(info.get("tags", []))
            }
            for name, info in self._servers.items()
        ]
        logger.info("List known MCP servers: %s", servers)
        return servers
    
    @kernel_function(
    name="ChooseBestServer",
    description="Step 2: Select the most appropriate MCP server based on the user's question and the tags of each server."
    )
    def choose_best_server(
        self,
        question: Annotated[str, "The user's natural language question."]
    ) -> str:
        """Return the best matching server name based on tag overlap."""
        question_lower = question.lower()

        best_match = None
        best_score = 0

        for name, info in self._servers.items():
            tags = info.get("tags", [])
            score = sum(1 for tag in tags if tag.lower() in question_lower)
            if score > best_score:
                best_score = score
                best_match = name

        logger.info("Best matching server for question '%s': %s (score: %d)", question, best_match, best_score)
        # fallback to first available server
        return best_match or next(iter(self._servers.keys()))


    @kernel_function(
    name="ListTools",
    description="Step 3: Given a server and a user question, return a ranked list of available tools that match the user's intent. Use this after ListServers."
    )
    async def list_tools(
        self,
        server: Annotated[str, "Name of the MCP server to query (from ListServers)"],
        question: Annotated[str, "User's natural language question used to match relevant tools"],
    ) -> Dict[str, Any]:
        """List and rank tools available on a specific MCP server."""
        logger.info("List tools on server %s", server)

        if server not in self._servers:
            raise ValueError(f"Unknown MCP server '{server}'")

        server_url = self._servers[server]["url"]
        sse_url = server_url.rstrip("/") + "/sse"

        async with sse_client(sse_url) as (read, write):
            async with ClientSession(read, write) as session:
                await session.initialize()
                tools = await session.list_tools()

        # Normalize the question for matching
        question_cleaned = question.lower().translate(str.maketrans("", "", string.punctuation))

        result_tools = []
        for tool in tools.tools:
            tool_name_cleaned = tool.name.replace("-", " ").lower().translate(str.maketrans("", "", string.punctuation))
            description_cleaned = tool.description.lower().translate(str.maketrans("", "", string.punctuation))

            # Count matching words in name and description
            match_count = sum(1 for word in tool_name_cleaned.split() if word in question_cleaned.split()) + \
                        sum(1 for word in description_cleaned.split() if word in question_cleaned.split())

            if match_count > 0:
                logger.info("Match found for tool: %s with %d matches", tool.name, match_count)
                result_tools.append({
                    "tool": tool.model_dump(),
                    "matches": match_count
                })

        # Return top 3 ranked tools
        top_tools = sorted(result_tools, key=lambda x: x["matches"], reverse=True)[:3]

        return {
            "tenant": os.getenv("AZURE_TENANT_ID"),
            "subscription": os.getenv("AZURE_SUBSCRIPTION_ID"),
            "server": server,
            "tools": top_tools
        }


    @kernel_function(
    name="CallTool",
    description="Step 4: Call a selected tool on a specified MCP server using any required parameters. Use a tool obtained from ListTools."
    )
    async def call_tool(
        self,
        server: Annotated[str, "MCP server name from ListServers"],
        tool: Annotated[str, "Tool name selected from ListTools"],
        params: Annotated[Dict[str, Any] | None, "Tool input parameters in JSON format (can be empty)"] = None,
    ) -> Any:
        """Call a specific tool on an MCP server."""
        logger.info("Call tool %s on server %s", tool, server)
        logger.info("Params: %s", params)

        if server not in self._servers:
            raise ValueError(f"Unknown MCP server '{server}'")

        server_url = self._servers[server]["url"]  # ✅ Fixed: extract 'url' from structured server data
        parsed_params = params or {}
        sse_url = server_url.rstrip("/") + "/sse"

        async with sse_client(sse_url) as (read, write):
            async with ClientSession(read, write) as session:
                await session.initialize()
                logger.info("Calling tool %s with params %s", tool, parsed_params)
                result = await session.call_tool(name=tool, arguments=parsed_params)

                if result.isError:
                    logger.error("Error occurred while calling tool: %s", result.content)
                    return {"error": result.content if result.content else "Unknown error"}

                if not result.content:
                    logger.warning("Tool call returned no content.")
                    return "No content returned by tool."

                output = result.content[0].text
                logger.info("Result: %s", output)
                return output

