from langgraph import MessageGraph, END
from langchain.chat_models import AzureChatOpenAI  # hypothetical usage via LangChain
# (Alternatively, use openai.ChatCompletion directly as configured above)
# ... import or define any prompt templates as needed ...

# Initialize Azure OpenAI chat model (assuming environment config done in __init__.py)
chat_model = AzureChatOpenAI(deployment_name=os.getenv("AZURE_OPENAI_ENGINE"), 
                             openai_api_base=os.getenv("AZURE_OPENAI_ENDPOINT"),
                             openai_api_version="2025-01-01-preview",
                             openai_api_key=os.getenv("AZURE_OPENAI_KEY"),
                             model_name= os.getenv("AZURE_OPENAI_MODELNAME") #"gpt-4")

# (Optional) System prompt or instructions including DB schema for better SQL generation
system_prompt = "You are an AI assistant with access to a database. Convert the user’s question to a SQL query. Only output SQL. Also suggest an ideal chart type (e.g., bar, line, pie) for visualizing the result."

# LangGraph: Define a node for generating SQL from NL
def generate_sql_node(message_history):
    # message_history includes past conversation (list of messages)
    user_msg = message_history[-1]["content"]  # get latest user question
    # Construct prompt with system instructions and conversation context
    messages = [{"role": "system", "content": system_prompt}]
    for msg in message_history:
        messages.append(msg)  # include prior Q&A for context
    # Call Azure OpenAI ChatCompletion to get SQL (and chart suggestion in answer)
    completion = openai.ChatCompletion.create(
        engine=os.getenv("AZURE_OPENAI_ENGINE"),
        messages=messages,
        temperature=0.2,
        max_tokens=200
    )
    answer = completion['choices'][0]['message']['content'].strip()
    # The model is instructed to return something like: "<SQL_QUERY>; Chart: <TYPE>"
    # Split the SQL and chart suggestion (assuming a known format)
    if "Chart:" in answer:
        sql_part, chart_part = answer.split("Chart:")
        sql_query = sql_part.strip()
        chart_type = chart_part.strip()
    else:
        sql_query = answer
        chart_type = None
    return {"sql": sql_query, "chart": chart_type}

# LangGraph: Define the conversation graph (single user -> AI turn for NL2SQL)
conv_graph = MessageGraph()
conv_graph.add_node("generate_sql", generate_sql_node)
conv_graph.set_entry_point("generate_sql")

# In-memory storage for conversation contexts (could use persistent storage for long-term memory)
user_sessions = {}  # e.g., map user_id to MessageGraph instance or history

async def nl_to_sql(user_input: str, user_id: str):
    # Retrieve or initialize conversation history for the user
    history = user_sessions.get(user_id, [])
    # Add the new user question to history
    history.append({"role": "user", "content": user_input})
    # Run the LangGraph node to get AI response
    result = conv_graph.run({"messages": history})
    sql_query = result["sql"]
    chart = result.get("chart")
    # Save assistant response to history for context (though here it's just SQL, we treat it as assistant message)
    history.append({"role": "assistant", "content": sql_query})
    user_sessions[user_id] = history  # update session
    suggested_chart = [chart] if chart else []
    return sql_query, suggested_chart