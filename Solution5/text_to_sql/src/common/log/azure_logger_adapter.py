
import logging
from opencensus.ext.azure.log_exporter import AzureLogHandler
from text_to_sql.core.log.logger_adapter import LoggerAdapter


class AzureLoggerAdapter(LoggerAdapter):
    """Adapter for Azure Application Insights logging."""
    def __init__(self, connection_string: str):
        self.connection_string = connection_string

    def get_logger(self) -> logging.Logger:
        logger = logging.getLogger("AzureLogger")
        logger.setLevel(logging.INFO)
        handler = AzureLogHandler(connection_string=self.connection_string)
        logger.addHandler(handler)
        return logger