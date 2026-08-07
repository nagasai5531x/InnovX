from typing import Optional
from pydantic import BaseModel, ConfigDict
from app.core.constants import DecisionAction


class NotificationSendRequest(BaseModel):
    session_id: str
    action: DecisionAction
    recipient_override: Optional[str] = None


class NotificationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    session_id: str
    channel: str
    recipient: str
    content: str
    status: str
