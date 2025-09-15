import logging

class LoggerAdapter:
    """Base adapter class for loggers."""
    def get_logger(self) -> logging.Logger:
        raise NotImplementedError("Subclasses must implement `get_logger` method.")