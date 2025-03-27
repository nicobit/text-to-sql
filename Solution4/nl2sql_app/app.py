from fastapi import FastAPI
from pydantic import BaseModel
from services import nl2sql_service

app = FastAPI(title="Dynamic NL-to-SQL System")

class QueryRequest(BaseModel):
    question: str

class QueryResponse(BaseModel):
    answer: str
    sql: str

@app.post("/query", response_model=QueryResponse)
def query_endpoint(request: QueryRequest):
    sql_query, answer = nl2sql_service.handle_question(request.question)
    return QueryResponse(answer=answer, sql=sql_query)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)