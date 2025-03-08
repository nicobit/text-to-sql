import pyodbc
import logging

def get_cached_schema(connection_string):
    """Retrieves and caches database schema (tables & columns)."""
    schema = {}
    try:
        conn = pyodbc.connect(connection_string)
        cursor = conn.cursor()

        # Get table and column names
        cursor.execute("SELECT ( TABLE_SCHEMA + '.' + TABLE_NAME ) as TABLE_NAME, COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS")
        for table, column in cursor.fetchall():
            if table not in schema:
                schema[table] = []
            schema[table].append(column)

        conn.close()
        logging.info("Schema cached successfully.")
        return schema

    except Exception as e:
        logging.error(f"Schema inference failed: {str(e)}")
        return {}