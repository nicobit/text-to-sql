import os, openai
DEPLOYMENT_NAME = os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME")

_SCHEMA_LINKER_PROMPT = (
    "You are a schema linking agent. Your task is to reduce a full database schema (in M-Schema format) "
    "to a minimally sufficient schema relevant to the user's question.\n\n"
    "User Question: {question}\n\n"
    "Full Schema:\n{full_schema}\n\n"
    "Return only the necessary tables and columns as an M-Schema formatted string (e.g. TableA(col1, col2) | TableB(col3, col4))."
)

def link_schema(state: dict):
    """
    Link the schema by filtering the full schema to only those tables and columns relevant to the question.
    """
    full_schema = state.get("schema", "")
    question = state.get("question", "")
    if not full_schema or not question:
        return {}
    prompt = _SCHEMA_LINKER_PROMPT.format(question=question, full_schema=full_schema)
    messages = [
        {"role": "system", "content": "You are an expert in database schema linking."},
        {"role": "user", "content": prompt}
    ]
    response = openai.ChatCompletion.create(
        engine=DEPLOYMENT_NAME,
        messages=messages,
        temperature=0.3,
        max_tokens=200
    )
    linked_schema = response.choices[0].message.content.strip()
    return {"linked_schema": linked_schema}