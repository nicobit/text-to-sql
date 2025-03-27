import logging 
from opencensus.ext.azure.log_exporter import AzureLogHandler
from app.settings import APPLICATIONINSIGHTS_CONNECTION_STRING


class NBLogger:
    def __init__(self):
        self.app_insight_connection_string = APPLICATIONINSIGHTS_CONNECTION_STRING
        self.logger = logging.getLogger(__name__)
        self.logger.setLevel(logging.INFO)
        handler = AzureLogHandler(connection_string=f'{self.app_insight_connection_string}')
        self.logger.addHandler(handler)

    def Log(self) -> any :
        return self.logger

    