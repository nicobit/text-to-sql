import azure.functions as func 
from fastapi import FastAPI, Request, Response
from pydantic import BaseModel
from app.utils.nb_logger import NBLogger
from app.utils.cors_helper import CORSHelper
from dashboard.dashboard_service import DashboardService
from app.settings import  BLOB_STORAGE_CONNECTION_STRING_SECRET_NAME, KEY_VAULT_CORE_URI
from app.services.secret_service import SecretService
from app.context import get_current_user
import httpx
import time

logger = NBLogger().Log()
fast_app = FastAPI() 
CORSHelper.set_CORS(fast_app)
blob_connection_string = SecretService.get_secret_value(KEY_VAULT_CORE_URI, BLOB_STORAGE_CONNECTION_STRING_SECRET_NAME)
dashbboard_service = DashboardService(
    connection_string=blob_connection_string,
    table_name="dashboard"
)

@fast_app.get("/dashboard/") 
async def return_http_no_body(): 
    return Response(content="Dashboard is working", media_type="text/plain") 


class DashboardData(BaseModel):
    tabs: list

# Example input structure for the `save_dashboard_data` endpoint:
# {
#     "content": {
#         "key1": "value1",
#         "key2": "value2",
#         ...
#     }
# }


@fast_app.get("/dashboard/data")
async def get_dashboard_data(req: Request):
    try:
        user = await get_current_user(req)
        data = dashbboard_service.load_dashboard_data(user["oid"])
       
        return data
    except Exception as e:
        logger.error(f"Error fetching dashboard data: {e}")
        return Response(content="Error fetching dashboard data", status_code=500)


@fast_app.put("/dashboard/data")
async def save_dashboard_data(req:Request,dashboard_data: DashboardData):
    try:
        user = await get_current_user(req)
        if not dashboard_data.tabs or len(dashboard_data.tabs) == 0:
            return Response(content="No data provided", status_code=400)
        dashbboard_service.save_dashboard_data(user["oid"], dashboard_data.tabs)
        
        return Response(content="Dashboard data saved successfully", status_code=200)
    except Exception as e:
        logger.error(f"Error saving dashboard data: {e}")
        return Response(content="Error saving dashboard data", status_code=500)
    
@fast_app.get("/dashboard/rssproxy")
async def get_rss_azure_update(rssUrl: str):
    try:
        logger.info(f"Fetching RSS feed from: {rssUrl}")
        response = httpx.get(rssUrl)
        response.raise_for_status()
        return Response(content=response.text, media_type="application/rss+xml")
    except httpx.RequestError as e:
        logger.error(f"An error occurred while requesting the RSS feed: {e}")
        return Response(content="Error fetching RSS feed", status_code=500)
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        return Response(content="Unexpected error occurred", status_code=500)
    
STOCK_RESULTS = {}  # Dictionary to store results per URL
LAST_FETCH_TIMES = {}  # Dictionary to store fetch times per URL


@fast_app.get("/dashboard/proxy")
async def proxy_content(url: str):
    try:
        global STOCK_RESULTS, LAST_FETCH_TIMES
        logger.info(f"Proxying content from: {url}")
        
        current_time = time.time()

        # Check if the URL has been fetched recently
        if url not in STOCK_RESULTS or (current_time - LAST_FETCH_TIMES.get(url, 0) > 900):  # 900 seconds = 15 minutes
            logger.info(f"Calling the service: {url}")
            headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"}
            response = httpx.get(url, headers=headers)
            response.raise_for_status()
            STOCK_RESULTS[url] = response.content
            LAST_FETCH_TIMES[url] = current_time
        
        return Response(content=STOCK_RESULTS[url], media_type="application/octet-stream")
    except httpx.RequestError as e:
        logger.error(f"An error occurred while requesting the content: {e}")
        return Response(content="Error fetching content", status_code=500)
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        return Response(content="Unexpected error occurred", status_code=500)

   

async def main(req: func.HttpRequest, context: func.Context) -> func.HttpResponse:
    return await func.AsgiMiddleware(fast_app).handle_async(req, context)



