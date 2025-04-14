from app.agents.conversation_state import ConversationState

from app.agents.core.agent import AgentBase
from app.agents.chat.tools.rewrite_question_tool import RewriteQuestion
from app.agents.chat.tools.context_selector import ContextSelector


class ChatAgent(AgentBase[ConversationState]):
    def __init__(self):
        name = "Chat Agent"  # Fixed name
        description = "Orchestrate the question from the user"  # Fixed description
        super().__init__(name, description)
        self.register_tool("Rewrite Question", RewriteQuestion())
        self.register_tool("Context Selector", ContextSelector())

    def get_run_updates(self, state: ConversationState) -> dict:
        
        return {}


    
