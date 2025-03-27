import pyodbc
from db_helper import DBHelper
from nb_logger import NBLogger


logger = NBLogger().Log()


from conversation_state import ConversationState

def node_retrieve_db_schema(state: ConversationState) -> ConversationState:
    """
    Retrieves database schema (tables & columns).
    
    """
    schema = {}
    try:
        connection_string = DBHelper().getConnectionString()
        conn = pyodbc.connect(connection_string)
        cursor = conn.cursor()

        # Get table and column names
        cursor.execute("SELECT ( TABLE_SCHEMA + '.' + TABLE_NAME ) as TABLE_NAME, COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS")
        for table, column in cursor.fetchall():
            if table not in schema:
                schema[table] = []
            schema[table].append(column)

        conn.close()
        logger.info("Schema cached successfully.")
        state["schema"] = schema
        return state

    except Exception as e:
        logger.error(f"Schema inference failed: {str(e)}")
        return state
