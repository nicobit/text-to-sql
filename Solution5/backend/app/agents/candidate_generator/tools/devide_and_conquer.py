from app.agents.conversation_state import ConversationState
from app.agents.core.tool import BaseTool
from app.settings import ROWS_LIMIT



class DevideAndConquer(BaseTool[ConversationState]):
    """
    Use Devide and Conquer to generate the sql query to answer the question.
    """
   
    def run(self, state: ConversationState) -> ConversationState:

        db_schema = state['relevant_schema']
        examples = state['examples']
        history = state['history']
        database_name = state['database']
        user_question = history[-1].content

        #  DEVIDE AND CONQUER STRATEGY
        # ----------------------------------------
        # Step 1: Decompose the question
        sub_questions = self.decompose_question(examples, db_schema, user_question)

        #Step 2: Generate partial SQL queries
        partial_sqls = self.generate_partial_sql(examples, db_schema, user_question, sub_questions)

        # Step 3: Assemble the final SQL query
        final_sql = self.assemble_final_query(examples, db_schema, user_question, sub_questions, partial_sqls)

        self.logger.warning(f"Final SQL query: {final_sql}")
        sql_query = ""
        queries = self.extract_result(final_sql,"sql_query")

        if not queries or len(queries) == 0 or (queries[0].strip() == ""):
            sql_query = final_sql
            state["command"] = "NO-QUERY"
        else:
            sql_query = queries
            state["sql_query"] = sql_query
            state["chart_type"] = "bar"  # Placeholder for chart type, can be improved
            state["command"] = "CONTINUE"

    
    def get_run_updates(self, state: ConversationState) -> dict:
        return {"sql_query": state["sql_query"]}
    
    def decompose_question(self,examples, db_schema, user_question):

    
        examples_str = self.get_example_str(examples)
        
        prompt = f"Given the database schema: \n {db_schema}\n\n"
        prompt += f"Decompose the following question into simpler sub-questions:\n{user_question}\n"
        prompt += f"Examples:\n" + examples_str + "\n\n"
        prompt += f"Sub-questions:"

        messages = [{"role":"assistant", "content": prompt}]
        response = self.call_llm(prompt,"" ) 
        sub_questions = response.split('\n')
        self.logger.warning(f"Sub-questions: {sub_questions}")
        return [sq.strip() for sq in sub_questions if sq.strip()]

    def get_example_str(self,examples):
        retval =  "\n".join(f"{example['question']}: {example['sql']}" for example in examples if isinstance(example, dict) and 'question' in example and 'sql' in example)
        return retval


    def generate_partial_sql(self,examples, db_schema, user_question, sub_questions):
        partial_sqls = []
        examples_str = self.get_example_str(examples)
        for i, sub_question in enumerate(sub_questions):
            context = " ".join(f"Q{i+1}: {sq} SQL{i+1}: {sql}" for i, (sq, sql) in enumerate(zip(sub_questions[:i], partial_sqls)))
            prompt = f"Given the database schema: {db_schema}\n"
            prompt += f"User question: {user_question}\n"
            prompt += f"Sub-question {i+1}: {sub_question}\n"
            prompt += f"Context: {context}\n"
            prompt += f"Examples:\n" + examples_str + "\n\n"
            prompt += "Provide the SQL query for the sub-question:"
            messages = [{"role":"assistant", "content": prompt}]
            response = self.call_llm(prompt,"")
            partial_sql = response.strip()
            partial_sqls.append(partial_sql)
        return partial_sqls

    def assemble_final_query( self,examples, db_schema, user_question, sub_questions, partial_sqls):
        examples_str = self.get_example_str(examples)
        prompt = f"Given the database schema: {db_schema}\n"
        prompt += f"Examples:\n" + examples_str + "\n\n"
        prompt += f"User question: {user_question}\n"
        for i, (sub_question, partial_sql) in enumerate(zip(sub_questions, partial_sqls)):
            prompt += f"Sub-question {i+1}: {sub_question}\n"
            prompt += f"SQL {i+1}: {partial_sql}\n"
        prompt += f"Combine the above SQL queries into a final SQL query (include TOP statement to retrieve just {ROWS_LIMIT} rows and return based on the needed fields/columns:  the top must be soon after select) that answers the user question. Do not include any additional explanation or commentary. Please prodvide The identified sql query inside <sql_query> taags."
        messages = [{"role":"assistant", "content": prompt}]
        response = self.call_llm(prompt,"")
        final_sql = response.strip()
        return final_sql
