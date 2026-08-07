from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.dependencies import get_db
from app.models.entities import Diagnosis
from app.schemas.diagnosis import DiagnosisResponse

router = APIRouter()


@router.get("/{session_id}", response_model=DiagnosisResponse)
async def get_session_diagnosis(
    session_id: str,
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(Diagnosis)
        .where(Diagnosis.session_id == session_id)
        .order_by(Diagnosis.created_at.desc())
    )
    res = await db.execute(stmt)
    diag = res.scalars().first()

    if not diag:
        raise HTTPException(status_code=404, detail="No diagnosis recorded for this session")

    return diag
