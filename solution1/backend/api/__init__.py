import os
import json
import logging
import azure.functions as func
import openai
from fastapi import FastAPI, Depends, HTTPException
from fastapi import Request
from starlette.middleware.cors import CORSMiddleware
from langchain.schema import SystemMessage, HumanMessage
from typing import Dict
from pydantic import BaseModel
import uuid
from . import auth, ai_bot  # import submodules for auth, database, AI logic


# Configure Logging
logging.basicConfig(level=logging.INFO)

# Initialize FastAPI App
app = FastAPI()

# Enable CORS (Allow only frontend domain)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://mywebsite.com", "http://localhost:3000", "http://localhost:5173"],  # Replace with your front-end URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "Azure Text-to-SQL Backend is Running"}


async def get_current_user(token: str = Depends(auth.oauth2_scheme)):
    """
    Validate JWT access token from Authorization header and return user principal.
    """
    logging.info(f"TOKEN: {token}")
    claims = auth.verify_jwt(token.credentials)  # verify signature and audience
    if not claims:
        raise HTTPException(status_code=401, detail="Unauthorized")
    logging.info(f"CLAIMS: {json.dumps(claims)}")
    return claims #{"user_id": claims["oid"], "username": claims["email"]}  # or return entire claims/object as needed



# Pydantic model for request
class QueryRequest(BaseModel):
    query: str
    session_id: str 

class QueryResponse(BaseModel):
    chart_type: str
    results: list
    #columns: list[str]
    #rows: list[list]        # 2D array of result rows
    #chartSuggestions: list[str]
   


# API Endpoints

@app.post("/query", response_model=QueryResponse)
async def nl_to_sql(request: QueryRequest, user=Depends(get_current_user)):
    """
    Handle a natural language query, convert to SQL, execute it, and return results.
    """
    try:
        
        result = await ai_bot.nl_to_sql(request.query, request.session_id, user["oid"])

        logging.info(f"RESULT: {result}")

        if result["chart_type"] == None:
            result["chart_type"] = "None"

        return {"results": result["response"],"chart_type":result["chart_type"]}
        

    except Exception as e:
        logging.info(f"nl_to_sql exception: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


        
