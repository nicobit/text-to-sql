# Azure Functions Natural Language to SQL Project
This repository contains an Azure Functions project (Python) that implements a natural-language-to-SQL API. The function accepts a natural language query, uses OpenAI GPT-3.5 to translate it into an SQL query, executes that SQL on an Azure SQL Database, and returns the results as JSON. It also dynamically integrates Azure Cognitive Search: the function retrieves the database schema, builds and populates a search index from the database content, and uses a pipeline of transformations (inspired by a LangGraph design) to enrich queries with semantic context, vector embeddings, metadata, custom scoring logic, filter/facet handling, and synonym expansion. All external services (Azure SQL, Azure Cognitive Search, OpenAI) are assumed to be provisioned and accessible via environment settings. Note: Actual calls to OpenAI are used for SQL generation, but embedding generation is mocked (random vectors) to avoid external dependency. The project is deployable to an Azure Functions Consumption Plan.

Project Structure
azure-nl2sql-function/
├── deploy.sh
├── host.json
├── local.settings.json
├── requirements.txt
└── nl2sqlfunction/ 
    ├── __init __.py
    └── function.json
deploy.sh – Bash script to provision Azure resources (storage, function app) and deploy the function using Azure CLI.
host.json – Host configuration for the Function App (sets runtime version and HTTP options).
local.settings.json – Local development settings (connection strings, keys, not for production use).
requirements.txt – Python dependencies for Azure Functions, Azure SDKs, and OpenAI.
nl2sqlfunction/init.py – The function code (HTTP trigger) implementing the NL->SQL logic, search integration, and pipeline.
nl2sqlfunction/function.json – Function binding configuration (HTTP trigger/input and HTTP output).
Pipeline Overview
The function's processing pipeline consists of multiple stages, each enhancing the query or controlling how it’s answered:

Index Planning: Determine which index or database table is relevant to the query (based on schema or keywords).
Semantic Enhancement: Refine or clarify the query (could involve rephrasing or adding context).
Vector Enrichment: Generate an embedding vector for the query (here we mock this step) to enable semantic vector search.
Metadata Enrichment: Attach metadata filters or context (e.g., restrict search to a specific table or category).
Custom Scoring: Apply any domain-specific scoring adjustments for search results (not extensively used in this example).
Filter/Facet Simulation: Detect and apply any filters or faceted query conditions implied by the natural language (e.g., date ranges, categories).
Synonym Expansion: Expand the query with synonyms to improve recall in keyword search.
Using Azure Cognitive Search's Python SDK, the function performs hybrid search combining keyword (with synonyms) and vector similarity. The Azure Search SDK supports such vector and filtered queries (Azure AI Search client library for Python | Microsoft Learn). We dynamically create an index with fields reflecting the database schema, including a vector field for embeddings (python - Azure Cognitive Vector search query and index creation - Stack Overflow). On each query, we enrich the user query through the pipeline, perform a search on the index (to gather context or relevant data), and then use GPT-3.5 to generate the final SQL query. The SQL is executed against Azure SQL and the results are returned as JSON.

Below, each file in the repository is shown with its content and inline comments:

deploy.sh
This script uses Azure CLI to set up the resource group, storage account (for function app), and the Function App itself on a Consumption plan, then deploys the code. Replace placeholders (<...>) with your actual resource names and keys before running.

#!/bin/bash
# Variables (set these to your values)
RESOURCE_GROUP="<your-resource-group>"
LOCATION="<your-region>"            # e.g., "westeurope" or "eastus"
STORAGE_ACCOUNT="<yourstorageacct>" # must be globally unique
FUNCTION_APP="<your-function-app-name>"  # must be unique
# (Optional) Azure Cognitive Search and OpenAI details if setting via CLI
SEARCH_SERVICE="<your-search-service-name>"
SEARCH_API_KEY="<your-search-admin-key>"
SQL_CONN_STRING="<your-AzureSQL-connection-string>"
OPENAI_API_KEY="<your-openai-api-key>"

