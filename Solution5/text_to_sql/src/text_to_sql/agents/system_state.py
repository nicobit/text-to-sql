from typing import TypeVar, TypedDict


# Define a TypedDict to represent the system state
class SystemState(TypedDict):
    # A list to store the execution history of tasks
    execution_history: list = []
    # A list to store the chat history
    chat_history: list = []
    # A dictionary to store errors encountered during execution
    errors: dict = {}
    # The name of the currently executing tool
    executing_tool: str = ""
    # The current task being executed
    task: str = ""
    # The timestamp when the task was executed
    executed_at: str = ""
    # The time taken to execute the task (in seconds)
    execution_time: float = 0.0
    # A flag to indicate whether to proceed with execution
    proceed: bool = True

# Define a generic type variable for SystemState
T = TypeVar("SystemState")