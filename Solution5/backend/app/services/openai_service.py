import openai
from openai import AzureOpenAI
from app.settings import OPEN_AI_KEY,EMBEDDING_MODEL,COMPLETION_MODEL,OPENAI_ENDPOINT, OPEN_AI_VERSION
from app.utils.nb_logger import NBLogger

logger = NBLogger().Log()   



openai.api_key = OPEN_AI_KEY

print(OPENAI_ENDPOINT)
client = AzureOpenAI(
        api_key = OPEN_AI_KEY,
        azure_endpoint = OPENAI_ENDPOINT,
        api_version = OPEN_AI_VERSION,
    )


def get_embedding(text: str) -> list:
    """Get the embedding vector for the given text using OpenAI."""
      
    response = client.embeddings.create(input=text, model=EMBEDDING_MODEL)
    embedding = response.data[0].embedding
    return embedding

def chat(messages: str) -> str:
    """Generate a response using GPT-4 from the given prompt."""
    
    response = client.chat.completions.create(
        model=COMPLETION_MODEL,
        messages=messages,
        max_tokens=150,
        temperature=0, # Deterministic output
    )
    retval = response.choices[0].message.content.strip()
    
    return retval

def generate_sql_query(prompt: str) -> str:
    """Generate SQL query using GPT-4 from the given prompt."""
    logger.info(f"Generating SQL query for prompt: {prompt}")
    messages=[{"role":"system","content": "You are an expert SQL generator."},{"role": "user", "content": prompt}]
    return chat(messages)
    

def retry_generate_sql_query(prompt: str) -> str:
    """Generate SQL query using GPT-4 from the given prompt."""
    logger.info(f"Retry tp generate SQL query for prompt: {prompt}")
    messages=[{"role":"system","content": "You are an expert SQL generator."},{"role": "user", "content": prompt}]

    return chat(messages)
   

def generate_answer(user_question: str, sql_results: list) -> str:
    """Generate a natural language answer from the SQL results using GPT-4."""
    result_str = str(sql_results)
    followup_prompt = (
        f"User question: \"{user_question}\"\n"
        f"SQL query results: {result_str}\n"
        "Provide and Articulate an answer based on these results and trying to give some insight and help to analyze it, without saying that was based on a query. Ask at the end another possible related things to be asked by the user. Format the answer in markdown."
    )

    messages=[{"role": "user", "content": followup_prompt}]
    return chat(messages)