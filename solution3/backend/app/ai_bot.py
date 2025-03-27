
## Python Library
from openai import AzureOpenAI
from langchain.schema import HumanMessage
import os
from typing import Dict
from typing_extensions import TypedDict, List
import json
from langgraph.graph import StateGraph, END
from solution3.backend.app.schema_cache import get_cached_schema
from solution3.backend.app.db_helper import execute_sql_query
from fuzzywuzzy import fuzz
import azure.functions as func 

# Import from app
import settings
from solution3.backend.app.nb_logger import NBLogger
import azure_sarch_indexer

from conversation_state import ConversationState, initialize_conversation_state
from retrieve_db_schema import retrieve_db_schema



logger = NBLogger().Log()

# In-memory storage for conversation contexts (could use persistent storage for long-term memory)
user_sessions: Dict[str, "ConversationState"] = {}  


def determine_relevant_tables(state: ConversationState) -> ConversationState:

    query = state["query"]  
    schema = state["schema"]
    matched_tables = {}

    for table, columns in schema.items():
        # Match query against the table name and column names
        table_score = fuzz.partial_ratio(query.lower(), table.lower())
        column_scores = [fuzz.partial_ratio(query.lower(), column.lower()) for column in columns]
        
        # Store the highest column score for each table
        max_column_score = max(column_scores) if column_scores else 0
        
        # Calculate overall relevance score (you can tune this logic)
        overall_score = (table_score + max_column_score) / 2
        
        if overall_score > 60:  # Only consider tables with a relevant score above a threshold
            matched_tables[table] = overall_score
    state["matched_tales"] = matched_tables
    return state
   
    
# LangGraph nodes
def generate_sql(state: ConversationState) -> ConversationState:
    """
    Generate SQL from natural language query.
    """
    query = state["history"][-1].content
    schema_message = state["schema"]
    schema = get_cached_schema()
    relevant_tables = state["relevant_tables"]
    schema_message = f"{json.dumps(schema, indent=2)}"
    state["schema"] =  relevant_tables # fuzzySchema # schema_message

    # Retrieve schema only if not sent before
    #if not state["schema_sent"]:
    #    schema = get_cached_schema()
    #    schema_message = f"{json.dumps(schema, indent=2)}"
    #    state["schema"] = schema_message
    #    state["schema_sent"] = True

    user_questions = "\n".join([message.content for message in state["history"]])

    
    prompt = f"""
        You are an expert SQL assistant. Below is the schema of an Azure SQL Database:
        {schema_message}

        Convert the following user questions into SQL queries. Only return the SQL query for the  question '{len(state["history"])}'. Ignore all previous queries and generate only the SQL query for the most recent question. Do not return any explanations or queries for previous questions. Ensure the SQL syntax is correct for Microsoft SQL Server database and relevant to the given context, don't include 'Limit" statement. Also suggest an ideal chart type (e.g., bar, line, pie) for visualizing the result, don't give any explanation and add after ChartType: .
        User Questions: "{user_questions}"
        SQL Query:
        """
    logger.info(f"Calling OpenAI with the following prompt:{prompt}")
    model = AzureOpenAI(
        api_key = settings.OPEN_AI_KEY,
        azure_endpoint = settings.OPENAI_ENDPOINT,
        api_version="2025-01-01-preview",
    )
    response = model.chat.completions.create(
        model= settings.OPENAI_DEPLOYMENT,
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
    try:
        result = execute_sql_query(state["sql_query"])
    except Exception as e:
        result = f"Error executing SQL: {str(e)}"
    
    state["query_result"] = result
    return state


def ensure_search_index(state: ConversationState) -> ConversationState:
    """
    2. Ensure Azure Search index is ready (schema and data indexed)
    """ 
    azure_sarch_indexer.ensure_search_index(state["schema"])


graph = StateGraph(ConversationState)
state = ConversationState()

graph.add_node("retrieve",ensure_search_index)
graph.add_node("ensure_search_index",ensure_search_index)
graph.add_node("determine_relevant_tables",determine_relevant_tables)
graph.add_node("generate_sql", generate_sql)
graph.add_node("execute_sql", execute_sql)

# Edges
graph.add_edge("ensure_search_index","determine_relevant_tables")
graph.add_edge("determine_relevant_tables","generate_sql")
graph.add_edge("generate_sql", "execute_sql")
graph.add_edge("execute_sql", END)

# Entry Point
graph.set_entry_point("generate_sql")

compiled_graph = graph.compile()


# Define the state for LangGraph
async def nl_to_sql(user_input: str, session_id: str, user_id: str):
    try:
        # 1. Retrieve user sessions and initialize if it does not exist
        user_session = user_id + "-" + session_id

        if user_session not in user_sessions:
            user_sessions[user_session] = initialize_conversation_state()

        # 2. Fill State
        state = user_sessions[user_session]
        index = len(state["history"])
        myContent = f"{index + 1}. {user_input}"
        
        state["history"].append(HumanMessage(content= myContent ))
        state["user_session"] = user_session

        # 3. Invoke Compiled Graph
        state = compiled_graph.invoke(state)

        return {"query": state["sql_query"], "response": state["query_result"], "chart_type": state["chart_type"]}
    
    except Exception as e:
        return func.HttpResponse(f"nl_to_sql failed: {e}", status_code=500)

