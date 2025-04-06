
from nltosql_chat.agents.conversation_state import ConversationState, ConversationStateHelper
from app.utils.nb_logger import NBLogger
from nltosql_chat.services.schema_engine import SchemaEngine
from nltosql_chat.services.db_service import DBHelper
from sqlalchemy import create_engine
from langgraph.types import Command
from langgraph.graph import StateGraph, START, END

logger = NBLogger().Log()



def get_schema(state: ConversationState) -> ConversationState:
    """If schema not already in state, fetch and summarize it. Returns updated state."""
    # Check cache in state
    if state.get("schema"):
        return {}  # Schema already known; no update needed
    
    connection_string = DBHelper.getConnectionString("")
    db_engine = create_engine(connection_string)
    db_name = state.get_database_name()

    schema_engine = SchemaEngine(engine=db_engine, db_name=db_name)
    mschema = schema_engine.mschema
    mschema_str = mschema.to_mschema()

    state = ConversationStateHelper.add_assistant_message(state,mschema_str)  

    return Command(goto=END, state=state)
  