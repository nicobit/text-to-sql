import pyodbc
import db_helper
from nb_logger import NBLogger


logger = NBLogger().Log()


def get_cached_schema():
    """Retrieves and caches database schema (tables & columns)."""
    schema = {}
    try:
        connection_string = db_helper.get_connection_string()
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
        return schema

    except Exception as e:
        logger.error(f"Schema inference failed: {str(e)}")
        return {}