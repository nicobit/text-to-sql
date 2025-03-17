import logging
import os
from sqlalchemy import create_engine, text
from opencensus.ext.azure.log_exporter import AzureLogHandler
import db_helper


# Set up your Application Insights Instrumentation Key
APP_INSIGHT_CONNECTION_STRING = os.getenv("APP_INSIGHT_CONNECTION_STRING")

# Create the logger
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# Add Azure Log Handler to the logger
handler = AzureLogHandler(connection_string=f'{APP_INSIGHT_CONNECTION_STRING}')
logger.addHandler(handler)

# connection_string = "mssql+pyodbc://username:password@server/database?driver=ODBC+Driver+17+for+SQL+Server"
#                      mssql+pyodbc://<username>:<password>@<server>/<database>?driver=ODBC+Driver+17+for+SQL+Server&Authentication=ActiveDirectoryPassword
def execute_sql_query(sql_query):
    """Executes a SQL query against Azure SQL Database and returns the results."""
    try:
        logger.info(f"Executing SQL query: {sql_query}")

        connection_string = db_helper.get_connection_string()
        # Create SQLAlchemy engine
        engine = create_engine(connection_string)

        # Connect to the database and execute the query
        with engine.connect() as conn:
            # Use SQLAlchemy's text() function to handle the SQL query
            result = conn.execute(text(sql_query))

            # Fetch columns and rows from the result set
            columns = result.keys()
            rows = result.fetchall()

            # Convert rows into a list of dictionaries
            results = [dict(zip(columns, row)) for row in rows]

        logger.info("SQL query executed successfully.")
        return results

    except Exception as e:
        logger.error(f"Exception in execute_sql_query: {str(e)}")
        raise