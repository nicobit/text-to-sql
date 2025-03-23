import logging 
from opencensus.ext.azure.log_exporter import AzureLogHandler
import os

class NBLogger:
    def __init__(self):
        self.app_insight_connection_string = os.getenv("APP_INSIGHT_CONNECTION_STRING")
        self.logger = logging.getLogger(__name__)
        self.logger.setLevel(logging.INFO)
        handler = AzureLogHandler(connection_string=f'{self.app_insight_connection_string}')
        self.logger.addHandler(handler)

    def Log(self) -> any :
        return self.logger

    