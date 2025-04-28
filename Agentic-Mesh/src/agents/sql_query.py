from azure.cosmos import CosmosClient
import uvicorn
from .base import BaseAgent
from agentic_mesh.registry import register_agent
from agentic_mesh.config import COSMOS_ENDPOINT, COSMOS_KEY, COSMOS_DB

@register_agent
class SQLQueryAgent(BaseAgent):
    name = "SQLQuery"
    description = "Query Cosmos DB SQL API"
    schema = {
      "type":"object",
      "properties":{"query":{"type":"string"}},
      "required":["query"]
    }

    def __init__(self):
        self.client = CosmosClient(COSMOS_ENDPOINT, COSMOS_KEY)
        self.container = self.client.get_database_client(COSMOS_DB).get_container_client("Data")

    def execute(self, query: str) -> dict:
        items = list(self.container.query_items(query, enable_cross_partition_query=True))
        return {"items": items}

if __name__ == "__main__":
    uvicorn.run(SQLQueryAgent().serve(), host="0.0.0.0", port=8080)