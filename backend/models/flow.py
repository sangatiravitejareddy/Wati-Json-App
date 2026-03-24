"""
Pydantic models for WATI automation flows.
"""
from pydantic import BaseModel
from typing import List, Optional, Any


class FlowReply(BaseModel):
    flowReplyType: str
    data: Any


class FlowNode(BaseModel):
    id: str
    flowNodeType: str
    flowReplies: Optional[List[FlowReply]] = []
    position: Optional[dict] = None
    data: Optional[dict] = None


class FlowEdge(BaseModel):
    id: str
    source: str
    target: str
    sourceHandle: Optional[str] = None
    targetHandle: Optional[str] = None


class FlowJSON(BaseModel):
    flowNodes: List[FlowNode]
    flowEdges: Optional[List[FlowEdge]] = []


class GenerateFlowRequest(BaseModel):
    prompt: str


class FlowRecord(BaseModel):
    flow_id: str
    user_id: str
    prompt: str
    json_data: dict
    created_at: str


class FlowResponse(BaseModel):
    flow_id: str
    prompt: str
    json_data: dict
    created_at: str
