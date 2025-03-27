import os, json
import azure.functions as func
from azure.search.documents import SearchClient
from azure.search.documents.indexes import SearchIndexClient
from azure.search.documents.indexes.models import SearchableField, SimpleField, SearchField, SearchFieldDataType
from azure.search.documents.indexes.models import VectorSearch, HnswAlgorithmConfiguration, VectorSearchProfile, SearchIndex
from azure.search.documents.models import VectorQuery
from azure.core.credentials import AzureKeyCredential
import pyodbc
import openai

# Global initialization (executed on cold start)
# Set up Azure Cognitive Search clients and database connection details
search_service = os.environ.get("AzureSearchServiceName")
search_api_key = os.environ.get("AzureSearchApiKey")
index_name = os.environ.get("AzureSearchIndexName", "nl2sql-index")
azure_search_endpoint = f"https://{search_service}.search.windows.net"
search_admin_cred = AzureKeyCredential(search_api_key)
index_client = SearchIndexClient(endpoint=azure_search_endpoint, credential=search_admin_cred)
search_client = SearchClient(endpoint=azure_search_endpoint, index_name=index_name, credential=search_admin_cred)

# Azure SQL connection string from env. (Ensure firewall allows Azure Function access)
sql_conn_str = os.environ.get("AzureSQLConnectionString")

# Global cache for database schema (to avoid repeated retrieval)
db_schema_cache = None

# Function to retrieve database schema (table and column info) from Azure SQL
def get_db_schema():
    """Connects to Azure SQL and retrieves table and column schema information."""
    global db_schema_cache
    if db_schema_cache:
        return db_schema_cache
    schema_info = []
    try:
        conn = pyodbc.connect(sql_conn_str)
        cursor = conn.cursor()
        # Get all user tables
        tables = cursor.execute(
            "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE='BASE TABLE'"
        ).fetchall()
        tables = [row[0] for row in tables]
        for table in tables:
            # Get columns for each table
            cols = cursor.execute(
                f"SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='{table}'"
            ).fetchall()
            col_names = [c[0] for c in cols]
            schema_info.append({"table": table, "columns": col_names})
        cursor.close()
        conn.close()
    except Exception as e:
        # Log error (in real scenario, use logging)
        print(f"Error retrieving schema: {e}")
    # Cache the schema list
    db_schema_cache = schema_info
    return schema_info

# Function to create Azure Cognitive Search index based on DB schema (if not exists)
def ensure_search_index(schema):
    """Creates (or updates) an Azure Cognitive Search index based on the database schema and uploads data."""
    # Check if index already exists
    try:
        index_client.get_index(name=index_name)
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

# Synonyms list for expansion (simple example; in real scenario, use a comprehensive list or Azure Search synonym maps)
SYNONYMS = {
    "cheap": ["inexpensive", "budget"],
    "customers": ["clients", "buyers"]  # example: synonyms for table names or common terms
}

def expand_query_with_synonyms(query: str) -> str:
    """Expands the query with synonyms for broader search matching."""
    words = query.split()
    expanded = []
    for w in words:
        expanded.append(w)
        if w.lower() in SYNONYMS:
            # add synonyms words for any recognized term (no duplicates)
            for syn in SYNONYMS[w.lower()]:
                if syn not in expanded:
                    expanded.append(syn)
    return " ".join(expanded)

