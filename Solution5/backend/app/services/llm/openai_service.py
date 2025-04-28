
from openai import AzureOpenAI
from app.settings import OPENAI_KEY_SECRET_NAME,EMBEDDING_MODEL,COMPLETION_MODEL,OPENAI_ENDPOINT_SECRET_NAME, OPENAI_VERSION_SECRET_NAME, KEY_VAULT_CORE_URI
from app.utils.nb_logger import NBLogger
from app.services.secret_service import SecretService

class OpenAIService:
    
    logger = NBLogger().Log()
    openai_key = SecretService.get_secret_value(KEY_VAULT_CORE_URI, OPENAI_KEY_SECRET_NAME)
    openai_endpoint = SecretService.get_secret_value(KEY_VAULT_CORE_URI, OPENAI_ENDPOINT_SECRET_NAME)
    openai_version = SecretService.get_secret_value(KEY_VAULT_CORE_URI, OPENAI_VERSION_SECRET_NAME)
    client = AzureOpenAI(
        api_key=openai_key,
        azure_endpoint=openai_endpoint,
        api_version=openai_version,
    )

    @classmethod
    def get_embedding(cls,text: str, model = EMBEDDING_MODEL) -> list:
        """Get the embedding vector for the given text using OpenAI."""
        response = cls.client.embeddings.create(input=text, model=model)
        embedding = response.data[0].embedding
        return embedding

    @classmethod
    def chat(cls, messages: str, model = COMPLETION_MODEL, max_tokens=150, temperature= 0) -> str:
        """Generate a response using GPT-4 from the given prompt."""
        response = cls.client.chat.completions.create(
            model=model,
            messages=messages,
            max_tokens=max_tokens,
            temperature=temperature,  # Deterministic output
        )
        retval = response.choices[0].message.content.strip()
        return retval