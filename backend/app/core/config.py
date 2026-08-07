from typing import List, Optional
from pydantic import AnyHttpUrl, PostgresDsn, RedisDsn, computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

    # Core Application Settings
    PROJECT_NAME: str = "AI Cart Rescue Platform"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "production"
    DEBUG: bool = False

    # Security & JWT Configuration
    SECRET_KEY: str = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 Days

    # Database Configuration (PostgreSQL Async)
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "cart_rescue"

    @computed_field
    @property
    def ASYNC_DATABASE_URI(self) -> str:
        return f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    @computed_field
    @property
    def SYNC_DATABASE_URI(self) -> str:
        return f"postgresql+psycopg2://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    # Redis Configuration
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_PASSWORD: Optional[str] = None
    REDIS_DB: int = 0

    @computed_field
    @property
    def REDIS_URL(self) -> str:
        if self.REDIS_PASSWORD:
            return f"redis://:{self.REDIS_PASSWORD}@{self.REDIS_HOST}:{self.REDIS_PORT}/{self.REDIS_DB}"
        return f"redis://{self.REDIS_HOST}:{self.REDIS_PORT}/{self.REDIS_DB}"

    # Celery Configuration
    CELERY_BROKER_URL: Optional[str] = None
    CELERY_RESULT_BACKEND: Optional[str] = None

    @computed_field
    @property
    def COMPUTED_CELERY_BROKER_URL(self) -> str:
        return self.CELERY_BROKER_URL or self.REDIS_URL

    @computed_field
    @property
    def COMPUTED_CELERY_RESULT_BACKEND(self) -> str:
        return self.CELERY_RESULT_BACKEND or self.REDIS_URL

    # ML Pipeline & Model Config
    MODEL_DIR: str = "app/ml/saved_models"
    XGB_MODEL_PATH: str = "app/ml/saved_models/xgboost_cart_risk.json"
    LGB_MODEL_PATH: str = "app/ml/saved_models/lightgbm_cart_risk.txt"
    HIGH_RISK_THRESHOLD: float = 0.70
    MEDIUM_RISK_THRESHOLD: float = 0.40

    # Notification Credentials
    SENDGRID_API_KEY: str = "SG.mock_sendgrid_key"
    SENDGRID_FROM_EMAIL: str = "rescue@cartrescue.ai"
    TWILIO_ACCOUNT_SID: str = "AC_mock_twilio_account_sid"
    TWILIO_AUTH_TOKEN: str = "mock_twilio_auth_token"
    TWILIO_PHONE_NUMBER: str = "+1234567890"
    WHATSAPP_FROM_NUMBER: str = "whatsapp:+14155238886"

    # CORS & Telemetry
    ALLOWED_HOSTS: List[str] = ["*"]
    OTEL_EXPORTER_OTLP_ENDPOINT: str = "http://localhost:4317"
    ENABLE_TELEMETRY: bool = True


settings = Settings()
