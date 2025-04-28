import openai
from azure.core.credentials import AzureKeyCredential
from azure.search.documents import SearchClient, IndexDocumentsBatch
from azure.search.documents.indexes import SearchIndexClient
from azure.search.documents.indexes.models import (
    SearchIndex, SimpleField, VectorSearch, VectorSearchAlgorithmConfiguration
)
from agentic_mesh.config import SEARCH_SERVICE, SEARCH_KEY, SEARCH_INDEX, TOP_K_MEMORY

# Ensure index exists
idx_client = SearchIndexClient(
    endpoint=f"https://{SEARCH_SERVICE}.search.windows.net",
    credential=AzureKeyCredential(SEARCH_KEY)
)
try:
    idx_client.get_index(SEARCH_INDEX)
except:
    fields = [
        SimpleField(name="id", type="Edm.String", key=True),
        SimpleField(name="text", type="Edm.String", searchable=True),
    ]
    vs = VectorSearch(algorithm_configurations=[
        VectorSearchAlgorithmConfiguration(name="hnsw", kind="hnsw")
    ])
    idx = SearchIndex(name=SEARCH_INDEX, fields=fields, vector_search=vs)
    idx_client.create_index(idx)

class MemoryStore:
    def __init__(self):
        self.client = SearchClient(
            endpoint=f"https://{SEARCH_SERVICE}.search.windows.net",
            index_name=SEARCH_INDEX,
            credential=AzureKeyCredential(SEARCH_KEY)
        )

    def retrieve(self, query):
        emb = openai.Embedding.create(model="text-embedding-ada-002", input=query)["data"][0]["embedding"]
        results = self.client.search(
            vector={"value": emb, "fields": "vector", "k": TOP_K_MEMORY}
        )
        return [r["text"] for r in results]

    def save(self, text, doc_id):
        emb = openai.Embedding.create(model="text-embedding-ada-002", input=text)["data"][0]["embedding"]
        batch = IndexDocumentsBatch(actions=[{
            "action": "mergeOrUpload",
            "document": {"id": doc_id, "text": text, "vector": emb}
        }])
        self.client.index_documents(batch)