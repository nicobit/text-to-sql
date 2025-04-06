import openai
from openai import AzureOpenAI
from app.settings import OPEN_AI_KEY,EMBEDDING_MODEL,COMPLETION_MODEL,OPENAI_ENDPOINT, OPEN_AI_VERSION
from app.utils.nb_logger import NBLogger

logger = NBLogger().Log()  

openai.api_key = OPEN_AI_KEY


class OpenAIClient:
    @staticmethod
    def get_client():
        return AzureOpenAI(
            api_key=OPEN_AI_KEY,
            azure_endpoint=OPENAI_ENDPOINT,
            api_version=OPEN_AI_VERSION,
        )
    
    @staticmethod
    def get_embedding_model() -> str:
        return EMBEDDING_MODEL

    @staticmethod
    def get_completion_model() -> str:
        return COMPLETION_MODEL

