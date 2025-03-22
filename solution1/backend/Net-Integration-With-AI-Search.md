# Azure Functions – Natural Language to SQL Query Project
## Overview
This C# Azure Functions project implements an HTTP-triggered function that takes a natural language query and returns a JSON response containing an auto-generated SQL query and its execution results. It dynamically retrieves the Azure SQL Database schema, uses Azure Cognitive Search for hybrid search (combining keyword and vector similarities (Hybrid query - Azure AI Search | Microsoft Learn)) over the schema and sample data, and invokes an OpenAI GPT-3.5 model to translate the user’s question into an SQL query. The pipeline is structured into sequential steps (schema retrieval, indexing, search, query generation, execution) similar to a LangGraph orchestration (Home), but implemented natively in C#. Each step (enrichment, embedding, search, etc.) is encapsulated in a service for clarity.

Key features:

HTTP Trigger – Accepts GET/POST requests with a natural language query.
Dynamic Schema Retrieval – Connects to Azure SQL DB at runtime to fetch table schema and sample data.
Azure Cognitive Search – Builds/updates an index of the schema and data, with a vector field for semantic similarity. Performs hybrid search to find relevant tables using keywords + vector embeddings (Hybrid query - Azure AI Search | Microsoft Learn).
Mock Embeddings – Generates deterministic 128-dim float vectors for schema texts (using a hash-based random seed) to simulate embeddings.
OpenAI GPT-3.5 Integration – Uses the OpenAI API (GPT-3.5) to generate an SQL query from the user’s question and the context of relevant schema (Building a SQL Query Assistant with Neon, .NET, Azure Functions, OpenAI service) (I made a tool that turns questions into SQL queries! Using GPT-4).
SQL Execution – Runs the generated SQL against the database and returns results.
Organized Pipeline – The flow is broken into modular services (for Schema, Search, Query generation, etc.), functioning as a C# equivalent to a LangGraph pipeline (Home).
Azure CLI Deployment – Includes a script to provision Azure resources (Function App, Storage) and deploy the function code.
## Project Structure
Below is the project structure with configuration, code, and deployment files:

NLSQLFunction
├── host.json
├── local.settings.json
├── NLSQLFunction.csproj
├── Program.cs
├── README.md
├── AzureDeploy.sh
├── Models
│   ├── TableIndexDocument.cs
│   └── QueryResult.cs
├── Services
│   ├── SchemaService.cs
│   ├── EmbeddingService.cs
│   ├── SearchService.cs
│   ├── QueryGeneratorService.cs
│   └── DatabaseService.cs
├── Pipelines
│   └── QueryPipeline.cs
└── Functions
    └── QueryFunction.cs
Each file is shown below:

host.json
This file configures the Azure Functions host. We enable the extension bundle for common triggers/bindings.

{
  "version": "2.0",
  "extensionBundle": {
    "id": "Microsoft.Azure.Functions.ExtensionBundle",
    "version": "[3.*, 4.0.0)"
  }
}
local.settings.json
Local development settings, including connection strings and API keys. (Do not deploy this file). Replace placeholder values with your actual Azure SQL connection string, Azure Cognitive Search endpoint/key, and OpenAI API key.

{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "dotnet-isolated",
    "SQL_CONNECTION_STRING": "<Your-Azure-SQL-Connection-String>",
    "AZURE_SEARCH_ENDPOINT": "https://<your-search-service>.search.windows.net",
    "AZURE_SEARCH_ADMIN_KEY": "<your-search-service-admin-key>",
    "AZURE_SEARCH_INDEX_NAME": "schema-index",
    "OPENAI_API_KEY": "<your-openai-api-key>",
    "OPENAI_ENGINE": "text-davinci-003"
  }
}
FUNCTIONS_WORKER_RUNTIME is set to use .NET 6 isolated process.
SQL_CONNECTION_STRING is the Azure SQL Database connection.
AZURE_SEARCH_* settings configure Azure Cognitive Search (service endpoint, admin API key, and index name).
OPENAI_API_KEY is the API key for OpenAI (or Azure OpenAI) to call GPT-3.5, and OPENAI_ENGINE specifies the model (using text-davinci-003 for completions in this example).
NLSQLFunction.csproj
The project file references Azure Functions SDK, Azure Cognitive Search SDK, OpenAI SDK, and other required packages:

<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net6.0</TargetFramework>
    <AzureFunctionsVersion>v4</AzureFunctionsVersion>
    <OutputType>Exe</OutputType>
  </PropertyGroup>
  <ItemGroup>
    <!-- Azure Functions core packages -->
    <PackageReference Include="Microsoft.Azure.Functions.Worker" Version="1.14.0" />
    <PackageReference Include="Microsoft.Azure.Functions.Worker.Extensions.Http" Version="3.0.13" />
    <!-- Azure Cognitive Search SDK -->
    <PackageReference Include="Azure.Search.Documents" Version="11.4.0" />
    <PackageReference Include="Azure.Identity" Version="1.8.2" />
    <!-- OpenAI SDK for .NET -->
    <PackageReference Include="OpenAI" Version="1.4.0" />
    <!-- SQL Client for Azure SQL Database -->
    <PackageReference Include="Microsoft.Data.SqlClient" Version="5.1.0" />
  </ItemGroup>
</Project>
Program.cs
Configures the Functions host and Dependency Injection (DI) for our services. We register each service and the pipeline, and then build the host. This organizes the workflow steps without an explicit LangGraph library by using DI to orchestrate components (Home).

using Microsoft.Azure.Functions.Worker.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using System;

