"""
Flow service — generate, validate, save, list, delete WATI flows.
Enforces usage limits per plan.
"""
import uuid
from datetime import datetime, timezone
from typing import List

from fastapi import HTTPException
from firebase_config import db
from config import PLAN_LIMITS
from services.ai_engine import generate_flow as ai_generate_flow
from models.flow import FlowJSON


def ensure_user_exists(user_id: str) -> dict:
    """Get user doc or auto-create if missing (self-healing for failed registrations)."""
    user_ref = db.collection("users").document(user_id)
    user_doc = user_ref.get()
    if user_doc.exists:
        return user_doc.to_dict()
    # Auto-create with free plan defaults
    from datetime import datetime, timezone
    new_user = {
        "userId": user_id,
        "email": "",
        "plan": "free",
        "flows_generated": 0,
        "is_blocked": False,
        "createdAt": datetime.now(timezone.utc).isoformat(),
    }
    user_ref.set(new_user)
    return new_user

# ── Allowed node types ────────────────────────────────────────────────
VALID_NODE_TYPES = {
    "Message",
    "Question",
    "Condition",
    "InteractiveButtons",
    "InteractiveList",
    "Webhook",
    "GoogleSpreadsheet",
    "AssignTeam",
    "AssignAgent",
    "TimeDelay",
    "InteractiveProductList",
    "InteractiveProduct",
    "UpdateAttribute",
    "Subscription",
    "InvokeFlow",
}


def validate_flow_json(data: dict) -> dict:
    """Validate that the generated JSON conforms to WATI schema."""
    if "flowNodes" not in data:
        raise ValueError("Missing 'flowNodes' in generated JSON")

    nodes = data["flowNodes"]
    if not isinstance(nodes, list) or len(nodes) == 0:
        raise ValueError("'flowNodes' must be a non-empty array")

    for node in nodes:
        if "id" not in node or "flowNodeType" not in node:
            raise ValueError(f"Node missing required fields: {node}")
        if node["flowNodeType"] not in VALID_NODE_TYPES:
            raise ValueError(f"Invalid flowNodeType: {node['flowNodeType']}")

    # Validate edges if present
    # WATI edges use sourceNodeId / targetNodeId (not source / target)
    # For InteractiveList rows the sourceNodeId contains "__" (e.g. "main_list-XXXXX__ROWID")
    # so we compare the base node ID (before "__") against the node_ids set.
    edges = data.get("flowEdges", [])
    node_ids = {n["id"] for n in nodes}
    for edge in edges:
        src = edge.get("sourceNodeId", "")
        tgt = edge.get("targetNodeId", "")
        # Strip the row suffix for InteractiveList source edges
        src_base = src.split("__")[0] if "__" in src else src
        if src_base and src_base not in node_ids:
            raise ValueError(f"Edge sourceNodeId '{src}' not found in nodes")
        if tgt and tgt not in node_ids:
            raise ValueError(f"Edge targetNodeId '{tgt}' not found in nodes")

    return data


async def check_usage_limit(user_id: str) -> None:
    """Check if user has remaining flow generation capacity."""
    user_data = ensure_user_exists(user_id)

    plan = user_data.get("plan", "free")
    flows_generated = user_data.get("flows_generated", 0)
    limit = PLAN_LIMITS.get(plan, 3)

    if limit != -1 and flows_generated >= limit:
        raise HTTPException(
            status_code=403,
            detail=f"Usage limit reached. Your {plan} plan allows {limit} flows. Please upgrade.",
        )


async def generate_and_save_flow(user_id: str, prompt: str) -> dict:
    """Generate a WATI flow via AI, validate, save to Firestore."""
    await check_usage_limit(user_id)

    # Generate via AI
    raw_json = await ai_generate_flow(prompt)

    # Validate
    validated = validate_flow_json(raw_json)

    # Save to Firestore
    flow_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()

    flow_doc = {
        "flowId": flow_id,
        "userId": user_id,
        "prompt": prompt,
        "json": validated,
        "createdAt": now,
    }
    db.collection("flows").document(flow_id).set(flow_doc)

    # Increment user's flow count
    user_ref = db.collection("users").document(user_id)
    user_doc = user_ref.get()
    if user_doc.exists:
        current_count = user_doc.to_dict().get("flows_generated", 0)
        user_ref.update({"flows_generated": current_count + 1})

    return {
        "flow_id": flow_id,
        "prompt": prompt,
        "json_data": validated,
        "created_at": now,
    }


async def save_flow(user_id: str, prompt: str, json_data: dict) -> dict:
    """Save an externally provided flow JSON (after validation)."""
    validated = validate_flow_json(json_data)
    flow_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()

    flow_doc = {
        "flowId": flow_id,
        "userId": user_id,
        "prompt": prompt,
        "json": validated,
        "createdAt": now,
    }
    db.collection("flows").document(flow_id).set(flow_doc)
    return {
        "flow_id": flow_id,
        "prompt": prompt,
        "json_data": validated,
        "created_at": now,
    }


async def get_user_flows(user_id: str) -> List[dict]:
    """Get all flows for a user."""
    try:
        flows_ref = db.collection("flows").where("userId", "==", user_id).order_by(
            "createdAt", direction="DESCENDING"
        )
        docs = list(flows_ref.stream())
    except Exception as e:
        # Fallback if composite index is missing — query without order_by, sort in Python
        import logging
        logging.getLogger(__name__).warning(
            f"Composite index missing for flows query, falling back to unordered query. "
            f"Create the index: {e}"
        )
        flows_ref = db.collection("flows").where("userId", "==", user_id)
        docs = sorted(
            flows_ref.stream(),
            key=lambda d: d.to_dict().get("createdAt", ""),
            reverse=True,
        )

    return [
        {
            "flow_id": doc.to_dict()["flowId"],
            "prompt": doc.to_dict()["prompt"],
            "json_data": doc.to_dict()["json"],
            "created_at": doc.to_dict()["createdAt"],
        }
        for doc in docs
    ]


async def delete_flow(user_id: str, flow_id: str) -> dict:
    """Delete a specific flow owned by the user."""
    flow_ref = db.collection("flows").document(flow_id)
    flow_doc = flow_ref.get()

    if not flow_doc.exists:
        raise HTTPException(status_code=404, detail="Flow not found")

    flow_data = flow_doc.to_dict()
    if flow_data["userId"] != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this flow")

    flow_ref.delete()

    # Decrement usage counter
    user_ref = db.collection("users").document(user_id)
    user_doc = user_ref.get()
    if user_doc.exists:
        current_count = user_doc.to_dict().get("flows_generated", 0)
        user_ref.update({"flows_generated": max(0, current_count - 1)})

    return {"message": "Flow deleted successfully"}


async def get_user_usage(user_id: str) -> dict:
    """Return current usage stats for a user."""
    data = ensure_user_exists(user_id)
    plan = data.get("plan", "free")
    limit = PLAN_LIMITS.get(plan, 3)

    return {
        "plan": plan,
        "flows_generated": data.get("flows_generated", 0),
        "monthly_limit": limit,
        "is_unlimited": limit == -1,
    }
