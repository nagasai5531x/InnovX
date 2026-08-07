from typing import Dict
from pydantic import BaseModel, ConfigDict
from app.core.constants import RiskLevel


class RiskPredictionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    session_id: str
    risk_score: float
    risk_level: RiskLevel
    confidence: float
    top_features: Dict[str, float]
    model_version: str
