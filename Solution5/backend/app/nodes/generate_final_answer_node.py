from app.data.conversation_state import ConversationState
from app.services.openai_service import generate_answer


def generate_final_answer_node(state: ConversationState) -> ConversationState:
    """
    Generate final answer based on query result.
    """
    history = state["history"] 
    user_question = history[-1].content
    query_result = state["query_result"] 
    answer = generate_answer(user_question, query_result)
    state["answer"] = answer
    
    return state