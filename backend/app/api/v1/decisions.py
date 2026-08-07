from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.dependencies import get_db
from app.schemas.decision import DecisionRequest, DecisionResponse
from app.services.orchestrator_service import MultiAgentOrchestrator

router = APIRouter()


@router.post("", response_model=DecisionResponse)
async def generate_decision(
    req: DecisionRequest,
    db: AsyncSession = Depends(get_db)
):
    orchestrator = MultiAgentOrchestrator(db)
    try:
        pipeline_output = await orchestrator.execute_pipeline(req.session_id)
        dec = pipeline_output["decision"]
        return DecisionResponse(
            id=req.session_id,
            session_id=req.session_id,
            recommended_action=dec["action"],
            business_justification=dec["business_justification"],
            expected_margin_impact=dec["expected_margin_impact"],
            is_approved_by_critic=dec["is_approved_by_critic"],
            policy_validated=dec["policy_validated"]
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
