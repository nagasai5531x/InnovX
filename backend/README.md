# AI BUILD 2026 - Enterprise Cart Rescue Platform Backend

An enterprise-grade, real-time multi-agent decision platform for e-commerce cart abandonment prediction, root-cause diagnosis, profit-optimized interventions, compliance enforcement, and automated multi-channel engagement.

## Architecture Overview

```text
backend/
├── app/
│   ├── api/             # FastAPI REST & WebSocket Router
│   ├── core/            # Config, Constants, Logging, Security
│   ├── db/              # SQLAlchemy 2.0 Async PostgreSQL DB Engine
│   ├── models/          # 13 ORM Entities (Users, Sessions, Events, Cart, Orders, Risk, etc.)
│   ├── schemas/         # Pydantic v2 Request/Response Data Validation
│   ├── repositories/    # Async Repository Pattern
│   ├── services/        # Multi-Agent Orchestrator Service
│   ├── agents/          # 10 Independent Specialized AI Agents
│   ├── ml/              # Feature Pipeline, XGBoost Model Loader, & Inference Predictor
│   ├── websocket/       # Real-time WebSocket Client Connection Manager
│   ├── tasks/           # Celery Distributed Asynchronous Tasks
│   └── middleware/      # Telemetry & Request Timing Middleware
├── tests/               # Pytest Async Test Suite
├── Dockerfile           # Python 3.12 Docker Container Specification
└── docker-compose.yml   # Multi-container Compose Stack
```

## The 10 AI Agents

1. **Session Intelligence Agent**: Ingests real-time clickstream events and tracks session state.
2. **Feature Engineering Agent**: Computes behavioral features from event streams.
3. **Risk Prediction Agent**: Runs fast XGBoost inference to estimate cart abandonment probability.
4. **Diagnosis Agent**: Classifies abandonment root cause into 7 categories (payment failure, form friction, price comparison, shipping cost, coupon waiting, delivery delay, browsing).
5. **Decision Agent**: Selects the optimal profit-maximizing action from a bounded action space.
6. **Policy Agent**: Validates TRAI DND regulations, WhatsApp opt-in compliance, daily discount budgets, and gross margins.
7. **Self Review Agent**: Adversarial AI self-critic reviewing recommendations to reject redundant/wasteful coupons.
8. **Notification Agent**: Multi-channel notification engine integrating SendGrid (Email) and Twilio (SMS/WhatsApp).
9. **Audit Agent**: Generates immutable audit trails and SHAP explainability attributes.
10. **Analytics Agent**: Computes real-time platform KPIs (Cart Recovery Rate, Incremental Revenue, ROI Multiplier).

## REST & WebSocket APIs

- `POST /api/v1/session/event` — Stream clickstream events into backend pipeline
- `POST /api/v1/session/end` — Mark session state expired/ended
- `GET /api/v1/risk/{session_id}` — Retrieve real-time abandonment risk score & confidence
- `GET /api/v1/diagnosis/{session_id}` — Retrieve root-cause diagnostic categorization
- `POST /api/v1/decision` — Trigger full multi-agent decision intelligence pipeline
- `POST /api/v1/notification` — Dispatch email/WhatsApp rescue notifications
- `GET /api/v1/analytics/dashboard` — Fetch executive KPI metrics
- `GET /api/v1/audit/{session_id}` — Retrieve audit logs for a session
- `WS /api/v1/ws/live-session` — Real-time bidirectional WebSocket stream

## Quick Start (Docker)

```bash
docker-compose up --build
```
