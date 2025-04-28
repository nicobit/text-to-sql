import openai
from agentic_mesh.config import OPENAI_API_KEY
from agentic_mesh.registry import list_agent_metadata

openai.api_key = OPENAI_API_KEY

def plan_with_gpt4(messages, rag_context):
    prompt = [
        {"role":"system","content":"You are an orchestrator; use only provided tools."},
        *({"role":"system","content":f"Context: {c}"} for c in rag_context),
        *messages
    ]
    resp = openai.ChatCompletion.create(
        model="gpt-4-0613",
        messages=prompt,
        functions=list_agent_metadata(),
        function_call="auto"
    )
    return resp.choices[0].message