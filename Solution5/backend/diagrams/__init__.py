
import json
import azure.functions as func
from azure.mgmt.resource import ResourceManagementClient
from azure.core.credentials import TokenCredential
from azure.mgmt.network import NetworkManagementClient
from fastapi import FastAPI, Request, Response
from azure.core.credentials import AccessToken
from app.utils.nb_logger import NBLogger

from diagrams.tools.subscriptions import SubscriptionManager
from diagrams.tools.virtualnetwork_retriever import VirtualNetworkRetriever
from diagrams.tools.azure_services_retriever import AzureServicesRetriever

fast_app = FastAPI() 
logger = NBLogger().Log()

@fast_app.get("/diagrams/") 
async def return_http_no_body(): 
    return Response(content="Diagrams is working", media_type="text/plain") 


def getToken(req: Request):
    # Get the bearer token from the Authorization header
    auth_header = req.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return func.HttpResponse("Missing or invalid Authorization header", status_code=401)

    token = auth_header.split(" ", 1)[1].strip()
    return token

@fast_app.get("/diagrams/subscriptions")
async def getSubscriptions(req: Request):
        
    token = getToken(req)
  
    try:
        subscriptionManager = SubscriptionManager(token)
        result  = subscriptionManager.get_subscriptions()

        return Response(content=json.dumps({"nodes": result['nodes'], "edges": result['edges']}), status_code=200)

    except Exception as e:
        logger.error(f"Error retrieving subscriptions: {str(e)}")
        return Response(content="Unexpected error occurred", status_code=500)
    

@fast_app.get("/diagrams/virtual-networks-and-subnets")
async def getVirtualNetworksAndSubnets(req: Request, subscriptionId: str, include_subnets: bool = True):
    logger.warning("Received request to get Azure virtual networks and subnets")
    token = getToken(req)
   
    try:
        result  = VirtualNetworkRetriever(token, subscriptionId).get_virtual_networks_and_subnets(include_subnets=include_subnets)
        return Response(content=json.dumps({"nodes": result["nodes"], "edges": result["edges"]}), status_code=200)

    except Exception as e:
        logger.error(f"Error retrieving virtual networks and subnets: {str(e)}")
        return Response(content="Unexpected error occurred", status_code=500)

@fast_app.get("/diagrams/data")
async def getDiagram(req: Request, subscriptionId: str, resourceType: str = None): 
    logger.warning("Received request to get Azure resource architecture")

    token = getToken(req)

    try:
        result = AzureServicesRetriever(token, subscriptionId).get_diagram(resource_type=resourceType)
        return Response(content=json.dumps({"nodes": result["nodes"], "edges": result["edges"]}), status_code=200)

    except Exception as e:
        logger.error(f"Error retrieving resources: {str(e)}")
        return Response(content="Unexpected error occurred", status_code=500)
    

async def main(req: func.HttpRequest, context: func.Context) -> func.HttpResponse:
    return await func.AsgiMiddleware(fast_app).handle_async(req, context)
