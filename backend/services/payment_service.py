"""
Dodo Payments integration — checkout creation, webhook handling, plan upgrades.
"""
import hmac
import hashlib
import uuid
import logging
from datetime import datetime, timezone

import httpx
from fastapi import HTTPException

from config import DODO_API_KEY, DODO_WEBHOOK_SECRET, DODO_API_URL, FRONTEND_URL
from firebase_config import db

logger = logging.getLogger(__name__)

PLAN_PRICES = {
    "pro": 500,         # $5.00 in cents
    "enterprise": 2900,  # $29.00 in cents
}


async def create_checkout_session(user_id: str, plan: str, email: str) -> dict:
    """Create a Dodo Payments checkout session."""
    if plan not in PLAN_PRICES:
        raise HTTPException(status_code=400, detail=f"Invalid plan: {plan}")

    payment_id = str(uuid.uuid4())

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{DODO_API_URL}/v1/payments",
                headers={
                    "Authorization": f"Bearer {DODO_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "amount": PLAN_PRICES[plan],
                    "currency": "USD",
                    "customer_email": email,
                    "success_url": f"{FRONTEND_URL}/dashboard?payment=success",
                    "cancel_url": f"{FRONTEND_URL}/dashboard/pricing?payment=cancelled",
                    "metadata": {
                        "user_id": user_id,
                        "plan": plan,
                        "payment_id": payment_id,
                    },
                },
            )
            response.raise_for_status()
            data = response.json()
    except httpx.HTTPError as e:
        logger.error(f"Dodo Payments API error: {e}")
        raise HTTPException(status_code=502, detail="Payment provider error")

    # Save pending payment record
    now = datetime.now(timezone.utc).isoformat()
    db.collection("payments").document(payment_id).set({
        "paymentId": payment_id,
        "userId": user_id,
        "plan": plan,
        "amount": PLAN_PRICES[plan] / 100,
        "status": "pending",
        "createdAt": now,
    })

    return {
        "payment_id": payment_id,
        "checkout_url": data.get("checkout_url", data.get("url", "")),
    }


def verify_webhook_signature(payload: bytes, signature: str) -> bool:
    """Verify Dodo Payments webhook signature using HMAC-SHA256."""
    if not DODO_WEBHOOK_SECRET:
        logger.warning("Webhook secret not configured — skipping verification")
        return True

    expected = hmac.new(
        DODO_WEBHOOK_SECRET.encode(), payload, hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(expected, signature)


async def handle_webhook(event: str, payment_id: str, metadata: dict) -> dict:
    """Process a Dodo Payments webhook event."""
    if event == "payment.success" or event == "payment_intent.succeeded":
        user_id = metadata.get("user_id")
        plan = metadata.get("plan", "pro")

        if not user_id:
            logger.error("Webhook missing user_id in metadata")
            return {"status": "error", "message": "Missing user_id"}

        # Upgrade user plan
        user_ref = db.collection("users").document(user_id)
        monthly_limit = 20 if plan == "pro" else -1

        user_ref.update({
            "plan": plan,
            "monthly_limit": monthly_limit,
            "flows_generated": 0,  # Reset monthly counter on upgrade
        })

        # Update payment status
        pay_ref = db.collection("payments").document(
            metadata.get("payment_id", payment_id)
        )
        if pay_ref.get().exists:
            pay_ref.update({"status": "completed"})

        logger.info(f"User {user_id} upgraded to {plan}")
        return {"status": "ok", "message": f"User upgraded to {plan}"}

    elif event == "payment.failed":
        # Mark payment as failed
        pay_ref = db.collection("payments").document(
            metadata.get("payment_id", payment_id)
        )
        if pay_ref.get().exists:
            pay_ref.update({"status": "failed"})
        return {"status": "ok", "message": "Payment marked as failed"}

    return {"status": "ignored", "message": f"Unhandled event: {event}"}
