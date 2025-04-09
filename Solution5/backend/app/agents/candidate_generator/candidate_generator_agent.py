import app.services.schema_service as schemaService 
from app.utils.nb_logger import NBLogger
from app.agents.conversation_state import ConversationState
from app.services.openai_service import chat
from app.settings import ROWS_LIMIT
import re
from app.services.db_service import DBHelper
from app.agents.agent import Agent

logger = NBLogger().Log()

class CandidateGeneratorAgent(Agent):
    def __init__(self, state: ConversationState):
        super().__init__(state) 

    def run(self) -> ConversationState:
        return candidate_generator_agent(self.state)


#  CANDIDATE GENERATION
def candidate_generator_agent(state: ConversationState) -> ConversationState:
    db_schema = state['relevant_schema']
    examples = state['examples']
    history = state['history']
    database_name = state['database']
    user_question = history[-1].content

    #  DEVIDE AND CONQUER STRATEGY
    # ----------------------------------------
    # Step 1: Decompose the question
    sub_questions = decompose_question(examples, db_schema, user_question)

    #Step 2: Generate partial SQL queries
    partial_sqls = generate_partial_sql(examples, db_schema, user_question, sub_questions)

    # Step 3: Assemble the final SQL query
    final_sql = assemble_final_query(examples, db_schema, user_question, sub_questions, partial_sqls)

    logger.warning(f"Final SQL query: {final_sql}")
    sql_query = ""
    queries = extract_sql_queries(final_sql)

    if queries:
        sql_query = queries[0]
        state["sql_query"] = sql_query
        state["chart_type"] = "bar"  # Placeholder for chart type, can be improved
        state["command"] = "CONTINUE"
    else:
        state["command"] = "NO-QUERY"
       
    # EVALUATE QUERY PLANNER
    # ----------------------------------------
    # Check if the SQL query is valid and get the query plan description
    logger.warning(f"Evaluating SQL query: {sql_query}")
    test = DBHelper.test(database_name, sql_query,db_schema)
    ms = messages = [{"role":"assistant", "content": test}]
    r1 = chat(ms)
    logger.warning(f"Alternative Query: {r1}")
    return state

def extract_sql_queries(text):
    queries = []
    
    # Pattern for SQL queries inside fenced code blocks: ```sql ... ```
    code_block_pattern = r"```sql\s*([\s\S]*?)\s*```"
    code_block_matches = re.findall(code_block_pattern, text, flags=re.IGNORECASE)
    queries.extend(match.strip() for match in code_block_matches if match.strip())
    
    # Pattern for SQL queries that might be inline after a numbered item (e.g. "3.  select * from products")
    inline_pattern = r"^\s*\d+\.\s*(select[\s\S]*?)(?=\n\d+\.|\Z)"
    inline_matches = re.findall(inline_pattern, text, flags=re.IGNORECASE | re.MULTILINE)
    queries.extend(match.strip() for match in inline_matches if match.strip())
    
    return queries


def decompose_question(examples, db_schema, user_question):

    
    examples_str = get_example_str(examples)
    logger.info(f"Examples: {examples}")
    prompt = f"Given the database schema: \n {db_schema}\n\n"
    prompt += f"Decompose the following question into simpler sub-questions:\n{user_question}\n"
    prompt += f"Examples:\n" + examples_str + "\n\n"
    prompt += f"Sub-questions:"

    messages = [{"role":"assistant", "content": prompt}]
    response = chat(messages)
    sub_questions = response.split('\n')
    logger.warning(f"Sub-questions: {sub_questions}")
    return [sq.strip() for sq in sub_questions if sq.strip()]

def get_example_str(examples):
    retval =  "\n".join(f"{example['question']}: {example['sql']}" for example in examples if isinstance(example, dict) and 'question' in example and 'sql' in example)
    return retval


def generate_partial_sql(examples, db_schema, user_question, sub_questions):
    partial_sqls = []
    examples_str = get_example_str(examples)
    for i, sub_question in enumerate(sub_questions):
        context = " ".join(f"Q{i+1}: {sq} SQL{i+1}: {sql}" for i, (sq, sql) in enumerate(zip(sub_questions[:i], partial_sqls)))
        prompt = f"Given the database schema: {db_schema}\n"
        prompt += f"User question: {user_question}\n"
        prompt += f"Sub-question {i+1}: {sub_question}\n"
        prompt += f"Context: {context}\n"
        prompt += f"Examples:\n" + examples_str + "\n\n"
        prompt += "Provide the SQL query for the sub-question:"
        messages = [{"role":"assistant", "content": prompt}]
        response = chat(messages)
        partial_sql = response.strip()
        partial_sqls.append(partial_sql)
    return partial_sqls

def assemble_final_query( examples, db_schema, user_question, sub_questions, partial_sqls):
    examples_str = get_example_str(examples)
    prompt = f"Given the database schema: {db_schema}\n"
    prompt += f"Examples:\n" + examples_str + "\n\n"
    prompt += f"User question: {user_question}\n"
    for i, (sub_question, partial_sql) in enumerate(zip(sub_questions, partial_sqls)):
        prompt += f"Sub-question {i+1}: {sub_question}\n"
        prompt += f"SQL {i+1}: {partial_sql}\n"
    prompt += f"Combine the above SQL queries into a final SQL query (include TOP statement to retrieve just {ROWS_LIMIT} rows and return based on the needed fields/columns:  the top must be soon after select) that answers the user question. Do not include any additional explanation or commentary :"
    messages = [{"role":"assistant", "content": prompt}]
    response = chat(messages)
    final_sql = response.strip()
    return final_sql

