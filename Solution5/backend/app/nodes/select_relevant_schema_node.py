from app.data.conversation_state import ConversationState
import app.services.schema_service as schemaService 
from app.utils.nb_logger import NBLogger

logger = NBLogger().Log()

#import  get_relevant_schema, initialize_schema_embeddings

def select_relevant_schema_node(state: ConversationState) -> ConversationState:
    """
    Select relevant schema segments based on the user question. 
    """

    table_embedding = state["table_embedding"]
    database = state["database"]
    if not table_embedding:
        state["table_embedding"] = {}
    if database not in table_embedding:
        result = schemaService.initialize_schema_embeddings(database)
        state["table_embedding"][database] = result

    
    # 1. Retrieve relevant schema based on question and related schema
    relevant_schema_1 = schemaService.get_relevant_schema(database,state["question_embedding"], state["table_embedding"][database])

    # 2. Retrieve relevant schema based on sql examples and related schema
    logger.info(f"examples: {state['examples']}")
    examples = [] #state["examples"]
    if examples:
        relevant_schema_2 = []
        for example in examples:
            example_embedding = example["sql_embedding"]
            relevant_schema = schemaService.get_relevant_schema(database, example_embedding, state["table_embedding"][database])
            relevant_schema_2.append(relevant_schema)

    # Merge relevant_schema_1 and relevant_schema_2
    if examples:
        relevant_schema = list(set(relevant_schema_1) | set().union(*relevant_schema_2))
    else:
        relevant_schema = relevant_schema_1
    
    state["relevant_schema"] = relevant_schema
    
    return state