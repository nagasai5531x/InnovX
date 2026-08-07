from typing import Any, Dict
from app.agents.base_agent import BaseAgent
from app.core.constants import DiagnosisCategory


class DiagnosisAgent(BaseAgent):
    def __init__(self):
        super().__init__("DiagnosisAgent")

    async def process(self, session_id: str, context: Dict[str, Any]) -> Dict[str, Any]:
        feature_dict = context.get("feature_dict", {})
        events = context.get("events", [])

        # Rule-based diagnostic classifier backed by behavioral event heuristics
        failed_payments = feature_dict.get("payment_failed_count", 0.0)
        form_stuck = feature_dict.get("form_stuck_count", 0.0)
        coupon_applied = feature_dict.get("coupon_applied_count", 0.0)
        tab_switches = feature_dict.get("tab_switch_count", 0.0)
        duration = feature_dict.get("session_duration_seconds", 0.0)
        cart_total = feature_dict.get("cart_total_amount", 0.0)

        if failed_payments > 0:
            category = DiagnosisCategory.PAYMENT_FAILURE
            summary = "Customer experienced 1 or more payment processing gateway failures."
            confidence = 0.95
        elif form_stuck > 0:
            category = DiagnosisCategory.FORM_FRICTION
            summary = "User experienced friction or errors while filling checkout form fields."
            confidence = 0.88
        elif coupon_applied > 0 or "coupon" in str(events):
            category = DiagnosisCategory.COUPON_WAITING
            summary = "Customer attempted multiple invalid promo codes or is waiting for a valid discount."
            confidence = 0.85
        elif tab_switches >= 3:
            category = DiagnosisCategory.PRICE_COMPARISON
            summary = "Customer is switching browser tabs to compare prices on competitor platforms."
            confidence = 0.82
        elif cart_total > 0 and cart_total < 500:
            category = DiagnosisCategory.SHIPPING_COST
            summary = "Low cart value makes high shipping fee disproportionate to purchase price."
            confidence = 0.78
        elif duration > 300:
            category = DiagnosisCategory.DELIVERY_DELAY
            summary = "High session time reviewing shipping parameters or product delivery timelines."
            confidence = 0.72
        else:
            category = DiagnosisCategory.BROWSING
            summary = "Passive window shopping behavior without clear purchase intent."
            confidence = 0.65

        return {
            "session_id": session_id,
            "primary_category": category,
            "confidence": confidence,
            "root_cause_summary": summary,
            "behavioral_signals": {
                "failed_payments": failed_payments,
                "form_stuck": form_stuck,
                "tab_switches": tab_switches,
                "duration": duration,
            }
        }
