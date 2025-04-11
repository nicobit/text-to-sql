Below is an example that builds on the previous code by adding a second agent to generate an SQL query. In addition, a LangGraph representation is created—with nodes and edges—to visually trace the workflow steps. In this example, the InformationRetrieverAgent gathers external data using two tools (one simulating an Azure Search sample and one for a database schema), and then the SQLQueryGeneratorAgent uses that information to generate an SQL query. (Both agents use a language model via the LangGraph library.) You can later substitute the simulated calls with real API queries as needed.

```python
import json
import re
import time
from abc import ABC, abstractmethod
import langgraph  # LangGraph library for language model chains and graph utilities.
import app.services.openai_service as chat  # Your OpenAI service wrapper
from app.agents.conversation_state import ConversationState
from app.utils.nb_logger import NBLogger

# ---------------------------------------------------------------------
# Base Classes (Agent and BaseTool)
# ---------------------------------------------------------------------
class Agent(ABC):
    """
    Base Agent class for langgraph-based workflows.
    An Agent processes a system state by interacting with a language model and external tools.
    """
    def __init__(self, name: str, task: str, config: dict):
        self.name = name
        self.task = task
        self.config = config
        self.tools = config.get("tools", {})  # tools provided in the config
        self.chat_history = []  # List of message dictionaries (role and content)
        self.register_tools()
    
    @abstractmethod
    def register_tools(self):
        """
        Subclasses should add tool instances to self.tools.
        """
        pass
    
    def add_message(self, role: str, content: str):
        self.chat_history.append({"role": role, "content": content})
    
    def get_tools_description(self) -> str:
        description = ""
        for idx, tool in enumerate(self.tools.values(), start=1):
            description += f"{idx}. {tool.tool_name}\n"
        return description.strip()
    
    def build_prompt(self) -> str:
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
        messages = ""
        for msg in self.chat_history:
            messages += f"<{msg['role']}>\n{msg['content']}\n</{msg['role']}>\n"
        messages += "<agent>\n"
        llm_chain = langgraph.get_llm_chain(
            engine=self.config.get("engine", "default"),
            temperature=0
        )
        response = llm_chain.call(messages=messages)
        return response.strip()
    
    def is_done(self, response: str) -> bool:
        return "DONE" in response
    
    def extract_tool_call(self, response: str) -> str:
        start_tag = "<tool_call>"
        end_tag = "</tool_call>"
        if start_tag in response and end_tag in response:
            start = response.index(start_tag) + len(start_tag)
            end = response.index(end_tag)
            return response[start:end].strip()
        else:
            raise ValueError("No tool call found in the response.")
    
    def call_tool(self, tool_name: str, system_state: dict) -> str:
        if tool_name not in self.tools:
            raise ValueError(f"Tool '{tool_name}' not found.")
        tool = self.tools[tool_name]
        try:
            result = tool.execute(system_state)
            return f"Tool {tool.tool_name} executed successfully. Result: {result}"
        except Exception as e:
            raise Exception(f"Error in tool {tool.tool_name}: {e}")
    
    def workout(self, system_state: dict) -> dict:
        # Add initial system prompt.
        system_prompt = self.build_prompt()
        self.add_message("system", system_prompt)
        
        for _ in range(10):  # Limit iterations to avoid infinite loops.
            try:
                response = self.call_agent(system_state)
                self.add_message("agent", response)
                print(f"Agent {self.name} response: {response}")
                
                if self.is_done(response):
                    break
                
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
        return self.workout(system_state)

class BaseTool(ABC):
    """
    Base Tool class for langgraph-based workflows.
    A Tool processes a conversation or system state, performs an action, and logs its execution.
    """
    def __init__(self):
        self.tool_name = self._camel_to_snake(self.__class__.__name__)
    
    def __call__(self, state: ConversationState) -> ConversationState:
        return self.run_tool(state)
    
    def run_tool(self, state: ConversationState) -> ConversationState:
        logger = NBLogger().Log()
        logger.log(f"---START: {self.tool_name}---")
        start_time = time.time()
        state.executing_tool = self.tool_name
        
        try:
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
        run_log = {"tool_name": self.tool_name}
        if status["status"] == "success":
            run_log.update(self.get_run_updates(state))
        run_log.update(status)
        state.execution_history.append(run_log)
        NBLogger().Log().log(json.dumps(state.execution_history, indent=2))
    
    @abstractmethod
    def run(self, state: ConversationState) -> None:
        """
        The core functionality of the tool.
        """
        pass
    
    @abstractmethod
    def get_run_updates(self, state: ConversationState) -> dict:
        """
        Return additional information about the tool's execution.
        """
        pass
    
    def _camel_to_snake(self, name: str) -> str:
        s1 = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', name)
        s2 = re.sub('([a-z0-9])([A-Z])', r'\1_\2', s1)
        return s2.lower()

# ---------------------------------------------------------------------
# Concrete Tool Implementations
# ---------------------------------------------------------------------
class AzureSearchTool(BaseTool):
    """
    Simulates retrieving a sample from Azure Search.
    """
    def run(self, state: ConversationState) -> None:
        query = state.get("query", "default query")
        sample = f"Azure Search sample result for query: '{query}'"
        state["azure_search_sample"] = sample
    
    def get_run_updates(self, state: ConversationState) -> dict:
        return {"azure_search_sample": state.get("azure_search_sample", "")}

class DatabaseSchemaTool(BaseTool):
    """
    Simulates retrieving a database schema.
    """
    def run(self, state: ConversationState) -> None:
        schema = {
            "tables": {
                "users": ["id", "name", "email"],
                "orders": ["order_id", "user_id", "amount"]
            }
        }
        state["database_schema"] = schema
    
    def get_run_updates(self, state: ConversationState) -> dict:
        return {"database_schema": state.get("database_schema", {})}

# ---------------------------------------------------------------------
# Concrete Information Retriever Agent
# ---------------------------------------------------------------------
class InformationRetrieverAgent(Agent):
    """
    Retrieves external data using Azure Search and a database schema tool.
    """
    def register_tools(self):
        self.tools["azure_search"] = AzureSearchTool()
        self.tools["database_schema"] = DatabaseSchemaTool()

# ---------------------------------------------------------------------
# Second Agent: SQL Query Generator Agent
# ---------------------------------------------------------------------
class SQLQueryGeneratorAgent(Agent):
    """
    Uses available system state (e.g., database schema and search sample)
    to generate an SQL query via the language model.
    """
    def register_tools(self):
        # This agent uses the language model directly; no additional tools registered.
        pass
    
    def call_agent(self, system_state: dict) -> str:
        # Build extra context from the system state.
        context = ""
        if "database_schema" in system_state:
            context += f"Database Schema: {json.dumps(system_state['database_schema'], indent=2)}\n"
        if "azure_search_sample" in system_state:
            context += f"Search Sample: {system_state['azure_search_sample']}\n"
        # Build the prompt including the context and the SQL generation request.
        full_prompt = f"{self.build_prompt()}\n{context}\nGenerate an SQL query that extracts relevant data."
        self.add_message("system", full_prompt)
        response = super().call_agent(system_state)
        # Assume the language model returns the SQL query directly.
        system_state["sql_query"] = response
        return response

# ---------------------------------------------------------------------
# LangGraph Representation Class
# ---------------------------------------------------------------------
class LangGraphRepresentation:
    def __init__(self):
        self.nodes = {}
        self.edges = []
        self.reasoning = {}
    
    def add_node(self, node_id: str, node_type: str, data: dict):
        self.nodes[node_id] = {"type": node_type, "data": data}
    
    def add_edge(self, from_node: str, to_node: str, relation: str):
        self.edges.append({"from": from_node, "to": to_node, "relation": relation})
    
    def add_reasoning(self, key: str, explanation: str):
        self.reasoning[key] = explanation
    
    def to_json(self):
        return json.dumps({
            "nodes": self.nodes,
            "edges": self.edges,
            "reasoning": self.reasoning
        }, indent=2)

# ---------------------------------------------------------------------
# Example Usage
# ---------------------------------------------------------------------
if __name__ == "__main__":
    # Simulate an initial conversation state.
    state = ConversationState({
        "query": "Show me sample data and the schema for the sales database.",
        "execution_history": [],
        "errors": {},
        "task": "Retrieve Information",
        "executing_tool": None
    })
    
    # Configuration shared by both agents.
    config = {
        "engine": "gpt-4",  # Example language model engine.
        "prompt_template": (
            "Agent: {agent_name}\n"
            "Task: {task}\n"
            "Available Tools:\n{tools_desc}"
        )
    }
    
    # Run the Information Retriever Agent.
    info_agent = InformationRetrieverAgent(name="InfoRetriever", task="Retrieve Data", config=config)
    state = info_agent(state)
    
    # Run the SQL Query Generator Agent.
    sql_agent = SQLQueryGeneratorAgent(name="SQLQueryGen", task="Generate SQL Query", config=config)
    state = sql_agent(state)
    
    # Create a LangGraph representation of the workflow.
    graph = LangGraphRepresentation()
    graph.add_node("initial_query", "SystemState", {"query": state.get("query")})
    graph.add_node("azure_search", "AzureSearchTool", {"sample": state.get("azure_search_sample")})
    graph.add_node("db_schema", "DatabaseSchemaTool", {"schema": state.get("database_schema")})
    graph.add_node("sql_query", "SQLQuery", {"query": state.get("sql_query")})
    graph.add_node("info_agent", "Agent", {"name": info_agent.name, "action": "Retrieved external data"})
    graph.add_node("sql_agent", "Agent", {"name": sql_agent.name, "action": "Generated SQL query"})
    
    graph.add_edge("initial_query", "azure_search", "used for search sample")
    graph.add_edge("initial_query", "db_schema", "used for schema retrieval")
    graph.add_edge("azure_search", "info_agent", "data provided")
    graph.add_edge("db_schema", "info_agent", "data provided")
    graph.add_edge("info_agent", "sql_agent", "passed external data")
    graph.add_edge("sql_agent", "sql_query", "generated query")
    
    graph.add_reasoning("info_agent_reasoning", "Retrieves external information using Azure Search and Database Schema tools.")
    graph.add_reasoning("sql_agent_reasoning", "Generates an SQL query based on the retrieved information.")
    
    # Print final conversation state.
    print("\nFinal Conversation State:")
    print(json.dumps(state, indent=2))
    
    # Print LangGraph representation.
    print("\nLangGraph Representation:")
    print(graph.to_json())
```

---

### Explanation

1. **InformationRetrieverAgent & Tools:**  
   - The **InformationRetrieverAgent** registers two tools: **AzureSearchTool** and **DatabaseSchemaTool**. Each tool simulates retrieving external data (an Azure Search sample and a database schema, respectively) and updates the system state.

2. **SQLQueryGeneratorAgent:**  
   - This second agent builds a prompt that includes both the retrieved database schema and the search sample. It then uses the language model (via LangGraph) to generate an SQL query. The resulting SQL query is stored in the system state.

3. **LangGraph Representation:**  
   - A simple **LangGraphRepresentation** class is defined to create nodes and edges, along with reasoning explanations. After both agents run, nodes are added for the initial query, tools’ outputs, and each agent’s action. Edges illustrate the flow from the initial query through the data retrieval steps and finally to the SQL query generation.

This complete sample provides a framework that integrates multiple agents, external tools, and a visual representation of the workflow using LangGraph.