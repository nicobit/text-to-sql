import pyodbc
import logging
from opencensus.ext.azure.log_exporter import AzureLogHandler
import os
import db_helper

# Set up your Application Insights Instrumentation Key
APP_INSIGHT_CONNECTION_STRING = os.getenv("APP_INSIGHT_CONNECTION_STRING")

# Create the logger
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# Add Azure Log Handler to the logger
handler = AzureLogHandler(connection_string=f'{APP_INSIGHT_CONNECTION_STRING}')
logger.addHandler(handler)


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
        logging.info("Schema cached successfully.")
        return schema

    except Exception as e:
        logging.error(f"Schema inference failed: {str(e)}")
        return {}