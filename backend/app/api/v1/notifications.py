from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.dependencies import get_db
from app.schemas.notification import NotificationSendRequest, NotificationResponse
from app.agents.notification_agent import NotificationAgent

router = APIRouter()


@router.post("", response_model=NotificationResponse, status_code=status.HTTP_201_CREATED)
async def dispatch_notification(
    req: NotificationSendRequest,
    db: AsyncSession = Depends(get_db)
):
    agent = NotificationAgent()
    context = {
        "final_action": req.action,
        "user": {"email": req.recipient_override or "customer@example.com", "phone_number": req.recipient_override or "+1234567890"}
    }
    res = await agent.execute(req.session_id, context)

    return NotificationResponse(
        id=req.session_id,
        session_id=req.session_id,
        channel=res["channel"],
        recipient=res["recipient"],
        content=res["message_body"],
        status=res["delivery_status"]
    )
