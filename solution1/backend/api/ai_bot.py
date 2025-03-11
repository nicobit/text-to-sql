
from openai import AzureOpenAI
from langchain.schema import HumanMessage
import os
from typing import Dict
from typing_extensions import TypedDict, List
import json
from langgraph.graph import StateGraph, END
import logging
from schema_cache import get_cached_schema
from db_connector import execute_sql_query



#from langchain.chat_models import AzureChatOpenAI  # hypothetical usage via LangChain
# (Alternatively, use openai.ChatCompletion directly as configured above)
# ... import or define any prompt templates as needed ...
# from schema_cache import get_cached_schema
# from db_connector import execute_sql_query
# from openai import AzureOpenAI
# from langchain.schema import SystemMessage, HumanMessage
# import os
# from typing import Dict
# from langgraph.graph import StateGraph, END
# import logging
# from typing import Annotated
# from typing_extensions import TypedDict, List
# from langgraph.graph.message import add_messages
# import json


OPENAI_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT")
OPEN_AI_KEY = os.getenv("AZURE_OPENAI_KEY")
OPENAI_DEPLOYMENT = os.getenv("AZURE_OPENAI_DEPLOYMENT")
CONNECTION_STRING = os.getenv("DB_CONNECTION")
# In-memory storage for conversation contexts (could use persistent storage for long-term memory)
user_sessions: Dict[str, "ConversationState"] = {}  


class ConversationState(TypedDict):
    history: List[HumanMessage]
    schema_sent: bool
    query_result: str
    sql_query: str
    chart_type: str
    schema: str
    user_session: str

def initialize_conversation_state() -> ConversationState:
    return {
        "history": [],
        "schema_sent": False,
        "query_result": "",
        "sql_query": "",
        "chart_type": "",
        "schema": ""
    }
    
# LangGraph nodes
def generate_sql(state: ConversationState) -> ConversationState:
    """
    Generate SQL from natural language query.
    """
    query = state["history"][-1].content
    schema_message = state["schema"]

    # Retrieve schema only if not sent before
    if not state["schema_sent"]:
        schema = get_cached_schema(CONNECTION_STRING)
        schema_message = f"{json.dumps(schema, indent=2)}"
        state["schema"] = schema_message
        state["schema_sent"] = True

    user_questions = "\n".join([message.content for message in state["history"]])

    logging.info(f"User questions:{user_questions}")
    prompt = f"""
        You are an expert SQL assistant. Below is the schema of an Azure SQL Database:
        {schema_message}

        Convert the following user questions into SQL queries. Only return the SQL query for the  question '{len(state["history"])}'. Ignore all previous queries and generate only the SQL query for the most recent question. Do not return any explanations or queries for previous questions. Ensure the SQL syntax is correct for Microsoft SQL Server database and relevant to the given context, don't include 'Limit" statement. Also suggest an ideal chart type (e.g., bar, line, pie) for visualizing the result, don't give any explanation and add after ChartType: .
        User Questions: "{user_questions}"
        SQL Query:
        """

    model = AzureOpenAI(
        api_key=OPEN_AI_KEY,
        azure_endpoint=OPENAI_ENDPOINT,
        api_version="2025-01-01-preview",
    )
    response = model.chat.completions.create(
        model="gpt-35-turbo",
        messages=[
            {
                "role": "system",
                "content": "You are an expert SQL generator."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        max_tokens=150,
        temperature=0.8,  # Deterministic output
    )
    answer = response.choices[0].message.content.strip()
    parsedAnswer = ParseResult(answer)
    
    sql_query = parsedAnswer["sql"]
    chart_type = parsedAnswer["chart"]
    
    state["sql_query"] = sql_query
    state["chart_type"] = chart_type

    return state

def ParseResult(answer):
    answer = answer.lower().replace("ideal chart", "chart")
    answer = answer.lower().replace("chart Type:","chartType:")
    if "charttype:" in answer:
        sql_part, chart_part = answer.split("charttype:")
        sql_query = sql_part.strip()
        sql_query = sql_query.replace("```", "").strip()
        
        chart_type = chart_part.strip()
    else:
        sql_query = answer
        chart_type = None

    logging.info(f"Queries:{sql_query}")
    sql_query = sql_query.replace("```sql", "").strip()
    sql_query = sql_query.replace("sql", "").strip()
    sql_query = sql_query.replace("sql\nSELECT", "SELECT").strip()
    sql_query = sql_query.replace("```", "").strip()
    temp = sql_query.split(";\n\n")
    if len(temp) > 1:
        sql_query = temp[-1].strip()
    
        
    return {"sql": sql_query, "chart": chart_type}


def execute_sql(state: ConversationState) -> ConversationState:
    """
    Execute SQL query and return results.
    """
    sss = state["sql_query"]
    
    try:
        result = execute_sql_query(state["sql_query"], CONNECTION_STRING)
    except Exception as e:
        result = f"Error executing SQL: {str(e)}"
    
    state["query_result"] = result
    return state



graph = StateGraph(ConversationState)

state = ConversationState()

graph.add_node("generate_sql", generate_sql)
graph.add_node("execute_sql", execute_sql)

# Edges
graph.add_edge("generate_sql", "execute_sql")
graph.add_edge("execute_sql", END)

# Entry Point
graph.set_entry_point("generate_sql")

compiled_graph = graph.compile()


# Define the state for LangGraph

async def nl_to_sql(user_input: str, session_id: str, user_id: str):


    user_session = user_id + "-" + session_id
    logging.info(f"Request for user_session:{user_session}")
    if user_session not in user_sessions:
        user_sessions[user_session] = initialize_conversation_state()

    state = user_sessions[user_session]
    index = len(state["history"])
    myContent = f"{index + 1}. {user_input}"
    
    state["history"].append(HumanMessage(content= myContent ))
    state["user_session"] = user_session
    state = compiled_graph.invoke(state)

    return {"query": state["sql_query"], "response": state["query_result"], "chart_type": state["chart_type"]}


    try:
        if session_id not in user_sessions:
            user_session = user_id + "-" + session_id
            user_sessions[user_session] = initialize_conversation_state()

        state = user_sessions[user_session]
        state["history"].append(HumanMessage(content=user_input))
        state = compiled_graph.invoke(state)

        return {"query": state["sql_query"], "response": state["query_result"], "chart_type": state["chart_type"]}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
