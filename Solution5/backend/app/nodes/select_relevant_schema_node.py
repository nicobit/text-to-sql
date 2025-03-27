from app.data.conversation_state import ConversationState
import app.services.schema_service as schemaService 

#import  get_relevant_schema, initialize_schema_embeddings

def select_relevant_schema_node(state: ConversationState) -> ConversationState:
    """
    Select relevant schema segments based on the user question. 
    """

    table_embedding = state["table_embedding"]
    if not table_embedding:
        result = schemaService.initialize_schema_embeddings()
        state["table_embedding"] = result
    
    relevant_schema = schemaService.get_relevant_schema(state["query_embedding"], state["table_embedding"])
    state["relevant_schema"] = relevant_schema
    
    return state