import os

from text_to_sql.core.services.vector_store.vector_store_base import VectorStoreBase
from text_to_sql.core.services.vector_store.azure_ai_search_store import AzureAISearchStore
from text_to_sql.core.settings.settings import Settings
from text_to_sql.core.services.secret.secret_service import SecretService


settings = Settings()




class VectoreStoreFactory:
    """Factory class to create loggers based on the provider."""
    @staticmethod
    def create_vectore_store(provider: str, **kwargs) -> 'VectorStoreBase':
        if provider == "azure_ai_search":
           return AzureAISearchStore(
                endpoint= SecretService.get_secret_value( settings.key_vault_core_uri,settings.search_service_endpoint_secret_name),
                api_key=os.environ["AZURE_SEARCH_KEY"],
                index_name=os.environ["AZURE_SEARCH_INDEX"]
            )
        else:
            raise ValueError(f"Unsupported logger provider: {provider}")