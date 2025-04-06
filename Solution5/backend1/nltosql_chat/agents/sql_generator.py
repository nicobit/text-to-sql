import os, openai

DEPLOYMENT_NAME = os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME")

# System prompt template for SQL generation
_SQL_SYSTEM_PROMPT = (
    "You are a SQL Generator Agent. You have the database schema information below, and a user question. "
    "Using ONLY the schema, generate a correct SQL query to answer the question. "
    "Do not include explanations or natural language, ONLY output the SQL query.\n\nSchema:\n{schema}\n"
)

def generate_sql(state: dict):
    """Generate SQL query for the user's question using Azure OpenAI."""
    schema = state.get("schema", "")
    user_question = state["question"]  # latest user question from state
    # Compile the prompt with schema
    system_prompt = _SQL_SYSTEM_PROMPT.format(schema=schema)
    # Prepare message history for context (previous Q&A for follow-ups)
    history_messages = state.get("messages", [])  # conversation so far as a list of dicts
    # Construct messages for OpenAI: system prompt + history + current user question
    messages = [{"role": "system", "content": system_prompt}]
    # Include conversation history (excluding any prior system prompts) to give context
    for msg in history_messages:
        # Only include actual user/assistant messages in history
        if msg.get("role") in ("user", "assistant"):
            messages.append(msg)
    # Add the latest user question as the final user message (if not already in history)
    if not messages or messages[-1]["role"] != "user":
        messages.append({"role": "user", "content": user_question})
    # Call Azure OpenAI to get the SQL query
    response = openai.ChatCompletion.create(
        engine=DEPLOYMENT_NAME,
        messages=messages,
        temperature=0  # keep output deterministic if possible
    )
    sql_query = response.choices[0].message.content.strip()
    # Save the generated SQL in state for execution
    return {"sql": sql_query}