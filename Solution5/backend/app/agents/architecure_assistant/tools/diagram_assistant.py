from app.agents.conversation_state import ConversationState
from app.agents.core.tool import BaseTool

import tempfile
import subprocess
import os




class DiagramAssitant(BaseTool[ConversationState]):

    result = ""
    def run(self, state: ConversationState) -> ConversationState:
        """
        Run the diagram assistant.
        """
        
        prompt = self.promptManager.create_prompt("diagram_assistant").format()
        self.result = self.call_llm(prompt, state["question"])
        diagram = self.extract_result(self.result, "diagram")
        answer = self.extract_result(self.result, "answer")

        if(not answer):
            answer = "No answer found."

        state["answer"] = answer
        state["mermaid"] = diagram

        return state

    def get_run_updates(self, state: ConversationState) -> dict:
        return {"result":self.result}      
