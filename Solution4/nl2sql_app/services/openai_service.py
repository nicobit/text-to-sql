import openai
from config import OPENAI_API_KEY

openai.api_key = OPENAI_API_KEY

EMBEDDING_MODEL = "text-embedding-ada-002"
COMPLETION_MODEL = "gpt-4"

def get_embedding(text: str) -> list:
    """Get the embedding vector for the given text using OpenAI."""
    response = openai.Embedding.create(input=text, model=EMBEDDING_MODEL)
    embedding = response["data"][0]["embedding"]
    return embedding

def generate_sql_query(prompt: str) -> str:
    """Generate SQL query using GPT-4 from the given prompt."""
    response = openai.ChatCompletion.create(
        model=COMPLETION_MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0
    )
    sql_query = response["choices"][0]["message"]["content"].strip()
    return sql_query

def generate_answer(user_question: str, sql_results: list) -> str:
    """Generate a natural language answer from the SQL results using GPT-4."""
    result_str = str(sql_results)
    followup_prompt = (
        f"User question: \"{user_question}\"\n"
        f"SQL query results: {result_str}\n"
        "Provide a clear, concise answer based on these results."
    )
    response = openai.ChatCompletion.create(
        model=COMPLETION_MODEL,
        messages=[{"role": "user", "content": followup_prompt}],
        temperature=0
    )
    answer = response["choices"][0]["message"]["content"].strip()
    return answer