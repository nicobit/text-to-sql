
from app.data.conversation_state import ConversationState
from app.services.openai_service import get_embedding
from app.utils.nb_logger import NBLogger

logger = NBLogger().Log()

def embed_user_question_node(state: ConversationState) -> ConversationState:
    """
    Embed the user question.
    """
    logger.info("Embedding user question...")

    history = state["history"]
    user_question = history[-1].content
    state["question_embedding"] = get_embedding(user_question)

    logger.info(f"End Embed User question: {user_question}")
    
    return state