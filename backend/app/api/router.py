from fastapi import APIRouter
from app.api.v1 import (
    sessions,
    risk,
    diagnosis,
    decisions,
    notifications,
    analytics,
    audit,
    websocket,
)

api_router = APIRouter()

api_router.include_router(sessions.router, prefix="/session", tags=["Session Intelligence"])
api_router.include_router(risk.router, prefix="/risk", tags=["Risk Prediction"])
api_router.include_router(diagnosis.router, prefix="/diagnosis", tags=["Abandonment Diagnosis"])
api_router.include_router(decisions.router, prefix="/decision", tags=["Decision Intelligence"])
api_router.include_router(notifications.router, prefix="/notification", tags=["Notifications & Engagement"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics & KPIs"])
api_router.include_router(audit.router, prefix="/audit", tags=["Audit & Explainability"])
api_router.include_router(websocket.router, prefix="/ws", tags=["Real-time WebSockets"])
