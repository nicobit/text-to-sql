import asyncio, uuid
from agentic_mesh.session import SessionStore
from agentic_mesh.memory import MemoryStore
from agentic_mesh.planner import plan_with_gpt4
from agentic_mesh.registry import get_agent
from agentic_mesh.trace import Trace, TraceEvent
from agentic_mesh.utils import retry_on_exception
from agentic_mesh.config import MAX_ITERATIONS

class Orchestrator:
    def __init__(self):
        self.sessions = SessionStore()
        self.memory   = MemoryStore()
        self.trace    = Trace()

    @retry_on_exception()
    async def handle_query(self, text, session_id="default"):
        # 1) Append & log user message
        hist = self.sessions.get(session_id)
        hist.append({"role":"user","content":text})
        self.sessions.append(session_id, hist[-1])
        self.trace.log(TraceEvent("UserInput","receive",inp={"text":text}))

        # 2) Retrieve RAG context
        rag = self.memory.retrieve(text)
        self.trace.log(TraceEvent("Memory","retrieve",inp={"query":text},out=rag))

        answer = None
        for _ in range(MAX_ITERATIONS):
            msg = plan_with_gpt4(hist, rag)
            self.trace.log(TraceEvent("LLMPlanner","plan",out=msg.to_dict()))

            if msg.get("function_call"):
                fn = msg.function_call
                agent = get_agent(fn.name)
                self.trace.log(TraceEvent("AgentAction",f"invoke {fn.name}",inp=fn.arguments))
                res = await asyncio.to_thread(agent.execute, **fn.arguments)
                self.trace.log(TraceEvent("AgentResult",f"{fn.name} result",out=res))
                hist.append({"role":"assistant","content":str(res)})
                self.sessions.append(session_id, hist[-1])
                rag.append(str(res))
            else:
                answer = msg.content
                self.trace.log(TraceEvent("LLMFinalizer","answer",out=answer))
                hist.append({"role":"assistant","content":answer})
                self.sessions.append(session_id, hist[-1])
                break

        # 3) Persist memory
        if answer:
            self.memory.save(text, str(uuid.uuid4()))
            self.memory.save(answer, str(uuid.uuid4()))

        return {"answer": answer, **self.trace.to_dict()}