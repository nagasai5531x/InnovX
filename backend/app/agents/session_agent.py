from typing import Any, Dict
from app.agents.base_agent import BaseAgent


class SessionIntelligenceAgent(BaseAgent):
    def __init__(self):
        super().__init__("SessionIntelligenceAgent")

    async def process(self, session_id: str, context: Dict[str, Any]) -> Dict[str, Any]:
        events = context.get("events", [])
        cart = context.get("cart", {"total_amount": 0.0, "item_count": 0})
        user = context.get("user", {})

        return {
            "session_id": session_id,
            "raw_events_count": len(events),
            "cart_amount": cart.get("total_amount", 0.0),
            "cart_items": cart.get("item_count", 0),
            "user_id": user.get("id") if user else None,
            "has_whatsapp_optin": user.get("whatsapp_optin", False) if user else False,
            "is_dnd_registered": user.get("dnd_registered", False) if user else False,
        }
