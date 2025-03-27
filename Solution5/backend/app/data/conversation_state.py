from typing import Dict
from typing_extensions import TypedDict, List
from langchain.schema import HumanMessage

class ConversationState(TypedDict):
    schema: str
    user_session: str
    chart_type: str
    history: List[HumanMessage]
    sql_query: str
    query_embedding: list
    table_embedding: Dict[str, Dict[str, str]]
    relevant_schema: str
    query_result: str
    answer:str

def initialize_conversation_state() -> ConversationState:
    return {
        "history": [],
        "query_result": "",
        "sql_query": "",
        "chart_type": "",
        "schema": "",
        "user_session": "",
        "table_embedding": {},
        "relevant_schema": "",
        "query_embedding": [],
        "answer": ""

    }