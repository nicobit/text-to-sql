import os, openai

DEPLOYMENT_NAME = os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME")

_CHAT_SYSTEM_PROMPT = (
    "You are a friendly assistant for a database QA system. If the user is not asking for data, respond conversationally."
)

def generate_chat_response(state: dict):
    """Generate a direct response to the user without invoking the database."""
    user_message = state.get("question", "")
    # Use conversation history for context (to maintain continuity in multi-turn chat)
    history = state.get("messages", [])
    messages = [{"role": "system", "content": _CHAT_SYSTEM_PROMPT}]
    for msg in history:
        if msg.get("role") in ("user", "assistant"):
            messages.append(msg)
    # Ensure the latest user message is at the end
    if not messages or messages[-1]["role"] != "user":
        messages.append({"role": "user", "content": user_message})
    response = openai.ChatCompletion.create(
        engine=DEPLOYMENT_NAME,
        messages=messages,
        temperature=0.7  # a bit more creativity for general chat
    )
    answer = response.choices[0].message.content.strip()
    # Append this answer to conversation history
    full_history = state.get("messages", [])
    full_history.append({"role": "assistant", "content": answer})
    return {"messages": full_history}