var host = new HostBuilder()
    .ConfigureFunctionsWorkerDefaults()  // Configure Azure Functions .NET isolated host
    .ConfigureServices(services =>
    {
        // Read environment variables for configuration
        string sqlConnStr = Environment.GetEnvironmentVariable("SQL_CONNECTION_STRING");
        string searchEndpoint = Environment.GetEnvironmentVariable("AZURE_SEARCH_ENDPOINT");
        string searchApiKey = Environment.GetEnvironmentVariable("AZURE_SEARCH_ADMIN_KEY");
        string searchIndexName = Environment.GetEnvironmentVariable("AZURE_SEARCH_INDEX_NAME");
        string openAiKey = Environment.GetEnvironmentVariable("OPENAI_API_KEY");
        string openAiEngine = Environment.GetEnvironmentVariable("OPENAI_ENGINE");

        // Register services for DI
        services.AddSingleton((_) => new Services.SchemaService(sqlConnStr));
        services.AddSingleton<Services.EmbeddingService>();
        services.AddSingleton((sp) => 
            new Services.SearchService(searchEndpoint, searchApiKey, searchIndexName, sp.GetRequiredService<Services.EmbeddingService>()));
        services.AddSingleton((_) => new Services.QueryGeneratorService(openAiKey, openAiEngine));
        services.AddSingleton((_) => new Services.DatabaseService(sqlConnStr));
        services.AddSingleton<Pipelines.QueryPipeline>();
    })
    .Build();

host.Run();
Models/TableIndexDocument.cs
Model class representing a document in the Azure Cognitive Search index. Each document corresponds to one database table (including its schema and sample data). It has a key, a text content, and a vector embedding field. The vector field is configured with 128 dimensions and linked to a vector search profile in the index (see SearchService). Azure Cognitive Search requires specifying the vector field’s dimensions and a vector search configuration name (How to create a Vector Profile in my Azure Search Service Index - Microsoft Q&A).

using Azure.Search.Documents.Indexes;  
using Azure.Search.Documents.Indexes.Models;
using System;
using System.Text.Json.Serialization;

namespace Models
{
    // Represents a searchable document for a database table's schema/data
    public class TableIndexDocument
    {
        [SimpleField(IsKey = true)]
        [JsonPropertyName("id")]
        public string Id { get; set; }

        [SearchableField(IsFilterable = false, IsSortable = false)]
        [JsonPropertyName("content")]
        public string Content { get; set; }

