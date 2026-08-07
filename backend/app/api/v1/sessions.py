from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.dependencies import get_db
from app.models.entities import Session, SessionEvent
from app.schemas.events import ClickstreamEventCreate, SessionEndRequest, SessionEventResponse, SessionStateResponse
from app.services.orchestrator_service import MultiAgentOrchestrator

router = APIRouter()


@router.post("/event", response_model=SessionEventResponse, status_code=status.HTTP_201_CREATED)
async def record_session_event(
    event_in: ClickstreamEventCreate,
    db: AsyncSession = Depends(get_db)
):
    # Ensure session exists or create on the fly
    stmt = select(Session).where(Session.id == event_in.session_id)
    res = await db.execute(stmt)
    session_obj = res.scalars().first()

    if not session_obj:
        session_obj = Session(id=event_in.session_id, user_id=event_in.user_id)
        db.add(session_obj)
        await db.flush()

    db_event = SessionEvent(
        session_id=event_in.session_id,
        event_type=event_in.event_type,
        page_url=event_in.page_url,
        element_id=event_in.element_id,
        payload=event_in.payload,
        timestamp=event_in.timestamp
    )
    db.add(db_event)
    await db.commit()
    await db.refresh(db_event)

    # Trigger multi-agent pipeline asynchronously on high-friction events
    orchestrator = MultiAgentOrchestrator(db)
    await orchestrator.execute_pipeline(event_in.session_id)

    return db_event


@router.post("/end", response_model=SessionStateResponse)
async def end_session(
    end_in: SessionEndRequest,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Session).where(Session.id == end_in.session_id)
    res = await db.execute(stmt)
    session_obj = res.scalars().first()

    if not session_obj:
        raise HTTPException(status_code=404, detail="Session not found")

    session_obj.state = "EXPIRED"
    session_obj.ended_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(session_obj)

    return session_obj
