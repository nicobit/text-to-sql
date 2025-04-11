from app.agents.conversation_state import ConversationState
from app.services.openai_service import generate_sql_query, chat
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
                        f"Ensure the SQL syntax is correct for Microsoft SQL Server database and relevant to the given context, include TOP statement to limit to retrieve just {ROWS_LIMIT} rows and return based on the needed fields/columns:  the top must be soon after select."
                        "Also suggest an ideal chart type (e.g., bar, line, pie) for visualizing the result, don't give any explanation and add after ChartType: \n")
    prompt_lines.append("Relevant Schemas:")
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

    
    user_question = state["question"]
    relevant_schema = state["relevant_schema"] 
    examples = state["examples"]

    if(relevant_schema == None or relevant_schema == ""):
        state["command"] = "NO-SCHEMA"
        state["answer"] = str("Not data available to anwer the question.")
    else:
        state["command"] = "CONTINUE"
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