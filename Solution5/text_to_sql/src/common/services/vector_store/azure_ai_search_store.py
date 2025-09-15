from text_to_sql.core.services.vector_store import VectorStoreBase
from azure.search.documents import SearchClient

class AzureAISearchStore(VectorStoreBase):
    def __init__(self, endpoint: str, api_key: str, index_name: str):
        self.client = SearchClient(endpoint, index_name, api_key)

    def upsert(self, ids, vectors, metadata=None):
        docs = [
            {"id": i, "vector": v, **(m or {})}
            for i, v, m in zip(ids, vectors, metadata or [{}]*len(ids))
        ]
        self.client.merge_or_upload_documents(docs)

    def query(self, vector, k=5):
        r = self.client.search(
            search_text=None,
            vectors=[{"value": vector, "k": k, "fields": "vector"}]
        )
        return [(d["id"], d["@search.score"], d) for d in r]