# Main function entry point for Azure Function
def main(req: func.HttpRequest) -> func.HttpResponse:
    # 1. Parse input (from query string or JSON body)
    query_text = None
    try:
        # GET request with query in 'q' parameter or POST with JSON body
        if req.method == "GET":
            query_text = req.params.get('q')
        else:
            req_body = req.get_json() 
            query_text = req_body.get('question') or req_body.get('query')
    except Exception:
        query_text = None

    if not query_text:
        return func.HttpResponse(
            "Please pass a query in the request (either 'q' parameter or JSON body).",
            status_code=400
        )
    query_text = query_text.strip()
    print(f"Received query: {query_text}")

    # 2. Ensure Azure Search index is ready (schema and data indexed)
    schema = get_db_schema()
    if not schema:
        return func.HttpResponse("Failed to retrieve database schema.", status_code=500)
    ensure_search_index(schema)  # create/populate index if needed

    # 3. Pipeline Stage: Index Planning - determine relevant table (index) for the query
    target_table = None
    for tbl in schema:
        name = tbl["table"]
        if name.lower() in query_text.lower():
            target_table = name
            break
    # (If no table name is mentioned, we could use Azure Search to infer it or default to a primary table.)

    # 4. Pipeline Stage: Semantic Enhancement - (Optional) refine query phrasing (not implemented in detail here)
    enhanced_query = query_text  # In a full implementation, you might use an LLM to rephrase or clarify the query.

    # 5. Pipeline Stage: Synonym Expansion - expand query with synonyms for better search recall
    expanded_query = expand_query_with_synonyms(enhanced_query)
    if expanded_query != enhanced_query:
        print(f"Expanded query with synonyms: {expanded_query}")

    # 6. Pipeline Stage: Vector Enrichment - generate embedding for the query (mocked)
    # Here we create a mock vector (128-dim) for the query. In a real scenario, you'd call an embedding model.
    query_vector = [float(hash(word) % 1000)/1000.0 for word in expanded_query.split()]
    # Ensure vector length matches index vector dimension (pad or trim)
    if len(query_vector) < 128:
        query_vector += [0.0] * (128 - len(query_vector))
    query_vector = query_vector[:128]

    # 7. Pipeline Stage: Metadata Enrichment - e.g., use target table as filter if identified
    filter_expr = None
    if target_table:
        filter_expr = f"table eq '{target_table}'"
        print(f"Applying filter to search for table: {target_table}")

    # 8. Pipeline Stage: Custom Scoring - (Not used here) could adjust search parameters or scoring profile.

    # 9. Pipeline Stage: Filter/Facet Simulation - (Not fully implemented) 
    # For example, if the query included "in 2021", we might later parse it to filter results or group by year.
    # In this demo, we skip additional filter parsing beyond table name.

    # Perform Azure Cognitive Search query (hybrid search: keyword + vector)
    try:
        vector_query = VectorQuery(vector=query_vector, k=5, fields="embedding")
        # Use search() to perform hybrid search: search_text uses expanded keywords, vector_queries uses embedding, filter by table if set.
        search_results = search_client.search(search_text=expanded_query, vector_queries=[vector_query],
                                             filter=filter_expr, top=5)
        # (We won't necessarily use the search results directly for the final answer, but this demonstrates the query.)
        results_list = list(search_results)
        if results_list:
            top_result = results_list[0]
            print(f"Top search result content: {top_result.get('content')[:100]}... (table: {top_result.get('table')})")
    except Exception as e:
        print(f"Search query failed: {e}")

    # 10. Use OpenAI GPT-3.5 to generate SQL from the natural language query and schema
    openai.api_key = os.environ.get("OpenAIKey")
    # Prepare the prompt with schema information to guide GPT
    schema_description = "\\n".join(
        [f"Table {tbl['table']} columns: {', '.join(tbl['columns'])}" for tbl in schema]
    )
    system_prompt = (
        "You are an assistant that converts natural language to SQL.\n"
        f"Database schema:\n{schema_description}\n"
        "When given a question, respond with a SQL query (T-SQL) that answers it, nothing else."
    )
    user_prompt = query_text
    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "system", "content": system_prompt},
                      {"role": "user", "content": user_prompt}]
        )
        sql_query = response['choices'][0]['message']['content'].strip()
    except Exception as e:
        return func.HttpResponse(f"Failed to generate SQL: {e}", status_code=500)

    print(f"Generated SQL: {sql_query}")

    # 11. Execute the SQL query against Azure SQL Database
    try:
        conn = pyodbc.connect(sql_conn_str)
        cursor = conn.cursor()
        cursor.execute(sql_query)
        columns = [desc[0] for desc in cursor.description] if cursor.description else []
        rows = cursor.fetchall()
        cursor.close()
        conn.close()
    except Exception as e:
        return func.HttpResponse(f"SQL execution failed: {e}", status_code=500)

    # 12. Format the results as JSON
    result_data = []
    for row in rows:
        # Convert row tuple to dict using column names
        row_dict = {col: val for col, val in zip(columns, row)}
        result_data.append(row_dict)

    # Return the JSON results (with an HTTP 200 status)
    return func.HttpResponse(
        json.dumps({"question": query_text, "sql": sql_query, "results": result_data}, default=str),
        mimetype="application/json",
        status_code=200
    )