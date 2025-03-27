import logging 
from opencensus.ext.azure.log_exporter import AzureLogHandler
import os
import settings

class NBLogger:
    def __init__(self):
        self.app_insight_connection_string = settings.APPLICATIONINSIGHTS_CONNECTION_STRING
        self.logger = logging.getLogger(__name__)
        self.logger.setLevel(logging.INFO)
        handler = AzureLogHandler(connection_string=f'{self.app_insight_connection_string}')
        self.logger.addHandler(handler)

    def Log(self) -> any :
        return self.logger

    