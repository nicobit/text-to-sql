# function_app.py
from azure.functions import AsgiFunctionApp, AuthLevel
from function_llm_proxy.app.fastapi_app import create_fastapi_app

fastapi_app = create_fastapi_app()
# Expose the FastAPI app as an Azure Functions HTTP trigger
app = AsgiFunctionApp(app=fastapi_app, http_auth_level=AuthLevel.ANONYMOUS)
