# function_app.py

import azure.functions as func 
from function_llm_proxy.appl.fastapi_app import create_fastapi_app

app = create_fastapi_app()
# Expose the FastAPI app as an Azure Functions HTTP trigger
# app = AsgiFunctionApp(app=fastapi_app, http_auth_level=AuthLevel.ANONYMOUS)

async def main(req: func.HttpRequest, context: func.Context) -> func.HttpResponse:
    return await func.AsgiMiddleware(app).handle_async(req, context)
