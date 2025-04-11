
from langchain.schema import HumanMessage
from typing import Dict
from langgraph.graph import StateGraph, END

from app.utils.nb_logger import NBLogger
from app.agents.conversation_state import ConversationState #, initialize_conversation_state

from app.agents.execute_sql_node import execute_sql_node 
from app.agents.answer_generator.answer_generator_agent import answer_generator_agent
from app.agents.schema_selector.schema_selector_agent import schema_selector_agent
from app.agents.candidate_generator.candidate_generator_agent import CandidateGeneratorAgent
from app.agents.chat.chat_agent import ChatAgent

from app.agents.information_retriever.information_retriever_agent import information_retriever_agent
from app.agents.fake_node import fake_node
from app.settings import DATABASE_NAME


from app.services.db_service import DBHelper


logger = NBLogger().Log()
# In-memory storage for conversation contexts (could use persistent storage for long-term memory)
user_sessions: Dict[str, "ConversationState"] = {}  

graph = StateGraph(ConversationState)

CHAT_AGENT = "Chat Agent"
VALIDATE_USER_QUESTION_NODE_STR = "Validate User Question"

INFORMATION_RETREIVER_AGENT = "Information Retriever Agent"
SCHEMA_SELECTOR_AGENT_STR = "Schema Selector Agent"
GENERATE_SQL_NODE_STR = "Generate SQL"
EXECUTE_SQL_NODE_STR = "Execute SQL"
VALIDATE_RESULT_NODE_STR = "Validate Result"
GENERATE_FINAL_ANSWER_NODE_STR = "Generate Final Answer"
CANDIDATE_GENERATOR_AGENT_STR = "Candidate Generator Agent"


graph.add_node(CHAT_AGENT, ChatAgent() )
graph.add_node(CANDIDATE_GENERATOR_AGENT_STR, CandidateGeneratorAgent())
graph.add_node(SCHEMA_SELECTOR_AGENT_STR, schema_selector_agent)
graph.add_node(INFORMATION_RETREIVER_AGENT, information_retriever_agent )
graph.add_node(EXECUTE_SQL_NODE_STR, execute_sql_node)
graph.add_node(VALIDATE_RESULT_NODE_STR, fake_node)
graph.add_node(GENERATE_FINAL_ANSWER_NODE_STR, answer_generator_agent)


def route_by_state(state: ConversationState) -> str:
    return state["result"]

# Edges
# -------------------------------------------
graph.add_conditional_edges(CHAT_AGENT, lambda state: state["command"],
    {
        "BUSINESS": INFORMATION_RETREIVER_AGENT, 
        "IT-ENGINEER": END,
        "OTHER":END,
        "CLARIFY":END
    }
)
graph.add_edge(INFORMATION_RETREIVER_AGENT, SCHEMA_SELECTOR_AGENT_STR)
graph.add_conditional_edges(SCHEMA_SELECTOR_AGENT_STR, lambda state: state["command"],
    {
        "NO-SCHEMA": END, 
        "CONTINUE": CANDIDATE_GENERATOR_AGENT_STR,
       
    }
)
graph.add_conditional_edges(CANDIDATE_GENERATOR_AGENT_STR, lambda state: state["command"],
    {
        "NO-QUERY": END, 
        "CONTINUE": EXECUTE_SQL_NODE_STR,
    }
)
graph.add_edge(EXECUTE_SQL_NODE_STR, VALIDATE_RESULT_NODE_STR)
graph.add_conditional_edges(VALIDATE_RESULT_NODE_STR, lambda state: state["result"],
    {
        "retry": SCHEMA_SELECTOR_AGENT_STR, 
        "continue": GENERATE_FINAL_ANSWER_NODE_STR
    }
)                    
graph.add_edge(GENERATE_FINAL_ANSWER_NODE_STR, END)

# Entry Point
# -------------------------------------------
graph.set_entry_point(CHAT_AGENT)
compiled_graph = graph.compile()
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
        user_sessions[user_session] = ConversationState.initialize()

    state = user_sessions[user_session]
    index = len(state["history"])
    myContent = f"{index + 1}. {user_input}"
    state["question"] = user_input
    
    databaseName = DBHelper.getDBName(database)
    if( not databaseName or databaseName == "default"):
        databaseName = DATABASE_NAME

    state["database"] = databaseName      
    state["history"].append(HumanMessage(content= myContent ))
    state["user_session"] = user_session
    state = compiled_graph.invoke(state)

    user_sessions[user_session] = state
    retval = {"answer":state["answer"],"sql_query": state["sql_query"], "response": state["query_result"], "chart_type": state["chart_type"]}
    logger.warning(f"Final answer: {str(retval)}")
    return retval