        // Note: Azure.Search.Documents does not yet support an attribute for vector config,
        // so the SearchService explicitly sets VectorSearchDimensions and Configuration when creating the index.
        [JsonPropertyName("contentVector")]
        public float[] ContentVector { get; set; }
    }
}
Note: We use JsonPropertyName to ensure the JSON field names match the index field names. The vector field (ContentVector) will be defined with VectorSearchDimensions = 128 and VectorSearchConfiguration = "default" in code (since attributes don’t directly support that), to satisfy Azure Search’s requirements for vector fields (Adding Dimension and Configuration to SearchIndex in Azure.Search.Documents · Issue #39414 · Azure/azure-sdk-for-net · GitHub).

Models/QueryResult.cs
Model for the function’s output. It contains the generated SQL query and the query results (as a list of row objects). This will be JSON-serialized and returned in the HTTP response.

using System.Collections.Generic;

namespace Models
{
    public class QueryResult
    {
        public string SqlQuery { get; set; }
        public List<Dictionary<string, object>> Results { get; set; }
    }
}
Services/SchemaService.cs
This service connects to the Azure SQL Database to retrieve schema information and sample data. It queries the database’s information schema to get all tables and columns, then selects a few sample rows from each table. The output is combined into a textual description per table (table name, columns, and sample data) which will be indexed by Cognitive Search.

using Microsoft.Data.SqlClient;
using System;
using System.Collections.Generic;
using System.Data;
using System.Text;

namespace Services
{
    public class SchemaService
    {
        private readonly string _connectionString;
        public SchemaService(string connectionString)
        {
            _connectionString = connectionString;
        }

        // Retrieves schema metadata and sample rows for each table in the database
        public List<(string TableName, string CombinedText)> GetSchemaInfo()
        {
            var tableSchemas = new Dictionary<string, List<(string ColName, string DataType)>>();
            using var conn = new SqlConnection(_connectionString);
            conn.Open();
            // Query information schema for table and column info
            string schemaQuery = @"
                SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE
                FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_SCHEMA NOT IN ('sys', 'INFORMATION_SCHEMA')
                ORDER BY TABLE_NAME, ORDINAL_POSITION;";
            using (var cmd = new SqlCommand(schemaQuery, conn))
            using (var reader = cmd.ExecuteReader())
            {
                while (reader.Read())
                {
                    string table = reader.GetString(0);
                    string col = reader.GetString(1);
                    string type = reader.GetString(2);
                    if (!tableSchemas.ContainsKey(table))
                        tableSchemas[table] = new List<(string, string)>();
                    tableSchemas[table].Add((col, type));
                }
            }

            // For each table, fetch a few sample rows
            var resultList = new List<(string, string)>();
            foreach (var table in tableSchemas.Keys)
            {
                // Build column schema description
                var colList = tableSchemas[table];
                string columnsDesc = String.Join(", ", colList.ConvertAll(c => $"{c.ColName} ({c.DataType})"));

                StringBuilder sampleDataDesc = new StringBuilder();
                try
                {
                    string sampleQuery = $"SELECT TOP 2 * FROM [{table}]";  // get up to 2 sample rows
                    using var sampleCmd = new SqlCommand(sampleQuery, conn);
                    using var reader = sampleCmd.ExecuteReader();
                    int fieldCount = reader.FieldCount;
                    int rowCount = 0;
                    while (reader.Read() && rowCount < 2)
                    {
                        // Concatenate column values for the row
                        var values = new List<string>();
                        for (int i = 0; i < fieldCount; i++)
                        {
                            string colName = reader.GetName(i);
                            object val = reader.IsDBNull(i) ? "NULL" : reader.GetValue(i);
                            values.Add($"{colName}: {val}");
                        }
                        sampleDataDesc.Append(string.Join(", ", values));
                        sampleDataDesc.Append(";\n");
                        rowCount++;
                    }
                }
                catch (Exception ex)
                {
                    // If sample data retrieval fails (e.g., no SELECT permission or no table data), skip data
                    sampleDataDesc.Append("<<No sample data>>\n");
                }

                // Combine into one text blob per table
                string combinedText = $"Table: {table}\nColumns: {columnsDesc}\nSampleData: {sampleDataDesc.ToString().Trim()}";
                resultList.Add((table, combinedText));
            }

            return resultList;
        }
    }
}
Notes:

We use INFORMATION_SCHEMA.COLUMNS to get table and column info. Each table’s columns and data types are collected.
For sample data, we do a SELECT TOP 2 * on each table to include a couple of example rows. This helps capture content values (e.g., sample names or dates) so that keyword search can match queries that mention specific data values, not just schema terms.
The combined text for each table includes the table name, columns, and sample rows. This is what will be indexed and searched. By including actual data values in the content, the search index can catch user queries referencing those values or similar (improving table relevance hits).
Any exceptions (e.g., table has no data or SELECT not allowed) are caught and noted, but do not stop processing other tables.
Services/EmbeddingService.cs
Generates deterministic 128-dimensional float vectors to simulate embeddings for text. This uses a hash of the input text as a random seed so the same text always yields the same vector (ensuring consistency across function runs). In a real scenario, you’d call an embedding model (like Azure OpenAI embeddings), but Azure Cognitive Search doesn’t generate vectors itself (azure-sdk-for-net/sdk/search/Azure.Search.Documents/samples/Sample07_VectorSearch.md at main · Azure/azure-sdk-for-net · GitHub), so we supply our own (azure-sdk-for-net/sdk/search/Azure.Search.Documents/samples/Sample07_VectorSearch.md at main · Azure/azure-sdk-for-net · GitHub).

using System;
using System.Linq;
using System.Security.Cryptography;
using System.Text;

namespace Services
{
    public class EmbeddingService
    {
        private const int VectorSize = 128;

        // Generate a pseudo-random embedding for the given text (deterministic)
        public float[] GenerateEmbedding(string text)
        {
            if (string.IsNullOrEmpty(text))
            {
                return new float[VectorSize];
            }
            // Use MD5 hash of text as a seed source (16 bytes)
            using var md5 = MD5.Create();
            byte[] hash = md5.ComputeHash(Encoding.UTF8.GetBytes(text));
            // Use first 4 bytes of hash as int seed
            int seed = BitConverter.ToInt32(hash, 0);
            var rand = new Random(seed);

            // Generate 128 floats between -1 and 1
            float[] vector = new float[VectorSize];
            for (int i = 0; i < VectorSize; i++)
            {
                // NextDouble gives [0,1); scale to [-1,1]
                double val = rand.NextDouble() * 2 - 1;
                vector[i] = (float)val;
            }
            // Normalize the vector to unit length (for cosine similarity consistency)
            double sumSquares = vector.Select(v => v * (double)v).Sum();
            if (sumSquares > 0)
            {
                float normFactor = (float)(1.0 / Math.Sqrt(sumSquares));
                for (int i = 0; i < VectorSize; i++)
                {
                    vector[i] *= normFactor;
                }
            }
            return vector;
        }
    }
}
Note: This embedding approach is purely for demonstration. In practice, you’d call OpenAIClient.GetEmbeddingsAsync or a similar API to get real embedding vectors (azure-sdk-for-net/sdk/search/Azure.Search.Documents/samples/Sample07_VectorSearch.md at main · Azure/azure-sdk-for-net · GitHub). The Azure Cognitive Search index will store these vectors and use them for k-NN similarity search.

Services/SearchService.cs
Handles Azure Cognitive Search index creation, document indexing, and search queries. On startup or on demand, it creates/updates the index schema (with a vector field and appropriate configurations) and uploads documents for each table (from SchemaService). It then executes a hybrid search query: combining the user’s query text with a vector similarity search on the embeddings (Hybrid query - Azure AI Search | Microsoft Learn). This returns relevant schema documents which will be used as context for SQL generation. We use the Azure.Search.Documents SDK to interact with the service.

using Azure;
using Azure.Core;
using Azure.Search.Documents;
using Azure.Search.Documents.Indexes;
using Azure.Search.Documents.Indexes.Models;
using Azure.Search.Documents.Models;
using Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Services
{
    public class SearchService
    {
        private readonly string _indexName;
        private readonly SearchIndexClient _indexClient;
        private readonly SearchClient _searchClient;
        private readonly EmbeddingService _embeddingService;

        public SearchService(string searchEndpoint, string adminApiKey, string indexName, EmbeddingService embeddingService)
        {
            _indexName = indexName;
            _embeddingService = embeddingService;
            Uri endpoint = new Uri(searchEndpoint);
            _indexClient = new SearchIndexClient(endpoint, new AzureKeyCredential(adminApiKey));
            _searchClient = _indexClient.GetSearchClient(indexName);
        }

        // Ensure the search index exists with the correct schema (creates or updates it)
        public async Task InitializeIndexAsync()
        {
            // Define the index schema (fields and vector search config)
            var fields = new List<SearchField>
            {
                new SimpleField("id", SearchFieldDataType.String) { IsKey = true },
                new SearchableField("content", SearchFieldDataType.String) 
                    { IsFilterable = false, IsSortable = false, IsFacetable = false },
                new SearchField("contentVector", SearchFieldDataType.Collection(SearchFieldDataType.Single))
                    {
                        IsSearchable = true, // mark vector field as searchable for vector queries
                        IsFilterable = false, IsSortable = false, IsFacetable = false,
                        // Set vector dimensions and the vector search profile name
                        VectorSearchDimensions = 128,
                        VectorSearchConfiguration = "default"
                    }
            };
            var definition = new SearchIndex(_indexName, fields);

            // Define the vector search algorithm configuration (HNSW with cosine similarity)
            definition.VectorSearch = new VectorSearch
            {
                AlgorithmConfigurations =
                {
                    new HnswVectorSearchAlgorithmConfiguration(name: "default")
                    {
                        // Use default HNSW parameters; we assume cosine similarity by default
                        // (In Azure Search, 'metric': 'cosine' is typically used for text embeddings ([How to create a Vector Profile in my Azure Search Service Index - Microsoft Q&A](https://learn.microsoft.com/en-us/answers/questions/1921281/how-to-create-a-vector-profile-in-my-azure-search#:~:text=algorithm_configurations%3D%5B%20VectorSearchAlgorithmConfiguration%28%20name%3D,cosine)))
                    }
                }
            };

            await _indexClient.CreateOrUpdateIndexAsync(definition);
        }

        // Indexes the given tables (schema and data) into the search index
        public async Task IndexTablesAsync(IEnumerable<(string TableName, string CombinedText)> tables)
        {
            // Convert each table schema into a document with an embedding
            var docs = tables.Select(table =>
            {
                var (tableName, text) = table;
                return new TableIndexDocument
                {
                    Id = tableName,
                    Content = text,
                    ContentVector = _embeddingService.GenerateEmbedding(text)
                };
            }).ToList();

            // Upload documents (upsert semantics)
            await _searchClient.UploadDocumentsAsync(docs);
        }

        // Performs a hybrid search on the index given a user query.
        // It uses keyword search on the 'content' and vector search on 'contentVector'.
        public async Task<IList<TableIndexDocument>> SearchSchemaAsync(string userQuery)
        {
            // Generate embedding for the query text
            float[] queryVector = _embeddingService.GenerateEmbedding(userQuery);

            // Prepare search options with vector query
            var options = new SearchOptions
            {
                VectorQueries =
                {
                    new SearchQueryVector()
                    {
                        // Use the same field and K as our vector index config
                        FieldName = "contentVector",
                        KNearestNeighborsCount = 3,
                        Value = queryVector
                    }
                },
                Size = 3  // retrieve top 3 matches
            };
            // Execute hybrid search: 'userQuery' as keyword query + vector query in options
            var response = await _searchClient.SearchAsync<TableIndexDocument>(userQuery, options);
            IList<TableIndexDocument> results = new List<TableIndexDocument>();
            await foreach (SearchResult<TableIndexDocument> result in response.GetResultsAsync())
            {
                results.Add(result.Document);
            }
            return results;
        }
    }
}
Key points:

The index schema has:

id (key),
content (all schema text, full-text searchable),
contentVector (a 128-float vector field). We mark contentVector as searchable and assign a vector configuration name "default". We then define a HNSW vector search config named "default" on the index (using default parameters, which use cosine similarity for nearest neighbor matching by default).
This setup ensures the vector field has dimensions and a vectorSearchConfiguration as required (Adding Dimension and Configuration to SearchIndex in Azure.Search.Documents · Issue #39414 · Azure/azure-sdk-for-net · GitHub). The code mirrors what a Python configuration would specify (e.g. dimensions=1536, vector_search_configuration="default" in Python (How to create a Vector Profile in my Azure Search Service Index - Microsoft Q&A), here 128 dims for our mock vectors).

InitializeIndexAsync checks/creates the index. We use CreateOrUpdateIndexAsync so it will create the index if it doesn’t exist or update the schema if it does (ensuring new fields/configs are applied without needing manual deletion). The vector search config is set once (only needed on first creation unless changed).

IndexTablesAsync converts each table schema info into a TableIndexDocument, calls our EmbeddingService to get a vector for the combined text, and uploads the documents to Azure Cognitive Search. We use UploadDocumentsAsync which performs upsert (update or insert) for each document by key.

SearchSchemaAsync performs the hybrid search. We generate a vector for the user’s query, then create a SearchOptions with a VectorQueries entry. We also pass the userQuery string as the textual query to _searchClient.SearchAsync. Azure Cognitive Search will run both the full-text query and the k-NN vector query in parallel and fuse the results (Hybrid query - Azure AI Search | Microsoft Learn) (using Reciprocal Rank Fusion by default for hybrid ranking). We request the top 3 results. The results are returned as TableIndexDocument objects via the SDK.

The result is a list of relevant table documents. Typically, the top result will be the most relevant table for the query. We will feed these (usually just the top one or two) into the prompt for SQL generation next. By vectorizing the schema and data, the system can “find the right tables, then create a query” (I made a tool that turns questions into SQL queries! Using GPT-4) – this approach helps GPT focus only on the relevant schema context.

Services/QueryGeneratorService.cs
This service calls the OpenAI API (GPT-3.5 model) to generate an SQL query based on the natural language question and relevant schema context. We construct a prompt that provides the schema info of the top-matched table(s) and the user’s question, then ask GPT-3.5 to output an SQL query. We use the official OpenAI .NET SDK (via the OpenAIAPI class) to create a completion.

using OpenAI_API;
using OpenAI_API.Completions;
using System.Threading.Tasks;

namespace Services
{
    public class QueryGeneratorService
    {
        private readonly OpenAIAPI _openAiApi;
        private readonly string _model;
        public QueryGeneratorService(string apiKey, string model)
        {
            _openAiApi = new OpenAIAPI(apiKey);
            _model = string.IsNullOrEmpty(model) ? "text-davinci-003" : model;
        }

        // Generates an SQL query text from the natural language query and schema context.
        public async Task<string> GenerateSqlQueryAsync(string naturalLanguageQuery, string schemaContext)
        {
            // Construct prompt with schema info and question
            string prompt = 
                $"You are an SQL assistant. Given the database schema and a question, write an SQL query to answer it.\n\n" +
                $"Schema:\n{schemaContext}\n\n" +
                $"Question: {naturalLanguageQuery}\nSQL Query:";
            var request = new CompletionRequest(prompt, model: _model, temperature: 0.0, max_tokens: 200);
            var result = await _openAiApi.Completions.CreateCompletionAsync(request);
            string queryText = result.ToString().Trim();
            // Ensure the query text is not empty
            return string.IsNullOrWhiteSpace(queryText) ? "-- No query generated --" : queryText;
        }
    }
}
Notes:

The prompt provides context: we include the Schema (e.g., “Table: Orders, Columns: ..., SampleData: ...”) that we got from the SearchService’s top results, then the Question. We end the prompt with “SQL Query:” to signal the model to produce only the SQL query as output.
We set temperature: 0.0 for deterministic output and limit max_tokens to 200 (enough for most queries).
The OpenAI SDK’s CompletionRequest is used with the specified model (e.g., text-davinci-003 which is a GPT-3.5 model tuned for completions). We could also use the Chat API with gpt-3.5-turbo, but for simplicity we use a completion model.
We trim the result. The OpenAI library’s result.ToString() conveniently returns the text of the completion (which is the SQL query).
Example: if the user asks “How many orders were placed last month?”, and the relevant schema (from, say, an Orders table) is provided, the model might return an SQL query like SELECT COUNT(*) FROM Orders WHERE OrderDate >= '2023-02-01' AND OrderDate < '2023-03-01';. The exact query is returned as-is.
Services/DatabaseService.cs
Executes the generated SQL query on the Azure SQL Database and retrieves the results. It uses the SqlClient to run the query and reads the result set into a list of dictionaries (each dictionary represents a row, mapping column names to values). This allows easy JSON serialization of the results.

using Microsoft.Data.SqlClient;
using System;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;

namespace Services
{
    public class DatabaseService
    {
        private readonly string _connectionString;
        public DatabaseService(string connectionString)
        {
            _connectionString = connectionString;
        }

        // Executes the given SQL query and returns the results as a list of dictionaries (column->value)
        public async Task<List<Dictionary<string, object>>> ExecuteQueryAsync(string sqlQuery)
        {
            var results = new List<Dictionary<string, object>>();
            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync();
            using var cmd = new SqlCommand(sqlQuery, conn);
            try
            {
                using var reader = await cmd.ExecuteReaderAsync();
                // Read each row
                while (await reader.ReadAsync())
                {
                    var row = new Dictionary<string, object>(StringComparer.OrdinalIgnoreCase);
                    for (int i = 0; i < reader.FieldCount; i++)
                    {
                        string colName = reader.GetName(i);
                        object value = reader.IsDBNull(i) ? null : reader.GetValue(i);
                        row[colName] = value;
                    }
                    results.Add(row);
                }
            }
            catch (Exception ex)
            {
                // If the query fails (e.g., syntax error or runtime error), return an empty result with an error note
                results.Clear();
                results.Add(new Dictionary<string, object>
                {
                    ["Error"] = ex.Message
                });
            }
            return results;
        }
    }
}
Notes:

The method returns a List<Dictionary<string, object>>. Each dictionary is one row of the result, mapping column names to their values. This structure will serialize to a JSON array of objects, which is convenient for the HTTP response.
We handle exceptions by returning a result indicating the error. In practice, you might also log the error or include it in the response. Here, we put the error message in a dictionary with key "Error" for simplicity.
This service assumes the generated SQL is a SELECT or similar query that produces a result set. If a non-SELECT query is executed (UPDATE/DELETE), ExecuteReaderAsync may not return rows. In such cases, one could detect reader.FieldCount == 0 or use ExecuteNonQueryAsync. For demonstration, we focus on SELECT queries which are typical for Q&A scenarios.
Pipelines/QueryPipeline.cs
This class orchestrates all the services to handle a query from start to finish. It fetches schema info, updates the search index, finds relevant schema context, asks OpenAI for the SQL, executes it, and packages the results. The steps are executed in order, forming an enrichment pipeline that resembles the kind of orchestration LangGraph would provide (if it were available in .NET) (Home).

using Models;
using Services;
using System.Linq;
using System.Threading.Tasks;

namespace Pipelines
{
    public class QueryPipeline
    {
        private readonly SchemaService _schemaService;
        private readonly SearchService _searchService;
        private readonly QueryGeneratorService _queryGenService;
        private readonly DatabaseService _databaseService;

        public QueryPipeline(SchemaService schemaService, SearchService searchService,
                             QueryGeneratorService queryGenService, DatabaseService databaseService)
        {
            _schemaService = schemaService;
            _searchService = searchService;
            _queryGenService = queryGenService;
            _databaseService = databaseService;
        }

        // Main method to process a natural language query through the pipeline
        public async Task<QueryResult> ProcessQueryAsync(string naturalLanguageQuery)
        {
            // Step 1: Retrieve latest schema info and sample data
            var schemaInfoList = _schemaService.GetSchemaInfo();

            // Step 2: Ensure search index exists and index the schema info
            await _searchService.InitializeIndexAsync();
            await _searchService.IndexTablesAsync(schemaInfoList);

            // Step 3: Perform hybrid search to find relevant tables for the query
            var searchResults = await _searchService.SearchSchemaAsync(naturalLanguageQuery);
            string schemaContext = "";
            if (searchResults.Count > 0)
            {
                // Take top 1-2 relevant schemas as context
                schemaContext = searchResults[0].Content;
                if (searchResults.Count > 1)
                {
                    // If second result is also relevant, include it
                    schemaContext += "\n\n" + searchResults[1].Content;
                }
            }

            // Step 4: Use OpenAI to generate SQL query from NL query and schema context
            string sqlQuery = await _queryGenService.GenerateSqlQueryAsync(naturalLanguageQuery, schemaContext);

            // Step 5: Execute the SQL query on the database
            var queryResults = await _databaseService.ExecuteQueryAsync(sqlQuery);

            // Return the composed result
            return new QueryResult
            {
                SqlQuery = sqlQuery,
                Results = queryResults
            };
        }
    }
}
Workflow explanation:

Schema Retrieval: We call _schemaService.GetSchemaInfo(), which returns a list of tuples (TableName, CombinedText). This provides the current schema and sample data for each table in the database.

Indexing: We initialize the search index (creating or updating the schema as needed) and then index all tables. This makes the latest schema searchable. (In a production scenario, this step might be done on a schedule or when the schema changes, rather than every query. Here we do it per query for simplicity.)

Hybrid Search: Using the user’s natural language query, we perform a hybrid search on the index. The result is a ranked list of table documents that likely pertain to the query. We then build the schemaContext string from the top results. We include the top result’s content (and the second result’s content if it seems relevant) as context. This context might look like, for example:

Table: Orders
Columns: OrderID (int), CustomerID (int), OrderDate (datetime), TotalAmount (decimal)
SampleData: OrderID: 1, CustomerID: 42, OrderDate: 2023-01-15, TotalAmount: 99.50;
            OrderID: 2, CustomerID: 17, OrderDate: 2023-01-20, TotalAmount: 150.00
By providing this, we guide GPT-3.5 to use the Orders table for an order-related question. (This approach of searching the schema first is aligned with best practices for text-to-SQL assistants (I made a tool that turns questions into SQL queries! Using GPT-4).)

SQL Generation: The _queryGenService.GenerateSqlQueryAsync is invoked with the natural language question and the schemaContext. The OpenAI model (GPT-3.5) will receive a prompt containing the schema info and question, and it will output an SQL query text that should answer the question. For example, if asked “How many orders were placed in January 2023?”, the model might produce:

SELECT COUNT(*) 
FROM Orders 
WHERE OrderDate >= '2023-01-01' AND OrderDate < '2023-02-01';
The generated SQL is captured in sqlQuery.

Execution: We pass the sqlQuery to the DatabaseService which executes it on the Azure SQL DB. The results (e.g., the count of orders) are fetched. In this case, the result might be a single row with the count. We collect results into queryResults.

Output Composition: Finally, we construct a QueryResult object containing the sqlQuery string and the Results list. This is what will be returned to the client.

Throughout this pipeline, each component is specialized, and the QueryPipeline ties them together, similar to how an AI orchestrator or LangGraph would sequence tasks (Building a SQL Query Assistant with Neon, .NET, Azure Functions, OpenAI service).

Functions/QueryFunction.cs
This is the Azure Function entry point. It’s an HTTP-triggered function that receives the HTTP request, extracts the natural language query, invokes the QueryPipeline, and returns the result as JSON. We support both GET (query parameter) and POST (JSON body) to provide the query.

using System.Net;
using System.Text.Json;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Models;
using Pipelines;
using System.Threading.Tasks;
using System.IO;

namespace Functions
{
    public class QueryFunction
    {
        private readonly QueryPipeline _pipeline;
        public QueryFunction(QueryPipeline pipeline)
        {
            _pipeline = pipeline;
        }

        [Function("QueryFunction")]
        public async Task<HttpResponseData> Run(
            [HttpTrigger(AuthorizationLevel.Function, "get", "post", Route = "query")] HttpRequestData req)
        {
            // Retrieve the natural language query from either query string or request body
            string nlQuery = null;

            // Try query parameters first (e.g., /api/query?question=... or ?query=...)
            var queryParams = System.Web.HttpUtility.ParseQueryString(req.Url.Query);
            nlQuery = queryParams["query"] ?? queryParams["q"];
            
            // If not in query string, try reading JSON body
            if (string.IsNullOrEmpty(nlQuery))
            {
                string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
                if (!string.IsNullOrEmpty(requestBody))
                {
                    try
                    {
                        using JsonDocument doc = JsonDocument.Parse(requestBody);
                        if (doc.RootElement.TryGetProperty("query", out JsonElement queryProp))
                        {
                            nlQuery = queryProp.GetString();
                        }
                        else if (doc.RootElement.TryGetProperty("question", out JsonElement questionProp))
                        {
                            nlQuery = questionProp.GetString();
                        }
                    }
                    catch (JsonException)
                    {
                        // Invalid JSON, we'll handle nlQuery still null below
                    }
                }
            }

            // If query is still null or empty, return a bad request
            var response = req.CreateResponse();
            if (string.IsNullOrWhiteSpace(nlQuery))
            {
                response.StatusCode = HttpStatusCode.BadRequest;
                await response.WriteStringAsync("Please provide a natural language query in the request (query parameter 'q' or 'query', or JSON body).");
                return response;
            }

            // Process the query through the pipeline
            QueryResult result = await _pipeline.ProcessQueryAsync(nlQuery);

            // Return the result as JSON
            response.StatusCode = HttpStatusCode.OK;
            response.Headers.Add("Content-Type", "application/json; charset=utf-8");
            await response.WriteAsJsonAsync(result);
            return response;
        }
    }
}
Function details:

We use [HttpTrigger(AuthorizationLevel.Function, "get", "post", Route = "query")] so that the function responds at e.g. https://<functionapp>.azurewebsites.net/api/query. The auth level is Function (you could use an API key or set to Anonymous as needed).
The function attempts to get the query text:
If a GET request, it looks for query parameters named "query" or "q". For example: GET /api/query?query=show+all+customers.
If a POST request, it expects a JSON payload, e.g. { "query": "show all customers" }.
If no query is provided, it returns a 400 Bad Request with a message.
Otherwise, it calls _pipeline.ProcessQueryAsync(nlQuery). This runs all the steps described earlier.
Finally, it uses WriteAsJsonAsync(result) to serialize the QueryResult object to JSON and return it.
When deployed, you can test this function by sending an HTTP request. For example:

# Example GET request
curl "<your_function_url>/api/query?query=How many orders in 2023?"

# Example POST request
curl -X POST "<your_function_url>/api/query" \
     -H "Content-Type: application/json" \
     -d '{"query": "List the top 5 customers by revenue"}'
The response will be a JSON object, for example:

{
  "SqlQuery": "SELECT TOP 5 CustomerID, SUM(TotalAmount) as TotalRevenue\nFROM Orders\nGROUP BY CustomerID\nORDER BY TotalRevenue DESC;",
  "Results": [
    { "CustomerID": 17, "TotalRevenue": 12345.67 },
    { "CustomerID": 42, "TotalRevenue": 9876.54 },
    // ... up to 5 results
  ]
}
This output contains the generated SqlQuery and the Results data retrieved from the database.

AzureDeploy.sh
A bash script to deploy this function to Azure using the Azure CLI. It will create a resource group, storage account (for Function storage), and an Azure Functions consumption plan app. It also sets the necessary application settings (connection strings and keys), then deploys the code. Make sure to fill in the placeholders for names and values before running.

#!/bin/bash
# Variables (edit these to your desired names and values)
RESOURCE_GROUP="MyFunctionsRG"
LOCATION="westeurope"                  # choose an Azure region
STORAGE_ACCOUNT="mystorage$RANDOM"     # must be unique
FUNCTION_APP="nlsqlfunc$RANDOM"        # must be unique

# Azure SQL and Cognitive Search info (fill these with your actual values)
SQL_CONN_STRING="<YOUR-AZURE-SQL-CONNECTION-STRING>"
SEARCH_ENDPOINT="<YOUR-SEARCH-ENDPOINT>"        # e.g. https://your-search.search.windows.net
SEARCH_KEY="<YOUR-SEARCH-ADMIN-KEY>"
SEARCH_INDEX_NAME="schema-index"
OPENAI_KEY="<YOUR-OPENAI-API-KEY>"
OPENAI_ENGINE="text-davinci-003"

# 1. Create Resource Group
az group create --name $RESOURCE_GROUP --location $LOCATION

# 2. Create Storage Account (for Function App's state and files)
az storage account create --name $STORAGE_ACCOUNT --location $LOCATION \
    --resource-group $RESOURCE_GROUP --sku Standard_LRS

# 3. Create the Function App (Consumption Plan, .NET 6)
az functionapp create --name $FUNCTION_APP --resource-group $RESOURCE_GROUP \
    --storage-account $STORAGE_ACCOUNT --consumption-plan-location $LOCATION \
    --runtime dotnet-isolated --functions-version 4

# 4. Configure Application Settings for the Function (connection strings and keys)
az functionapp config appsettings set --name $FUNCTION_APP --resource-group $RESOURCE_GROUP \
    --settings "SQL_CONNECTION_STRING=$SQL_CONN_STRING"
az functionapp config appsettings set --name $FUNCTION_APP --resource-group $RESOURCE_GROUP \
    --settings "AZURE_SEARCH_ENDPOINT=$SEARCH_ENDPOINT"
az functionapp config appsettings set --name $FUNCTION_APP --resource-group $RESOURCE_GROUP \
    --settings "AZURE_SEARCH_ADMIN_KEY=$SEARCH_KEY"
az functionapp config appsettings set --name $FUNCTION_APP --resource-group $RESOURCE_GROUP \
    --settings "AZURE_SEARCH_INDEX_NAME=$SEARCH_INDEX_NAME"
az functionapp config appsettings set --name $FUNCTION_APP --resource-group $RESOURCE_GROUP \
    --settings "OPENAI_API_KEY=$OPENAI_KEY"
az functionapp config appsettings set --name $FUNCTION_APP --resource-group $RESOURCE_GROUP \
    --settings "OPENAI_ENGINE=$OPENAI_ENGINE"

# 5. Deploy the function code
# Build the project and deploy via zip push
dotnet publish -c Release -o publish_output
cd publish_output
zip -r ../deployment.zip .
cd ..
az functionapp deployment source config-zip --resource-group $RESOURCE_GROUP \
    --name $FUNCTION_APP --src deployment.zip

echo "Deployment complete. Function App URL: https://${FUNCTION_APP}.azurewebsites.net/api/query"
Usage: Make sure you are logged in to Azure (az login) and have the Azure CLI installed. Save the script as AzureDeploy.sh, make it executable, and run it in the project root directory. It will output the function’s URL upon success. You can then invoke the function via curl or a REST client.

README.md
The following is the project README with setup and usage instructions:

# Natural Language to SQL Azure Function

This project contains an Azure Function that translates natural language questions into SQL queries and returns the results, using Azure SQL Database, Azure Cognitive Search, and OpenAI's GPT-3.5. It demonstrates a **rapid enrichment pipeline**: schema retrieval, vector-based semantic search, and GPT-assisted query generation ([Building a SQL Query Assistant with Neon, .NET, Azure Functions, OpenAI service](https://neon.tech/blog/building-sql-query-assistant-with-dotnet-azure-functions-openai#:~:text=,user%20queries%2C%20generates%20SQL%20commands)).

## How it Works

1. **Schema Extraction** – On each query, the function connects to the Azure SQL DB to fetch table schemas and a few sample rows.
2. **Indexing & Search** – The schema and samples are indexed into Azure Cognitive Search with a vector field. The user query is used to perform a **hybrid search** (keyword + vector) to identify relevant tables ([Hybrid query - Azure AI Search | Microsoft Learn](https://learn.microsoft.com/en-us/azure/search/hybrid-search-how-to-query#:~:text=Hybrid%20search%20%20combines%20text,return%20the%20most%20relevant%20results)).
3. **SQL Generation (GPT-3.5)** – The function calls an OpenAI GPT-3.5 model with the user question and the relevant schema info as context to generate an appropriate SQL query ([I made a tool that turns questions into SQL queries! Using GPT-4](https://www.reddit.com/r/OpenAI/comments/19a6dbc/i_made_a_tool_that_turns_questions_into_sql/#:~:text=I%20made%20a%20tool%20that,It%27s%20still%20a%20lot%2C)).
4. **SQL Execution** – The generated SQL is run against the database, and the results are retrieved.
5. **Response** – The function returns a JSON response containing the SQL query and the query results.

This approach uses semantic embeddings and search to pinpoint the right tables before generating the query, improving accuracy (a technique akin to using LangGraph for orchestration, implemented here with custom C# services) ([Home](https://langchain-ai.github.io/langgraph/#:~:text=LangGraph%20%E2%80%94%20used%20by%20Replit%2C,to%20reliably%20handle%20complex%20tasks)).

## Setup Instructions

### Prerequisites

- **Azure SQL Database** with your data. Obtain the connection string and ensure the function has read access to the data.
- **Azure Cognitive Search** service (with "Vector Search" enabled). Note your Search service endpoint and **Admin API key**.
- **OpenAI API Key** for GPT-3.5 (or Azure OpenAI endpoint/key). We use the OpenAI completion API in this project.
- **Azure Functions Core Tools** (if running locally) and .NET 6 SDK.

### Configuration

Update the `local.settings.json` (for local testing) or Azure Function App settings (in Azure) with the following:

- `SQL_CONNECTION_STRING` – connection string for your Azure SQL Database.
- `AZURE_SEARCH_ENDPOINT` – URL of your Cognitive Search service (e.g., *https://<name>.search.windows.net*).
- `AZURE_SEARCH_ADMIN_KEY` – Admin key for the search service (needed to create index and upload docs).
- `AZURE_SEARCH_INDEX_NAME` – Name for the index (e.g., "schema-index").
- `OPENAI_API_KEY` – API key for OpenAI (or Azure OpenAI key).
- `OPENAI_ENGINE` – Model name or deployment name (e.g., "text-davinci-003" for OpenAI, or your Azure OpenAI deployment name for gpt-35-turbo).

### Running Locally

1. Ensure your Azure SQL and Cognitive Search settings are in `local.settings.json`. For OpenAI, provide the API key.
2. Start the function locally:  
   ```bash
   func start
This will launch the Functions host on your machine. 3. Test the function:

curl "http://localhost:7071/api/query?query=How many orders in 2021?"
You should receive a JSON response with an SQL query and (if the database is accessible from your machine) the results.

Deployment
Use the provided AzureDeploy.sh script or the following manual steps:

Create an Azure resource group and storage account.
Create an Azure Functions App (Consumption plan, runtime: .NET). Use Functions v4 for .NET 6.
Set the application settings as described (via Azure Portal or CLI).
Deploy the code: you can publish from Visual Studio/VS Code, use Azure Functions Core Tools (func azure functionapp publish <appName>), or run the CLI script which uses az functionapp deployment source config-zip to push the build.
For example, to deploy via Azure CLI:

az group create -n MyFunctionRG -l <Region>
az storage account create -n <storageName> -g MyFunctionRG -l <Region> --sku Standard_LRS
az functionapp create -n <FunctionAppName> -g MyFunctionRG -s <storageName> \
  --consumption-plan-location <Region> --runtime dotnet-isolated --functions-version 4
# (Then set configuration settings as shown in AzureDeploy.sh)
func azure functionapp publish <FunctionAppName>
Once deployed, note the function URL (it will be of the form: https://<FunctionAppName>.azurewebsites.net/api/query). You can send HTTP requests to this endpoint.

Usage
Send a GET request with a query parameter, or a POST request with a JSON body:

GET Example:
GET https://<FunctionAppName>.azurewebsites.net/api/query?query=What%20are%20the%20top%2010%20products%20by%20sales%3F

POST Example:

POST /api/query HTTP/1.1
Host: <FunctionAppName>.azurewebsites.net
Content-Type: application/json

{
  "query": "What are the top 10 products by sales?"
}
Response: The function will respond with JSON. For example:

{
  "SqlQuery": "SELECT TOP 10 ProductName, SUM(SalesAmount) AS TotalSales\nFROM Sales\nGROUP BY ProductName\nORDER BY TotalSales DESC;",
  "Results": [
    { "ProductName": "Gadget", "TotalSales": 123456.78 },
    { "ProductName": "Widget", "TotalSales": 98765.43 },
    // ...other products
  ]
}
The "SqlQuery" is the SQL generated by GPT-3.5 given your question and the database schema context, and "Results" is the data returned from your database for that query.

Important Notes
Vector Search: The Azure Cognitive Search index is configured with a vector field and uses an HNSW algorithm for similarity search. We use mock embeddings in this project. In a real deployment, you would replace EmbeddingService.GenerateEmbedding with calls to an embedding model (e.g., Azure OpenAI embeddings) to get meaningful vectors (azure-sdk-for-net/sdk/search/Azure.Search.Documents/samples/Sample07_VectorSearch.md at main · Azure/azure-sdk-for-net · GitHub).
OpenAI Model: We used the text-davinci-003 model for demonstration. You can substitute this with gpt-3.5-turbo by adjusting the code to use the ChatCompletion API or using Azure OpenAI’s Azure.AI.OpenAI SDK. Ensure the prompt provides enough schema detail and that you handle any tokens limit.
Security: The function is at Function auth level by default. In production, consider using function keys or API management, and never expose sensitive connection strings or keys. Also, be mindful that the OpenAI API call will send the schema info and question to the model; ensure this is allowed by your data privacy standards.
LangGraph Equivalents: We structured the code into services and a pipeline to mimic the control flow you might achieve with a library like LangGraph (which orchestrates complex LLM workflows) (Home). This design makes it easier to maintain each part (schema fetch, search, AI, etc.) separately.
References
Azure Cognitive Search Hybrid Search – combining keyword and vector search to improve result relevance (Hybrid query - Azure AI Search | Microsoft Learn). This project uses hybrid queries to find the relevant schema pieces for a given question.
Azure Cognitive Search Vector Fields – vector fields require specifying dimensions and a configuration for similarity algorithm (Adding Dimension and Configuration to SearchIndex in Azure.Search.Documents · Issue #39414 · Azure/azure-sdk-for-net · GitHub). We configure a 128-dimension vector with an HNSW algorithm (cosine similarity) for the index (How to create a Vector Profile in my Azure Search Service Index - Microsoft Q&A).
OpenAI GPT-3.5 for Text-to-SQL – using GPT-3.5 to generate SQL queries from natural language is inspired by approaches to “convert natural language into SQL queries” (Building a SQL Query Assistant with Neon, .NET, Azure Functions, OpenAI service). We enhance accuracy by providing context (relevant schema) before generation (I made a tool that turns questions into SQL queries! Using GPT-4).
LangGraph – Although not available in C#, the concept of LangGraph (from LangChain) informed our pipeline design. LangGraph is an orchestration framework for controllable AI agents (Home). Here we implemented a similar multi-step orchestration manually, ensuring each component’s output feeds into the next in a controlled manner.