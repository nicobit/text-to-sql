
from openai import AzureOpenAI
from app.settings import OPEN_AI_KEY,EMBEDDING_MODEL,COMPLETION_MODEL,OPENAI_ENDPOINT, OPEN_AI_VERSION
from app.utils.nb_logger import NBLogger

class OpenAIService:
    
    logger = NBLogger().Log()
    
    client = AzureOpenAI(
        api_key=OPEN_AI_KEY,
        azure_endpoint=OPENAI_ENDPOINT,
        api_version=OPEN_AI_VERSION,
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