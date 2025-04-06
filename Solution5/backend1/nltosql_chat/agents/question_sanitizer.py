from langgraph.types import Command
from nltosql_chat.utils.openai_client import OpenAIClient
from nltosql_chat.agents.conversation_state import ConversationState, ConversationStateHelper
from app.utils.nb_logger import NBLogger

logger = NBLogger().Log()

# System prompt instructing the model how to classify
_SANITIZER_SYSTEM_PROMPT = (
    "You are a business communication assistant. Your task is to review the following business question to determine if it is clear, specific, and unambiguous. If you find any vague or unclear parts, please provide a revised version that clarifies the request. Otherwise, if the question is already clear and complete, simply return the original question exactly as it was provided."
    "Business Question: {user_question}"
)


def sanitize_question(state: ConversationState) -> ConversationState:
    """Use OpenAI to clarify the question so that can be understood."""
    # Prepare the messages for the OpenAI chat completion
    user_message = state["question"]
    logger.info(f"Sanitizing question: {user_message}")
    messages = [
        {"role": "system", "content": _SANITIZER_SYSTEM_PROMPT },
        {"role": "user", "content": user_message}
    ]

    # Example usage:
    client = OpenAIClient.get_client()
    model = OpenAIClient.get_completion_model()
    logger.info(f"Using model: {model}")
    logger.info(f"Using engine: {OpenAIClient.get_completion_mode()}")
    response = client.chat.completions.create(
        model= model,
        messages=messages,
        temperature=0  # deterministic classification
    )
    result = response.choices[0].message.content.strip()

    state = ConversationStateHelper.add_assistant_message(state,result)  # Store the sanitized question in the state for later use
    
    state["question"] = result # Store the sanitized question in the state for later use
    
    logger.info(f"Sanitized question: {result}")
    return state