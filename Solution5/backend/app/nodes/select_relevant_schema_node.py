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
    relevant_schema = schemaService.get_relevant_schema(database,state["question_embedding"], state["table_embedding"][database])

    # 2. Retrieve relevant schema based on sql examples and related schema
    examples = state["examples"]
    filtered_examples = []
    if examples:
        
        for example in examples:
            # 1. Check if the question has some match in the example questions
            example_embedding = example["question_embedding"]
            isSimilar = schemaService.is_similarity_significant(example_embedding,state["question_embedding"] )
            # 2. If yes, then get the relevant schema for that example question and add the ones that are not already in the relevant schema list
            if isSimilar == True:
                temp = schemaService.get_relevant_schema(database, example["sql_embedding"], state["table_embedding"][database])
                if temp and len(temp) > 0:
                    filtered_examples.append(example)
                    if temp:
                        new_schemas = [schema for schema in temp if schema not in relevant_schema]
                        relevant_schema.extend(new_schemas)
            # 3. If no, then skip that example
            
    # Store filtered examples back in state
    state["examples"] = filtered_examples
    relevant_schema_str =  "\n".join(relevant_schema)
    state["relevant_schema"] = relevant_schema_str
    
    return state