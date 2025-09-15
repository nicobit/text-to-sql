import logging
from opencensus.ext.azure.log_exporter import AzureLogHandler
from app.settings import APPLICATIONINSIGHTS_CONNECTION_STRING

class NBLogger:
    def __init__(self):
        self.app_insight_connection_string = APPLICATIONINSIGHTS_CONNECTION_STRING
        self.logger = logging.getLogger(__name__)
        self.logger.setLevel(logging.INFO)

        # Azure Application Insights handler
        azure_handler = AzureLogHandler(connection_string=self.app_insight_connection_string)
        self.logger.addHandler(azure_handler)

        # Terminal (console) handler
        console_handler = logging.StreamHandler()
        console_handler.setLevel(logging.INFO)
        formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
        console_handler.setFormatter(formatter)
        self.logger.addHandler(console_handler)

    def Log(self) -> any:
        return self.logger