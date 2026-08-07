from typing import Any, Dict
from app.agents.base_agent import BaseAgent
from app.core.config import settings
from app.core.constants import DecisionAction
from app.core.logger import logger


class NotificationAgent(BaseAgent):
    def __init__(self):
        super().__init__("NotificationAgent")

    async def process(self, session_id: str, context: Dict[str, Any]) -> Dict[str, Any]:
        action = context.get("final_action", DecisionAction.DO_NOTHING)
        user = context.get("user", {})
        recipient_email = user.get("email", "customer@example.com")
        recipient_phone = user.get("phone_number", "+1234567890")

        channel = "NONE"
        status = "SKIPPED"
        message_body = ""

        if action == DecisionAction.EMAIL_RESCUE:
            channel = "EMAIL"
            message_body = f"Hi! You left items in your cart. Complete your purchase now with 1-click checkout."
            status = self._send_email(recipient_email, message_body)

        elif action == DecisionAction.WHATSAPP_RESCUE:
            channel = "WHATSAPP"
            message_body = f"Hi! Your cart is reserved for 15 minutes. Tap here to complete payment on WhatsApp."
            status = self._send_whatsapp(recipient_phone, message_body)

        elif action in [DecisionAction.EXIT_POPUP, DecisionAction.DISCOUNT_COUPON, DecisionAction.FREE_SHIPPING, DecisionAction.COD_OFFER, DecisionAction.RETRY_PAYMENT]:
            channel = "IN_APP_POPUP"
            message_body = f"Action [{action.value}] pushed to active WebSocket session."
            status = "DELIVERED_WS"

        return {
            "session_id": session_id,
            "action": action,
            "channel": channel,
            "recipient": recipient_email if channel == "EMAIL" else recipient_phone,
            "message_body": message_body,
            "delivery_status": status,
        }

    def _send_email(self, email: str, body: str) -> str:
        logger.info("Dispatching email via SendGrid API", recipient=email, api_key_configured=bool(settings.SENDGRID_API_KEY))
        # Simulated SendGrid SDK dispatch
        return "SENT_SENDGRID"

    def _send_whatsapp(self, phone: str, body: str) -> str:
        logger.info("Dispatching WhatsApp message via Twilio API", recipient=phone, account_sid=settings.TWILIO_ACCOUNT_SID)
        # Simulated Twilio SDK dispatch
        return "SENT_TWILIO"
