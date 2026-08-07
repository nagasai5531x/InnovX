from datetime import datetime, timezone
from typing import Any, Dict, Optional
from pydantic import BaseModel, ConfigDict, Field
from app.core.constants import EventType, SessionState


class ClickstreamEventCreate(BaseModel):
    session_id: str
    user_id: Optional[str] = None
    event_type: EventType
    page_url: Optional[str] = None
    element_id: Optional[str] = None
    payload: Dict[str, Any] = Field(default_factory=dict)
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class SessionEndRequest(BaseModel):
    session_id: str
    reason: Optional[str] = "USER_DISCONNECT"


class SessionEventResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    session_id: str
    event_type: EventType
    page_url: Optional[str]
    element_id: Optional[str]
    payload: Dict[str, Any]
    timestamp: datetime


class SessionStateResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: Optional[str]
    state: SessionState
    started_at: datetime
    ended_at: Optional[datetime]
