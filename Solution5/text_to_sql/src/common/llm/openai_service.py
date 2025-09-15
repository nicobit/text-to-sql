
from openai import AzureOpenAI

from text_to_sql.core.settings.settings import Settings
from text_to_sql.core.log.logger import Logger
from text_to_sql.core.services.secret.secret_service import SecretService


settings = Settings()

class OpenAIService:
    
    logger = Logger().log()
    openai_key = SecretService.get_secret_value( settings.key_vault_core_uri,settings.openai_key_secret_name)
    openai_endpoint = SecretService.get_secret_value(settings.key_vault_core_uri, settings.openai_endpoint_secret_name)
    openai_version = SecretService.get_secret_value(settings.key_vault_core_uri, settings.openai_version_secret_name)
    client = AzureOpenAI(
        api_key=openai_key,
        azure_endpoint=openai_endpoint,
        api_version=openai_version,
    )

    @classmethod
    def get_embedding(cls,text: str, model = settings.embedding_model) -> list:
        """Get the embedding vector for the given text using OpenAI."""
        response = cls.client.embeddings.create(input=text, model=model)
        embedding = response.data[0].embedding
        return embedding

    @classmethod
    def chat(cls, messages: str, model = settings.completion_model, max_tokens=150, temperature= 0) -> str:
        """Generate a response using GPT-4 from the given prompt."""
        response = cls.client.chat.completions.create(
            model=model,
            messages=messages,
            max_tokens=max_tokens,
            temperature=temperature,  # Deterministic output
        )
        retval = response.choices[0].message.content.strip()
        return retval