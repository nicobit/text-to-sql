import os
import asyncio
import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import semantic_kernel as sk
from semantic_kernel.connectors.ai.open_ai import OpenAIChatCompletion, AzureChatCompletion, OpenAITextEmbedding, AzureTextEmbedding
from semantic_kernel.connectors.memory.azure_cognitive_search import AzureCognitiveSearchMemoryStore
from skills import agent_invoker
from agent_registry_client import AgentRegistryClient

# Configure logging
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()
logging.basicConfig(level=LOG_LEVEL,
                    format="%(asctime)s [%(levelname)s] %(name)s - %(message)s")
logger = logging.getLogger("orchestrator")

app = FastAPI(title="AI Orchestrator Service", version="1.0.0")

# Allow cross-origin requests (useful if the orchestrator is accessed from web frontends)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    user_id: str
    message: str

class ChatResponse(BaseModel):
    user_id: str
    answer: str

# Global orchestrator kernel and registry client instances
kernel: sk.Kernel = None
registry_client: AgentRegistryClient = None

@app.on_event("startup")
async def startup_event():
    """Initialize Semantic Kernel, memory store, and agent registry client on service startup."""
    global kernel, registry_client

    # Load agent registry configuration
    registry_url = os.getenv("AGENT_REGISTRY_URL")
    if not registry_url:
        logger.error("AGENT_REGISTRY_URL not set. Cannot initialize Agent Registry client.")
        raise RuntimeError("Agent registry URL must be provided in AGENT_REGISTRY_URL")

    # Initialize the Agent Registry client and fetch agents
    registry_client = AgentRegistryClient(registry_url=registry_url)
    try:
        registry_client.load_agents()
    except Exception as e:
        logger.error(f"Failed to load agents from registry: {e}")
        # Abort startup if registry is unavailable (can't route requests without it)
        raise

    logger.info(f"Loaded {len(registry_client.agents_by_capability)} capabilities from Agent Registry.")

    # Initialize Semantic Kernel and register AI services
    kernel = sk.Kernel()

    # Configure chat completion service (Azure OpenAI or OpenAI)
    azure_endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
    azure_api_key = os.getenv("AZURE_OPENAI_API_KEY")
    azure_deployment = os.getenv("AZURE_OPENAI_CHAT_DEPLOYMENT")
    if azure_endpoint and azure_api_key and azure_deployment:
        logger.info("Configuring Azure OpenAI chat service")
        chat_service = AzureChatCompletion(deployment_name=azure_deployment,
                                          endpoint=azure_endpoint,
                                          api_key=azure_api_key)
        kernel.add_chat_service("azure-chat", chat_service)
    else:
        openai_api_key = os.getenv("OPENAI_API_KEY")
        openai_chat_model = os.getenv("OPENAI_CHAT_MODEL", "gpt-3.5-turbo")
        if not openai_api_key:
            logger.error("No Azure OpenAI or OpenAI configuration found for chat service.")
            raise RuntimeError("LLM configuration missing for orchestrator.")
        logger.info("Configuring OpenAI chat service")
        chat_service = OpenAIChatCompletion(model_id=openai_chat_model, api_key=openai_api_key)
        kernel.add_chat_service("openai-chat", chat_service)

    # Configure embedding generation service for memory (Azure OpenAI or OpenAI)
    embed_added = False
    if azure_endpoint and azure_api_key and os.getenv("AZURE_OPENAI_EMBED_DEPLOYMENT"):
        embed_deployment = os.getenv("AZURE_OPENAI_EMBED_DEPLOYMENT")
        try:
            logger.info("Configuring Azure OpenAI embedding service")
            embed_service = AzureTextEmbedding(deployment_name=embed_deployment,
                                               endpoint=azure_endpoint,
                                               api_key=azure_api_key)
            kernel.add_text_embedding_generation_service("azure-embed", embed_service)
            embed_added = True
        except Exception as e:
            logger.error(f"Azure embedding service error: {e}")
    if not embed_added:
        openai_embed_model = os.getenv("OPENAI_EMBED_MODEL", "text-embedding-ada-002")
        openai_api_key = os.getenv("OPENAI_API_KEY")
        if openai_api_key:
            logger.info("Configuring OpenAI embedding service")
            embed_service = OpenAITextEmbedding(model_id=openai_embed_model, api_key=openai_api_key)
            kernel.add_text_embedding_generation_service("openai-embed", embed_service)
            embed_added = True
    if not embed_added:
        logger.error("No embedding model configured for memory.")
        raise RuntimeError("Embedding model configuration missing for orchestrator.")

    # Initialize Azure Cognitive Search memory store for long-term memory
    search_endpoint = os.getenv("AZURE_SEARCH_ENDPOINT")
    search_key = os.getenv("AZURE_SEARCH_ADMIN_KEY")
    vector_size = int(os.getenv("EMBEDDING_VECTOR_SIZE", "1536"))
    if not search_endpoint or not search_key:
        logger.error("Azure Cognitive Search endpoint or key not provided.")
        raise RuntimeError("Azure Cognitive Search configuration missing.")
    try:
        memory_store = AzureCognitiveSearchMemoryStore(
            vector_size=vector_size,
            search_endpoint=search_endpoint,
            admin_key=search_key
        )
    except Exception as e:
        logger.error(f"Failed to initialize Azure Cognitive Search memory store: {e}")
        raise

    # Register the memory store with the kernel's Semantic Memory
    kernel.register_memory_store(memory_store=memory_store)
    logger.info("Memory store registered with Semantic Kernel.")

    # Register AgentInvoker plugin (skill for invoking agents)
    memory_sharing = os.getenv("MEMORY_SHARING", "false").lower() == "true"
    invoker_plugin = agent_invoker.AgentInvokerPlugin(registry_client, memory_sharing=memory_sharing)
    kernel.add_plugin(invoker_plugin, plugin_name="AgentInvoker")
    logger.info(f"AgentInvoker plugin added (memory_sharing={memory_sharing}).")

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """
    Handle a chat message from a user and return the orchestrator's response.
    """
    if kernel is None or registry_client is None:
        logger.error("Service not initialized properly.")
        raise HTTPException(status_code=500, detail="Service not initialized.")

    user_id = request.user_id
    user_message = request.message
    logger.info(f"Received message from user {user_id}: {user_message}")

    # Retrieve relevant context from Semantic Kernel memory (vector search in Azure Cognitive Search)
    relevant_context = []
    try:
        if kernel.memory is not None:
            results = await kernel.memory.search_async(collection=user_id, query=user_message, limit=5)
            for item in results:
                text = item.text if hasattr(item, "text") else (str(item) if item else "")
                if text:
                    relevant_context.append(text)
    except Exception as mem_err:
        logger.error(f"Memory search error for user {user_id}: {mem_err}")

    # Construct a system prompt with retrieved context (for LLM to use as additional knowledge)
    system_prompt = ""
    if relevant_context:
        context_text = "\n".join(relevant_context)
        system_prompt = f"Relevant previous information:\n{context_text}\n\n"
    full_prompt = system_prompt + user_message

    # Execute the AI pipeline using Semantic Kernel (with function calling for agent invocation)
    try:
        context_vars = sk.ContextVariables()
        context_vars["userInput"] = full_prompt
        context_vars["user_id"] = user_id  # pass user_id into SK context for plugin use
        result = await kernel.run_async(input_vars=context_vars)
        answer_text = str(result)
        # Store the user message and assistant answer into long-term memory (for future recall)
        try:
            if kernel.memory is not None:
                await kernel.memory.save_information_async(collection=user_id, text=user_message,
                                                          id=f"{user_id}:user:{asyncio.get_event_loop().time()}")
                await kernel.memory.save_information_async(collection=user_id, text=answer_text,
                                                          id=f"{user_id}:assistant:{asyncio.get_event_loop().time()}")
        except Exception as save_err:
            logger.error(f"Memory save error for user {user_id}: {save_err}")
    except Exception as e:
        logger.exception(f"Error processing message for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal error during processing.")

    logger.info(f"Responding to user {user_id}: {answer_text}")
    return ChatResponse(user_id=user_id, answer=answer_text)
