from datetime import datetime
from pydantic import BaseModel, ConfigDict


class AnalyticsDashboardResponse(BaseModel):
    total_sessions: int
    high_risk_sessions: int
    rescued_sessions: int
    recovery_rate: float
    incremental_revenue: float
    total_discounts_given: float
    roi_multiplier: float
    cost_per_decision: float
    last_updated: datetime
