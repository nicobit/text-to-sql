# How It Works
1. User Query Reception:
The React frontend sends a POST request with a JSON payload (e.g., { "question": "Qual'e' la linea di prodotti con maggior vendita nel 2022" }) to the /query endpoint.

2. Embedding & Dynamic Schema Identification:

The backend computes an embedding for the question.

The schema_service uses that embedding to calculate cosine similarity with each table’s precomputed embedding.

The top (e.g., 2) most relevant tables are selected and summarized.

3. Few-Shot Example Retrieval:
Azure Cognitive Search is queried (using the question embedding) to retrieve similar example Q&A pairs.

4. Prompt Construction & SQL Generation:
The prompt includes a dynamic schema snippet, retrieved examples, and the user question. This prompt is sent to GPT‑4, which returns an SQL query.

5. SQL Execution:
The generated SQL is executed against your Azure SQL Database (using pyodbc).

4. Final Answer Generation:
The SQL results (converted to a string) and the original question are sent back to GPT‑4 to produce a natural language answer.

7. Response:
The API returns the generated SQL and the final answer as JSON.

# Multilingual Considerations
Because the OpenAI embedding model (text‑embedding‑ada‑002) supports multiple languages, the system can process questions in different languages without additional translation steps. The dynamic schema selection and GPT‑4 completions will work on the multilingual input as long as your few‑shot examples and schema summaries are written in a language (or mix) that GPT‑4 can understand.

This complete project meets the requirements:

- It dynamically identifies relevant schema parts.

- It supports multi‑lingual queries.

- It integrates Azure SQL, Azure Cognitive Search, and OpenAI GPT‑4.

- It exposes a RESTful API for a React frontend.