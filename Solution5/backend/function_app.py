import azure.functions as func 
from fastapi import FastAPI, Request, Response
from pydantic import BaseModel
from app.ai_bot import nl_to_sql
from app.utils.nb_logger import NBLogger
from app.context import get_current_user
from app.utils.cors_helper import CORSHelper


logger = NBLogger().Log()
fast_app = FastAPI() 
CORSHelper.set_CORS(fast_app)

@fast_app.get("/") 
async def return_http_no_body(): 
    return Response(content="Text to SQL Is working v.1.3", media_type="text/plain") 

# Pydantic model for request
class QueryRequest(BaseModel):
    query: str
    session_id: str 

class QueryResponse(BaseModel):
    chart_type: str
    results: list
    
@fast_app.post("/query")
async def query(req: Request, body:  QueryRequest):
   
    user = await get_current_user(req)
    query = body.query 
    session_id = body.session_id 

    logger.info(f"query called with the following paramenters:query={query};session_id={session_id}")
    result = await nl_to_sql(query, session_id, user["oid"])
    if result["chart_type"] == None:
        result["chart_type"] = "None"

    return {"results": result["response"],"chart_type":result["chart_type"],"answer":result["answer"],"sql_query":result["sql_query"]}


app = func.AsgiFunctionApp(app=fast_app, 
                           http_auth_level=func.AuthLevel.ANONYMOUS) 

async def main(req: func.HttpRequest, context: func.Context) -> func.HttpResponse:
       return await func.AsgiMiddleware(app).handle_async(req, context)

