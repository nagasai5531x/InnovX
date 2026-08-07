from typing import Any, Dict
from app.agents.base_agent import BaseAgent
from app.core.logger import logger


class AuditAgent(BaseAgent):
    def __init__(self):
        super().__init__("AuditAgent")

    async def process(self, session_id: str, context: Dict[str, Any]) -> Dict[str, Any]:
        risk_score = context.get("risk_score")
        risk_level = context.get("risk_level")
        diagnosis = context.get("diagnosis_category")
        action = context.get("final_action")
        justification = context.get("business_justification")

        audit_payload = {
            "session_id": session_id,
            "risk_score": risk_score,
            "risk_level": risk_level,
            "diagnosis": diagnosis,
            "final_action": action,
            "justification": justification,
            "explainability_breakdown": context.get("top_features", {}),
            "policy_compliant": context.get("is_compliant", True),
            "critic_approved": context.get("is_approved_by_critic", True),
        }

        logger.info("AUDIT_LOG_ENTRY", **audit_payload)

        return {
            "session_id": session_id,
            "audit_persisted": True,
            "audit_payload": audit_payload,
        }
