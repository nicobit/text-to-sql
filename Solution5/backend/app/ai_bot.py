
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
from app.nodes.fake_node import fake_node
from app.settings import DATABASE_NAME

from app.services.db_service import DBHelper


logger = NBLogger().Log()
# In-memory storage for conversation contexts (could use persistent storage for long-term memory)
user_sessions: Dict[str, "ConversationState"] = {}  

graph = StateGraph(ConversationState)
state = ConversationState()

VALIDATE_USER_QUESTION_NODE_STR = "Validate User Question"
REFINE_USER_QUESTION_NODE_STR = "Refine User Question"
EMBED_USER_QUESTION_NODE_STR = "Embed User Questions"
RETRIEVE_EXAMPLES_NODE_STR = "Retrieve Examples"
SELECT_RELEVANT_SCHEMA_NODE_STR = "Select Relevant Schemas"
GENERATE_SQL_NODE_STR = "Generate SQL"
EXECUTE_SQL_NODE_STR = "Execute SQL"
VALIDATE_RESULT_NODE_STR = "Validate Result"
GENERATE_FINAL_ANSWER_NODE_STR = "Generate Final Answer"

graph.add_node(VALIDATE_USER_QUESTION_NODE_STR, fake_node)
graph.add_node(REFINE_USER_QUESTION_NODE_STR, fake_node)
graph.add_node(EMBED_USER_QUESTION_NODE_STR, embed_user_question_node)
graph.add_node(RETRIEVE_EXAMPLES_NODE_STR, retrieve_examples_node )
graph.add_node(SELECT_RELEVANT_SCHEMA_NODE_STR, select_relevant_schema_node)
graph.add_node(GENERATE_SQL_NODE_STR, generate_sql_node)
graph.add_node(EXECUTE_SQL_NODE_STR, execute_sql_node)
graph.add_node(VALIDATE_RESULT_NODE_STR, fake_node)
graph.add_node(GENERATE_FINAL_ANSWER_NODE_STR, generate_final_answer_node)


def route_by_state(state: ConversationState) -> str:
    return state["result"]

# Edges
graph.add_conditional_edges(VALIDATE_USER_QUESTION_NODE_STR, lambda state: state["result"],
    {
        "not valid": END, 
        "continue": REFINE_USER_QUESTION_NODE_STR
    }
)
graph.add_edge(REFINE_USER_QUESTION_NODE_STR, EMBED_USER_QUESTION_NODE_STR)
graph.add_edge(EMBED_USER_QUESTION_NODE_STR, RETRIEVE_EXAMPLES_NODE_STR)
graph.add_edge(RETRIEVE_EXAMPLES_NODE_STR, SELECT_RELEVANT_SCHEMA_NODE_STR)
graph.add_edge(SELECT_RELEVANT_SCHEMA_NODE_STR, GENERATE_SQL_NODE_STR)
graph.add_edge(GENERATE_SQL_NODE_STR, EXECUTE_SQL_NODE_STR)
graph.add_edge(EXECUTE_SQL_NODE_STR, VALIDATE_RESULT_NODE_STR)
graph.add_conditional_edges(VALIDATE_RESULT_NODE_STR, lambda state: state["result"],
    {
        "retry": SELECT_RELEVANT_SCHEMA_NODE_STR, 
        "continue": GENERATE_FINAL_ANSWER_NODE_STR
    }
)
                        

graph.add_edge(GENERATE_FINAL_ANSWER_NODE_STR, END)

# Entry Point
graph.set_entry_point(VALIDATE_USER_QUESTION_NODE_STR)

compiled_graph = graph.compile()

#graph_png = compiled_graph.get_graph().draw_mermaid_png()
# graph_mermaid = compiled_graph.get_graph().draw_mermaid()
graph_png_bytes = compiled_graph.get_graph().draw_mermaid_png()

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
    
    databaseName = DBHelper.getDBName(database)
    if( not databaseName or databaseName == "default"):
        databaseName = DATABASE_NAME

    state["database"] = databaseName      
    state["history"].append(HumanMessage(content= myContent ))
    state["user_session"] = user_session
    state = compiled_graph.invoke(state)

    user_sessions[user_session] = state


    return {"answer":state["answer"],"sql_query": state["sql_query"], "response": state["query_result"], "chart_type": state["chart_type"]}
