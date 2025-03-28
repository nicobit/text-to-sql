import openai
import json
from azure.storage.blob import BlobServiceClient
from app.settings import BLOB_STORAGE_CONNECTION_STRING
import app.services.openai_service as openai_service
from app.utils.nb_logger import NBLogger

logger = NBLogger().Log()

# Set your OpenAI API key
openai.api_key = "YOUR_OPENAI_API_KEY"

# Azure Blob Storage configuration
AZURE_CONNECTION_STRING = BLOB_STORAGE_CONNECTION_STRING
CONTAINER_NAME = "embeddings"

# In-memory cache for embeddings
embedding_cache = {}

# Initialize Azure Blob Service Client
blob_service_client = BlobServiceClient.from_connection_string(AZURE_CONNECTION_STRING)

def get_key(name,text):
    return f"{name}"

def generate_embedding(text):
    """Generate embedding using OpenAI API."""
    return openai_service.get_embedding(text)
    

def save_embedding_to_blob(name, text, embedding):
    """Save embedding as a JSON file to Azure Blob Storage."""
    key = get_key(name,text)
    blob_name = f"{key}.json"
    blob_client = blob_service_client.get_blob_client(container=CONTAINER_NAME, blob=blob_name)
    data = {
        "text_representation": text,
        "embedding": embedding
    }
    blob_client.upload_blob(json.dumps(data), overwrite=True)
    print(f"Embedding saved to Azure Blob: {blob_name}")

def get_embedding_from_blob(name:str,text:str):
    """Try to retrieve the embedding from Azure Blob Storage."""
    key = get_key(name,text)
    blob_name = f"{key}.json"
    logger.warning(f"Trying to retrieve embedding from Azure Blob: {blob_name}")
    blob_client = blob_service_client.get_blob_client(container=CONTAINER_NAME, blob=blob_name)
    try:
        blob_data = blob_client.download_blob().readall()
        data = json.loads(blob_data)
        print(f"Embedding retrieved from Azure Blob: {blob_name}")
        return data['embedding']
    except Exception as e:
        logger.warning(f"Embedding not found in blob storage:{blob_name}")
        print(f"Embedding not found in blob storage: {blob_name} {e}")
        return None

def get_or_generate_embedding(name:str,text:str):
    """Retrieve from cache, then from blob, or generate a new embedding."""
    # Check in-memory cache first
    if text in embedding_cache:
        print("Embedding found in memory cache.")
        return embedding_cache[text]
    
    # Check Azure Blob Storage
    embedding = get_embedding_from_blob(name,text)
    if embedding is not None:
        embedding_cache[text] = embedding
        return embedding
    
    # Generate a new embedding using OpenAI
    print("Generating new embedding using OpenAI...")
    embedding = generate_embedding(text)
    embedding_cache[text] = embedding

    # Save to Azure Blob Storage for future use
    save_embedding_to_blob(name,text, embedding)
    return embedding