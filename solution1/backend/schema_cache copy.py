import pyodbc
import logging 
from opencensus.ext.azure.log_exporter import AzureLogHandler
import os
from sqlalchemy import create_engine, MetaData
from sqlalchemy.orm import sessionmaker
from azure.identity import ClientSecretCredential
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
    schema = {}
    try:
        logger.info("Called get_cached_schema")
        connection_string = db_helper.get_connection_string()
        # Create SQLAlchemy engine
        engine = create_engine(connection_string)
        metadata = MetaData()

        # Reflect the database schema (get all tables and columns)
        metadata.reflect(bind=engine)

        # Process the schema and store it in the dictionary
        for table_name, table in metadata.tables.items():
            schema[table_name] = [column.name for column in table.columns]

        logger.info("Schema cached successfully.")
        return schema

    except Exception as e:
        logger.error(f"Schema inference failed: {str(e)}")
        return {}