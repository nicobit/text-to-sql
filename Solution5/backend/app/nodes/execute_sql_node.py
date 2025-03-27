from app.data.conversation_state import ConversationState
from app.services.db_service import DBHelper
from app.utils.nb_logger import NBLogger

logger = NBLogger().Log()


def execute_sql_node(state: ConversationState) -> ConversationState:
    """
    Execute SQL Query to get the results.
    """
    
    try:
        results = DBHelper().executeSQLQuery(state["sql_query"])
    except Exception as e:
        state["output"] = "error"
        state["error"] = f"Error executing SQL: {str(e)}"
        logger.error(f"Error executing SQL: {str(e)}")
        results = None
    
   
    state["query_result"] = results
    
    return state