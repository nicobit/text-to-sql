import logging

from text_to_sql.core.log.logger_factory import LoggerFactory
from text_to_sql.core.settings.settings import Settings

settings = Settings()


# Usage example
class Logger:
    def __init__(self, provider: str = "azure"):
        self.logger_adapter = LoggerFactory.create_logger(
            provider,
            connection_string=settings.application_insights_connection_string
        )

    def log(self) -> logging.Logger:
        return self.logger_adapter.get_logger()