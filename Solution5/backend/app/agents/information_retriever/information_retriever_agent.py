from app.agents.conversation_state import ConversationState
from app.services.search_service import SearchService


def information_retriever_agent(state: ConversationState) -> ConversationState:
    database = state["database"]
    question_embedding = state["question_embedding"]
    retval = SearchService.find_relevant_examples(database,question_embedding)
    state["examples"] = retval
    return state
