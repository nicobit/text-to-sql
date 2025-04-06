from langgraph.types import Command
from nltosql_chat.utils.openai_client import OpenAIClient
from nltosql_chat.agents.conversation_state import ConversationState
from app.utils.nb_logger import NBLogger

logger = NBLogger().Log()

# System prompt instructing the model how to classify
_SELECTOR_SYSTEM_PROMPT = (
    "You are an agent that decides if a user request needs a SQL database query. "
    "Respond with 'DB_STRUCTURE' if the user's message is asking for information of the structure for the database (requires a query), "
    "or 'CONTINUE' if it is another question asking for information "
    "or 'OTHER' if it is greeting or other non-query related message."
    "Answer with only the single word DB_STRUCTURE, CONTINUE or OTHER."
)


def select_action(state: ConversationState) -> ConversationState:
    """Use Azure OpenAI to classify user_message as 'DB_STRUCTURE' or 'OTHER'. Returns a LangGraph Command for routing."""
    # Prepare the messages for the OpenAI chat completion
    user_message = state["question"]
    # Log the user message for debugging
    logger.info(f"Classifying user message: {user_message}")
    messages = [
        {"role": "system", "content": _SELECTOR_SYSTEM_PROMPT},
        {"role": "user", "content": user_message}
    ]

    # Example usage:
    client = OpenAIClient.get_client()
    response = client.chat.completions.create(
        model= OpenAIClient.get_completion_model(),
        messages=messages,
        temperature=0  # deterministic classification
    )
    decision = response.choices[0].message.content.strip()
    # Expecting the decision to be either 'DB_STRUCTURE', "CONTINUE" or 'OTHER'
    state["command"] = decision  # Store the decision in the state for later use
    
    return state