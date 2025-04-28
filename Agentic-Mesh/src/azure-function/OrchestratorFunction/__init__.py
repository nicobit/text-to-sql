import azure.functions as func
import json
from agentic_mesh.orchestrator import Orchestrator

async def main(req: func.HttpRequest) -> func.HttpResponse:
    body = req.get_json()
    text = body.get("text", "")
    session_id = req.headers.get("X-Session-ID", "default")
    orch = Orchestrator()
    result = await orch.handle_query(text, session_id=session_id)
    return func.HttpResponse(json.dumps(result), status_code=200, mimetype="application/json")
