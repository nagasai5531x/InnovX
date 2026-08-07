from typing import Any, Dict
from app.agents.base_agent import BaseAgent
from app.core.constants import DecisionAction, DiagnosisCategory, RiskLevel


class DecisionAgent(BaseAgent):
    def __init__(self):
        super().__init__("DecisionAgent")

    async def process(self, session_id: str, context: Dict[str, Any]) -> Dict[str, Any]:
        risk_level = context.get("risk_level", RiskLevel.LOW)
        risk_score = context.get("risk_score", 0.0)
        diagnosis = context.get("diagnosis_category", DiagnosisCategory.BROWSING)
        cart_total = context.get("cart_amount", 0.0)

        # Profit-Optimized Decision Logic
        if risk_level == RiskLevel.LOW or risk_score < 0.35:
            action = DecisionAction.DO_NOTHING
            justification = "Low abandonment risk. Avoid diluting product margin with unnecessary incentives."
            margin_impact = 0.0

        elif diagnosis == DiagnosisCategory.PAYMENT_FAILURE:
            action = DecisionAction.RETRY_PAYMENT
            justification = "Payment failure detected. Offer instant retry with alternative payment gateway."
            margin_impact = cart_total * 0.95

        elif diagnosis == DiagnosisCategory.SHIPPING_COST or (cart_total > 0 and cart_total < 500):
            action = DecisionAction.FREE_SHIPPING
            justification = "Cart total below shipping threshold causing dropoff. Offer free shipping to unlock conversion."
            margin_impact = (cart_total * 0.85) - 50.0

        elif diagnosis == DiagnosisCategory.COUPON_WAITING:
            action = DecisionAction.DISCOUNT_COUPON
            justification = "High coupon sensitivity detected. Grant a targeted 10% rescue coupon."
            margin_impact = (cart_total * 0.90) - (cart_total * 0.10)

        elif diagnosis == DiagnosisCategory.FORM_FRICTION or diagnosis == DiagnosisCategory.PRICE_COMPARISON:
            action = DecisionAction.EXIT_POPUP
            justification = "High exit intent / comparison behavior detected. Present interactive exit popup."
            margin_impact = cart_total * 0.90

        elif risk_level == RiskLevel.CRITICAL:
            action = DecisionAction.WHATSAPP_RESCUE
            justification = "Critical abandonment risk with high basket value. Trigger automated WhatsApp rescue prompt."
            margin_impact = cart_total * 0.88

        else:
            action = DecisionAction.EMAIL_RESCUE
            justification = "Medium risk level session. Dispatch automated abandoned cart email reminder."
            margin_impact = cart_total * 0.85

        return {
            "session_id": session_id,
            "recommended_action": action,
            "business_justification": justification,
            "expected_margin_impact": round(margin_impact, 2),
        }
