import logging, time
from functools import wraps

def retry_on_exception(retries=3, delay=1):
    def deco(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            for i in range(retries):
                try:
                    return fn(*args, **kwargs)
                except Exception as e:
                    logging.warning(f"Retry {i+1}/{retries} failed: {e}")
                    time.sleep(delay)
                    if i == retries-1:
                        raise
        return wrapper
    return deco