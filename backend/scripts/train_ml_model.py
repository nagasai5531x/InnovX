"""
CartSense AI — Synthetic Dataset Generator & XGBoost Model Trainer
Generates 10,000 synthetic e-commerce session samples, trains an XGBoost classifier for cart abandonment risk prediction,
evaluates metrics, and exports model.xgb binary artifact for runtime inference.
"""

import os
import sys
import numpy as np
import pandas as pd
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, roc_auc_score
from sklearn.ensemble import RandomForestClassifier

# Ensure backend root is on sys.path and sys.stdout uses utf-8
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

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

def generate_synthetic_dataset(n_samples: int = 10000, seed: int = 42) -> pd.DataFrame:
    np.random.seed(seed)
    
    session_duration = np.random.exponential(scale=120, size=n_samples) + 10
    total_page_views = np.random.poisson(lam=5, size=n_samples) + 1
    cart_item_count = np.random.poisson(lam=2, size=n_samples) + 1
    cart_total_amount = np.random.gamma(shape=2, scale=75, size=n_samples) + 15.0
    
    payment_attempt = np.random.binomial(n=3, p=0.3, size=n_samples)
    payment_failed = np.array([np.random.binomial(n=att, p=0.4) if att > 0 else 0 for att in payment_attempt])
    
    cursor_leave = np.random.poisson(lam=1.5, size=n_samples)
    tab_switch = np.random.poisson(lam=2.0, size=n_samples)
    form_stuck = np.random.binomial(n=1, p=0.15, size=n_samples)
    coupon_applied = np.random.binomial(n=2, p=0.25, size=n_samples)
    time_since_last = np.random.exponential(scale=30, size=n_samples)
    
    # Ground truth formula for cart abandonment risk
    risk_score = (
        0.35 * (payment_failed > 0) +
        0.25 * (cursor_leave >= 2) +
        0.20 * (tab_switch >= 3) +
        0.15 * (form_stuck == 1) +
        0.10 * (cart_total_amount > 200) +
        0.10 * (session_duration > 180) -
        0.20 * (coupon_applied > 0) +
        np.random.normal(loc=0, scale=0.1, size=n_samples)
    )
    
    # Sigmoidal conversion probability -> binary label (1 = Abandoned, 0 = Converted)
    prob_abandon = 1.0 / (1.0 + np.exp(-3.0 * (risk_score - 0.35)))
    abandoned = (np.random.rand(n_samples) < prob_abandon).astype(int)
    
    df = pd.DataFrame({
        "session_duration_seconds": np.round(session_duration, 1),
        "total_page_views": total_page_views,
        "cart_item_count": cart_item_count,
        "cart_total_amount": np.round(cart_total_amount, 2),
        "payment_attempt_count": payment_attempt,
        "payment_failed_count": payment_failed,
        "cursor_leave_count": cursor_leave,
        "tab_switch_count": tab_switch,
        "form_stuck_count": form_stuck,
        "coupon_applied_count": coupon_applied,
        "time_since_last_event_sec": np.round(time_since_last, 1),
        "abandoned": abandoned
    })
    return df

def train_and_export():
    print("🤖 Generating 10,000 synthetic cart abandonment session samples...")
    df = generate_synthetic_dataset(10000)
    
    X = df[FEATURE_NAMES]
    y = df["abandoned"]
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.20, random_state=42, stratify=y)
    
    print(f"📊 Dataset split: Train={len(X_train)} samples, Test={len(X_test)} samples")
    print(f"📈 Baseline abandonment rate: {y.mean():.2%}")
    
    # ── 1. XGBoost Model Training
    print("\n⚡ Training XGBoost Classifier...")
    xgb_clf = xgb.XGBClassifier(
        n_estimators=150,
        max_depth=5,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        eval_metric="logloss",
        random_state=42
    )
    xgb_clf.fit(X_train, y_train)
    
    y_pred_xgb = xgb_clf.predict(X_test)
    y_prob_xgb = xgb_clf.predict_proba(X_test)[:, 1]
    
    acc_xgb = accuracy_score(y_test, y_pred_xgb)
    prec_xgb = precision_score(y_test, y_pred_xgb)
    rec_xgb = recall_score(y_test, y_pred_xgb)
    auc_xgb = roc_auc_score(y_test, y_prob_xgb)
    
    print("🎯 XGBoost Model Results:")
    print(f"   Accuracy:  {acc_xgb:.4f}")
    print(f"   Precision: {prec_xgb:.4f}")
    print(f"   Recall:    {rec_xgb:.4f}")
    print(f"   ROC-AUC:   {auc_xgb:.4f}")
    
    # ── 2. Random Forest Comparison
    rf_clf = RandomForestClassifier(n_estimators=100, max_depth=6, random_state=42)
    rf_clf.fit(X_train, y_train)
    y_prob_rf = rf_clf.predict_proba(X_test)[:, 1]
    auc_rf = roc_auc_score(y_test, y_prob_rf)
    print(f"🌲 Random Forest ROC-AUC benchmark: {auc_rf:.4f}")
    
    # ── 3. Feature Importance Analysis
    importances = xgb_clf.feature_importances_
    print("\n🔥 Top Feature Importances (XGBoost):")
    for feat, imp in sorted(zip(FEATURE_NAMES, importances), key=lambda x: x[1], reverse=True):
        print(f"   - {feat:30s}: {imp:.4f}")
        
    # ── 4. Export Model Artifacts
    model_paths = [
        os.path.join(backend_dir, "model.xgb"),
        os.path.join(backend_dir, "app", "ml", "model.xgb")
    ]
    
    booster = xgb_clf.get_booster()
    for path in model_paths:
        booster.save_model(path)
        print(f"✅ Exported trained model to: {path}")

if __name__ == "__main__":
    train_and_export()
