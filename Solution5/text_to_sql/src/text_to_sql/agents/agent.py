from abc import ABC, abstractmethod
from typing import Generic
import time

from text_to_sql.agents.tool import BaseTool
from text_to_sql.agents.system_state import T
from text_to_sql.core.llm.openai_service import OpenAIService
from text_to_sql.core.llm.prompt_menager import PromptManager
from text_to_sql.core.log.logger import Logger


class AgentBase(ABC, Generic[T]):
    """
    Abstract base class for agents. Provides common functionality for managing tools,
    interacting with LLMs, and maintaining execution history.
    """

    def __init__(self, name: str, description: str):
        self.name = name  # Name of the agent
        self.description = description  # Description of the agent
        self.tools = {}  # Dictionary of tools this agent can use
        self.history = []  # List to store (role, message) tuples for conversation history
        self.logger = Logger().Log()  # Logger instance
        self.promptManager = PromptManager()  # Prompt manager instance

    # Common
    def add_history(self, role: str, message: str):
        """
        Add a message to the agent's history.
        Useful for tracking conversation or reasoning history.
        """
        self.history.append((role, message))

    def register_tool(self, tool_name, tool: BaseTool):
        """
        Register a tool that the agent can use.
        """
        self.logger.info(f"Registering tool: {tool_name}")
        self.tools[tool_name] = tool
        self.logger.info(f"Registering tool: {tool_name} -- DONE")

    # Common
    def call_llm(self, system_prompt: str, user_prompt: str, temperature=0.7, max_tokens=512) -> str:
        """
        Call the LLM with a system prompt and user prompt.
        """
        answer = OpenAIService.chat(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=temperature,
            max_tokens=max_tokens
        )
        return answer

    # Common
    def get_embedding(self, text: str) -> list:
        """
        Get the embedding for a given text using OpenAI's embedding service.
        """
        embedding = OpenAIService.get_embedding(text)
        return embedding

    def call_tool(self, tool_name: str, state: T) -> T:
        """
        Call a registered tool with the given state.
        """
        self.logger.info(f"Calling tool: {tool_name}")

        if tool_name not in self.tools:
            self.logger.error(f"Tool '{tool_name}' not found.")
            raise ValueError(f"Tool '{tool_name}' not found.")

        tool = self.tools[tool_name]

        if not isinstance(tool, BaseTool):
            self.logger.error(f"Tool '{tool_name}' is not of type BaseTool.")
            raise TypeError(f"Tool '{tool_name}' is not of type BaseTool.")
        else:
            try:
                state = tool.run_tool(state)
            except Exception as e:
                error_msg = f"{type(e).__name__}: {e}"
                state["errors"][tool_name] = error_msg
                self.logger.error(f"Error in tool {tool_name}: {e}", exc_info=True)
                raise Exception(f"Error in tool {tool_name}: {e}")

        return state

    # Common
    def extract_result(self, answer: str, tag: str) -> str:
        """
        Extract a result from the LLM's response using a specific tag.
        """
        return answer.split(f"<{tag}>")[1].split(f"</{tag}>")[0].strip()

    def run_before(self, state: T) -> T:
        """
        Method to execute logic before running tools.
        To be implemented by subclasses.
        """
        return state

    def log_update(self, state: T, status: dict):
        """
        Log the execution status and update the execution history in the state.
        """
        run_log = {"agent_name": self.name}
        if status["status"] == "success":
            run_log.update(self.get_run_updates(state))
        run_log.update(status)

        if "execution_history" not in state:
            state["execution_history"] = []

        state["execution_history"].append(run_log)

    @abstractmethod
    def get_run_updates(self, state: T) -> T:
        """
        Abstract method to get updates for the run.
        To be implemented by subclasses.
        """
        pass

    def run_after(self, state: T) -> T:
        """
        Method to execute logic after running tools.
        To be implemented by subclasses.
        """
        return state

    def __call__(self, state: T) -> T:
        """
        Allow the agent to be called like a function.
        """
        return self.run(state)

    def run(self, state: T) -> T:
        """
        Main execution method for the agent.
        """
        state["execution_history"].append({"agent_name": f"{self.name}-----------------"})
        start_time = time.time()
        try:
            status = {"executed_at": time.strftime("%Y.%m.%d: %H.%M.%S")}
            state = self.run_before(state)

            for tool_name, tool in self.tools.items():
                self.logger.info(f"Running tool: {tool_name}")
                self.add_history("agent", f"Calling tool: {tool_name}")

                state = self.call_tool(tool_name, state)
                if not state.get("proceed", True):
                    self.logger.info(f"Tool {tool_name} indicated not to proceed.")
                    break

            state = self.run_after(state)
            status["status"] = "success"

        except Exception as e:
            error_msg = f"Error in agent workflow: {type(e).__name__}: {e}"
            state["errors"][self.name] = error_msg
            status = {"status": "error", "error": error_msg}
            self.logger.info(f"Error: {error_msg}")
            self.add_history("error", error_msg)

        status["execution_time"] = round(time.time() - start_time, 1)
        self.log_update(state, status)

        return state
