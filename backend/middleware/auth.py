"""
Firebase Authentication middleware.
Verifies the Firebase ID token from the Authorization header.
"""
from fastapi import Request, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from firebase_config import auth
from config import ADMIN_EMAILS

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """Verify Firebase ID token and return decoded user info."""
    token = credentials.credentials
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


async def get_admin_user(
    user: dict = Depends(get_current_user),
) -> dict:
    """Verify that the current user is an admin."""
    email = user.get("email", "")
    if email not in ADMIN_EMAILS:
        raise HTTPException(status_code=403, detail="Admin access required")
    return user
