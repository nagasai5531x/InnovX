import os
import numpy as np
import xgboost as xgb
from app.core.config import settings
from app.core.logger import logger


class ModelLoader:
    _instance = None
    _xgb_model = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ModelLoader, cls).__new__(cls)
            cls._instance._load_or_train_fallback()
        return cls._instance

    def _load_or_train_fallback(self):
        candidate_paths = [
            "model.xgb",
            "app/ml/model.xgb",
            settings.XGB_MODEL_PATH
        ]
        loaded = False
        for path in candidate_paths:
            if os.path.exists(path):
                try:
                    self._xgb_model = xgb.Booster()
                    self._xgb_model.load_model(path)
                    print(f"[INFO] [ModelLoader] Loaded trained XGBoost model from: {path}")
                    loaded = True
                    break
                except Exception as e:
                    print(f"[WARNING] [ModelLoader] Failed loading model from {path}: {e}")
        if not loaded:
            print("[WARNING] [ModelLoader] Trained model file not found. Creating cold-start operational model...")
            self._xgb_model = self._create_coldstart_model()

    def _create_coldstart_model(self) -> xgb.Booster:
        # Synthetic baseline dataset representing e-commerce checkout behavior
        X_dummy = np.random.rand(100, 11)
        y_dummy = (X_dummy[:, 4] * 0.4 + X_dummy[:, 6] * 0.3 + X_dummy[:, 7] * 0.3 > 0.5).astype(int)
        
        dtrain = xgb.DMatrix(X_dummy, label=y_dummy)
        params = {
            'objective': 'binary:logistic',
            'eval_metric': 'logloss',
            'max_depth': 4,
            'eta': 0.1
        }
        booster = xgb.train(params, dtrain, num_boost_round=10)
        return booster

    def predict(self, feature_vector: np.ndarray) -> float:
        from app.ml.feature_pipeline import FeaturePipeline
        dtest = xgb.DMatrix(feature_vector, feature_names=FeaturePipeline.FEATURE_NAMES)
        preds = self._xgb_model.predict(dtest)
        return float(preds[0])


model_loader = ModelLoader()
