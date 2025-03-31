
from langchain.schema import HumanMessage
from typing import Dict
from langgraph.graph import StateGraph, END

from app.utils.nb_logger import NBLogger
from app.data.conversation_state import ConversationState, initialize_conversation_state
from app.nodes.generate_sql_node import generate_sql_node
from app.nodes.execute_sql_node import execute_sql_node 
from app.nodes.generate_final_answer_node import generate_final_answer_node
from app.nodes.select_relevant_schema_node import select_relevant_schema_node
from app.nodes.embed_user_question_node import embed_user_question_node
from app.nodes.retrieve_examples_node import retrieve_examples_node

from app.services.db_service import DBHelper


logger = NBLogger().Log()
# In-memory storage for conversation contexts (could use persistent storage for long-term memory)
user_sessions: Dict[str, "ConversationState"] = {}  

graph = StateGraph(ConversationState)
state = ConversationState()

graph.add_node("embed_user_question", embed_user_question_node)
graph.add_node("retrieve_examples_node", retrieve_examples_node )
graph.add_node("select_relevant_schema_node", select_relevant_schema_node)
graph.add_node("generate_sql", generate_sql_node)
graph.add_node("execute_sql", execute_sql_node)
graph.add_node("generate_final_answer_node", generate_final_answer_node)

# Edges
graph.add_edge("embed_user_question", "retrieve_examples_node")
graph.add_edge("retrieve_examples_node", "select_relevant_schema_node")
graph.add_edge("select_relevant_schema_node", "generate_sql")
graph.add_edge("generate_sql", "execute_sql")
graph.add_edge("execute_sql", "generate_final_answer_node")
graph.add_edge("generate_final_answer_node", END)

# Entry Point
graph.set_entry_point("embed_user_question")

compiled_graph = graph.compile()


# Define the state for LangGraph
async def nl_to_sql(user_input: str, session_id: str, user_id: str, database: str = "default") -> Dict[str, str]:
    """
    Orchestrate the entire NL-to-SQL workflow:
      1. Embed the user question.
      2. Retrieve few-shot examples.
      3. Dynamically select relevant schema segments.
      4. Build the GPT prompt.
      5. Generate SQL using GPT-4.
      6. Execute SQL.
      7. Generate final natural language answer.
    Returns (generated SQL, final answer, Chart Type, SQL Query).
    """
    user_session = user_id + "-" + session_id

    if user_session not in user_sessions:
        user_sessions[user_session] = initialize_conversation_state()

    state = user_sessions[user_session]
    index = len(state["history"])
    myContent = f"{index + 1}. {user_input}"
    
    state["database"] = DBHelper.getDBName(database)
    state["history"].append(HumanMessage(content= myContent ))
    state["user_session"] = user_session
    state = compiled_graph.invoke(state)

    user_sessions[user_session] = state


    return {"answer":state["answer"],"sql_query": state["sql_query"], "response": state["query_result"], "chart_type": state["chart_type"]}
