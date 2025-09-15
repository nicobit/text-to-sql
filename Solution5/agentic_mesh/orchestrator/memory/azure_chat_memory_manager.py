import uuid
from typing import List
from azure.core.credentials import AzureKeyCredential
from azure.search.documents import SearchClient
from azure.search.documents.indexes import SearchIndexClient
from semantic_kernel.connectors.ai.open_ai import  AzureTextEmbedding
from azure.search.documents.indexes.models import (
    SearchIndex,
    SearchField,
    SearchFieldDataType,
    SimpleField,
    SearchableField,
    VectorSearch,
    VectorSearchAlgorithmConfiguration,
    VectorSearchProfile
    )
from azure.search.documents.models import VectorizedQuery
import logging
import os
import re


# Configure logging
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()
logging.basicConfig(level=LOG_LEVEL,
                    format="%(asctime)s [%(levelname)s] %(name)s - %(message)s")
logger = logging.getLogger("orchestrator")


class AzureChatMemoryManager:
    def __init__(self, endpoint: str, admin_key: str, index_name: str, text_embedding: AzureTextEmbedding, vector_dim: int = 1536 ):
        self.endpoint = endpoint
        self.admin_key = admin_key
        self.index_name = index_name
        self.vector_dim = vector_dim
        self.credential = AzureKeyCredential(admin_key)
        self.index_client = SearchIndexClient(endpoint=endpoint, credential=self.credential)
        self.search_client = SearchClient(endpoint=endpoint, index_name=index_name, credential=self.credential)
        self.text_embedding = text_embedding 
        self._ensure_index()

    def _ensure_index(self):
        if self.index_name not in self.index_client.list_index_names():
            # Define the vector search algorithm configuration
            vector_algorithm = VectorSearchAlgorithmConfiguration( name="my-vector-config")
            vector_algorithm.kind = "hnsw"
            # Define the vector search profile
            vector_profile = VectorSearchProfile(
                name="my-vector-profile",
                algorithm_configuration_name="my-vector-config"
            )

            # Define the vector search configuration
            vector_search = VectorSearch(
                algorithms=[vector_algorithm],
                profiles=[vector_profile]
            )

            # Define the index fields
            fields = [
                SimpleField(name="id", type=SearchFieldDataType.String, key=True),
                SearchableField(name="content", type=SearchFieldDataType.String),
                SearchableField(name="user_id", type=SearchFieldDataType.String),
                SearchableField(name="role", type=SearchFieldDataType.String),
                SearchField(
                    name="content_vector",
                    type=SearchFieldDataType.Collection(SearchFieldDataType.Single),
                    searchable=True,
                    vector_search_dimensions=1536,
                    vector_search_profile_name="my-vector-profile"
                ),
            ]

            # Create the index
            index = SearchIndex(
                name=self.index_name,
                fields=fields,
                vector_search=vector_search
            )

            # Create the index using the SearchIndexClient
            self.index_client.create_index(index)

    async def sanitize_key(self,key: str) -> str:
        """
        Replace all characters not allowed in Azure Search document keys
        with underscores (_), keeping letters, digits, underscores, dashes, and equal signs.
        """
        return re.sub(r"[^a-zA-Z0-9_\-=]", "_", key)

    async def index_message(self, user_id: str, content: str, role: str = "user", id = str(uuid.uuid4())):
        logger.info(f"Indexing message for user {user_id}: {content}")
        embedding = await self.text_embedding.generate_embeddings([content])
        embedding = embedding[0] if len(embedding) > 0 else []
        id = await self.sanitize_key(id)
        document = {
            "id": id,
            "content": content,
            "user_id": user_id,
            "content_vector": embedding.tolist(),  # Convert NumPy array to list
            "role": role
        }
        logger.debug(f"Document to be indexed: {document}")
        self.search_client.upload_documents(documents=[document])
        logger.info(f"Document indexed successfully.")

    async def search_messages(self, user_id: str, query:str, top_k: int = 5) -> List[str]:
        logger.info(f"Searching messages for user {user_id} with query: {query}")
        query_embedding = await self.text_embedding.generate_embeddings([query])
        query_embedding = query_embedding[0] if len(query_embedding) > 0 else []

        # Manually construct the vector query as a dict:
        vector_query = VectorizedQuery(
            vector=query_embedding.tolist(),  # Convert NumPy array to list
            k=top_k,
            fields="content_vector",
            filter=f"user_id eq '{user_id}'",  # Include database in the query filter
            order_by="@search.score desc"  # Order by relevance score to limit to the latest top_k
        )

        results = self.search_client.search(
            search_text=None,
            vector_queries=[vector_query],
            select=["content"]
        )
        retval = [{"content": result["content"]} for result in results][:top_k]
        return retval

