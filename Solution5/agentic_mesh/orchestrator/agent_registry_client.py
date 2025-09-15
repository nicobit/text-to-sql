import logging
from collections import defaultdict
from typing import Dict, List
import httpx

logger = logging.getLogger(__name__)

class AgentRegistryClient:
    """
    Client to retrieve agent information from the Agent Registry.
    Expects the registry's response to contain agents and their capabilities in a Model Context Protocol (MCP)-like schema.
    Example schema:
    {
      "agents": [
         {
           "id": "agent1",
           "name": "Agent One",
           "capabilities": ["CapabilityA", "CapabilityB"],
           "endpoint": "http://agent1.example.com/api"
         },
         ...
      ]
    }
    """
    def __init__(self, registry_url: str):
        """
        :param registry_url: URL of the agent registry service (e.g., http://registry-service/api/agents).
        """
        self.registry_url = registry_url
        # Dictionary mapping capability name to list of agent info dicts that provide that capability
        self.agents_by_capability: Dict[str, List[Dict]] = defaultdict(list)
        logger.info(f"AgentRegistryClient initialized for URL: {registry_url}")

    def load_agents(self):
        """
        Fetch agent data from the registry and organize it by capability.
        """
        logger.debug("Fetching agent list from registry...")
        try:
            try:
                for attempt in range(3):  # Retry up to 3 times
                    try:
                        logger.info(f"Attempt {attempt + 1}: Fetching agents from registry...{self.registry_url}")
                        resp = httpx.get(self.registry_url, timeout=10.0)
                        resp.raise_for_status()
                        break
                    except httpx.ConnectError as e:
                        logger.warning(f"Attempt {attempt + 1}: Connection error while trying to reach the registry: {e}")
                        if attempt == 2:  # Last attempt
                            raise
                    except httpx.RequestError as e:
                        logger.error(f"HTTP request error while fetching agents from registry: {e}")
                        raise
                resp.raise_for_status()
            except httpx.ConnectError as e:
                logger.error(f"Connection error while trying to reach the registry: {e}")
                raise
        except httpx.RequestError as e:
            logger.error(f"HTTP request error while fetching agents from registry: {e}")
            raise
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP status error: {e.response.status_code} - {e.response.text}")
            raise

        try:
            data = resp.json()
        except ValueError as e:
            logger.error(f"Error decoding JSON response from registry: {e}")
            raise

        # Accept either a list of agents or a dict with an "agents" list
        if isinstance(data, dict) and "agents" in data:
            agent_list = data["agents"]
        elif isinstance(data, list):
            agent_list = data
        else:
            logger.error("Unexpected agent registry response format")
            raise ValueError("Agent registry response format not recognized")

        # Reset current data and populate capabilities
        self.agents_by_capability.clear()
        for agent in agent_list:
            for cap in agent.get("capabilities", []):
                cap_name = str(cap)
                self.agents_by_capability[cap_name].append(agent)
        logger.info(f"Loaded {len(agent_list)} agents from registry.")

    def get_agents_for_capability(self, capability: str):
        """
        Get the list of agents offering a given capability.
        """
        logger.info(f"Retrieving agents for capability: {capability}")
        return self.agents_by_capability.get(capability, [])
