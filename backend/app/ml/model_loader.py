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
        try:
            if os.path.exists(settings.XGB_MODEL_PATH):
                logger.info("Loading XGBoost model from file", path=settings.XGB_MODEL_PATH)
                self._xgb_model = xgb.Booster()
                self._xgb_model.load_model(settings.XGB_MODEL_PATH)
            else:
                logger.warning("XGBoost model file not found. Creating cold-start operational model...")
                self._xgb_model = self._create_coldstart_model()
        except Exception as e:
            logger.error("Error loading XGBoost model, initializing fallback predictor", error=str(e))
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
        dtest = xgb.DMatrix(feature_vector)
        preds = self._xgb_model.predict(dtest)
        return float(preds[0])


model_loader = ModelLoader()
