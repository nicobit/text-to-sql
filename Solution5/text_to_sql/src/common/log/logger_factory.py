from text_to_sql.core.log.logger_adapter import LoggerAdapter
from text_to_sql.core.log.azure_logger_adapter import AzureLoggerAdapter

class LoggerFactory:
    """Factory class to create loggers based on the provider."""
    @staticmethod
    def create_logger(provider: str, **kwargs) -> LoggerAdapter:
        if provider == "azure":
            return AzureLoggerAdapter(connection_string=kwargs.get("connection_string"))
        else:
            raise ValueError(f"Unsupported logger provider: {provider}")