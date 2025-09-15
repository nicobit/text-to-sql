import asyncio
import json
import logging
from typing import List,Annotated
import httpx
from semantic_kernel.functions import kernel_function

logger = logging.getLogger(__name__)

class AgentInvokerPlugin:
    """
    Semantic Kernel plugin to invoke external agents based on capabilities from the registry.
    Provides functions the AI can call to route requests to appropriate agents.
    """
    def __init__(self, registry_client, memory_sharing: bool = False):
        """
        :param registry_client: AgentRegistryClient for looking up agent endpoints by capability.
        :param memory_sharing: If True, include shared memory context when invoking agents.
        """
        self.registry_client = registry_client
        self.memory_sharing = memory_sharing
        self._rr_index = {}      # round-robin index per capability
        self._locks = {}         # locks for concurrency control per capability
        for cap in self.registry_client.agents_by_capability:
            self._locks[cap] = asyncio.Lock()
        logger.info(f"AgentInvokerPlugin initialized (memory_sharing={memory_sharing})")

    @kernel_function(
            name="ListCapabilities",
            description="Step 1: List available agent capabilities and the number of agents for each.")
    async def list_capabilities(self) -> str:
        """
        Returns a list of all capabilities offered by registered agents, along with the count of agents for each.
        """
        capabilities = []
        for cap, agents in self.registry_client.agents_by_capability.items():
            capabilities.append(f"{cap} (agents: {len(agents)})")
        if not capabilities:
            return "No capabilities available."
        return "; ".join(capabilities)

    #@kernel_function(description="Step 2: Invoke an agent for a given capability. Provide 'capability' and 'message'. The result will be provided as answer to the user.")
    @kernel_function(
    name="InvokeAgent",
    description=(
        "Step 2: Use this function to get the final answer for the user by invoking the agent "
        "that handles the specified capability (e.g., 'storage', 'monitoring'). "
        "The 'message' parameter must contain the original user question or request in plain text. "
        "The returned string is the final answer to be shown to the user."
    )
    )
    async def invoke_agent(
        self,
        capability: Annotated[str, "The agent capability to use (e.g., 'storage', 'monitoring')"],
        message: Annotated[str, "The original user question or request in natural language"],
        user_id: str = "",
        kernel=None
    ) -> str:
        """
        Routes the user's message to an external agent that supports the specified capability and returns the agent's answer.
        If multiple agents have this capability, uses round-robin scheduling to distribute calls.
        If memory_sharing is enabled, includes relevant context from the user's session memory in the request.
        """
        capability = capability.strip()
        if not capability:
            return "Error: capability name is required."

        # Find agents that offer the requested capability
        agents = self.registry_client.get_agents_for_capability(capability)
        if not agents:
            logger.error(f"No agents for capability '{capability}'")
            return f"I'm sorry, no service is available for '{capability}'."

        # Ensure a concurrency lock exists for this capability
        if capability not in self._locks:
            self._locks[capability] = asyncio.Lock()
        lock = self._locks[capability]

        # Determine which agent to call (round-robin index selection)
        async with lock:
            start_index = self._rr_index.get(capability, 0)
            # Set next start index for subsequent call (round-robin progression)
            self._rr_index[capability] = (start_index + 1) % len(agents)

        last_error = None
        # Try each agent in the list, starting from the chosen index
        for i in range(len(agents)):
            idx = (start_index + i) % len(agents)
            agent = agents[idx]
            agent_id = agent.get("id", f"<{idx}>")
            agent_url = agent.get("endpoint")
            if not agent_url:
                logger.error(f"Agent {agent_id} missing endpoint; skipping.")
                continue

            # Prepare request payload for the agent
            payload = {"user_id": user_id, "message": message}
            if self.memory_sharing and kernel is not None and user_id:
                # Include shared memory context (relevant past messages or info) if enabled
                try:
                    results = await kernel.memory.search_async(collection=user_id, query=message, limit=3)
                    shared_context: List[str] = []
                    for item in results:
                        text = item.text if hasattr(item, "text") else (str(item) if item else "")
                        if text:
                            shared_context.append(text)
                    if shared_context:
                        payload["context"] = shared_context
                except Exception as e:
                    logger.error(f"Memory retrieval failed for user {user_id}: {e}")

            try:
                logger.info(f"Invoking agent {agent_id} at {agent_url} for capability '{capability}'")
                async with httpx.AsyncClient() as client:
                    resp = await client.post(agent_url, json=payload, timeout=15.0)
                    resp.raise_for_status()
                    text = resp.text
                    agent_answer = None
                    try:
                        data = resp.json()
                        if isinstance(data, dict):
                            # Expect agent response JSON to contain 'answer' or 'result'
                            agent_answer = data.get("answer") or data.get("result")
                            if agent_answer is None:
                                # If no specific field, use entire JSON as answer
                                agent_answer = json.dumps(data)
                        else:
                            # If response JSON is a primitive or list, stringify it
                            agent_answer = json.dumps(data)
                    except ValueError:
                        # Response is not JSON, use raw text
                        agent_answer = text
                    # Clean up the answer to a string
                    agent_answer = agent_answer.strip() if isinstance(agent_answer, str) else str(agent_answer)
                    logger.info(f"Agent {agent_id} responded: {agent_answer}")

                    logger.info(f"Agent {agent_id} call succeeded. With response: {agent_answer}")
                    return agent_answer
            except Exception as err:
                # Log the error and try the next agent
                last_error = err
                status = err.response.status_code if hasattr(err, "response") and err.response else None
                if status:
                    logger.error(f"Agent {agent_id} call failed with status {status}")
                else:
                    logger.error(f"Agent {agent_id} call exception: {err}")
                continue

        # If all agents failed to respond properly, return a generic error message
        logger.error(f"All agents for capability '{capability}' failed.")
        return "I'm sorry, I couldn't complete that request due to an internal error."
