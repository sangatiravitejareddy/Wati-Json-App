"""
Application configuration — loaded from environment variables.
"""
import os
from dotenv import load_dotenv

load_dotenv()

# ── Firebase ──────────────────────────────────────────────────────────
FIREBASE_SERVICE_ACCOUNT_PATH = os.getenv(
    "FIREBASE_SERVICE_ACCOUNT_PATH", "firebase-service-account.json"
)
FIREBASE_SERVICE_ACCOUNT_JSON = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON")

# ── AI (Google Gemini) ────────────────────────────────────────────────
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")  # Set in .env — do NOT hardcode
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")

# ── Dodo Payments ─────────────────────────────────────────────────────
DODO_API_KEY = os.getenv("DODO_API_KEY", "rK7RDbbKgJ22k-yO.pgt5WFUfXsyuGKhEx4yybDSrhgBxFBSVyXaiAX2eKHi_85Hm")
DODO_WEBHOOK_SECRET = os.getenv("DODO_WEBHOOK_SECRET", "")
DODO_API_URL = os.getenv("DODO_API_URL", "https://api.dodopayments.com")

# ── App ───────────────────────────────────────────────────────────────
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")
SENTRY_DSN = os.getenv("SENTRY_DSN", "")

# ── Plan Limits ───────────────────────────────────────────────────────
PLAN_LIMITS = {
    "free": 3,        # 3 flows total (lifetime)
    "pro": 20,        # 20 flows per month
    "enterprise": -1,  # unlimited
}

# ── Admin emails (Firebase UIDs or emails allowed to access admin) ───
ADMIN_EMAILS = os.getenv("ADMIN_EMAILS", "test@watiflow.com").split(",")
