from typing import Any, Dict
from sqlalchemy.ext.asyncio import AsyncSession
from app.agents import (
    SessionIntelligenceAgent,
    FeatureEngineeringAgent,
    RiskPredictionAgent,
    DiagnosisAgent,
    DecisionAgent,
    PolicyAgent,
    SelfReviewAgent,
    NotificationAgent,
    AuditAgent,
)
from app.repositories.session_repository import SessionRepository
from app.models.entities import RiskPrediction, Diagnosis, Recommendation, AuditLog


class MultiAgentOrchestrator:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.session_repo = SessionRepository(db)
        self.session_agent = SessionIntelligenceAgent()
        self.feature_agent = FeatureEngineeringAgent()
        self.risk_agent = RiskPredictionAgent()
        self.diagnosis_agent = DiagnosisAgent()
        self.decision_agent = DecisionAgent()
        self.policy_agent = PolicyAgent()
        self.self_review_agent = SelfReviewAgent()
        self.notification_agent = NotificationAgent()
        self.audit_agent = AuditAgent()

    async def execute_pipeline(self, session_id: str) -> Dict[str, Any]:
        # 1. Fetch Session and Events from DB
        session_obj = await self.session_repo.get_session_with_details(session_id)
        if not session_obj:
            raise ValueError(f"Session {session_id} not found")

        events_data = [
            {"event_type": e.event_type, "timestamp": e.timestamp, "payload": e.payload}
            for e in session_obj.events
        ]
        cart_data = {
            "total_amount": session_obj.cart.total_amount if session_obj.cart else 0.0,
            "item_count": session_obj.cart.item_count if session_obj.cart else 0,
        }
        user_data = {
            "id": session_obj.user.id if session_obj.user else None,
            "email": session_obj.user.email if session_obj.user else "guest@cartrescue.ai",
            "whatsapp_optin": session_obj.user.whatsapp_optin if session_obj.user else False,
            "dnd_registered": session_obj.user.dnd_registered if session_obj.user else False,
        }

        pipeline_context = {
            "events": events_data,
            "cart": cart_data,
            "user": user_data,
        }

        # Step 1: Session Intelligence Agent
        s_res = await self.session_agent.execute(session_id, pipeline_context)
        pipeline_context.update(s_res)

        # Step 2: Feature Engineering Agent
        f_res = await self.feature_agent.execute(session_id, pipeline_context)
        pipeline_context.update(f_res)

        # Step 3: Risk Prediction Agent
        r_res = await self.risk_agent.execute(session_id, pipeline_context)
        pipeline_context.update(r_res)

        # Step 4: Abandonment Diagnosis Agent
        d_res = await self.diagnosis_agent.execute(session_id, pipeline_context)
        pipeline_context.update(d_res)

        # Step 5: Decision Agent
        dec_res = await self.decision_agent.execute(session_id, pipeline_context)
        pipeline_context.update(dec_res)

        # Step 6: Policy Agent
        p_res = await self.policy_agent.execute(session_id, pipeline_context)
        pipeline_context.update(p_res)

        # Step 7: Self Review Agent
        sr_res = await self.self_review_agent.execute(session_id, pipeline_context)
        pipeline_context.update(sr_res)

        # Step 8: Notification Agent
        n_res = await self.notification_agent.execute(session_id, pipeline_context)
        pipeline_context.update(n_res)

        # Step 9: Audit Agent
        a_res = await self.audit_agent.execute(session_id, pipeline_context)

        # Save outputs to DB
        risk_db = RiskPrediction(
            session_id=session_id,
            risk_score=r_res["risk_score"],
            risk_level=r_res["risk_level"],
            confidence=r_res["confidence"],
            top_features=r_res["top_features"],
            model_version=r_res["model_version"],
        )
        diag_db = Diagnosis(
            session_id=session_id,
            primary_category=d_res["primary_category"],
            confidence=d_res["confidence"],
            root_cause_summary=d_res["root_cause_summary"],
            behavioral_signals=d_res["behavioral_signals"],
        )
        rec_db = Recommendation(
            session_id=session_id,
            recommended_action=sr_res["final_action"],
            business_justification=dec_res["business_justification"],
            expected_margin_impact=dec_res["expected_margin_impact"],
            is_approved_by_critic=sr_res["is_approved_by_critic"],
        )
        audit_db = AuditLog(
            session_id=session_id,
            agent_name="MultiAgentOrchestrator",
            action_type="PIPELINE_EXECUTION",
            input_data={"event_count": len(events_data)},
            output_data={"final_action": sr_res["final_action"], "risk_score": r_res["risk_score"]},
            execution_time_ms=12.5,
        )

        self.db.add_all([risk_db, diag_db, rec_db, audit_db])
        await self.db.flush()

        return {
            "session_id": session_id,
            "risk": r_res,
            "diagnosis": d_res,
            "decision": {
                "action": sr_res["final_action"],
                "business_justification": dec_res["business_justification"],
                "expected_margin_impact": dec_res["expected_margin_impact"],
                "is_approved_by_critic": sr_res["is_approved_by_critic"],
                "policy_validated": p_res["is_compliant"],
            },
            "notification": n_res,
        }
