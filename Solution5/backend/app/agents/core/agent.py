from abc import ABC, abstractmethod
from app.llm.openai_service import OpenAIService
from app.llm.prompt_menager import PromptManager
from typing import Generic

from app.agents.core.tool import BaseTool
from app.agents.core.system_state import T
from app.utils.nb_logger import NBLogger



class AgentBase(ABC, Generic[T]):
    def __init__(self, name: str, description: str):
        self.name = name
        self.description = description
        self.tools = {}  # list of tools this agent can use
        self.history = []  # store (role, message) tuples for this agent if needed
        self.logger = NBLogger().Log()
        self.promptManager = PromptManager()

    # Common
    def add_history(self, role: str, message: str):
        # Track conversation or reasoning history (not always needed for single-shot prompts, but useful for debugging)
        self.history.append((role, message))

    def register_tool(self, tool_name, tool: BaseTool):
        # Register a tool that this agent can use
        self.logger.info(f"Registering tool: {tool_name}")
        self.tools[tool_name] = tool
        self.logger.info(f"Registering tool: {tool_name} -- DONE")

    # Common
    def call_llm(self, system_prompt: str, user_prompt: str, temperature=0.7, max_tokens=512) -> str:
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
    def get_embedding(self, text:str) -> list:
        # Get the embedding for a given text using OpenAI's embedding service.
        embedding = OpenAIService.get_embedding(text)
        return embedding

    
    def call_tool(self, tool_name: str, state: T) -> T:

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
                self.logger.error(f"Error in tool {tool_name}: {e}", exc_info=True)
                raise Exception(f"Error in tool {tool_name}: {e}")
        return state
    
    # Common
    def extract_result(self, answer : str, tag : str) -> str:
        return answer.split("<{tag}}>")[1].split("</{tag}}>")[0].strip()

  
    def run_before(self, state: T) -> T:
        # Primary method to execute the agent's logic. To be implemented by subclasses
        return state
    
    
    def run_after(self, state: T) -> T:
        # Primary method to execute the agent's logic. To be implemented by subclasses
        return state

    def __call__(self, state: T) -> T:
        return self.run(state)

    def run(self, state:T) -> T:
        self.logger.info(f"---START: {self.name}---")
        try:
            state = self.run_before(state)
            self.logger.info(f"run-before called")

            for tool_name, tool in self.tools.items():
                self.logger.info(f"Running tool: {tool_name}")
               

                self.add_history("agent", f"Calling tool: {tool_name}")

                state = self.call_tool(tool_name, state)
                if(state["proceed"] == False):
                    self.logger.info(f"Tool {tool_name} indicated not to proceed.")
                    break
                    
            state = self.run_after(state)
            
    
        except Exception as e:
            error_msg = f"Error in agent workflow: {e}"
            
            self.logger.info(f"Error: {error_msg}")
            self.add_history("error", error_msg)
        
        return state

