import os, openai

DEPLOYMENT_NAME = os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME")

_ANALYSIS_SYSTEM_PROMPT = (
    "You are an Analyzer Agent. You will be given the user's question and the SQL query results. "
    "Provide a brief, helpful answer to the user, incorporating the results. "
    "If the result set is small, include the actual results in your answer. "
    "Also, suggest a follow-up question if it would be helpful."
)

def analyze_response(state: dict):
    """Generate a user-facing answer by analyzing the SQL results."""
    question = state.get("question", "")
    results_text = state.get("results", "")
    # Prepare messages for OpenAI
    messages = [
        {"role": "system", "content": _ANALYSIS_SYSTEM_PROMPT},
        {"role": "user", "content": f"Question: {question}\nResults:\n{results_text}"}
    ]
    response = openai.ChatCompletion.create(
        engine=DEPLOYMENT_NAME,
        messages=messages,
        temperature=0.2  # a bit of creativity for follow-up suggestion
    )
    answer = response.choices[0].message.content.strip()
    # Append the analyzer's answer as the final assistant message in the conversation history
    # (This is the answer that will be returned to the user.)
    full_history = state.get("messages", [])
    full_history.append({"role": "assistant", "content": answer})
    return {"messages": full_history}