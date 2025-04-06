# main.py
import os, openai
from fastapi import FastAPI
from pydantic import BaseModel
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver

from app.utils.nb_logger import NBLogger    

# Import agent node functions
from nltosql_chat.agents.selector_agent import select_action
from nltosql_chat.agents.schema_reader import get_schema
from nltosql_chat.agents.schema_linker import link_schema
from nltosql_chat.agents.sql_generator import generate_sql
from nltosql_chat.agents.sql_refiner import refine_candidates
from nltosql_chat.agents.candidate_selector import select_best_candidate
from nltosql_chat.agents.sql_executor import execute_sql
from nltosql_chat.agents.analyzer_agent import analyze_response
from nltosql_chat.agents.chat_agent import generate_chat_response
from nltosql_chat.agents.question_sanitizer import sanitize_question

from nltosql_chat.agents.conversation_state import ConversationState, ConversationStateHelper,initialize_conversation_state

# Initialize Azure OpenAI configuration
openai.api_type = "azure"
openai.api_base = os.getenv("AZURE_OPENAI_ENDPOINT")
openai.api_version = os.getenv("AZURE_OPENAI_API_VERSION")
openai.api_key = os.getenv("AZURE_OPENAI_API_KEY")

logger = NBLogger().Log()

app = FastAPI(title="NL2SQL Chat Agent", version="1.0")

# Define the LangGraph state machine and add agent nodes.
graph = StateGraph(ConversationState)
graph.add_node("sanitizer", sanitize_question)
graph.add_node("selector", select_action)
graph.add_conditional_edges("selector", lambda state: state["command"], {
    "DB_STRUCTURE": "schema_reader",
    "CONTINUE": "schema_reader",
    "OTHER": "chat_fallback"})
graph.add_node("schema_reader", get_schema)
graph.add_node("schema_linker", link_schema)
graph.add_node("sql_generator", generate_sql)
graph.add_node("sql_refiner", refine_candidates)
graph.add_node("candidate_selector", select_best_candidate)
graph.add_node("sql_executor", execute_sql)
graph.add_node("analyzer", analyze_response)
graph.add_node("chat_fallback", generate_chat_response)

# Define workflow edges.
graph.add_edge(START, "sanitizer")
graph.add_edge("sanitizer", "selector")
# The selector returns a Command that sends non–SQL requests to "chat_fallback".
graph.add_edge("schema_reader", "schema_linker")
graph.add_edge("schema_linker", "sql_generator")
graph.add_edge("sql_generator", "sql_refiner")
graph.add_edge("sql_refiner", "candidate_selector")
graph.add_edge("candidate_selector", "sql_executor")
graph.add_edge("sql_executor", "analyzer")
graph.add_edge("chat_fallback", END)
graph.add_edge("analyzer", END)

# MemorySaver to maintain multi-turn conversation state per session.
memory = MemorySaver()
agent_app = graph.compile(checkpointer=memory)

class ChatRequest(BaseModel):
    question: str
    session_id: str = "default"
    database_name:str = ""
    limit: int = 10
    num_candidates: int = 3

class ChatResponse(BaseModel):
    answer: str

#@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Chat endpoint that processes multi-turn queries.
    The LangGraph agent is invoked with the new question, row limit, and candidate count.
    """

    logger.info(f"Chat called with the following parameters: question={request.question}; session_id={request.session_id}; limit={request.limit}; num_candidates={request.num_candidates}")
    user_question = request.question
    
    input_state = initialize_conversation_state()

    input_state = ConversationStateHelper.add_message(input_state,[{"role": "user", "content": user_question}])
    input_state["user_question"] = user_question
    input_state["limit"] = request.limit
    
    input_state["session_id"] = request.session_id

    input_state["num_candidates"] = request.num_candidates
    input_state["database_name"] = request.database_name

    output_state = agent_app.invoke(input_state, config={"configurable": {"thread_id": request.session_id}})
    messages = output_state.get("messages", [])
    answer_text = ""
    for msg in reversed(messages):
        if msg.get("role") == "assistant":
            answer_text += msg.get("content", "")
            break
    return {"answer": answer_text}

@app.get("/chat", response_model=ChatResponse)
async def chat_get(question: str, session_id: str = "default", limit: int = 10, num_candidates: int = 3):
    req = ChatRequest(question=question, session_id=session_id, limit=limit, num_candidates=num_candidates)
    return await chat(req)
