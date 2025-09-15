import json, os, logging, asyncio
from typing import Dict, Any, List
from openai import AsyncOpenAI, embeddings_utils

log = logging.getLogger("selector")
MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
OAI   = AsyncOpenAI()

async def choose_tool(question: str, tools: List[Dict[str, Any]]):
    """Return (tool_name, params) via function-calling."""
    resp = await OAI.chat.completions.create(
        model=MODEL,
        temperature=0,
        messages=[
            {"role":"system",
             "content":"You are a router. Choose the single best tool and fill "
                       "parameters as valid JSON. Respond ONLY with a tool call."},
            {"role":"user", "content": question}
        ],
        tools=[{"type":"function","function":t} for t in tools],
        tool_choice="auto"
    )
    call = resp.choices[0].message.tool_calls[0]      # may raise if none
    return call.function.name, json.loads(call.function.arguments)

async def choose_by_embedding(question: str, tools: List[Dict[str, Any]]):
    """Fallback when the model lacks function-calling."""
    embeds = await OAI.embeddings.create(
        model="text-embedding-3-small",
        input=[question]+[t["description"] for t in tools])
    q_vec, *tool_vecs = (e.embedding for e in embeds.data)
    sims = embeddings_utils.get_cosine_similarity(q_vec, tool_vecs)
    return tools[max(range(len(sims)), key=sims.__getitem__)]["name"], {}
