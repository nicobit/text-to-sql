from conversation_state import ConversationState
from fuzzywuzzy import fuzz


def node_determine_relevant_tables(state: ConversationState) -> ConversationState:

    query = state["query"]  
    schema = state["schema"]
    matched_tables = {}

    for table, columns in schema.items():
        # Match query against the table name and column names
        table_score = fuzz.partial_ratio(query.lower(), table.lower())
        column_scores = [fuzz.partial_ratio(query.lower(), column.lower()) for column in columns]
        
        # Store the highest column score for each table
        max_column_score = max(column_scores) if column_scores else 0
        
        # Calculate overall relevance score (you can tune this logic)
        overall_score = (table_score + max_column_score) / 2
        
        if overall_score > 60:  # Only consider tables with a relevant score above a threshold
            matched_tables[table] = overall_score
    state["matched_tales"] = matched_tables
    return state