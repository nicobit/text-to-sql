from text_to_sql.agents.conversation_state import ConversationState
from text_to_sql.agents.tool import BaseTool
from text_to_sql.core.services.search_service import SearchService


class QuestionAndSQLExamplesTool(BaseTool[ConversationState]):

    def run(self, state: ConversationState) -> ConversationState:
        """
        Run the tool to get SQL examples.
        """
        database = state["database"]
        question_embedding = state["question_embedding"]
        retval = SearchService.find_relevant_examples(database,question_embedding)
        state["examples"] = retval
        return state

    def get_run_updates(self, state: ConversationState) -> dict:
        # Placeholder implementation
        return {}