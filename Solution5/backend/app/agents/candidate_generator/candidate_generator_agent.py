from app.agents.conversation_state import ConversationState

from app.agents.core.agent import AgentBase
from app.agents.candidate_generator.tools.devide_and_conquer import DevideAndConquer
from app.agents.candidate_generator.tools.executor_planner import ExecutorPlanner




class CandidateGeneratorAgent(AgentBase[ConversationState]):
    def __init__(self):
        name = "Candidate Generator Agent"  # Fixed name
        description = "Generate the candidate sql query"  # Fixed description
        super().__init__(name, description)
        
        self.register_tool("Devide And Conquer", DevideAndConquer())
        self.register_tool("Executor Planner", ExecutorPlanner())
        