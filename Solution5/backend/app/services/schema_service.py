import numpy as np
from app.services import openai_service
from app.services.db_service import DBHelper
from app.utils.nb_logger import NBLogger
import app.services.embedding_service as embedding_service

logger = NBLogger().Log()


# 
#    [
 #       {
  #          "table": "Customers",
   #         "columns": ["CustomerID", "Name", "Age", "City"],
    #        "description": "Stores customer details."
     #   },
      #  {
       #     "table": "Orders",
        #    "columns": ["OrderID", "CustomerID", "Product", "Quantity", "OrderDate"],
         #   "description": "Stores order records and details."
        #},
    
    #]

# Precompute embeddings for each table summary at startup.
# For each table, we concatenate the table name, columns, and description.

SCHEMA = {}

def initialize_schema_embeddings(database:str) -> dict:
    """
    Compute and cache embeddings for each table in the schema.
    """
    logger.warning("Initializing schema embeddings...")
    
    global SCHEMA
    if SCHEMA == {}:
        retval = {}
        schema =  DBHelper.getDBSchema(database)
        for table_name, columns in schema.items():
            # Create a summary string for the table.
            # Since there's no description, we only list table name and columns.
            summary = f"Table: {table_name}. Columns: {', '.join(columns)}."
            embedding = embedding_service.get_or_generate_embedding(table_name,summary)
            retval[table_name] = {
                "embedding": embedding,
                "columns": columns  # store the columns list
            }
        SCHEMA = retval
    return SCHEMA
    
    # It shoud be added also the description to check from where to take.
    #for table in SCHEMA:
    #    summary = f"Table: {table['table']}. Columns: {', '.join(table['columns'])}. Description: {table['description']}"
    #    embedding = openai_service.get_embedding(summary)
    #    TABLE_EMBEDDINGS[table["table"]] = {
    #        "embedding": embedding,
    #        "table": table  # store the full table info
    #    }

def cosine_similarity(vec1: list, vec2: list) -> float:
    """Compute cosine similarity between two vectors."""
    v1 = np.array(vec1)
    v2 = np.array(vec2)
    if np.linalg.norm(v1)==0 or np.linalg.norm(v2)==0:
        return 0.0
    return float(np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2)))

def is_similarity_significant(vec1: list, vec2: list, threshold: float = 0.7) -> bool:
    """
    Check if the cosine similarity between two vectors is above a given threshold.
    
    Args:
        vec1 (list): First vector.
        vec2 (list): Second vector.
        threshold (float): The similarity threshold to consider as significant.
        
    Returns:
        bool: True if similarity is above the threshold, False otherwise.
    """
    similarity = cosine_similarity(vec1, vec2)
    return similarity >= threshold


def get_relevant_schema(database:str,question_embedding: list, table_embedding:dict,top_k: int = 6) -> list:
    """
    Given the embedding for the user question, select the top_k most relevant tables
    from the schema and return a string description.
    """
    # database can be useful in case we want to check with similarities in azure search
    similarities = []
    for table_name, data in table_embedding.items():
        sim = cosine_similarity(question_embedding, data["embedding"])
        similarities.append((sim, table_name))
    # Sort by similarity (descending) and take top_k.
    similarities.sort(key=lambda x: x[0], reverse=True)
    selected_tables = [t for _, t in similarities[:top_k]]
    
    # Build a schema snippet string from selected tables.
    schema_snippet_lines = []
    for table in selected_tables:
        #line = f"Table: {table['table']} | Columns: {', '.join(table['columns'])} | Description: {table['description']}"
        line = f"Table: {table} | Columns: {', '.join(table_embedding[table]['columns'])} "
        schema_snippet_lines.append(line)
    #return "\n".join(schema_snippet_lines)
    return schema_snippet_lines

