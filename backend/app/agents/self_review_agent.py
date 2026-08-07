from typing import Any, Dict
from app.agents.base_agent import BaseAgent
from app.core.constants import DecisionAction, RiskLevel


class SelfReviewAgent(BaseAgent):
    def __init__(self):
        super().__init__("SelfReviewAgent")

    async def process(self, session_id: str, context: Dict[str, Any]) -> Dict[str, Any]:
        action = context.get("validated_action", DecisionAction.DO_NOTHING)
        risk_score = context.get("risk_score", 0.0)
        risk_level = context.get("risk_level", RiskLevel.LOW)
        cart_amount = context.get("cart_amount", 0.0)

        is_approved = True
        critique_reason = "Action meets all quality, compliance, and ROI benchmarks."
        final_action = action

        # Self-Critic Check: Reject unnecessary coupons on high-value / low-risk carts
        if action == DecisionAction.DISCOUNT_COUPON:
            if risk_score < 0.60:
                is_approved = False
                final_action = DecisionAction.EXIT_POPUP
                critique_reason = "Rejected coupon: Risk score (0.60 threshold not met). Reverted to Non-discount Exit Popup."
            elif cart_amount > 10000.0:
                is_approved = False
                final_action = DecisionAction.FREE_SHIPPING
                critique_reason = "Rejected coupon: High cart value (>10k). Substituted with Free Shipping to protect gross margin."

        return {
            "session_id": session_id,
            "is_approved_by_critic": is_approved,
            "critique_reason": critique_reason,
            "final_action": final_action,
        }
