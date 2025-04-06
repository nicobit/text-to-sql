# agents/candidate_selector.py
import os, openai
DEPLOYMENT_NAME = os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME")

_SELECTION_SYSTEM_PROMPT = (
    "You are a SQL Candidate Selection Agent. You are given the user's question and a set of candidate SQL queries. "
    "Evaluate the candidates based on their adherence to the schema and their ability to answer the question. "
    "Return the index (starting at 0) of the best candidate.\n\n"
    "Candidates:\n{candidates}\n\nUser Question: {question}\n\n"
    "Return only the candidate index as an integer."
)

def select_best_candidate(state: dict):
    """
    Use a selection model (here implemented with Azure OpenAI) to choose the best candidate
    from state["refined_candidates"]. The chosen SQL is stored under state["selected_sql"].
    """
    candidates = state.get("refined_candidates", [])
    if not candidates:
        return {"selected_sql": ""}
    candidates_str = "\n".join([f"{idx}: {cand}" for idx, cand in enumerate(candidates)])
    question = state.get("question", "")
    prompt = _SELECTION_SYSTEM_PROMPT.format(candidates=candidates_str, question=question)
    messages = [
        {"role": "system", "content": "You are a SQL Candidate Selection Agent."},
        {"role": "user", "content": prompt}
    ]
    response = openai.ChatCompletion.create(
        engine=DEPLOYMENT_NAME,
        messages=messages,
        temperature=0,
        max_tokens=20
    )
    try:
        selected_idx = int(response.choices[0].message.content.strip())
        if selected_idx < 0 or selected_idx >= len(candidates):
            selected_idx = 0
    except Exception:
        selected_idx = 0
    return {"selected_sql": candidates[selected_idx]}
