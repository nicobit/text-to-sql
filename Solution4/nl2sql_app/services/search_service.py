import os
from azure.search.documents import SearchClient
from azure.search.documents.models import Vector
from azure.core.credentials import AzureKeyCredential
from config import AZURE_SEARCH_ENDPOINT, AZURE_SEARCH_API_KEY, AZURE_SEARCH_INDEX_NAME

# Initialize Azure Cognitive Search client
search_client = SearchClient(
    endpoint=AZURE_SEARCH_ENDPOINT,
    index_name=AZURE_SEARCH_INDEX_NAME,
    credential=AzureKeyCredential(AZURE_SEARCH_API_KEY)
)

def find_relevant_examples(question_embedding: list, top_k: int = 3) -> list:
    """
    Query Azure Cognitive Search with the question embedding to retrieve
    the top_k few-shot examples.
    """
    vector_query = Vector(
        value=question_embedding,
        k_nearest_neighbors_count=top_k,
        fields="question_vector"
    )
    results = search_client.search(search_text=None, vector_queries=[vector_query], select=["question", "sql"])
    examples = []
    for result in results:
        examples.append({
            "question": result["question"],
            "sql": result["sql"]
        })
    return examples