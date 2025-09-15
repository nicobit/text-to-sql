import os
import asyncio
import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import semantic_kernel as sk
from semantic_kernel.connectors.ai.open_ai import (
    OpenAIChatCompletion,
    AzureChatCompletion,
    OpenAITextEmbedding,
    AzureTextEmbedding,
)
from semantic_kernel.connectors.memory.azure_cognitive_search import AzureCognitiveSearchMemoryStore
from semantic_kernel.memory.semantic_text_memory import SemanticTextMemory
from skills import agent_invoker, mcp_plugin
from agent_registry_client import AgentRegistryClient
from memory.memory_utils import summarize_context
from semantic_kernel.planners.sequential_planner import SequentialPlanner
from memory.azure_chat_memory_manager import AzureChatMemoryManager

# Configure logging
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()
logging.basicConfig(
    level=LOG_LEVEL,
    format="%(asctime)s [%(levelname)s] %(name)s - %(message)s"
)
logger = logging.getLogger("orchestrator")

# Initialize FastAPI app
app = FastAPI(title="AI Orchestrator Service", version="1.0.0")

# Allow cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request and response models
class ChatRequest(BaseModel):
    user_id: str
    message: str
    use_planner: bool | None = None

class ChatResponse(BaseModel):
    user_id: str
    answer: str

# Global variables
kernel: sk.Kernel = None
semantic_memory: SemanticTextMemory = None
memory_manager: AzureChatMemoryManager = None
planner = None
registry_client: AgentRegistryClient = None
mcp_plugin_instance = None

# Configuration flags and environment variables
USE_PLANNER = os.getenv("USE_PLANNER", "false").lower() == "true"
AZURE_SEARCH_CONVERSION_INDEX = os.getenv("AZURE_SEARCH_CONVERSION_INDEX", "conversion-index")
AZURE_OPENAI_API_VERSION = os.getenv("AZURE_OPENAI_API_VERSION", "2025-01-01-preview")
AZURE_OPENAI_EMBEDDING_API_VERSION = os.getenv("AZURE_OPENAI_EMBEDDING_API_VERSION", "2023-05-15")

# Utility class for services with IDs
class ServiceWithId:
    def __init__(self, service, service_id):
        self._service = service
        self.service_id = service_id

    def __getattr__(self, name):
        return getattr(self._service, name)

# Shutdown event handler
@app.on_event("shutdown")
async def on_shutdown():
    global mcp_plugin_instance
    await mcp_plugin_instance.async_shutdown()

