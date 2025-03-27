import numpy as np
from services import openai_service

# Define your schema as a list of table dictionaries.
SCHEMA = [
    {
        "table": "Customers",
        "columns": ["CustomerID", "Name", "Age", "City"],
        "description": "Stores customer details."
    },
    {
        "table": "Orders",
        "columns": ["OrderID", "CustomerID", "Product", "Quantity", "OrderDate"],
        "description": "Stores order records and details."
    },
    # Add more tables as needed...
]

# Precompute embeddings for each table summary at startup.
# For each table, we concatenate the table name, columns, and description.
TABLE_EMBEDDINGS = {}

def initialize_schema_embeddings():
    """Compute and cache embeddings for each table in the schema."""
    for table in SCHEMA:
        summary = f"Table: {table['table']}. Columns: {', '.join(table['columns'])}. Description: {table['description']}"
        embedding = openai_service.get_embedding(summary)
        TABLE_EMBEDDINGS[table["table"]] = {
            "embedding": embedding,
            "table": table  # store the full table info
        }

def cosine_similarity(vec1: list, vec2: list) -> float:
    """Compute cosine similarity between two vectors."""
    v1 = np.array(vec1)
    v2 = np.array(vec2)
    if np.linalg.norm(v1)==0 or np.linalg.norm(v2)==0:
        return 0.0
    return float(np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2)))

def get_relevant_schema(question_embedding: list, top_k: int = 2) -> str:
    """
    Given the embedding for the user question, select the top_k most relevant tables
    from the schema and return a string description.
    """
    similarities = []
    for table_name, data in TABLE_EMBEDDINGS.items():
        sim = cosine_similarity(question_embedding, data["embedding"])
        similarities.append((sim, data["table"]))
    # Sort by similarity (descending) and take top_k.
    similarities.sort(key=lambda x: x[0], reverse=True)
    selected_tables = [t for _, t in similarities[:top_k]]
    
    # Build a schema snippet string from selected tables.
    schema_snippet_lines = []
    for table in selected_tables:
        line = f"Table: {table['table']} | Columns: {', '.join(table['columns'])} | Description: {table['description']}"
        schema_snippet_lines.append(line)
    return "\n".join(schema_snippet_lines)

# Initialize embeddings at module load.
initialize_schema_embeddings()