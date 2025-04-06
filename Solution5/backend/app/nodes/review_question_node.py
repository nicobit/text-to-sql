
from app.data.conversation_state import ConversationState
from app.services.openai_service import get_embedding
from app.utils.nb_logger import NBLogger

logger = NBLogger().Log()

def review_question_node(state: ConversationState) -> ConversationState:
    """
    Embed the user question.
    """
    
    history = state["history"]
    user_question = history[-1].content
    state["question_embedding"] = get_embedding(user_question)

    
    return state