# Startup event handler
@app.on_event("startup")
async def startup_event():
    """
    Initialize Semantic Kernel, memory store, and agent registry client on service startup.
    """
    global kernel, registry_client, planner, semantic_memory, memory_manager, mcp_plugin_instance

    # Load agent registry configuration
    registry_url = os.getenv("AGENT_REGISTRY_LIST_URL")
    if not registry_url:
        logger.error("AGENT_REGISTRY_URL not set. Cannot initialize Agent Registry client.")
        raise RuntimeError("Agent registry URL must be provided in AGENT_REGISTRY_URL")

    # Initialize the Agent Registry client
    logger.info(f"Agent Registry URL: {registry_url}")
    registry_client = AgentRegistryClient(registry_url=registry_url)
    try:
        registry_client.load_agents()
        logger.info(f"Loaded {len(registry_client.agents_by_capability)} capabilities from Agent Registry.")
    except Exception as e:
        logger.error(f"Failed to load agents from registry: {e}")
        raise

    # Initialize Semantic Kernel
    kernel = sk.Kernel()

    # Configure chat completion service (Azure OpenAI or OpenAI)
    azure_endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
    azure_api_key = os.getenv("AZURE_OPENAI_API_KEY")
    azure_deployment = os.getenv("AZURE_OPENAI_CHAT_DEPLOYMENT")

    if azure_endpoint and azure_api_key and azure_deployment:
        logger.info("Configuring Azure OpenAI chat service")
        chat_service = AzureChatCompletion(
            service_id="orchestrator",
            deployment_name=azure_deployment,
            endpoint=azure_endpoint,
            api_version=AZURE_OPENAI_API_VERSION,
            api_key=azure_api_key
        )
        kernel.add_service(chat_service)
    else:
        openai_api_key = os.getenv("OPENAI_API_KEY")
        openai_chat_model = os.getenv("OPENAI_CHAT_MODEL", "gpt-3.5-turbo")
        if not openai_api_key:
            logger.error("No Azure OpenAI or OpenAI configuration found for chat service.")
            raise RuntimeError("LLM configuration missing for orchestrator.")
        logger.info("Configuring OpenAI chat service")
        chat_service = OpenAIChatCompletion(ai_model_id=openai_chat_model, api_key=openai_api_key)
        kernel.add_service(chat_service)

    # Configure embedding generation service for memory
    embed_service = None
    if azure_endpoint and azure_api_key and os.getenv("AZURE_OPENAI_EMBED_DEPLOYMENT"):
        embed_deployment = os.getenv("AZURE_OPENAI_EMBED_DEPLOYMENT")
        logger.info("Configuring Azure OpenAI embedding service")
        embed_service = AzureTextEmbedding(
            deployment_name=embed_deployment,
            endpoint=azure_endpoint,
            api_key=azure_api_key,
            api_version=AZURE_OPENAI_EMBEDDING_API_VERSION
        )
        kernel.add_service(embed_service)
    else:
        openai_embed_model = os.getenv("OPENAI_EMBED_MODEL", "text-embedding-ada-002")
        openai_api_key = os.getenv("OPENAI_API_KEY")
        if openai_api_key:
            logger.info("Configuring OpenAI embedding service")
            embed_service = OpenAITextEmbedding(ai_model_id=openai_embed_model, api_key=openai_api_key)
            kernel.add_service(embed_service)
        else:
            logger.error("No embedding model configured for memory.")
            raise RuntimeError("Embedding model configuration missing for orchestrator.")

    # Initialize Azure Cognitive Search memory store
    search_endpoint = os.getenv("AZURE_SEARCH_ENDPOINT_A")
    search_key = os.getenv("AZURE_SEARCH_ADMIN_KEY")
    vector_size = int(os.getenv("EMBEDDING_VECTOR_SIZE", "1536"))

    if not search_endpoint or not search_key:
        logger.error("Azure Cognitive Search endpoint or key not provided.")
        raise RuntimeError("Azure Cognitive Search configuration missing.")
    try:
        memory_manager = AzureChatMemoryManager(
            endpoint=search_endpoint,
            admin_key=search_key,
            index_name=AZURE_SEARCH_CONVERSION_INDEX,
            text_embedding=embed_service,
            vector_dim=vector_size
        )
        logger.info("Azure Search memory store initialized.")
    except Exception as e:
        logger.error(f"Failed to initialize Azure Cognitive Search memory store: {e}")
        raise

    # Register AgentInvoker plugin
    memory_sharing = os.getenv("MEMORY_SHARING", "false").lower() == "true"
    invoker_plugin = agent_invoker.AgentInvokerPlugin(registry_client, memory_sharing=memory_sharing)
    logger.info(f"AgentInvoker plugin added (memory_sharing={memory_sharing}).")

    #kernel.add_plugin(invoker_plugin, plugin_name="AgentInvoker")

    # Add MCP Plugin
    mcp_plugin_instance = mcp_plugin.MCPPlugin(kernel)
    kernel.add_plugin(mcp_plugin_instance, plugin_name="MCPPlugin")
    mcp_plugin_instance.async_setup()

    # Initialize planner if enabled
    if USE_PLANNER:
        from semantic_kernel.planners.function_calling_stepwise_planner import FunctionCallingStepwisePlanner
        planner = FunctionCallingStepwisePlanner(service_id="orchestrator")
        logger.info("FunctionCallingStepwisePlanner initialized")

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """
    Handle a chat message from a user and return the orchestrator's response.
    """
    global kernel, registry_client, planner, memory_manager

    if kernel is None or registry_client is None:
        logger.error("Service not initialized properly.")
        raise HTTPException(status_code=500, detail="Service not initialized.")

    user_id = request.user_id
    user_message = request.message
    logger.info(f"Received message from user {user_id}: {user_message}")

    # Retrieve relevant context from memory
    relevant_context = ""
    try:
        if memory_manager is not None:
            results = await memory_manager.search_messages(user_id=user_id, query=user_message, top_k=3)
            relevant_context = summarize_context(results)
    except Exception as mem_err:
        logger.error(f"Memory search error for user {user_id}: {mem_err}")

    # Construct system prompt
    system_prompt = f"Relevant previous information:\n{relevant_context}\n\n" if relevant_context else ""
    full_prompt = system_prompt + user_message

    # Process the message using the planner or manual skill execution
    try:
        if USE_PLANNER:
            logger.info("Using planner to process goal.")
            if not planner:
                raise ValueError("Planner not initialized")
            plugins = kernel.plugins
            available_functions = [
                function for plugin in plugins.values() for function in plugin.functions
            ]
            result = await planner.invoke(
                kernel=kernel,
                question=full_prompt,
                available_functions=available_functions,
                goal=user_message,
                name_delimiter="."
            )
        else:
            logger.info("Using manual skill execution.")
            context_vars = sk.ContextVariables()
            context_vars["userInput"] = full_prompt
            context_vars["user_id"] = user_id
            result = await kernel.run_async(input_vars=context_vars)

        final_answer = result.final_answer if hasattr(result, "final_answer") else "No answer found."

        # Store messages in memory
        try:
            if memory_manager is not None:
                await memory_manager.index_message(
                    user_id=user_id, content=user_message, id=f"{user_id}_user_{str(asyncio.get_event_loop().time()).replace('.', '_')}"
                )
                await memory_manager.index_message(
                    user_id=user_id, content=final_answer, id=f"{user_id}_assistant_{str(asyncio.get_event_loop().time()).replace('.', '_')}",
                )
        except Exception as save_err:
            logger.error(f"Memory save error for user {user_id}: {save_err}")
    except Exception as e:
        logger.exception(f"Error processing message for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal error during processing.")

    logger.info(f"Responding to user {user_id}: {final_answer}")
    return ChatResponse(user_id=user_id, answer=final_answer)
