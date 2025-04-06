import nltosql_chat.utils.db as db

# You may set a default limit if not provided in state
DEFAULT_LIMIT = 10

def execute_sql(state: dict):
    """Execute the SQL query in state against the database and return result rows (limited)."""
    query = state.get("sql")
    if not query:
        return {"results": "ERROR: No SQL query to execute."}
    # Apply row limit from state or default
    limit = state.get("limit", DEFAULT_LIMIT)
    try:
        result_text = db.run_query(query, limit=limit)
    except Exception as e:
        # Capture database errors
        result_text = f"ERROR: {str(e)}"
    # Store the query results (as text) in state for analysis
    return {"results": result_text}