from typing import Any, Dict
from app.agents.base_agent import BaseAgent
from app.ml.feature_pipeline import FeaturePipeline


class FeatureEngineeringAgent(BaseAgent):
    def __init__(self):
        super().__init__("FeatureEngineeringAgent")

    async def process(self, session_id: str, context: Dict[str, Any]) -> Dict[str, Any]:
        events = context.get("events", [])
        cart = context.get("cart", {})
        
        feature_dict = FeaturePipeline.extract_features(events, cart)
        return {
            "session_id": session_id,
            "feature_dict": feature_dict,
        }
