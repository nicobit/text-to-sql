from app.data.conversation_state import ConversationState
from app.services.openai_service import generate_sql_query
from app.utils.nb_logger import NBLogger
from app.settings import ROWS_LIMIT

logger = NBLogger().Log()

def build_prompt(user_question: str, examples: list, dynamic_schema: str) -> str:
    """
    Build the GPT-4 prompt with the dynamic schema snippet, few-shot examples, and user question.
    """
    logger.info("Building prompt for SQL generation...")
    logger.info(f"User question: {user_question}") 
    prompt_lines = []
    prompt_lines.append("You are an expert at providing facts from a SQL Database. "
                        f"Given the database schema , produce a Microsoft SQL SELECT query that answers the question and return maximum {ROWS_LIMIT} rows. "
                        "Do not return any explanations or queries for previous questions."
                        "Ensure the SQL syntax is correct for Microsoft SQL Server database and relevant to the given context, don't include 'Limit statement."
                        "Also suggest an ideal chart type (e.g., bar, line, pie) for visualizing the result, don't give any explanation and add after ChartType: \n")
    prompt_lines.append("Relevant Schema:")
    prompt_lines.append(dynamic_schema)
    prompt_lines.append("\n")
    prompt_lines.append("Examples:")
    # Include few-shot examples from Azure Search.
    for ex in examples:
        prompt_lines.append(f" Q: {ex['question']}")
        prompt_lines.append(f" SQL: {ex['sql']}\n")
    prompt_lines.append("\n")
    prompt_lines.append(f" User Questions: {user_question}")
    prompt_lines.append(" SQL Query:")

    
    return "\n".join(prompt_lines)

  
def generate_sql_node(state: ConversationState) -> ConversationState:
    """
    Generate SQL Query
    """

    history = state["history"]
    user_question = history[-1].content
    relevant_schema = state["relevant_schema"] 
    examples = state["examples"]
    prompt = build_prompt(user_question, examples, relevant_schema)

    result = generate_sql_query(prompt)
    temp = ParseResult(result)
    sql_query = temp["sql"]
    chart_type = temp["chart"]

    state["sql_query"] = sql_query
    state["chart_type"] = chart_type
    logger.info(f"Generated SQL query: {sql_query}")
    return state


def ParseResult(answer):
    answer = answer.lower().replace("ideal chart", "chart")
    answer = answer.lower().replace("chart Type:","chartType:")
    if "charttype:" in answer:
        sql_part, chart_part = answer.split("charttype:")
        sql_query = sql_part.strip()
        sql_query = sql_query.replace("```", "").strip()
        
        chart_type = chart_part.strip()
    else:
        sql_query = answer
        chart_type = None

    
    sql_query = sql_query.replace("```sql", "").strip()
    sql_query = sql_query.replace("sql", "").strip()
    sql_query = sql_query.replace("sql\nSELECT", "SELECT").strip()
    sql_query = sql_query.replace("```", "").strip()
    temp = sql_query.split(";\n\n")
    if len(temp) > 1:
        sql_query = temp[-1].strip()
    
        
    return {"sql": sql_query, "chart": chart_type}