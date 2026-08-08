from typing import Dict, Tuple
from app.ml.feature_pipeline import FeaturePipeline
from app.ml.model_loader import model_loader
from app.core.constants import RiskLevel


class CartRiskPredictor:
    @classmethod
    def predict_abandonment_risk(cls, feature_dict: Dict[str, float]) -> Tuple[float, RiskLevel, float, Dict[str, float]]:
        vec = FeaturePipeline.to_feature_vector(feature_dict)
        raw_prob = model_loader.predict(vec)
        
        # Determine risk level
        if raw_prob >= 0.75:
            risk_level = RiskLevel.CRITICAL
        elif raw_prob >= 0.50:
            risk_level = RiskLevel.HIGH
        elif raw_prob >= 0.25:
            risk_level = RiskLevel.MEDIUM
        else:
            risk_level = RiskLevel.LOW

        # Confidence calculation
        confidence = round(0.85 + (abs(raw_prob - 0.5) * 0.25), 4)

        # Feature importance attribution (SHAP surrogate score)
        top_features = {
            "payment_failure_signal": round(feature_dict.get("payment_failed_count", 0.0) * 0.45, 4),
            "payment_failed_count": round(feature_dict.get("payment_failed_count", 0.0) * 0.45, 4),
            "high_shipping_fee": round(feature_dict.get("shipping_fee", 0.0) * 0.05, 4),
            "cursor_leave_count": round(feature_dict.get("cursor_leave_count", 0.0) * 0.25, 4),
            "tab_switch_count": round(feature_dict.get("tab_switch_count", 0.0) * 0.20, 4),
            "cart_total_amount": round(feature_dict.get("cart_total_amount", 0.0) * 0.001, 4),
        }

        return round(float(raw_prob), 4), risk_level, confidence, top_features
