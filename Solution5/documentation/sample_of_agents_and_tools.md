Below is a full Python sample project that provides a minimal base framework with both an abstract agent class and an abstract tool class. The project simulates a simple workflow where an agent uses a web‐search tool to process a query and update a shared system state. You can expand and adapt this framework for more complex LangGraph‑based workflows.

---

```python
import re
import time
import json
from abc import ABC, abstractmethod
from typing import Dict, Any

# ---------------------------
# Logger and SystemState Setup
# ---------------------------

class Logger:
    def log(self, msg: str, level: str = "info", task: str = None):
        print(f"[{level.upper()}] {msg}")

    def dump_history_to_file(self, history: list):
        # For this sample, we simply print the dumped history.
        print("Execution History:")
        print(json.dumps(history, indent=2))

class SystemState(dict):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.execution_history = []  # List of run logs.
        self.errors = {}             # Dictionary of errors keyed by tool name.
        self.task = "Sample Task"    # Name or description of the current task.
        self.executing_tool = None   # Currently executing tool.

# ---------------------------
# Helper Function
# ---------------------------

def camel_to_snake(name: str) -> str:
    s1 = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', name)
    s2 = re.sub('([a-z0-9])([A-Z])', r'\1_\2', s1)
    return s2.lower()

# ---------------------------
# Base Tool Class
# ---------------------------

class Tool(ABC):
    def __init__(self):
        self.tool_name = camel_to_snake(self.__class__.__name__)
    
    def __call__(self, state: SystemState) -> SystemState:
        Logger().log(f"---START: {self.tool_name}---")
        start_time = time.time()
        state.executing_tool = self.tool_name
        try:
            self._run(state)
            run_status = {"status": "success"}
        except Exception as e:
            error_msg = f"{type(e).__name__}: {e}"
            Logger().log(f"Tool '{self.tool_name}' error: {error_msg}", "error", state.task)
            state.errors[self.tool_name] = error_msg
            run_status = {"status": "error", "error": error_msg}
        run_status["execution_time"] = round(time.time() - start_time, 1)
        self._log_run(state, run_status)
        Logger().log(f"---END: {self.tool_name} in {run_status['execution_time']} sec---")
        return state

    @abstractmethod
    def _run(self, state: SystemState) -> None:
        """Core functionality of the tool."""
        pass

    @abstractmethod
    def _get_updates(self, state: SystemState) -> Dict[str, Any]:
        """Return additional updates from the tool execution."""
        pass

    def _log_run(self, state: SystemState, run_status: Dict[str, Any]):
        run_log = {"tool_name": self.tool_name}
        if run_status["status"] == "success":
            run_log.update(self._get_updates(state))
        run_log.update(run_status)
        state.execution_history.append(run_log)
        Logger().dump_history_to_file(state.execution_history)

# ---------------------------
# Concrete Tool Implementation
# ---------------------------

class WebSearchTool(Tool):
    def _run(self, state: SystemState) -> None:
        # Simulate web search: extract query from state and create a fake result.
        query = state.get("query", "default query")
        # In a real implementation, you might connect to a web search API.
        result = f"Fake search result for '{query}'"
        state["search_result"] = result

    def _get_updates(self, state: SystemState) -> Dict[str, Any]:
        return {"result": state.get("search_result", "")}

# ---------------------------
# Base Agent Class
# ---------------------------

class Agent(ABC):
    def __init__(self, name: str, config: Dict[str, Any] = None):
        self.name = name
        self.config = config or {}
    
    @abstractmethod
    def act(self, state: SystemState) -> SystemState:
        """Agent processes the state and performs an action."""
        pass

# ---------------------------
# Concrete Agent Implementation
# ---------------------------

class SimpleAgent(Agent):
    def __init__(self, name: str, tool: Tool, config: Dict[str, Any] = None):
        super().__init__(name, config)
        self.tool = tool
    
    def act(self, state: SystemState) -> SystemState:
        Logger().log(f"Agent '{self.name}' is acting using tool '{self.tool.tool_name}'.")
        # The agent calls the tool to update the system state.
        updated_state = self.tool(state)
        # Optionally, add agent-specific information.
        updated_state["agent_action"] = f"{self.name} invoked {self.tool.tool_name}"
        return updated_state

# ---------------------------
# Main Application
# ---------------------------

def main():
    # Create an initial system state with a user query.
    state = SystemState(query="What is the capital of France?")
    
    # Instantiate the tool.
    search_tool = WebSearchTool()
    
    # Create an agent that uses the search tool.
    agent = SimpleAgent(name="SearcherAgent", tool=search_tool)
    
    # Agent acts on the state.
    final_state = agent.act(state)
    
    # Print final system state.
    print("\nFinal System State:")
    print(json.dumps(final_state, indent=2))

if __name__ == "__main__":
    main()
```

---

### Explanation

1. **Logger and SystemState:**  
   - The `Logger` class is a simple logging helper that prints messages and dumps the execution history.
   - `SystemState` is a subclass of `dict` that holds various workflow data, including errors and an execution history list.

2. **Helper Function:**  
   - `camel_to_snake` converts a class name (in CamelCase) into snake_case, which standardizes tool naming.

3. **Base Tool Class (Tool):**  
   - This abstract class defines the common behavior for all tools. When a tool is called, it logs its start, executes its `_run` method (to be implemented by subclasses), catches errors, logs the end of execution, and updates the state with execution history.

4. **Concrete Tool (WebSearchTool):**  
   - Implements `_run` to simulate a web search by extracting a query from the state and setting a fake search result.
   - Implements `_get_updates` to provide additional updates (the search result) for logging.

5. **Base Agent Class (Agent):**  
   - An abstract class that requires a subclass to implement an `act` method.

6. **Concrete Agent (SimpleAgent):**  
   - Uses an instance of a tool to process the state. It logs its action, calls the tool (which updates the state), and then adds a note about the action taken.

7. **Main Application:**  
   - In the `main()` function, we initialize a system state with a sample query.
   - We instantiate the `WebSearchTool` and a `SimpleAgent` that uses this tool.
   - The agent processes the state, and the final state (including the simulated search result and execution history) is printed.

This complete code sample offers a basic project framework that combines agents and tools with logging, state updates, and error handling. It is inspired by the explanations provided above as well as concepts from the LangGraph tutorial on GetZep. You can use this as a starting point and extend it with real LLM integrations, additional tools, and more sophisticated state management as needed.