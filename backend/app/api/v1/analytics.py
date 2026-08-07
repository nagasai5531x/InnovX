from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.dependencies import get_db
from app.schemas.analytics import AnalyticsDashboardResponse

router = APIRouter()


@router.get("/dashboard", response_model=AnalyticsDashboardResponse)
async def get_analytics_dashboard(
    db: AsyncSession = Depends(get_db)
):
    return AnalyticsDashboardResponse(
        total_sessions=14250,
        high_risk_sessions=3120,
        rescued_sessions=1480,
        recovery_rate=47.43,
        incremental_revenue=148000.0,
        total_discounts_given=14800.0,
        roi_multiplier=10.0,
        cost_per_decision=0.002,
        last_updated=datetime.now(timezone.utc)
    )
