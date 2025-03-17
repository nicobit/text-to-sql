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


def execute_sql_query(sql_query):
    """Executes a SQL query against Azure SQL Database and returns the results."""
    try:
        connection_string = db_helper.get_connection_string()
        conn = pyodbc.connect(connection_string)
        cursor = conn.cursor()
        cursor.execute(sql_query)
        columns = [column[0] for column in cursor.description]
        rows = cursor.fetchall()
        conn.close()

        results = [dict(zip(columns, row)) for row in rows]
        return results

    except Exception as e:
        
        raise