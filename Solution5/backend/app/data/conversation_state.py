from typing import Dict
from typing_extensions import TypedDict, List
from langchain.schema import HumanMessage

class ConversationState(TypedDict):
    db_schema: str
    database:str
    user_session: str
    chart_type: str
    history: List[HumanMessage]
    sql_query: str
    question_embedding: list
    table_embedding: dict # Dict[str,Dict[str, Dict[str, str]]]  # database, trable , fields
    relevant_schema: str
    query_result: str
    examples: List
    answer:str
    result:str

def initialize_conversation_state() -> ConversationState:
    return {
        "history": [],
        "query_result": "",
        "sql_query": "",
        "chart_type": "",
        "db_schema": "",
        "database": "",
        "user_session": "",
        "table_embedding": {},
        "relevant_schema": "",
        "question_embedding": [],
        "examples":[],
        "answer": "",
        "result": ""

    }