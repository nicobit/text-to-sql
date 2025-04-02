from app.data.conversation_state import ConversationState



def fake_node(state: ConversationState) -> ConversationState:
    state["result"] = "continue"
    return state
