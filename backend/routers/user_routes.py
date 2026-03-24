"""
User API routes.
"""
from fastapi import APIRouter, Depends, Request
from middleware.auth import get_current_user
from config import ADMIN_EMAILS
from firebase_config import db
from middleware.rate_limit import limiter
from models.flow import GenerateFlowRequest
from services.flow_service import (
    generate_and_save_flow,
    save_flow,
    get_user_flows,
    delete_flow,
    get_user_usage,
)

router = APIRouter(tags=["User"])


@router.get("/me")
async def get_me(user: dict = Depends(get_current_user)):
    """Return current user profile including admin status."""
    email = user.get("email", "")
    uid = user.get("uid", "")
    is_admin = email in ADMIN_EMAILS

    # Fetch Firestore profile if available
    profile = {}
    try:
        doc = db.collection("users").document(uid).get()
        if doc.exists:
            profile = doc.to_dict()
    except Exception:
        pass

    return {
        "uid": uid,
        "email": email,
        "is_admin": is_admin,
        "plan": profile.get("plan", "free"),
        "flows_generated": profile.get("flows_generated", 0),
        "monthly_limit": profile.get("monthly_limit", 3),
        "is_blocked": profile.get("is_blocked", False),
    }


@router.post("/generate-flow")
@limiter.limit("10/minute")
async def generate_flow_endpoint(
    request: Request,
    body: GenerateFlowRequest,
    user: dict = Depends(get_current_user),
):
    """Generate a WATI automation flow from a prompt."""
    result = await generate_and_save_flow(user["uid"], body.prompt)
    return result



@router.post("/save-flow")
async def save_flow_endpoint(
    body: dict,
    user: dict = Depends(get_current_user),
):
    """Save an externally provided flow JSON."""
    prompt = body.get("prompt", "")
    json_data = body.get("json_data", {})
    result = await save_flow(user["uid"], prompt, json_data)
    return result


@router.get("/flows")
async def get_flows_endpoint(user: dict = Depends(get_current_user)):
    """List all flows for the current user."""
    flows = await get_user_flows(user["uid"])
    return {"flows": flows}


@router.delete("/flow/{flow_id}")
async def delete_flow_endpoint(
    flow_id: str,
    user: dict = Depends(get_current_user),
):
    """Delete a specific flow."""
    result = await delete_flow(user["uid"], flow_id)
    return result


@router.get("/user-usage")
async def get_usage_endpoint(user: dict = Depends(get_current_user)):
    """Get current usage stats for the authenticated user."""
    usage = await get_user_usage(user["uid"])
    return usage
