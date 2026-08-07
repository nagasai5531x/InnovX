from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.dependencies import get_db
from app.models.entities import RiskPrediction
from app.schemas.risk import RiskPredictionResponse

router = APIRouter()


@router.get("/{session_id}", response_model=RiskPredictionResponse)
async def get_session_risk(
    session_id: str,
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(RiskPrediction)
        .where(RiskPrediction.session_id == session_id)
        .order_by(RiskPrediction.created_at.desc())
    )
    res = await db.execute(stmt)
    prediction = res.scalars().first()

    if not prediction:
        raise HTTPException(status_code=404, detail="No risk prediction found for this session")

    return prediction
