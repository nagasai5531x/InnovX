from datetime import datetime
from typing import Any, Dict
from pydantic import BaseModel, ConfigDict


class AuditLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    session_id: str
    agent_name: str
    action_type: str
    input_data: Dict[str, Any]
    output_data: Dict[str, Any]
    execution_time_ms: float
    created_at: datetime
