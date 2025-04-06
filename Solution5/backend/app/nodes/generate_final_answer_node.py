from app.data.conversation_state import ConversationState
from app.services.openai_service import generate_answer
import tiktoken
from app.utils.nb_logger import NBLogger

logger = NBLogger().Log()


def generate_final_answer_node(state: ConversationState) -> ConversationState:
    """
    Generate final answer based on query result.
    """
    history = state["history"] 
    user_question = history[-1].content
    query_result = state["query_result"] 

    token_count = count_tokens(str(query_result))

    logger.info(f"Token count for query result: {token_count}")
    if token_count > 1100:
        answer = str("The result is too large to display. Please refine your question.")
    else:
        answer = generate_answer(user_question, query_result)
        
    state["answer"] = answer
    
    return state


def count_tokens(text, model_name='gpt-3.5-turbo'):
    encoding = tiktoken.encoding_for_model(model_name)
    return len(encoding.encode(text))