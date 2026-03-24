"""
Auth routes — user registration endpoint for initializing Firestore user doc.
"""
from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from middleware.auth import get_current_user
from firebase_config import db
from config import PLAN_LIMITS

router = APIRouter(tags=["Auth"])


@router.post("/register")
async def register_user(user: dict = Depends(get_current_user)):
    """
    Initialize a Firestore user document after Firebase Auth signup.
    Called from the frontend after successful Firebase Authentication.
    """
    uid = user["uid"]
    email = user.get("email", "")

    user_ref = db.collection("users").document(uid)
    existing = user_ref.get()

    if existing.exists:
        return {"message": "User already registered", "user": existing.to_dict()}

    now = datetime.now(timezone.utc).isoformat()
    user_doc = {
        "userId": uid,
        "email": email,
        "plan": "free",
        "flowsGenerated": 0,
        "flows_generated": 0,
        "monthlyLimit": PLAN_LIMITS["free"],
        "monthly_limit": PLAN_LIMITS["free"],
        "is_blocked": False,
        "createdAt": now,
    }
    user_ref.set(user_doc)

    return {"message": "User registered successfully", "user": user_doc}
