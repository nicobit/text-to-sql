# LangGraph Examples

Below are progressively richer examples showing how to **call the proxy as an LLM** from **LangGraph**.  
All examples assume:
- Your proxy lives at `https://<your-function>.azurewebsites.net`
- You inject `Authorization: Bearer <AAD token>` headers when calling the OpenAI client used inside your nodes.

> The proxy is **Azure OpenAI-compatible**, so you can keep using the `AzureOpenAI` client.

## 0) Prereqs

```bash
pip install langgraph openai
```

## 1) Minimal single-node graph

```python
from langgraph.graph import StateGraph, END
from pydantic import BaseModel, Field
from typing import List, Dict, Any
from openai import AzureOpenAI

AAD_TOKEN = "<access token for proxy AUDIENCE>"

client = AzureOpenAI(
    api_key="placeholder",
    api_version="2024-06-01",
    azure_endpoint="https://<your-function>.azurewebsites.net"
)
client.default_headers = {"Authorization": f"Bearer {AAD_TOKEN}"}

class ChatState(BaseModel):
    messages: List[Dict[str, Any]] = Field(default_factory=list)

def llm_node(state: ChatState) -> ChatState:
    resp = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=state.messages
    )
    content = resp.choices[0].message.content
    return ChatState(messages=state.messages + [{"role":"assistant","content":content}])

graph = StateGraph(ChatState)
graph.add_node("llm", llm_node)
graph.set_entry_point("llm")
graph.add_edge("llm", END)
app = graph.compile()

out = app.invoke(ChatState(messages=[{"role":"user","content":"Summarize LangGraph in one sentence."}]))
print(out.messages[-1]["content"])
```

## 2) Branching with a simple router

```python
from langgraph.graph import StateGraph, END
from typing import Literal

def router(state: ChatState) -> Literal["llm","bye"]:
    text = state.messages[-1]["content"].lower()
    return "bye" if "bye" in text else "llm"

def bye_node(state: ChatState) -> ChatState:
    return ChatState(messages=state.messages + [{"role":"assistant","content":"Goodbye!"}])

graph = StateGraph(ChatState)
graph.add_node("llm", llm_node)
graph.add_node("bye", bye_node)
graph.add_edge("llm", END)
graph.add_edge("bye", END)
graph.set_entry_point("llm")
graph.add_conditional_edges("llm", router, {"llm":"llm", "bye":"bye"})
app = graph.compile()
```

## 3) Tool-using agent (ReAct-lite)

This pattern uses a **tool node** plus the LLM to choose between tools and answering.

```python
import json, time
from typing import Optional

def search_tool(query: str) -> str:
    # Dummy tool: pretend we searched
    return f"Results for '{query}': doc1, doc2, ..."

def agent_node(state: ChatState) -> ChatState:
    sys = {"role":"system","content":"You can call a tool by emitting JSON: {\"tool\":\"search\",\"query\":\"...\"} or answer directly."}
    msgs = [sys] + state.messages
    resp = client.chat.completions.create(model="gpt-4o-mini", messages=msgs)
    content = resp.choices[0].message.content

    # naive parse
    try:
        data = json.loads(content)
        if data.get("tool") == "search":
            q = data.get("query","")
            tool_out = search_tool(q)
            follow = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=msgs + [{"role":"tool","content":tool_out,"name":"search"}]
            )
            content = follow.choices[0].message.content
    except Exception:
        pass

    return ChatState(messages=state.messages + [{"role":"assistant","content":content}])

graph = StateGraph(ChatState)
graph.add_node("agent", agent_node)
graph.set_entry_point("agent")
graph.add_edge("agent", END)
app = graph.compile()
```

## 4) Multi-turn planner-executor sketch

```python
from langgraph.graph import START, END, StateGraph

def planner(state: ChatState) -> ChatState:
    prompt = [{"role":"system","content":"Break the user goal into 1-3 steps."}] + state.messages
    plan = client.chat.completions.create(model="gpt-4o-mini", messages=prompt).choices[0].message.content
    return ChatState(messages=state.messages + [{"role":"assistant","content":f"PLAN:\n{plan}"}])

def executor(state: ChatState) -> ChatState:
    plan_text = next((m["content"] for m in state.messages if m["role"]=="assistant" and m["content"].startswith("PLAN:")), "")
    exec_prompt = [{"role":"system","content":"Execute the plan succinctly."}, {"role":"user","content":plan_text}]
    ans = client.chat.completions.create(model="gpt-4o-mini", messages=exec_prompt).choices[0].message.content
    return ChatState(messages=state.messages + [{"role":"assistant","content":ans}])

graph = StateGraph(ChatState)
graph.add_node("planner", planner)
graph.add_node("executor", executor)
graph.add_edge("planner","executor")
graph.add_edge("executor", END)
graph.set_entry_point("planner")
app = graph.compile()
```

### Notes

- The **proxy** counts tokens for each call made by your graph; per-user quotas will apply.
- You can store the **Bearer token** in a LangGraph-wide config and inject into the OpenAI client you use across nodes.
