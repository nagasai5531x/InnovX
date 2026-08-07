import pytest
from app.agents import RiskPredictionAgent, DecisionAgent, PolicyAgent
from app.core.constants import DecisionAction, RiskLevel


@pytest.mark.asyncio
async def test_risk_agent_prediction():
    agent = RiskPredictionAgent()
    context = {
        "feature_dict": {
            "session_duration_seconds": 120.0,
            "total_page_views": 5.0,
            "cart_item_count": 2.0,
            "cart_total_amount": 1500.0,
            "payment_failed_count": 1.0,
            "cursor_leave_count": 2.0,
            "tab_switch_count": 1.0,
            "form_stuck_count": 0.0,
            "coupon_applied_count": 0.0,
            "time_since_last_event_sec": 10.0,
        }
    }
    result = await agent.execute("test_session_risk", context)
    assert "risk_score" in result
    assert result["risk_score"] > 0.0
    assert "risk_level" in result


@pytest.mark.asyncio
async def test_policy_agent_dnd_block():
    agent = PolicyAgent()
    context = {
        "recommended_action": DecisionAction.WHATSAPP_RESCUE,
        "has_whatsapp_optin": False,
        "is_dnd_registered": True,
        "cart_amount": 1000.0,
    }
    result = await agent.execute("test_policy_dnd", context)
    assert result["is_compliant"] is False
    assert result["validated_action"] == DecisionAction.EXIT_POPUP
