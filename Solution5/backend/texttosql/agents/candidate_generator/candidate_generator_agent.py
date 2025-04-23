from texttosql.agents.conversation_state import ConversationState

from texttosql.agents.core.agent import AgentBase
from texttosql.agents.candidate_generator.tools.devide_and_conquer import DevideAndConquer
from texttosql.agents.candidate_generator.tools.executor_planner import ExecutorPlanner
from texttosql.agents.candidate_generator.tools.generate_sql_node_simple import GenerateSQLSimple
from texttosql.agents.candidate_generator.tools.candidate_generator_tool import CandidateGeneratorTool




class CandidateGeneratorAgent(AgentBase[ConversationState]):
    def __init__(self):
        name = "Candidate Generator Agent"  # Fixed name
        description = "Generate the candidate sql query"  # Fixed description
        super().__init__(name, description)
        
        #self.register_tool("Devide And Conquer", DevideAndConquer())
        #self.register_tool("Executor Planner", ExecutorPlanner())
        #self.register_tool("Generate SQL Node Simple", GenerateSQLSimple())
        self.register_tool("Candidate Generator Tool", CandidateGeneratorTool())


    def get_run_updates(self, state: ConversationState) -> dict:
        
        return {}
        