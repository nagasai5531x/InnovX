-- ====================================================================
--  CartSense AI — Enterprise Decision Intelligence Platform
--  AI BUILD 2026 · Student Edition · Track 2
--  PostgreSQL 14+ Schema — Complete & Final
--
--  HOW TO IMPORT:
--    1. Create the database first:
--         createdb -U postgres cart_rescue
--    2. Import this schema:
--         psql -U postgres -d cart_rescue -f schema.sql
--    3. Verify:
--         psql -U postgres -d cart_rescue -c "\dt"
-- ====================================================================

-- Enable UUID + crypto extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ====================================================================
-- SECTION 1 — ENUM TYPES
-- (mirror of app/core/constants.py StrEnums + new auth enums)
-- ====================================================================

DO $$ BEGIN CREATE TYPE user_role AS ENUM (
    'ADMIN', 'MERCHANT', 'ANALYST', 'OPERATIONS_MANAGER', 'GROWTH_MANAGER', 'CUSTOMER'
); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE session_state AS ENUM (
    'ACTIVE', 'ABANDONED', 'RESCUED', 'CONVERTED', 'EXPIRED'
); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE event_type AS ENUM (
    'PAGE_VIEW', 'ITEM_ADD', 'ITEM_REMOVE', 'CHECKOUT_START',
    'PAYMENT_ATTEMPT', 'PAYMENT_FAILED', 'CURSOR_LEAVE',
    'TAB_SWITCH', 'FORM_STUCK', 'COUPON_APPLY', 'SESSION_END'
); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE risk_level AS ENUM (
    'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE diagnosis_category AS ENUM (
    'PAYMENT_FAILURE', 'BROWSING', 'DELIVERY_DELAY',
    'SHIPPING_COST', 'COUPON_WAITING', 'PRICE_COMPARISON', 'FORM_FRICTION'
); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE decision_action AS ENUM (
    'DO_NOTHING', 'RETRY_PAYMENT', 'OFFER_COD',
    'OFFER_FREE_SHIPPING', 'OFFER_SMALL_COUPON',
    'EXIT_INTENT_POPUP', 'EMAIL_REMINDER', 'WHATSAPP_REMINDER'
); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE policy_verdict AS ENUM (
    'PASSED', 'REJECTED', 'OVERRIDDEN'
); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE critic_verdict AS ENUM (
    'APPROVED', 'MODIFIED', 'REJECTED'
); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE execution_status AS ENUM (
    'DISPATCHED', 'BLOCKED', 'NO_ACTION'
); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE order_status AS ENUM (
    'PENDING', 'PAID', 'ABANDONED', 'CANCELLED', 'REFUNDED'
); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE payment_status AS ENUM (
    'INITIATED', 'SUCCESS', 'FAILED', 'RETRYING'
); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE notification_channel AS ENUM (
    'EMAIL', 'WHATSAPP', 'IN_APP_POPUP', 'IN_APP_MODAL', 'SMS', 'NONE'
); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE notification_status AS ENUM (
    'QUEUED', 'SENT', 'DELIVERED', 'FAILED', 'SKIPPED'
); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE customer_segment AS ENUM (
    'REGULAR', 'PRICE_SENSITIVE', 'PREMIUM', 'NEW', 'CHURNED'
); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ====================================================================
-- SECTION 2 — CORE TABLES
-- ====================================================================

-- ------------------------------------------------------------------
-- TABLE: users
-- Stores platform operators (Admin, Merchant, Analyst) AND end customers.
-- Maps to: POST /auth/register, POST /auth/login, GET /auth/me
-- ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id                  VARCHAR(36)      PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    email               VARCHAR(255)     NOT NULL UNIQUE,
    hashed_password     VARCHAR(255)     NOT NULL,
    full_name           VARCHAR(255)     NOT NULL,
    role                user_role        NOT NULL DEFAULT 'MERCHANT',
    is_active           BOOLEAN          NOT NULL DEFAULT TRUE,
    phone_number        VARCHAR(20),
    avatar_initials     VARCHAR(4),
    -- TRAI Compliance
    whatsapp_optin      BOOLEAN          NOT NULL DEFAULT FALSE,
    dnd_registered      BOOLEAN          NOT NULL DEFAULT FALSE,
    -- Timestamps
    created_at          TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
    last_login_at       TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email      ON users (LOWER(email));
