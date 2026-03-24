"""
Pydantic models for User documents.
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    email: str
    plan: str = "free"
    flows_generated: int = 0
    monthly_limit: int = 3
    is_blocked: bool = False
    created_at: Optional[str] = None


class UserCreate(BaseModel):
    email: str
    uid: str


class UserUpdate(BaseModel):
    plan: Optional[str] = None
    monthly_limit: Optional[int] = None
    is_blocked: Optional[bool] = None


class UserResponse(BaseModel):
    uid: str
    email: str
    plan: str
    flows_generated: int
    monthly_limit: int
    is_blocked: bool
    created_at: str
