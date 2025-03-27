from services import openai_service, search_service, db_service, schema_service

def build_prompt(user_question: str, examples: list, dynamic_schema: str) -> str:
    """
    Build the GPT-4 prompt with the dynamic schema snippet, few-shot examples, and user question.
    """
    prompt_lines = []
    prompt_lines.append("You are an expert at providing facts from a SQL Database. "
                        "Given the database schema and some example Q&A pairs, produce a PostgreSQL SELECT query that answers the question.\n")
    prompt_lines.append("Relevant Schema:")
    prompt_lines.append(dynamic_schema)
    prompt_lines.append("")
    # Include few-shot examples from Azure Search.
    for ex in examples:
        prompt_lines.append(f"Q: {ex['question']}")
        prompt_lines.append(f"SQL: {ex['sql']}\n")
    prompt_lines.append(f"Q: {user_question}")
    prompt_lines.append("SQL:")
    return "\n".join(prompt_lines)

def handle_question(user_question: str):
    """
    Orchestrate the entire NL-to-SQL workflow:
      1. Embed the user question.
      2. Retrieve few-shot examples.
      3. Dynamically select relevant schema segments.
      4. Build the GPT prompt.
      5. Generate SQL using GPT-4.
      6. Execute SQL.
      7. Generate final natural language answer.
    Returns (generated SQL, final answer).
    """
    # Step 1: Get embedding of user question.
    question_embedding = openai_service.get_embedding(user_question)
    
    # Step 2: Retrieve few-shot examples from Azure Search.
    examples = search_service.find_relevant_examples(question_embedding, top_k=3)
    
    # Step 3: Dynamically select relevant schema parts.
    dynamic_schema = schema_service.get_relevant_schema(question_embedding, top_k=2)
    
    # Step 4: Build the prompt.
    prompt = build_prompt(user_question, examples, dynamic_schema)
    
    # Step 5: Generate SQL query using GPT-4.
    sql_query = openai_service.generate_sql_query(prompt)
    
    # Step 6: Execute the SQL query.
    try:
        results = db_service.execute_query(sql_query)
    except Exception as e:
        results = f"Error executing SQL: {str(e)}"
    
    # Step 7: Generate final natural language answer.
    answer = openai_service.generate_answer(user_question, results)
    
    return sql_query, answer