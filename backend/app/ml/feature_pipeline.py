from datetime import datetime, timezone
from typing import Any, Dict, List
import numpy as np
from app.core.constants import EventType


class FeaturePipeline:
    FEATURE_NAMES = [
        "session_duration_seconds",
        "total_page_views",
        "cart_item_count",
        "cart_total_amount",
        "payment_attempt_count",
        "payment_failed_count",
        "cursor_leave_count",
        "tab_switch_count",
        "form_stuck_count",
        "coupon_applied_count",
        "time_since_last_event_sec",
    ]

    @classmethod
    def extract_features(cls, events: List[Dict[str, Any]], cart_data: Dict[str, Any]) -> Dict[str, float]:
        if not events:
            return {name: 0.0 for name in cls.FEATURE_NAMES}

        sorted_events = sorted(events, key=lambda e: e.get("timestamp", datetime.now(timezone.utc)))
        first_time = sorted_events[0].get("timestamp")
        last_time = sorted_events[-1].get("timestamp")

        if isinstance(first_time, str):
            first_time = datetime.fromisoformat(first_time)
        if isinstance(last_time, str):
            last_time = datetime.fromisoformat(last_time)

        duration = (last_time - first_time).total_seconds() if first_time and last_time else 0.0

        event_counts = {e_type.value: 0 for e_type in EventType}
        for ev in sorted_events:
            ev_type = ev.get("event_type")
            if ev_type in event_counts:
                event_counts[ev_type] += 1

        now = datetime.now(timezone.utc)
        time_since_last = (now - last_time).total_seconds() if last_time else 0.0

        features = {
            "session_duration_seconds": float(duration),
            "total_page_views": float(event_counts.get(EventType.PAGE_VIEW.value, 0)),
            "cart_item_count": float(cart_data.get("item_count", 0)),
            "cart_total_amount": float(cart_data.get("total_amount", 0.0)),
            "payment_attempt_count": float(event_counts.get(EventType.PAYMENT_ATTEMPT.value, 0)),
            "payment_failed_count": float(event_counts.get(EventType.PAYMENT_FAILED.value, 0)),
            "cursor_leave_count": float(event_counts.get(EventType.CURSOR_LEAVE.value, 0)),
            "tab_switch_count": float(event_counts.get(EventType.TAB_SWITCH.value, 0)),
            "form_stuck_count": float(event_counts.get(EventType.FORM_STUCK.value, 0)),
            "coupon_applied_count": float(event_counts.get(EventType.COUPON_APPLY.value, 0)),
            "time_since_last_event_sec": float(time_since_last),
        }
        return features

    @classmethod
    def to_feature_vector(cls, feature_dict: Dict[str, float]) -> np.ndarray:
        return np.array([[feature_dict.get(name, 0.0) for name in cls.FEATURE_NAMES]], dtype=np.float32)
