from typing import Dict
from typing_extensions import TypedDict, List
from langchain.schema import HumanMessage

class ConversationState(TypedDict):
    history: List[HumanMessage]
    schema_sent: bool
    query_result: str
    sql_query: str
    chart_type: str
    schema: str
    user_session: str
    matched_schema: Dict[str, str]

def initialize_conversation_state() -> ConversationState:
    return {
        "history": [],
        "schema_sent": False,
        "query_result": "",
        "sql_query": "",
        "chart_type": "",
        "schema": "",
        "user_session": "",
        "matched_schema": {}
    }