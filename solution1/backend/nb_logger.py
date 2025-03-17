import logging 
from opencensus.ext.azure.log_exporter import AzureLogHandler
import os


# Set up your Application Insights Instrumentation Key
APP_INSIGHT_CONNECTION_STRING = os.getenv("APP_INSIGHT_CONNECTION_STRING")

# Create the logger
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# Add Azure Log Handler to the logger
handler = AzureLogHandler(connection_string=f'{APP_INSIGHT_CONNECTION_STRING}')
logger.addHandler(handler)