from typing import Any, Dict
from pydantic import BaseModel, ConfigDict
from app.core.constants import DiagnosisCategory


class DiagnosisResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    session_id: str
    primary_category: DiagnosisCategory
    confidence: float
    root_cause_summary: str
    behavioral_signals: Dict[str, Any]