CREATE INDEX        IF NOT EXISTS idx_users_role       ON users (role);
CREATE INDEX        IF NOT EXISTS idx_users_is_active  ON users (is_active);

COMMENT ON TABLE  users IS 'Platform operators (Admin/Merchant/Analyst) and e-commerce end customers.';
COMMENT ON COLUMN users.whatsapp_optin  IS 'TRAI WhatsApp Business opt-in — required before any WhatsApp notification dispatch.';
COMMENT ON COLUMN users.dnd_registered  IS 'TRAI DND Registry flag — blocks all outbound SMS/WhatsApp campaign messages.';
COMMENT ON COLUMN users.avatar_initials IS 'Two-letter initials for frontend avatar chip (e.g. AM for Arjun Mehta).';

-- ------------------------------------------------------------------
-- TABLE: auth_tokens
-- Persistent bearer tokens (replaces JWT for stateful revocation).
-- Maps to: POST /auth/login, POST /auth/register → GET /auth/me
-- ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS auth_tokens (
    id          VARCHAR(36)  PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    user_id     VARCHAR(36)  NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    token       VARCHAR(128) NOT NULL UNIQUE,
    is_revoked  BOOLEAN      NOT NULL DEFAULT FALSE,
    expires_at  TIMESTAMPTZ  NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auth_tokens_user_id ON auth_tokens (user_id);
CREATE INDEX IF NOT EXISTS idx_auth_tokens_token   ON auth_tokens (token);

COMMENT ON TABLE auth_tokens IS 'Stateful bearer tokens issued on login/register. Enables instant revocation.';

-- ------------------------------------------------------------------
-- TABLE: sessions
-- One record per browser session tracked by the Session Intelligence Agent.
-- Maps to: GET /sessions, POST /sessions, GET /sessions/{id}
-- ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sessions (
    id                  VARCHAR(36)      PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    user_id             VARCHAR(36)      REFERENCES users (id) ON DELETE SET NULL,
    device_type         VARCHAR(50)      NOT NULL DEFAULT 'Mobile',
    browser             VARCHAR(50)      NOT NULL DEFAULT 'Chrome',
    os                  VARCHAR(50)      DEFAULT 'Android',
    ip_address          INET,
    country_code        CHAR(2)          DEFAULT 'IN',
    state               session_state    NOT NULL DEFAULT 'ACTIVE',
    started_at          TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
    ended_at            TIMESTAMPTZ,
    created_at          TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ      NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id    ON sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_state      ON sessions (state);
CREATE INDEX IF NOT EXISTS idx_sessions_started_at ON sessions (started_at DESC);

COMMENT ON TABLE sessions IS 'Browser/app sessions tracked by the Session Intelligence Agent (Agent 1).';

-- ------------------------------------------------------------------
-- TABLE: session_events
-- High-volume clickstream event table. Raw telemetry from browser SDK.
-- Maps to: POST /events (triggers agent pipeline)
-- ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS session_events (
    id          VARCHAR(36)   PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    session_id  VARCHAR(36)   NOT NULL REFERENCES sessions (id) ON DELETE CASCADE,
    event_type  event_type    NOT NULL,
    page_url    VARCHAR(1000),
    element_id  VARCHAR(100),
    payload     JSONB         NOT NULL DEFAULT '{}',
    -- Cart snapshot at event time
    cart_value          DOUBLE PRECISION DEFAULT 0.0,
    cogs                DOUBLE PRECISION DEFAULT 0.0,
    shipping_fee        DOUBLE PRECISION DEFAULT 0.0,
    item_count          INTEGER          DEFAULT 0,
    payment_failures    INTEGER          DEFAULT 0,
    coupon_failures     INTEGER          DEFAULT 0,
    dwell_time_seconds  INTEGER          DEFAULT 0,
    timestamp   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_session_id  ON session_events (session_id);
CREATE INDEX IF NOT EXISTS idx_events_event_type  ON session_events (event_type);
CREATE INDEX IF NOT EXISTS idx_events_timestamp   ON session_events (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_events_payload     ON session_events USING GIN (payload);

COMMENT ON TABLE  session_events IS 'Real-time clickstream events ingested by the SDK and processed by Agent 1.';
COMMENT ON COLUMN session_events.payload IS 'JSONB metadata: gateway error codes, form field ids, UTM params, etc.';

-- ------------------------------------------------------------------
-- TABLE: carts
-- Cart state snapshot at the time of abandonment risk assessment.
-- Maps to: agent pipeline internal state
-- ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS carts (
    id              VARCHAR(36)      PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    session_id      VARCHAR(36)      NOT NULL UNIQUE REFERENCES sessions (id) ON DELETE CASCADE,
    user_id         VARCHAR(36)      REFERENCES users (id) ON DELETE SET NULL,
    total_amount    DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    cogs            DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    gross_margin    DOUBLE PRECISION GENERATED ALWAYS AS (total_amount - cogs) STORED,
    shipping_fee    DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    item_count      INTEGER          NOT NULL DEFAULT 0,
    items_json      JSONB            NOT NULL DEFAULT '[]',
    coupon_code     VARCHAR(50),
    coupon_discount DOUBLE PRECISION          DEFAULT 0.0,
    created_at      TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ      NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_carts_session_id   ON carts (session_id);
CREATE INDEX IF NOT EXISTS idx_carts_total_amount ON carts (total_amount DESC);
CREATE INDEX IF NOT EXISTS idx_carts_items        ON carts USING GIN (items_json);

COMMENT ON TABLE  carts IS 'Shopping cart state snapshot per session. Used by Feature Engineering Agent.';
COMMENT ON COLUMN carts.gross_margin IS 'Computed column: total_amount - cogs. Used for margin guardrail validation.';
COMMENT ON COLUMN carts.items_json   IS 'Array: [{product_id, name, price, qty, category, cogs_per_unit}]';

-- ====================================================================
-- SECTION 3 — AI AGENT PIPELINE TABLES
-- ====================================================================

-- ------------------------------------------------------------------
-- TABLE: risk_predictions
-- Output of Agent 3 (LightGBM Risk Prediction Agent).
-- Maps to: SessionFeed risk scores, StatCard "High Risk Sessions"
-- ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS risk_predictions (
    id            VARCHAR(36)      PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    session_id    VARCHAR(36)      NOT NULL REFERENCES sessions (id) ON DELETE CASCADE,
    risk_score    DOUBLE PRECISION NOT NULL CHECK (risk_score BETWEEN 0.0 AND 1.0),
    risk_level    risk_level       NOT NULL,
    confidence    DOUBLE PRECISION NOT NULL CHECK (confidence BETWEEN 0.0 AND 1.0),
    shap_features JSONB            NOT NULL DEFAULT '{}',
    model_version VARCHAR(50)      NOT NULL DEFAULT 'lightgbm_v2.6.0',
    latency_ms    DOUBLE PRECISION          DEFAULT 0.0,
    created_at    TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ      NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_risk_session_id  ON risk_predictions (session_id);
CREATE INDEX IF NOT EXISTS idx_risk_level       ON risk_predictions (risk_level);
CREATE INDEX IF NOT EXISTS idx_risk_score       ON risk_predictions (risk_score DESC);
CREATE INDEX IF NOT EXISTS idx_risk_created_at  ON risk_predictions (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_risk_shap        ON risk_predictions USING GIN (shap_features);

COMMENT ON TABLE  risk_predictions IS 'LightGBM abandonment risk scores from Agent 3.';
COMMENT ON COLUMN risk_predictions.shap_features IS 'SHAP feature attribution: {payment_failure_signal, high_shipping_fee, checkout_dwell_time, price_sensitivity, ...}';

-- ------------------------------------------------------------------
-- TABLE: agent_decisions
-- MASTER DECISION TABLE — single record per full 10-agent pipeline run.
-- Maps to: GET /decisions, GET /decisions/{id}
--          AuditLedger table, SessionFeed, AgentConsole, StatCards
-- ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS agent_decisions (
    id                          VARCHAR(36)      PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    decision_id                 VARCHAR(36)      NOT NULL UNIQUE,  -- human-readable ref: dec_a891f2b1
    session_id                  VARCHAR(36)      NOT NULL REFERENCES sessions (id) ON DELETE CASCADE,
    customer_id                 VARCHAR(36)      REFERENCES users (id) ON DELETE SET NULL,
    customer_name               VARCHAR(255)     NOT NULL DEFAULT 'Anonymous',

    -- Financial snapshot
    cart_value                  DOUBLE PRECISION NOT NULL,
    cogs                        DOUBLE PRECISION NOT NULL,
    gross_margin                DOUBLE PRECISION NOT NULL,
    shipping_fee                DOUBLE PRECISION NOT NULL DEFAULT 0.0,

    -- Risk output (Agent 3)
    risk_score                  DOUBLE PRECISION NOT NULL CHECK (risk_score BETWEEN 0.0 AND 1.0),
    confidence_score            DOUBLE PRECISION NOT NULL CHECK (confidence_score BETWEEN 0.0 AND 1.0),

    -- Diagnosis (Agent 4)
    primary_diagnosis           VARCHAR(100)     NOT NULL,
    secondary_diagnosis         VARCHAR(100),

    -- Decision (Agent 5)
    recommended_action          decision_action  NOT NULL,
    action_discount_value       DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    action_cost                 DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    expected_incremental_margin DOUBLE PRECISION NOT NULL DEFAULT 0.0,

    -- Policy validation (Agent 6)
    policy_status               policy_verdict   NOT NULL DEFAULT 'PASSED',
    policy_violations           JSONB            NOT NULL DEFAULT '[]',

    -- Self-Critic verdict (Agent 7)
    critic_verdict              critic_verdict   NOT NULL DEFAULT 'APPROVED',
    critic_reasoning            TEXT             NOT NULL DEFAULT '',

    -- Execution (Agent 8)
    execution_status            execution_status NOT NULL DEFAULT 'NO_ACTION',

    -- Explainability
    shap_features               JSONB            NOT NULL DEFAULT '{}',
    cot_steps                   JSONB            NOT NULL DEFAULT '[]',  -- Full Chain-of-Thought

    -- Timing
    total_pipeline_latency_ms   DOUBLE PRECISION          DEFAULT 0.0,
    created_at                  TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ      NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dec_decision_id   ON agent_decisions (decision_id);
CREATE INDEX IF NOT EXISTS idx_dec_session_id    ON agent_decisions (session_id);
CREATE INDEX IF NOT EXISTS idx_dec_customer_id   ON agent_decisions (customer_id);
CREATE INDEX IF NOT EXISTS idx_dec_risk_score    ON agent_decisions (risk_score DESC);
CREATE INDEX IF NOT EXISTS idx_dec_policy        ON agent_decisions (policy_status);
CREATE INDEX IF NOT EXISTS idx_dec_critic        ON agent_decisions (critic_verdict);
CREATE INDEX IF NOT EXISTS idx_dec_action        ON agent_decisions (recommended_action);
CREATE INDEX IF NOT EXISTS idx_dec_exec          ON agent_decisions (execution_status);
CREATE INDEX IF NOT EXISTS idx_dec_created_at    ON agent_decisions (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_dec_shap          ON agent_decisions USING GIN (shap_features);
CREATE INDEX IF NOT EXISTS idx_dec_cot           ON agent_decisions USING GIN (cot_steps);

COMMENT ON TABLE  agent_decisions IS 'Master decision record for each 10-agent pipeline run. Single source of truth for AuditLedger, AgentConsole, and all analytics.';
COMMENT ON COLUMN agent_decisions.decision_id   IS 'Human-readable decision reference (dec_xxxxx). Displayed in UI and included in audit exports.';
COMMENT ON COLUMN agent_decisions.cot_steps     IS 'Full 10-agent Chain-of-Thought: [{agent_name, timestamp, status, input_summary, reasoning, output_summary}]';
COMMENT ON COLUMN agent_decisions.shap_features IS 'SHAP feature importance: {payment_failure_signal, high_shipping_fee, checkout_dwell_time, price_sensitivity}';

-- ------------------------------------------------------------------
-- TABLE: policy_configurations
-- Live guardrail config managed via PUT /dashboard/policy.
-- Maps to: PolicyEngine page sliders & toggles
-- ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS policy_configurations (
    id                          VARCHAR(36)      PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    merchant_id                 VARCHAR(36)      NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    max_discount_percentage     DOUBLE PRECISION NOT NULL DEFAULT 10.0
                                                 CHECK (max_discount_percentage BETWEEN 0.0 AND 50.0),
    min_cart_margin_percentage  DOUBLE PRECISION NOT NULL DEFAULT 15.0
                                                 CHECK (min_cart_margin_percentage BETWEEN 0.0 AND 50.0),
    daily_budget_limit          DOUBLE PRECISION NOT NULL DEFAULT 5000.0,
    current_daily_spend         DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    cannibalization_threshold   DOUBLE PRECISION NOT NULL DEFAULT 0.40
                                                 CHECK (cannibalization_threshold BETWEEN 0.0 AND 1.0),
    enforce_whatsapp_opt_in     BOOLEAN          NOT NULL DEFAULT TRUE,
    enforce_trai_dnd            BOOLEAN          NOT NULL DEFAULT TRUE,
    active_channels             JSONB            NOT NULL DEFAULT '["IN_APP_MODAL"]',
    is_active                   BOOLEAN          NOT NULL DEFAULT TRUE,
    created_at                  TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ      NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_policy_merchant_id ON policy_configurations (merchant_id);
CREATE INDEX IF NOT EXISTS idx_policy_is_active   ON policy_configurations (is_active);

COMMENT ON TABLE  policy_configurations IS 'Per-merchant live guardrail configuration. Read by Agent 6 (Policy Agent) on every decision.';
COMMENT ON COLUMN policy_configurations.cannibalization_threshold IS 'Organic conversion probability above which discounts are blocked to prevent cannibalization.';
COMMENT ON COLUMN policy_configurations.active_channels           IS 'Allowed outbound channels: ["WHATSAPP","EMAIL","IN_APP_MODAL"]';

-- ------------------------------------------------------------------
-- TABLE: notifications
-- Outbound messages dispatched by Agent 8 (Notification Agent).
-- Maps to: audit logs notification channel field
-- ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
    id          VARCHAR(36)           PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    decision_id VARCHAR(36)           NOT NULL REFERENCES agent_decisions (decision_id) ON DELETE CASCADE,
    session_id  VARCHAR(36)           NOT NULL REFERENCES sessions (id),
    channel     notification_channel  NOT NULL DEFAULT 'IN_APP_MODAL',
    recipient   VARCHAR(255)          NOT NULL,
    subject     VARCHAR(255),
    content     TEXT                  NOT NULL,
    status      notification_status   NOT NULL DEFAULT 'QUEUED',
    provider_ref VARCHAR(100),
    sent_at     TIMESTAMPTZ,
    created_at  TIMESTAMPTZ           NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ           NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notif_decision_id ON notifications (decision_id);
CREATE INDEX IF NOT EXISTS idx_notif_session_id  ON notifications (session_id);
CREATE INDEX IF NOT EXISTS idx_notif_channel     ON notifications (channel);
CREATE INDEX IF NOT EXISTS idx_notif_status      ON notifications (status);

COMMENT ON TABLE  notifications IS 'Outbound rescue messages dispatched by Agent 8. Channels: WhatsApp (Twilio), Email (SendGrid), In-App modal.';
COMMENT ON COLUMN notifications.provider_ref IS 'External provider message ID for delivery tracking (Twilio SID / SendGrid message ID).';

-- ====================================================================
-- SECTION 4 — ORDERS & PAYMENTS (Outcome Tracking)
-- ====================================================================

-- ------------------------------------------------------------------
-- TABLE: orders
-- E-commerce orders. Updated with PAID/ABANDONED status for RL feedback.
-- ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
    id               VARCHAR(36)      PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    session_id       VARCHAR(36)      NOT NULL REFERENCES sessions (id),
    user_id          VARCHAR(36)      REFERENCES users (id),
    decision_id      VARCHAR(36)      REFERENCES agent_decisions (decision_id),
    total_price      DOUBLE PRECISION NOT NULL,
    cogs             DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    net_margin       DOUBLE PRECISION GENERATED ALWAYS AS (total_price - cogs) STORED,
    discount_applied DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    status           order_status     NOT NULL DEFAULT 'PENDING',
    created_at       TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ      NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_session_id  ON orders (session_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id     ON orders (user_id);
CREATE INDEX IF NOT EXISTS idx_orders_decision_id ON orders (decision_id);
CREATE INDEX IF NOT EXISTS idx_orders_status      ON orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at  ON orders (created_at DESC);

COMMENT ON TABLE  orders IS 'E-commerce orders linked to AI rescue sessions. PAID status triggers positive RL reward signal.';
COMMENT ON COLUMN orders.decision_id      IS 'FK to agent_decisions.decision_id — links outcome to the intervention for ROI attribution.';
COMMENT ON COLUMN orders.net_margin       IS 'Computed: total_price - cogs. Used by Analytics Agent for margin impact tracking.';

-- ------------------------------------------------------------------
-- TABLE: payments
-- Payment gateway transactions. FAILED records trigger RETRY_PAYMENT.
-- ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payments (
    id             VARCHAR(36)      PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    order_id       VARCHAR(36)      NOT NULL REFERENCES orders (id),
    amount         DOUBLE PRECISION NOT NULL,
    gateway        VARCHAR(50)      NOT NULL DEFAULT 'Razorpay',
    payment_method VARCHAR(50)      DEFAULT 'UPI',
    status         payment_status   NOT NULL DEFAULT 'INITIATED',
    failure_reason TEXT,
    error_code     VARCHAR(50),
    retry_count    INTEGER          NOT NULL DEFAULT 0,
    created_at     TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ      NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments (order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status   ON payments (status);
CREATE INDEX IF NOT EXISTS idx_payments_gateway  ON payments (gateway);

COMMENT ON TABLE  payments IS 'Payment gateway transaction records. FAILED + retry_count triggers RETRY_PAYMENT Agent 1 event.';
COMMENT ON COLUMN payments.failure_reason IS 'Gateway error: HDFC_UPI_TIMEOUT, CARD_INSUFFICIENT_FUNDS, 3DS_FAILED, etc.';

-- ====================================================================
-- SECTION 5 — ANALYTICS & AUDIT
-- ====================================================================

-- ------------------------------------------------------------------
-- TABLE: analytics_daily
-- Pre-aggregated daily KPIs for the AnalyticsView charts.
-- Maps to: GET /analytics/hourly, GET /dashboard/kpis
-- ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS analytics_daily (
    id                      VARCHAR(36)      PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    date                    DATE             NOT NULL UNIQUE,
    total_sessions          INTEGER          NOT NULL DEFAULT 0,
    high_risk_sessions      INTEGER          NOT NULL DEFAULT 0,
    interventions_executed  INTEGER          NOT NULL DEFAULT 0,
    rescued_sessions        INTEGER          NOT NULL DEFAULT 0,
    recovery_rate           DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    recovered_cart_value    DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    net_incremental_margin  DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    total_discount_spend    DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    avg_decision_latency_ms DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    policy_pass_rate        DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    critic_rejection_rate   DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    -- Action breakdown (JSON for flexibility)
    action_distribution     JSONB            NOT NULL DEFAULT '{}',
    created_at              TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ      NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_date ON analytics_daily (date DESC);

COMMENT ON TABLE  analytics_daily IS 'Daily aggregated KPIs computed by Agent 10 (Analytics Agent). Powers StatCards and AnalyticsView charts.';
COMMENT ON COLUMN analytics_daily.action_distribution IS 'Action counts: {"RETRY_PAYMENT":48, "OFFER_FREE_SHIPPING":32, ...}';

-- ------------------------------------------------------------------
-- TABLE: audit_log_entries
-- Immutable step-by-step audit trail from every agent execution.
-- Maps to: GET /audit-logs — AuditLedger expandable rows
-- ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_log_entries (
    id                VARCHAR(36)      PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    decision_id       VARCHAR(36)      NOT NULL REFERENCES agent_decisions (decision_id) ON DELETE CASCADE,
    session_id        VARCHAR(36)      NOT NULL REFERENCES sessions (id) ON DELETE CASCADE,
    agent_name        VARCHAR(100)     NOT NULL,
    agent_index       SMALLINT         NOT NULL CHECK (agent_index BETWEEN 1 AND 10),
    step_status       VARCHAR(20)      NOT NULL DEFAULT 'COMPLETED',
    input_summary     TEXT             NOT NULL DEFAULT '',
    reasoning         TEXT             NOT NULL DEFAULT '',
    output_summary    TEXT             NOT NULL DEFAULT '',
    input_data        JSONB            NOT NULL DEFAULT '{}',
    output_data       JSONB            NOT NULL DEFAULT '{}',
    execution_time_ms DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    created_at        TIMESTAMPTZ      NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_decision_id  ON audit_log_entries (decision_id);
CREATE INDEX IF NOT EXISTS idx_audit_session_id   ON audit_log_entries (session_id);
CREATE INDEX IF NOT EXISTS idx_audit_agent_name   ON audit_log_entries (agent_name);
CREATE INDEX IF NOT EXISTS idx_audit_agent_index  ON audit_log_entries (agent_index);
CREATE INDEX IF NOT EXISTS idx_audit_created_at   ON audit_log_entries (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_input_data   ON audit_log_entries USING GIN (input_data);
CREATE INDEX IF NOT EXISTS idx_audit_output_data  ON audit_log_entries USING GIN (output_data);

COMMENT ON TABLE  audit_log_entries IS 'Immutable per-agent audit trail for full decision explainability. One row per agent per pipeline run.';
COMMENT ON COLUMN audit_log_entries.agent_index   IS 'Agent position (1–10) in the pipeline for timeline ordering in AgentConsole.';
COMMENT ON COLUMN audit_log_entries.reasoning     IS 'Agent''s natural-language reasoning — displayed in the AgentConsole CoT timeline.';

-- ====================================================================
-- SECTION 6 — AUTO-UPDATE TRIGGERS
-- ====================================================================

CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DO $$
DECLARE t TEXT;
BEGIN
    FOREACH t IN ARRAY ARRAY[
        'users', 'sessions', 'session_events', 'carts', 'orders',
        'payments', 'risk_predictions', 'agent_decisions',
        'policy_configurations', 'notifications',
        'analytics_daily', 'audit_log_entries'
    ] LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS set_updated_at ON %I;
            CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I
            FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
        ', t, t);
    END LOOP;
END;
$$;

-- ====================================================================
-- SECTION 7 — SEED DATA (Demo Accounts & Default Policy)
-- ====================================================================

-- Seed platform users (passwords: Admin@2026, Analyst@2026, Demo@2026)
-- SHA-256 hashed:  Admin@2026 = 7d84bc... (use bcrypt in prod)
INSERT INTO users (id, email, hashed_password, full_name, role, avatar_initials, is_active, whatsapp_optin)
VALUES
  ('usr_001', 'admin@cartsense.ai',   'REPLACE_WITH_BCRYPT_HASH', 'Arjun Mehta',  'ADMIN',    'AM', TRUE, TRUE),
  ('usr_002', 'analyst@cartsense.ai', 'REPLACE_WITH_BCRYPT_HASH', 'Priya Sharma', 'ANALYST',  'PS', TRUE, TRUE),
  ('usr_003', 'demo@cartsense.ai',    'REPLACE_WITH_BCRYPT_HASH', 'Demo User',    'MERCHANT', 'DU', TRUE, FALSE)
ON CONFLICT (id) DO NOTHING;

-- Seed default policy config for the demo merchant
INSERT INTO policy_configurations (
    merchant_id, max_discount_percentage, min_cart_margin_percentage,
    daily_budget_limit, current_daily_spend, cannibalization_threshold,
    enforce_whatsapp_opt_in, enforce_trai_dnd, active_channels
)
VALUES (
    'usr_003', 10.0, 15.0, 5000.0, 1240.50, 0.40,
    TRUE, TRUE, '["WHATSAPP","EMAIL","IN_APP_MODAL"]'
)
ON CONFLICT DO NOTHING;

-- ====================================================================
-- SECTION 8 — VERIFICATION QUERY
-- Run after import to confirm all 12 tables created.
-- ====================================================================

SELECT
    table_name,
    pg_size_pretty(pg_total_relation_size(quote_ident(table_name))) AS size,
    (SELECT COUNT(*) FROM information_schema.columns
     WHERE table_name = t.table_name AND table_schema = 'public') AS columns
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_type   = 'BASE TABLE'
ORDER BY table_name;
