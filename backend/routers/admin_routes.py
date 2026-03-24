"""
Admin API routes — user management, analytics, flow oversight.
"""
from fastapi import APIRouter, Depends
from middleware.auth import get_admin_user
from firebase_config import db
from config import PLAN_LIMITS

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/users")
async def get_all_users(admin: dict = Depends(get_admin_user)):
    """Get all registered users with their plan info."""
    users_ref = db.collection("users").stream()
    users = []
    for doc in users_ref:
        data = doc.to_dict()
        data["uid"] = doc.id
        users.append(data)
    return {"users": users}


@router.get("/flows")
async def get_all_flows(admin: dict = Depends(get_admin_user)):
    """Get all generated flows across all users."""
    flows_ref = db.collection("flows").order_by(
        "createdAt", direction="DESCENDING"
    ).limit(100).stream()
    flows = []
    for doc in flows_ref:
        data = doc.to_dict()
        flows.append(data)
    return {"flows": flows}


@router.get("/payments")
async def get_all_payments(admin: dict = Depends(get_admin_user)):
    """Get all payment records."""
    payments_ref = db.collection("payments").order_by(
        "createdAt", direction="DESCENDING"
    ).limit(100).stream()
    payments = []
    for doc in payments_ref:
        data = doc.to_dict()
        payments.append(data)
    return {"payments": payments}


@router.post("/upgrade-user")
async def upgrade_user(
    body: dict,
    admin: dict = Depends(get_admin_user),
):
    """Manually upgrade or downgrade a user's plan."""
    user_id = body.get("user_id")
    plan = body.get("plan", "pro")

    if plan not in PLAN_LIMITS:
        return {"error": f"Invalid plan: {plan}"}

    user_ref = db.collection("users").document(user_id)
    user_doc = user_ref.get()

    if not user_doc.exists:
        return {"error": "User not found"}

    monthly_limit = PLAN_LIMITS[plan]
    user_ref.update({
        "plan": plan,
        "monthly_limit": monthly_limit,
        "flows_generated": 0,
    })

    return {"message": f"User {user_id} upgraded to {plan}"}


@router.post("/block-user")
async def block_user(
    body: dict,
    admin: dict = Depends(get_admin_user),
):
    """Block or unblock a user account."""
    user_id = body.get("user_id")
    is_blocked = body.get("is_blocked", True)

    user_ref = db.collection("users").document(user_id)
    user_doc = user_ref.get()

    if not user_doc.exists:
        return {"error": "User not found"}

    user_ref.update({"is_blocked": is_blocked})

    action = "blocked" if is_blocked else "unblocked"
    return {"message": f"User {user_id} has been {action}"}


@router.post("/reset-usage")
async def reset_user_usage(
    body: dict,
    admin: dict = Depends(get_admin_user),
):
    """Reset a user's flow generation count to 0."""
    user_id = body.get("user_id")

    user_ref = db.collection("users").document(user_id)
    user_doc = user_ref.get()

    if not user_doc.exists:
        return {"error": "User not found"}

    user_ref.update({"flows_generated": 0})
    return {"message": f"Usage reset for user {user_id}"}


@router.get("/analytics")
async def get_analytics(admin: dict = Depends(get_admin_user)):
    """Get platform-wide analytics."""
    # Count users by plan
    users_ref = db.collection("users").stream()
    total_users = 0
    plan_counts = {"free": 0, "pro": 0, "enterprise": 0}
    total_flows_generated = 0
    blocked_users = 0

    for doc in users_ref:
        data = doc.to_dict()
        total_users += 1
        plan = data.get("plan", "free")
        plan_counts[plan] = plan_counts.get(plan, 0) + 1
        total_flows_generated += data.get("flows_generated", 0)
        if data.get("is_blocked"):
            blocked_users += 1

    # Count total flows
    flows_ref = db.collection("flows").stream()
    total_flows = sum(1 for _ in flows_ref)

    # Count payments
    payments_ref = db.collection("payments").stream()
    total_revenue = 0
    total_payments = 0
    for doc in payments_ref:
        data = doc.to_dict()
        total_payments += 1
        if data.get("status") == "completed":
            total_revenue += data.get("amount", 0)

    return {
        "total_users": total_users,
        "plan_counts": plan_counts,
        "total_flows": total_flows,
        "total_flows_generated": total_flows_generated,
        "total_payments": total_payments,
        "total_revenue": total_revenue,
        "blocked_users": blocked_users,
    }
