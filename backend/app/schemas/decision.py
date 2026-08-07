from typing import Optional
from pydantic import BaseModel, ConfigDict
from app.core.constants import DecisionAction


class DecisionRequest(BaseModel):
    session_id: str
    force_refresh: bool = False


class DecisionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    session_id: str
    recommended_action: DecisionAction
    business_justification: str
    expected_margin_impact: float
    is_approved_by_critic: bool
    policy_validated: bool = True
