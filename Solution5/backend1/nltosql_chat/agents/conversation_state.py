from typing_extensions import TypedDict, List
from langchain.schema import HumanMessage


class Message:
    role:str
    content:str 

class ConversationState(TypedDict):
    session_id: str
    messages : List[Message]
    user_session: str
    command: str
    question: str
    limit: int
    database_name:str
    output:str

class ConversationStateHelper:

    @staticmethod
    def add_message(state: ConversationState, message: Message) -> ConversationState:
        """Add a message to the conversation state."""
        state["messages"].append(message) 
        return state  
    
    @staticmethod
    def add_assistant_message(state, message: str) -> ConversationState:
        state["messages"].append({"role": "assistant", "content": message})
        return state

    @staticmethod
    def add_user_message(state:ConversationState, message: str) -> ConversationState:
        state["messages"].append({"role": "user", "content": message})
        return state

    def add_system_message(state:ConversationState, message: str) -> ConversationState:
        state["messages"].append({"role": "system", "content": message})
        return state
    
    

def initialize_conversation_state() -> ConversationState:
    return {
        "session_id": "default",
        "messages": [],
        "command" : "",
        "user_question": "",
        "question": "",
        "limit": 10,
        "output":""

    }