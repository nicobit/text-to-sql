# agents/sql_refiner.py
import os, openai
DEPLOYMENT_NAME = os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME")

_REFINE_SYSTEM_PROMPT = (
    "You are a SQL Refiner Agent. You are given the following context:\n"
    "1. Database schema:\n{schema}\n\n"
    "2. User question:\n{question}\n\n"
    "3. A candidate SQL query:\n{sql_candidate}\n\n"
    "4. An error message from executing the candidate (if any):\n{error_message}\n\n"
    "Refine the SQL query to correct any syntactical or logical errors so it adheres to the schema. "
    "Return only the refined SQL query."
)

def refine_candidate(state: dict, candidate: str, error_message: str = "") -> str:
    """Refine one candidate SQL query using error clues and context."""
    schema = state.get("linked_schema") or state.get("schema", "")
    question = state.get("question", "")
    prompt = _REFINE_SYSTEM_PROMPT.format(
        schema=schema,
        question=question,
        sql_candidate=candidate,
        error_message=error_message or "No error."
    )
    messages = [
        {"role": "system", "content": "You are a SQL Refiner Agent."},
        {"role": "user", "content": prompt}
    ]
    response = openai.ChatCompletion.create(
        engine=DEPLOYMENT_NAME,
        messages=messages,
        temperature=0
    )
    refined_sql = response.choices[0].message.content.strip()
    return refined_sql

def refine_candidates(state: dict):
    """
    For each candidate SQL query in state["candidates"], if an execution error was recorded in state["execution_errors"],
    refine that candidate. Return an updated list in state["refined_candidates"].
    """
    candidates = state.get("candidates", [])
    # execution_errors is a dict mapping candidate index (as string) to an error message.
    execution_errors = state.get("execution_errors", {})
    refined = []
    for idx, candidate in enumerate(candidates):
        error_msg = execution_errors.get(str(idx), "")
        if error_msg:
            refined_candidate = refine_candidate(state, candidate, error_msg)
            refined.append(refined_candidate)
        else:
            refined.append(candidate)
    return {"refined_candidates": refined}
