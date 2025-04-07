from app.data.conversation_state import ConversationState

from app.utils.nb_logger import NBLogger
from app.services.openai_service import chat
import re
from app.services.openai_service import get_embedding

logger = NBLogger().Log()


_CONTEXT_SELECTOR_SYSTEM_PROMPT = (
    "You are an agent that decides if a user request needs a SQL database query. "
    "Respond with 'IT-ENGINEER' if the user's message is asking for information of the structure for the database , "
    "or 'BUSINESS' if it is another question asking for information of the content in the database. "
    "or 'OTHER' if it is greeting or other non-query related message."
    "Answer with only the single word IT-ENGINEER, BUSINESS or OTHER."
)

# System prompt instructing the model how to classify
_REWRITER_PROMPT = (
    "You are a business communication assistant. Your task is to review the following user question to determine if it is clear, specific, and unambiguous. If you find any vague or unclear parts, please provide a revised version that clarifies the request. Otherwise, if the question is already clear and complete, simply return the original question exactly as it was provided."
    "Business Question: {user_question}"
    "Response:"
    

)

def chat_agent(state: ConversationState) -> ConversationState:
     
     # 1. Rewrite question so to be undestood by LLM

    history = state["history"]
    user_question = history[-1].content
    rewrite_prompt_messages = [
        {"role": "user", "content": _REWRITER_PROMPT.format(user_question=user_question)}
        
    ]
    new_question = chat(rewrite_prompt_messages)
    logger.info(f"Rewritten question: {new_question}")

    final_question = extract_question(new_question)
    if(final_question == ""):
        # The system is asking more info to clarify the question
        state["answer"] = str(new_question)
        state["command"] = str("CLARIFY")
        return state
    else:
        history[-1].content = final_question
        state["answer"] = str("Question not supported.")
        state["history"] = history
        state["question_embedding"] = get_embedding(final_question)
        context_selector_messages  = [
            {"role": "system", "content": _CONTEXT_SELECTOR_SYSTEM_PROMPT},
            {"role": "user", "content": new_question}
        ]
        context = chat(context_selector_messages)
        logger.info(f"Context: {context}")

        state["command"] = context


        return state

def extract_question(llm_response):
    if "Revised Question:" in llm_response:
        # Extract the revised question after 'Revised Question:'
        revised_question = llm_response.split("Revised Question:")[1].strip()
        return revised_question
    else:
        # Extract the original question from within quotes
        match = re.search(r'"([^"]+)"', llm_response)
        if match:
            original_question = match.group(1)
            return original_question
        else:
            return "" #llm_response.strip()  # Return the entire response if no specific question is found
            #raise ValueError("No question found in the response.")