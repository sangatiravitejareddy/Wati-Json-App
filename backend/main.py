"""
AI WATI Flow Builder — FastAPI Application Entry Point
"""
import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from config import FRONTEND_URL
from middleware.rate_limit import limiter
from routers import user_routes, admin_routes, payment_routes, auth_routes

# ── Logging ───────────────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ── App ───────────────────────────────────────────────────────────────
app = FastAPI(
    title="AI WATI Flow Builder",
    description="Generate WATI WhatsApp automation flows using AI",
    version="1.0.0",
)

# ── Rate limiting ─────────────────────────────────────────────────────
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ── CORS ──────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────
app.include_router(auth_routes.router, prefix="/api")
app.include_router(user_routes.router, prefix="/api")
app.include_router(admin_routes.router, prefix="/api")
app.include_router(payment_routes.router, prefix="/api")


# ── Health Check ──────────────────────────────────────────────────────
@app.get("/")
async def health_check():
    return {"status": "healthy", "service": "AI WATI Flow Builder API"}


@app.get("/api/health")
async def api_health():
    return {"status": "ok"}


# ── Global Error Handler ─────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error: {exc}", exc_info=True)
    detail = str(exc) if str(exc) else "Internal server error"
    return JSONResponse(
        status_code=500,
        content={"detail": detail},
    )
