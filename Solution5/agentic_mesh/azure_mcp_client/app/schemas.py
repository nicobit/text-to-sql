"""
Shared Pydantic models used by the FastAPI handlers.
These mirror the MCP JSON-RPC payloads closely so that the proxy
can return typed responses without modification.
"""
from __future__ import annotations
from pydantic import BaseModel, Field
from typing import Any, List, Dict

# ------------------------------------------------------------------
# 1.  /tools  -----------------------------------------------------------------
# ------------------------------------------------------------------

class ToolParam(BaseModel):
    name: str
    type: str
    required: bool = Field(default=False)
    description: str | None = None

class ToolSchema(BaseModel):
    name: str
    description: str | None = None
    parameters: List[ToolParam]

class ToolsResponse(BaseModel):
    tools: List[ToolSchema]


# ------------------------------------------------------------------
# 2.  /invoke/{tool_name}  ------------------------------------------
# ------------------------------------------------------------------

class InvokeRequest(BaseModel):
    params: Dict[str, Any] = Field(
        default_factory=dict,
        description="Arbitrary parameters for the selected tool",
    )

class InvokeResult(BaseModel):
    """
    We don’t know each tool's result schema at *compile time*, so we
    capture the opaque `result` plus the standard MCP bookkeeping.
    """
    success: bool = Field(default=True)
    result: Any | None = None
    error: str | None = None
