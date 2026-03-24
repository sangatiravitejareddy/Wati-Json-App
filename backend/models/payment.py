"""
Pydantic models for payments.
"""
from pydantic import BaseModel
from typing import Optional


class CreatePaymentRequest(BaseModel):
    plan: str  # "pro" or "enterprise"


class PaymentRecord(BaseModel):
    payment_id: str
    user_id: str
    plan: str
    amount: float
    status: str
    created_at: str


class DodoWebhookPayload(BaseModel):
    event: str
    payment_id: str
    status: str
    metadata: Optional[dict] = None
    amount: Optional[float] = None
    currency: Optional[str] = None
