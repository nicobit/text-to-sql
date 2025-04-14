import azure.functions as func 
from fastapi import FastAPI, Request, Response
from pydantic import BaseModel
from app.ai_bot import nl_to_sql,  graph_png_bytes
from app.utils.nb_logger import NBLogger
from app.context import get_current_user
from app.utils.cors_helper import CORSHelper
from app.services.db_service import DBHelper
from app.services.search_service import SearchService
from app.utils.connection_string_parser import ConnectionStringParser


logger = NBLogger().Log()
fast_app = FastAPI() 
CORSHelper.set_CORS(fast_app)

@fast_app.get("/") 
async def return_http_no_body(): 
    
     
    connection_string = "Driver={ODBC Driver 17 for SQL Server};Server=tcp:your_server.database.windows.net,1433;Database=your_database;Uid=your_username;Pwd=your_password;Encrypt=yes;TrustServerCertificate=no;Connection Timeout=30;"
    retval = ConnectionStringParser.setConnectionStringWithDatabase(connection_string, "new_database")
    if "new_database" in retval:
        print("Database updated successfully.")
    return Response(content="Text to SQL Is working v.1.3", media_type="text/plain") 

# Pydantic model for request
class QueryRequest(BaseModel):
    query: str
    session_id: str
    database: str = "default"

class QueryResponse(BaseModel):
    chart_type: str
    results: list



@fast_app.post("/query")
async def query(req: Request, body:  QueryRequest):
   
    user = await get_current_user(req)
    query = body.query 
    session_id = body.session_id 
    database = body.database

    connection_string = DBHelper.getConnectionString("")
    logger.info(f"Connection string: {connection_string}")
                                        

    logger.info(f"query called with the following paramenters:query={query};session_id={session_id}")
    result = await nl_to_sql(query, session_id, user["oid"],database)
    if result["chart_type"] == None:
        result["chart_type"] = "None"

    return {"results": result["response"],
            "chart_type":result["chart_type"],
            "answer":result["answer"],
            "sql_query":result["sql_query"],
            "execution_history": result["execution_history"],
            "mermaid": result["mermaid"]}    



#class ChatRequest(BaseModel):
#    question: str
#    session_id: str = "default"
#    database_name:str = ""
#    limit: int = 10
#    num_candidates: int = 3

#@fast_app.post("/chat")
#async def chat(req: Request, body:  ChatRequest):
#    return await myChat(body)

@fast_app.get("/graph.png")
async def get_graph_image():
    # Generate the image as PNG bytes using Mermaid rendering
    #return graph_mermaid
    png_bytes = graph_png_bytes
    return Response(content=png_bytes, media_type="image/png")


@fast_app.get("/databases")
async def get_databases():
    try:
        databases = DBHelper.getDatabases()
        return {"databases": databases}
    except Exception as e:
        logger.error(f"Error retrieving databases: {str(e)}")
        return Response(content="Failed to retrieve databases", status_code=500)

class ExampleRequest(BaseModel):
    question: str
    sql: str
    database: str = "default"

@fast_app.post("/add_example")
async def add_example(body: ExampleRequest):
    try:
        question = body.question
        sql = body.sql
        database = body.database

        logger.info(f"Adding example with question: {question} and SQL: {sql}")
        # Assuming there's a method to save examples in DBHelper
        SearchService.add_example(database,question,sql)
        return {"message": "Example added successfully"}
    except Exception as e:
        logger.error(f"Error adding example: {str(e)}")
        return Response(content="Failed to add example", status_code=500)

@fast_app.get("/examples")
async def list_examples(database: str = "default"):
    try:
        logger.info(f"Listing examples for database: {database}")
        examples = SearchService.get_examples(database)
        return {"examples": examples}
    except Exception as e:
        logger.error(f"Error listing examples: {str(e)}")
        return Response(content="Failed to list examples", status_code=500)


@fast_app.delete("/delete_example")
async def delete_example(doc_id: str, database: str = "default"):
    try:
        logger.info(f"Deleting example with question: {doc_id} from database: {database}")
        # Assuming there's a method to delete examples in SearchService
        SearchService.delete_example(database, doc_id)
        return {"message": "Example deleted successfully"}
    except Exception as e:
        logger.error(f"Error deleting example: {str(e)}")
        return Response(content="Failed to delete example", status_code=500)

class ExampleRequest(BaseModel):
    doc_id:str
    question: str
    sql: str
    database: str = "default"

@fast_app.put("/update_example")
async def update_example( body: ExampleRequest):
    try:
        question = body.question
        sql = body.sql
        database = body.database
        doc_id = body.doc_id

        logger.info(f"Updating example with ID: {doc_id}, question: {question}, and SQL: {sql}")
        # Assuming there's a method to update examples in SearchService
        SearchService.update_example(database, doc_id, question, sql)
        return {"message": "Example updated successfully"}
    except Exception as e:
        logger.error(f"Error updating example: {str(e)}")
        return Response(content="Failed to update example", status_code=500)

app = func.AsgiFunctionApp(app=fast_app, 
                           http_auth_level=func.AuthLevel.ANONYMOUS) 


async def main(req: func.HttpRequest, context: func.Context) -> func.HttpResponse:
    return await func.AsgiMiddleware(fast_app).handle_async(req, context)

