from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.dependencies import get_db
from app.models.entities import AuditLog
from app.schemas.audit import AuditLogResponse

router = APIRouter()


@router.get("/{session_id}", response_model=List[AuditLogResponse])
async def get_session_audit(
    session_id: str,
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(AuditLog)
        .where(AuditLog.session_id == session_id)
        .order_by(AuditLog.created_at.desc())
    )
    res = await db.execute(stmt)
    logs = res.scalars().all()

    return list(logs)
