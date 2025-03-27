from azure.search.documents import SearchClient
from azure.search.documents.indexes import SearchIndexClient
from azure.search.documents.indexes.models import SearchableField, SimpleField, SearchField, SearchFieldDataType
from azure.search.documents.indexes.models import VectorSearch, HnswAlgorithmConfiguration, VectorSearchProfile, SearchIndex
from azure.search.documents.models import VectorQuery
import pyodbc
from azure.core.credentials import AzureKeyCredential
import settings
from db_helper import DBHelper
from conversation_state import ConversationState


search_service = settings.SEARCH_SERVICE
search_api_key = settings.SEARCH_API_KEY
azure_search_endpoint = f"https://{search_service}.search.windows.net"
index_name = settings.INDEX_NAME
sql_conn_str = DBHelper().getConnectionString()


search_admin_cred = AzureKeyCredential(search_api_key)
index_client = SearchIndexClient(endpoint=azure_search_endpoint, credential=search_admin_cred)
search_client = SearchClient(endpoint=azure_search_endpoint, index_name=index_name, credential=search_admin_cred)


# Function to create Azure Cognitive Search index based on DB schema (if not exists)
def node_ensure_search_indexer(state: ConversationState) -> ConversationState:
    """
    Creates (or updates) an Azure Cognitive Search index based on the database schema and uploads data.
    """
    schema = state["schema"]
    # Check if index already exists
    try:
        index_client.get_index(name=settings.INDEX_NAME)
        index_exists = True
    except Exception:
        index_exists = False
    if not index_exists:
        # Define index fields (common fields for all tables)
        fields = [
            SimpleField(name="id", type=SearchFieldDataType.String, key=True),
            SimpleField(name="table", type=SearchFieldDataType.String, filterable=True),
            SearchableField(name="content", type=SearchFieldDataType.String),  # combined text content
            SearchField(name="embedding", type=SearchFieldDataType.Collection(SearchFieldDataType.Single),
                        searchable=True, vector_search_dimensions=128, vector_search_profile_name="myHnswProfile")
        ]
        # Define vector search parameters (HNSW algorithm)
        vector_search = VectorSearch(
            algorithms=[HnswAlgorithmConfiguration(name="myHnsw")],
            profiles=[VectorSearchProfile(name="myHnswProfile", algorithm_configuration_name="myHnsw")]
        )
        index = SearchIndex(name=index_name, fields=fields, vector_search=vector_search)
        index_client.create_index(index)
        print(f"Created Azure Search index: {index_name}")

    # Upload documents to the index (for simplicity, we reupload each time if already exists)
    docs = []
    try:
        conn = pyodbc.connect(sql_conn_str)
        cursor = conn.cursor()
        for table_info in schema:
            table = table_info["table"]
            # Fetch up to 100 rows from each table to index (to avoid massive data uploads in this demo)
            rows = cursor.execute(f"SELECT * FROM [{table}]").fetchmany(100)
            columns = [col[0] for col in cursor.description]  # column names for this table
            for row in rows:
                doc = {
                    "id": f"{table}-{row[0]}-{len(docs)}",  # unique id composed of table and first column value (assuming first column is a primary key or unique)
                    "table": table,
                    # Combine all column names and values into a single content string
                    "content": " ; ".join(f"{col}: {val}" for col, val in zip(columns, row)),
                    # Generate a mock embedding vector (128-dim random values) for the content
                    "embedding": [float(hash(f"{table}{row}{i}") % 1000)/1000.0 for i in range(128)]
                }
                docs.append(doc)
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Error fetching data for index: {e}")

    if docs:
        # Upload documents in batches to Azure Search
        for i in range(0, len(docs), 1000):
            batch = docs[i:i+1000]
            results = search_client.upload_documents(documents=batch)
            # Check for failures in upload
            if any([not r.succeeded for r in results]):
                print("Warning: Some documents failed to index.")
        print(f"Uploaded {len(docs)} documents to Azure Cognitive Search index.")