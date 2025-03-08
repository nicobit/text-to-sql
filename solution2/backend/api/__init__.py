from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
import openai  # Azure OpenAI SDK (or use openai package configured for Azure)
from . import auth, db, ai_bot  # import submodules for auth, database, AI logic

app = FastAPI(title="Text-to-SQL API")

# Enable CORS for frontend domain (adjust origins for production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow all for now, restrict in prod to specific origin
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True
)

# Azure OpenAI configuration (using environment variables for keys and endpoint)
openai.api_type = "azure"
openai.api_base = os.getenv("AZURE_OPENAI_ENDPOINT")  # e.g. "https://<resource>.openai.azure.com/"
openai.api_key = os.getenv("AZURE_OPENAI_KEY")
openai.api_version = "2023-05-15"  # or the appropriate API version for chat completions

# Dependency for authentication: validate Bearer token from MSAL (Azure AD)
async def get_current_user(token: str = Depends(auth.oauth2_scheme)):
    """
    Validate JWT access token from Authorization header and return user principal.
    """
    claims = auth.verify_jwt(token)        # verify signature and audience
    if not claims:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return claims["preferred_username"]    # or return entire claims/object as needed

# Pydantic model for request
from pydantic import BaseModel
class QueryRequest(BaseModel):
    question: str

class QueryResponse(BaseModel):
    columns: list[str]
    rows: list[list]        # 2D array of result rows
    chartSuggestions: list[str]

@app.post("/query", response_model=QueryResponse)
async def query_database(request: QueryRequest, user=Depends(get_current_user)):
    """
    Handle a natural language query, convert to SQL, execute it, and return results.
    """
    user_question = request.question

    # 1. Use LangGraph/LLM to convert NL question + context to SQL query
    try:
        sql_query, suggested_chart = await ai_bot.nl_to_sql(user_question, user_id=user)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI parsing failed: {e}")

    # 2. Execute the SQL query against Azure SQL DB
    try:
        columns, rows = db.run_query(sql_query)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database query failed: {e}")

    # 3. Return results and chart suggestion(s)
    return {"columns": columns, "rows": rows, "chartSuggestions": suggested_chart}