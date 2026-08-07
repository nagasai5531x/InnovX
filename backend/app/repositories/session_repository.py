from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.models.entities import Session, SessionEvent, Cart
from app.repositories.base_repository import BaseRepository


class SessionRepository(BaseRepository[Session]):
    def __init__(self, db: AsyncSession):
        super().__init__(Session, db)

    async def get_session_with_details(self, session_id: str) -> Optional[Session]:
        stmt = (
            select(Session)
            .where(Session.id == session_id)
            .options(
                selectinload(Session.events),
                selectinload(Session.cart),
                selectinload(Session.user)
            )
        )
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def create_event(self, event: SessionEvent) -> SessionEvent:
        self.db.add(event)
        await self.db.flush()
        await self.db.refresh(event)
        return event

    async def get_session_events(self, session_id: str) -> List[SessionEvent]:
        stmt = (
            select(SessionEvent)
            .where(SessionEvent.session_id == session_id)
            .order_by(SessionEvent.timestamp.asc())
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())
