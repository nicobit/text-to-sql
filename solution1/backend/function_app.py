

import azure.functions as func 
from fastapi import FastAPI, Request, Response 
from fastapi import FastAPI, Request, Response,Depends,HTTPException
from starlette.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from auth import verify_jwt
from ai_bot import nl_to_sql
import os



# Fetch CORS allowed origins from environment variable
CORS_ALLOWED_ORIGINS = os.getenv("CORSAllowedOrigins", "http://localhost:3000,http://localhost:5173,http://example.com")

# Split the string into a list of allowed origins
allowed_origins = CORS_ALLOWED_ORIGINS.split(',')


# Initialize FastAPI App
fast_app = FastAPI() 


# Enable CORS (Allow only frontend domain)
fast_app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,  # Replace with your front-end URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



@fast_app.get("/") 
async def return_http_no_body(): 
    return Response(content="Text to SQL Is working", media_type="text/plain") 




async def get_current_user(request: func.HttpRequest):
    """
    Validate JWT access token from Authorization header and return user principal.
    """
    token = request.headers.get("Authorization")
    if token is None or not token.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")

    token = token[len("Bearer "):]

    
    claims =  verify_jwt(token)  # verify signature and audience
    if not claims:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    return claims  # or return entire claims/object as needed

# Pydantic model for request
class QueryRequest(BaseModel):
    query: str
    session_id: str 

class QueryResponse(BaseModel):
    chart_type: str
    results: list
    

@fast_app.post("/query")
async def query(req: Request, body:  QueryRequest):
   
    user = get_current_user(req)
   
    #body = req.get_json()
    query = body.query # body.get('query')
    session_id = body.session_id # body.get('session_id')

  
    result = await nl_to_sql(query, session_id, user["oid"])
    if result["chart_type"] == None:
        result["chart_type"] = "None"

    return {"results": result["response"],"chart_type":result["chart_type"]}


app = func.AsgiFunctionApp(app=fast_app, 
                           http_auth_level=func.AuthLevel.ANONYMOUS) 

async def main(req: func.HttpRequest, context: func.Context) -> func.HttpResponse:
       return await func.AsgiMiddleware(app).handle_async(req, context)


#-----------------------------------------------------------

#import azure.functions as func 
#from fastapi import FastAPI, Request, Response 


#fast_app = FastAPI() 

#@fast_app.get("/return_http_no_body") 
#async def return_http_no_body(): 
#    return Response(content="Hello", media_type="text/plain") 

#app = func.AsgiFunctionApp(app=fast_app, 
#                           http_auth_level=func.AuthLevel.ANONYMOUS) 

#async def main(req: func.HttpRequest, context: func.Context) -> func.HttpResponse:
#    return await func.AsgiMiddleware(app).handle_async(req, context)

#-----------------------------------------------------------