# Create Resource Group
az group create --name "$RESOURCE_GROUP" --location "$LOCATION"

# Create Storage Account for Function App (required for Functions)
az storage account create --name "$STORAGE_ACCOUNT" --location "$LOCATION" \
    --resource-group "$RESOURCE_GROUP" --sku Standard_LRS

# Create the Function App on a Consumption Plan (Python runtime)
az functionapp create --name "$FUNCTION_APP" --storage-account "$STORAGE_ACCOUNT" \
    --consumption-plan-location "$LOCATION" --resource-group "$RESOURCE_GROUP" \
    --functions-version 4 --runtime python --runtime-version 3.10  ([Create a serverless function app using the Azure CLI | Microsoft Learn](https://learn.microsoft.com/en-us/azure/azure-functions/scripts/functions-cli-create-serverless#:~:text=,version%20%24functionsVersion))

# Configure app settings (connection strings and keys for external services)
az functionapp config appsettings set --name "$FUNCTION_APP" --resource-group "$RESOURCE_GROUP" --settings \
    AzureSearchServiceName="$SEARCH_SERVICE" \
    AzureSearchApiKey="$SEARCH_API_KEY" \
    AzureSearchIndexName="nl2sql-index" \
    AzureSQLConnectionString="$SQL_CONN_STRING" \
    OpenAIKey="$OPENAI_API_KEY"

# Deploy the function code by zip push deployment
echo "Creating deployment package..."
zip -r function.zip . -x "local.settings.json" -x "*.git*" -x "*.vscode*"
echo "Deploying to Azure..."
az functionapp deployment source config-zip --name "$FUNCTION_APP" --resource-group "$RESOURCE_GROUP" --src function.zip

echo "Deployment completed. Function App URL:"
FUNC_URL="https://$FUNCTION_APP.azurewebsites.net/nl2sql?code=<FUNCTION_KEY>"
echo "$FUNC_URL"
host.json
The host configuration file for the Function App. Here we specify the runtime version and remove any route prefix for HTTP triggers (so the function endpoint is at the root path we define, rather than the default /api prefix).

{
  "version": "2.0",
  "extensionBundle": {
    "id": "Microsoft.Azure.Functions.ExtensionBundle",
    "version": "[3.*, 4.0.0)"
  },
  "extensions": {
    "http": {
      "routePrefix": ""  // No prefix, so our function route is not prefixed with "api"
    }
  }
}
local.settings.json
Settings for local development. Do not commit real secrets to source control. This file is excluded from deployment and is only used when running the function locally. The values here include placeholders for the Azure WebJobs storage (using local Azure Storage emulator by default) and the keys/connection strings for Azure SQL, Azure Search, and OpenAI.

{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "python",
    "AzureSQLConnectionString": "<Your-Azure-SQL-Connection-String>",
    "AzureSearchServiceName": "<Your-Search-Service-Name>",
    "AzureSearchApiKey": "<Your-Search-Admin-Key>",
    "AzureSearchIndexName": "nl2sql-index",
    "OpenAIKey": "<Your-OpenAI-API-Key>"
  }
}
requirements.txt
Python dependencies for this project. This includes Azure Functions support, Azure Cognitive Search SDK, database driver, and OpenAI SDK. All will be installed into the Function App during deployment.

azure-functions
azure-search-documents
pyodbc
openai
azure-functions – Azure Functions Python library (for the azure.functions module).
azure-search-documents – Azure Cognitive Search client SDK (allows index management, document upload, and querying (Azure AI Search client library for Python | Microsoft Learn)).
pyodbc – ODBC driver interface to connect to Azure SQL Database.
openai – OpenAI Python library to call GPT-3.5 for SQL generation.
nl2sqlfunction/init.py
This is the main Azure Function code, implementing an HTTP-triggered function. It ties everything together: connecting to the database, ensuring the search index exists and is populated, processing the natural language query through the pipeline, calling OpenAI for SQL generation, executing the SQL query, and returning results. The code is heavily commented to explain each part:

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
Key points in the code:

We use pyodbc to connect to Azure SQL and fetch schema and data. Make sure the ODBC driver is available in the environment and the connection string is valid. (Using an Azure Managed Identity for SQL is also possible, but here we use a direct connection string for simplicity.)
The Azure Cognitive Search index is defined with an id key, a table field, a content field (searchable text), and an embedding field for vector search. We configure the vector field with 128 dimensions and an HNSW algorithm for similarity search (python - Azure Cognitive Vector search query and index creation - Stack Overflow). This setup allows combined vector and keyword queries.
We mock the embedding generation by using a hash of the content and query words to produce a pseudo-random vector. In a real implementation, you might call the OpenAI Embeddings API or Azure AI services to get actual embeddings.
The function expands the query with synonyms (see SYNONYMS dict) to improve keyword search recall. For example, a query containing "cheap" will also search for "inexpensive" or "budget".
We perform an Azure Search query with both the expanded keywords and the vector embedding (search_client.search(...) with vector_queries). This is an example of a hybrid search: it uses both vector similarity and text matching (python - Azure Cognitive Vector search query and index creation - Stack Overflow). We also apply a filter on the table field if we identified a specific table from the query (Index Planning stage).
The OpenAI GPT-3.5 model is called via the openai SDK. We provide a system prompt that includes the database schema (list of tables and columns) to guide the model, and ask it to output only the SQL query. The model's response is captured as sql_query.
The SQL query is executed on the Azure SQL Database. The results are fetched, converted to a list of dictionaries (one per row), and returned as JSON. We also include the original question and the generated SQL in the response for transparency (this can be adjusted or removed as needed).
nl2sqlfunction/function.json
Azure Functions binding configuration for the function. It defines an HTTP trigger named "req" (listening for GET or POST) and an HTTP output. The route is set to "nl2sql" (so the endpoint will be e.g. https://<function-app>.azurewebsites.net/nl2sql). The auth level is "function", meaning a function key is required to call the endpoint (for production security – you can change it to "anonymous" for open access if desired).

{
  "scriptFile": "__init__.py",
  "bindings": [
    {
      "authLevel": "function",
      "type": "httpTrigger",
      "direction": "in",
      "name": "req",
      "methods": [ "get", "post" ],
      "route": "nl2sql"
    },
    {
      "type": "http",
      "direction": "out",
      "name": "$return"
    }
  ]
}
Deployment and Usage
With all files in place, you can deploy the project using the deploy.sh script or manually via Azure CLI. The script will create an Azure Function App on the Consumption plan (Create a serverless function app using the Azure CLI | Microsoft Learn) and upload the code. Once deployed, you can invoke the function by sending an HTTP GET or POST request. For example:

GET Request: GET https://<your-function-app>.azurewebsites.net/nl2sql?q=How many orders were placed last month?&code=<function_key>
POST Request: POST https://<your-function-app>.azurewebsites.net/nl2sql?code=<function_key> with JSON body: {"question": "How many orders were placed last month?"}.
The function will respond with a JSON object containing the SQL query and the query results. For instance, a response might look like:

{
  "question": "How many orders were placed last month?",
  "sql": "SELECT COUNT(*) AS OrderCount FROM Orders WHERE OrderDate >= '2025-02-01' AND OrderDate < '2025-03-01';",
  "results": [
    { "OrderCount": 42 }
  ]
}
This indicates the natural question was interpreted, converted to SQL, and executed, returning that 42 orders were placed in the last month (example data). The Azure Cognitive Search integration (index and query pipeline) provides a framework for semantic enhancements, though in this simple query the final answer comes directly from the database query. In more complex scenarios, the search results could be used to augment the prompt or provide direct answers if appropriate.

Note: In this project, the embedding generation is mocked and the search index is built on-the-fly for demonstration. In a real application, you would generate actual embeddings (e.g., via OpenAI or Azure AI) and possibly maintain the index separately (with updates when the database changes). The pipeline steps illustrated (synonyms, vector search, etc.) show how one can enhance the NL->SQL translation with additional context and recall, making the solution more robust for ambiguous or complex queries.