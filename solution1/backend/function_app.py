import os
import json
import logging
import azure.functions as func
import openai
from fastapi import FastAPI, Depends, HTTPException
from fastapi import Request
from starlette.middleware.cors import CORSMiddleware
from langgraph_agent import LangGraphAgent
from db_connector import execute_sql_query
from schema_cache import get_cached_schema
from pydantic import BaseModel


# Configure Logging
logging.basicConfig(level=logging.INFO)

# Load environment variables
OPENAI_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT")
OPENAI_API_KEY = os.getenv("AZURE_OPENAI_KEY")
OPENAI_DEPLOYMENT = os.getenv("AZURE_OPENAI_DEPLOYMENT")
DB_CONNECTION_STRING = os.getenv("DB_CONNECTION")

# Initialize FastAPI App
app = FastAPI()

# Enable CORS (Allow only frontend domain)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://mywebsite.com", "http://localhost:3000"],  # Replace with your front-end URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize AI Agent
agent = LangGraphAgent(OPENAI_ENDPOINT, OPENAI_API_KEY, OPENAI_DEPLOYMENT)
schema_cache = get_cached_schema(DB_CONNECTION_STRING)  # Load schema once

@app.get("/")
def root():
    return {"message": "Azure Text-to-SQL Backend is Running"}

class QueryRequest(BaseModel):
    user_query: str
    ##user: str = "anonymous"

@app.post("/query")
async def query_database(req: Request):
    """Converts natural language to SQL and executes the query."""
    logging.info(f"API CALLED")
    try:
       # if(req.method == "OPTIONS"):
        #    return func.HttpResponse(
         #       status_code=200,
          #      headers = {
           #       "Access-Control-Allow-Origin": "http://localhost:3000",
            #      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",     
             #    "Access-Control-Allow-Headers": "Content-Type, Authorization",
              #   "Access-Control-Allow-Credentials": "true"
               # }
            #)
        data = await req.json()
        user_query = data.get("query")
        user = data.get("user", "anonymous")

        logging.info(f"User {user} asked: {user_query}")
        
        # Generate SQL query using AI agent
        generated_sql = await agent.generate_sql(user_query, schema_cache)
        logging.info(f"Generated SQL : {generated_sql}")
        # Execute the SQL query
        results = execute_sql_query(generated_sql, DB_CONNECTION_STRING)
        logging.info(f"results : {results}")
        return {"sql": generated_sql, "results": results}
       
    except Exception as e:
        logging.error(f"Error processing query: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

# Azure Functions ASGI integration
fastapi_app = func.AsgiFunctionApp(app=app, http_auth_level=func.AuthLevel.ANONYMOUS)
