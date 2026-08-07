from typing import Any, Dict, List
from app.agents.base_agent import BaseAgent
from app.core.constants import DecisionAction, PolicyViolation


class PolicyAgent(BaseAgent):
    def __init__(self):
        super().__init__("PolicyAgent")

    async def process(self, session_id: str, context: Dict[str, Any]) -> Dict[str, Any]:
        action = context.get("recommended_action", DecisionAction.DO_NOTHING)
        has_whatsapp_optin = context.get("has_whatsapp_optin", False)
        is_dnd_registered = context.get("is_dnd_registered", False)
        cart_amount = context.get("cart_amount", 0.0)
        daily_discount_budget_remaining = context.get("remaining_discount_budget", 50000.0)

        violations: List[PolicyViolation] = []

        # TRAI & DND Compliance
        if action == DecisionAction.WHATSAPP_RESCUE:
            if not has_whatsapp_optin:
                violations.append(PolicyViolation.NO_WHATSAPP_OPTIN)
            if is_dnd_registered:
                violations.append(PolicyViolation.TRAI_DND_BLOCKED)

        # Budget & Margin Safeguards
        if action == DecisionAction.DISCOUNT_COUPON:
            estimated_discount = cart_amount * 0.10
            if estimated_discount > daily_discount_budget_remaining:
                violations.append(PolicyViolation.BUDGET_EXCEEDED)
            if cart_amount > 0 and (cart_amount * 0.20) < estimated_discount:
                violations.append(PolicyViolation.LOW_MARGIN)

        is_compliant = len(violations) == 0
        fallback_action = action if is_compliant else DecisionAction.EXIT_POPUP

        return {
            "session_id": session_id,
            "original_action": action,
            "is_compliant": is_compliant,
            "violations": violations,
            "validated_action": fallback_action,
        }
