from typing import Any, Dict
from app.agents.base_agent import BaseAgent
from app.ml.predictor import CartRiskPredictor


class RiskPredictionAgent(BaseAgent):
    def __init__(self):
        super().__init__("RiskPredictionAgent")

    async def process(self, session_id: str, context: Dict[str, Any]) -> Dict[str, Any]:
        feature_dict = context.get("feature_dict", {})
        risk_score, risk_level, confidence, top_features = CartRiskPredictor.predict_abandonment_risk(feature_dict)

        return {
            "session_id": session_id,
            "risk_score": risk_score,
            "risk_level": risk_level,
            "confidence": confidence,
            "top_features": top_features,
            "model_version": "xgboost_v1.0.0",
        }
