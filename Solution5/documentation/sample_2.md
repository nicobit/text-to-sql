Below is an example of how you might define your base classes for actors (agents) and tools. This example blends ideas from the LangGraph tutorial with the code you provided. In this design, an Agent processes a system state by interacting with a language model and invoking tools, while a Tool (here called BaseTool) encapsulates a specific action or service that can be executed as part of the workflow.

```python
from abc import ABC, abstractmethod
import re
import time
import json
import langgraph  # LangGraph helper library
import app.services.openai_service as chat  # Your OpenAI service wrapper
from app.agents.conversation_state import ConversationState
from app.utils.nb_logger import NBLogger

# ---------------------------------------------------------------------
# Base Agent Class for LangGraph-based Workflows (Actor)
# ---------------------------------------------------------------------
class Agent(ABC):
    """
    Base Agent class for langgraph-based workflows.
    An Agent processes a system state by interacting with a language model and external tools.
    """
    
    def __init__(self, name: str, task: str, config: dict):
        """
        Initialize the Agent with a name, task, and configuration.
        Expected keys in config:
          - "engine": the name of the language model engine to use.
          - "prompt_template": (optional) a template for the system prompt.
          - "tools": a dictionary with tool names as keys and tool instances as values.
        """
        self.name = name
        self.task = task
        self.config = config
        self.tools = config.get("tools", {})  # tools should be provided in the config
        self.chat_history = []  # List of message dictionaries (role and content)
        
        # Allow subclasses to register additional tools if needed.
        self.register_tools()
    
    @abstractmethod
    def register_tools(self):
        """
        Abstract method for registering tools.
        Subclasses should add tool instances to self.tools.
        """
        pass
    
    def add_message(self, role: str, content: str):
        """
        Append a message to the chat history.
        """
        self.chat_history.append({"role": role, "content": content})
    
    def get_tools_description(self) -> str:
        """
        Create a numbered list of available tools for prompt context.
        """
        description = ""
        for idx, tool in enumerate(self.tools.values(), start=1):
            description += f"{idx}. {tool.tool_name}\n"
        return description.strip()
    
    def build_prompt(self) -> str:
        """
        Build the system prompt using a template from the configuration.
        """
        template = self.config.get(
            "prompt_template",
            "Agent: {agent_name}\nTask: {task}\nAvailable Tools:\n{tools_desc}"
        )
        return template.format(
            agent_name=self.name,
            task=self.task,
            tools_desc=self.get_tools_description()
        )
    
    def call_agent(self, system_state: dict) -> str:
        """
        Use langgraph's language model chain to generate the agent's next response.
        """
        # Assemble conversation messages with simple XML-like tags.
        messages = ""
        for msg in self.chat_history:
            messages += f"<{msg['role']}>\n{msg['content']}\n</{msg['role']}>\n"
        messages += "<agent>\n"
        
        # Get an LLM chain from langgraph. The exact API may vary.
        llm_chain = langgraph.get_llm_chain(
            engine=self.config.get("engine", "default"),
            temperature=0
        )
        response = llm_chain.call(messages=messages)
        return response.strip()
    
    def is_done(self, response: str) -> bool:
        """
        Determine if the response indicates that processing is complete.
        """
        return "DONE" in response
    
    def extract_tool_call(self, response: str) -> str:
        """
        Extract a tool name from the agent response, assuming the tool call is
        marked as <tool_call>tool_name</tool_call> in the response.
        """
        start_tag = "<tool_call>"
        end_tag = "</tool_call>"
        if start_tag in response and end_tag in response:
            start = response.index(start_tag) + len(start_tag)
            end = response.index(end_tag)
            return response[start:end].strip()
        else:
            raise ValueError("No tool call found in the response.")
    
    def call_tool(self, tool_name: str, system_state: dict) -> str:
        """
        Call the specified tool with the current system state.
        The tool is expected to have an execute (or __call__) method.
        """
        if tool_name not in self.tools:
            raise ValueError(f"Tool '{tool_name}' not found.")
        tool = self.tools[tool_name]
        try:
            result = tool.execute(system_state)
            return f"Tool {tool.tool_name} executed successfully. Result: {result}"
        except Exception as e:
            raise Exception(f"Error in tool {tool.tool_name}: {e}")
    
    def workout(self, system_state: dict) -> dict:
        """
        Main workflow:
          1. Build and add a system prompt.
          2. Iteratively call the agent via the language model.
          3. If a tool call is indicated, invoke the corresponding tool.
          4. Stop if the agent indicates completion.
        """
        # Add initial system prompt
        system_prompt = self.build_prompt()
        self.add_message("system", system_prompt)
        
        for _ in range(10):  # Limit iterations to avoid infinite loops
            try:
                response = self.call_agent(system_state)
                self.add_message("agent", response)
                print(f"Agent {self.name} response: {response}")
                
                if self.is_done(response):
                    break
                
                # Extract tool call from response and invoke the tool
                tool_name = self.extract_tool_call(response)
                self.add_message("agent", f"Calling tool: {tool_name}")
                tool_result = self.call_tool(tool_name, system_state)
                self.add_message("tool", tool_result)
            except Exception as e:
                error_msg = f"Error in agent workflow: {e}"
                print(error_msg)
                self.add_message("error", error_msg)
                break
        return system_state
    
    def __call__(self, system_state: dict) -> dict:
        """
        Allow the Agent instance to be called as a function with system_state.
        """
        return self.workout(system_state)

# ---------------------------------------------------------------------
# Base Tool Class for LangGraph-based Workflows
# ---------------------------------------------------------------------
class BaseTool(ABC):
    """
    Base Tool class for langgraph-based workflows.
    A Tool processes a conversation or system state, performs an action, and logs its execution.
    """
    def __init__(self):
        # Set a consistent tool name by converting the class name to snake_case.
        self.tool_name = self._camel_to_snake(self.__class__.__name__)
    
    def __call__(self, state: ConversationState) -> ConversationState:
        return self.run_tool(state)
    
    def run_tool(self, state: ConversationState) -> ConversationState:
        logger = NBLogger().Log()
        logger.log(f"---START: {self.tool_name}---")
        start_time = time.time()
        state.executing_tool = self.tool_name
        
        try:
            # Execute the tool's main functionality.
            self.run(state)
            status = {"status": "success"}
        except Exception as err:
            error_msg = f"{type(err).__name__}: {err}"
            logger.log(f"Tool '{self.tool_name}' encountered an error:\n{error_msg}", "error", state.task)
            state.errors[self.tool_name] = error_msg
            status = {"status": "error", "error": error_msg}
        
        status["execution_time"] = round(time.time() - start_time, 1)
        self.log_update(state, status)
        logger.log(f"---END: {self.tool_name} in {status['execution_time']} seconds---")
        return state
    
    def log_update(self, state: ConversationState, status: dict):
        # Prepare a log entry containing tool name and execution status.
        run_log = {"tool_name": self.tool_name}
        if status["status"] == "success":
            run_log.update(self.get_run_updates(state))
        run_log.update(status)
        state.execution_history.append(run_log)
        NBLogger().Log().log(json.dumps(state.execution_history, indent=2))
    
    @abstractmethod
    def run(self, state: ConversationState) -> None:
        """
        The core functionality of the tool. Subclasses must implement this method.
        It should process the given SystemState and update it accordingly.
        """
        pass
    
    @abstractmethod
    def get_run_updates(self, state: ConversationState) -> dict:
        """
        Retrieve additional information about the tool's execution (e.g., state updates).
        Subclasses must implement this to return a dictionary of updates.
        """
        pass
    
    def _camel_to_snake(self, name: str) -> str:
        """
        Convert CamelCase to snake_case.
        """
        s1 = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', name)
        s2 = re.sub('([a-z0-9])([A-Z])', r'\1_\2', s1)
        return s2.lower()
```

### Explanation

- **Agent Base Class:**  
  - Initializes with a name, task, and configuration (which should include a language model engine, an optional prompt template, and a tools dictionary).  
  - Provides helper methods to build prompts, add messages to a conversation history, call a language model via LangGraph, and extract tool calls from the agent’s responses.  
  - The `workout` method implements a loop that calls the language model, checks for completion, and delegates tool calls as needed.

- **BaseTool Class:**  
  - Sets a standardized `tool_name` by converting the class name from CamelCase to snake_case.  
  - The `run_tool` method logs the tool’s execution start and end, handles errors, and records execution updates in the system state.  
  - Two abstract methods (`run` and `get_run_updates`) must be implemented by subclasses to perform the tool’s specific action and return additional execution information.

This design gives you a strong foundation for building more complex LangGraph-based workflows where agents can interact with language models and tools dynamically. Feel free to extend these base classes to suit your project’s needs.