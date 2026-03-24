"""
Payment API routes — checkout creation, Dodo webhook handler.
"""
import json
from fastapi import APIRouter, Depends, Request, HTTPException
from middleware.auth import get_current_user
from services.payment_service import (
    create_checkout_session,
    verify_webhook_signature,
    handle_webhook,
)

router = APIRouter(tags=["Payments"])


@router.post("/create-payment")
async def create_payment(
    body: dict,
    user: dict = Depends(get_current_user),
):
    """Create a Dodo Payments checkout session for plan upgrade."""
    plan = body.get("plan", "pro")
    result = await create_checkout_session(
        user_id=user["uid"],
        plan=plan,
        email=user.get("email", ""),
    )
    return result


@router.post("/webhook/dodo")
async def dodo_webhook(request: Request):
    """Handle incoming Dodo Payments webhook events."""
    body = await request.body()
    signature = request.headers.get("x-dodo-signature", "")

    if not verify_webhook_signature(body, signature):
        raise HTTPException(status_code=400, detail="Invalid webhook signature")

    payload = json.loads(body)
    event = payload.get("event", "")
    payment_id = payload.get("payment_id", "")
    metadata = payload.get("metadata", {})

    result = await handle_webhook(event, payment_id, metadata)
    return result
