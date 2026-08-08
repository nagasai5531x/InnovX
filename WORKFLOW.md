# InnovX — CartSense AI: Complete System Workflow & Architecture Document

> **Version:** 2.6.0  
> **Frontend:** React 19 + TypeScript + Vite + TailwindCSS v4 + Zustand + Recharts  
> **Backend:** FastAPI (Python) + XGBoost ML  
> **Purpose:** Enterprise autonomous cart abandonment diagnosis and profit-first intervention platform

---

## TABLE OF CONTENTS

1. [System Architecture Overview](#1-system-architecture-overview)
2. [Authentication Flow](#2-authentication-flow)
3. [Application Layout](#3-application-layout)
4. [Page-by-Page Workflow](#4-page-by-page-workflow)
   - [Control Center (Dashboard)](#41-control-center-default-page)
   - [Live Sessions](#42-live-sessions-page)
   - [Agent Console](#43-agent-console-page)
   - [Policy Engine](#44-policy-engine-page)
   - [Audit Ledger](#45-audit-ledger-page)
   - [Analytics](#46-analytics-page)
   - [Settings](#47-settings-page)
5. [Simulation Workflow (TopBar Buttons)](#5-simulation-workflow-topbar-buttons)
6. [Live Event Ingestion Pipeline](#6-live-event-ingestion-pipeline)
7. [10-Agent AI Pipeline (Detail)](#7-10-agent-ai-pipeline-detail)
8. [Backend API Reference](#8-backend-api-reference)
9. [State Management](#9-state-management)
10. [XGBoost ML Model](#10-xgboost-ml-model)
11. [Data Initialization](#11-data-initialization-on-server-start)
12. [Key File Map](#12-key-file-map)

---

## 1. System Architecture Overview

```
╔══════════════════════════════════════════════════════════════════╗
║                     BROWSER — React App (:3000)                  ║
║  LoginPage ─► Dashboard ─► Sessions ─► Agents ─► Policy ─►      ║
║  Audit ─► Analytics                                              ║
╚══════════════════════════╤═══════════════════════════════════════╝
                           │  HTTP requests via Vite proxy
                           ▼
╔══════════════════════════════════════════════════════════════════╗
║                   FastAPI Backend (:8000)                        ║
║  /auth  /dashboard  /sessions  /events  /simulate  /analytics   ║
╚══════════════════════════╤═══════════════════════════════════════╝
                           │
                           ▼
╔══════════════════════════════════════════════════════════════════╗
║              In-Memory Stores (→ PostgreSQL in production)       ║
║   USERS_DB   TOKEN_STORE   DECISIONS_DB   SESSIONS_DB           ║
╚══════════════════════════╤═══════════════════════════════════════╝
                           │
                           ▼
╔══════════════════════════════════════════════════════════════════╗
║              XGBoost ML Engine  (backend/app/ml/model.xgb)       ║
║   FeaturePipeline ─► CartRiskPredictor ─► risk_score + SHAP     ║
╚══════════════════════════════════════════════════════════════════╝
```

### Startup Sequence
1. `uvicorn app.main:app --reload` starts FastAPI on port 8000
2. `_seed_initial_data()` pre-populates **25 realistic decision + session records**
3. `npm run dev` starts Vite dev server on port 3000 with proxy `/api → http://localhost:8000`
4. React app loads, checks `localStorage` for persisted auth → shows Login or Dashboard

---

## 2. Authentication Flow

### Accounts in the system
| Email | Password | Role |
|---|---|---|
| `admin@cartsense.ai` | `Admin@2026` | Admin |
| `analyst@cartsense.ai` | `Analyst@2026` | Analyst |
| `demo@cartsense.ai` | `Demo@2026` | Merchant |

### Login Flow
```
User opens app
    │
    ▼
App.tsx checks useAuthStore.isAuthenticated
    │
    ├── false ──► Show LoginPage (demo@cartsense.ai / Demo@2026 pre-filled)
    │                │
    │                ▼ User clicks Sign In
    │           useAuthStore.login(email, password)
    │                │
    │                ├──► POST /api/v1/auth/login
    │                │         Backend: SHA-256 hash check
    │                │         Returns: { access_token: "cs_<uuid>", user: {...} }
    │                │         Token stored in TOKEN_STORE (in-memory)
    │                │
    │                ├── SUCCESS: token + user saved to Zustand + localStorage
    │                │           → redirect to Dashboard
    │                │
    │                └── FAILURE (backend offline): fallback to DEMO_ACCOUNTS[]
    │                           → sets token = 'demo-token-12345'
    │                           → enters Dashboard anyway
    │
    └── true ───► Show <Dashboard />
```

### Token Usage on API Calls
```
api.ts → getAuthHeader()
  reads localStorage['cartsense-auth']
  → parsed.state.token
  → returns { Authorization: "Bearer cs_<token>" }

Backend get_current_user():
  if token in TOKEN_STORE → return real user
  else                    → return demo@cartsense.ai user  [NEVER returns 401]
```

### Register Flow
```
LoginPage → click "Create Account" → RegisterPage
  User fills name/email/password/role → click Register
  → useAuthStore.register()
  → POST /api/v1/auth/register
  → Backend creates user in USERS_DB, issues token
  → On failure: offline fallback, enters dashboard with demo token
```

### Logout
```
Sidebar user card → LogOut button
  → useAuthStore.logout()
  → Clears: user, token, isAuthenticated
  → App.tsx re-renders → shows LoginPage
```

---

## 3. Application Layout

```
┌──────────────────────────────────────────────────────────────────────┐
│ SIDEBAR (256px fixed left)                                           │
│                                                                      │
│  🔷 CartSense AI  "Decision Intelligence"                            │
│  ● ALL 10 AGENTS ONLINE  p95: 18.4ms                                │
│                                                                      │
│  [Control Center]   ← dashboard (default)                           │
│  [Live Sessions]    ← sessions  🔴 badge: 14                        │
│  [Agent Console]    ← agents                                        │
│  [Policy Engine]    ← policy                                        │
│  [Audit Ledger]     ← audit                                         │
│  [Analytics]        ← analytics                                     │
│  [Settings]         ← settings                                      │
│                                                                      │
│  System Health:                                                      │
│  LightGBM Engine  ████████░░ 98%                                    │
│  Policy Guardrail ██████████ 100%                                   │
│  Self-Critic      ████████░░ 97%                                    │
│                                                                      │
│  [DU] Demo User · Merchant  [logout]                                │
├──────────────────────────────────────────────────────────────────────┤
│ TOP BAR (sticky)                                                     │
│  Page Title + Subtitle                                               │
│  Simulate: [Payment Fail] [Shipping Friction] [Self-Critic Test]    │
│  🔔  ● AI Engine Active  [DU] Demo User                             │
├──────────────────────────────────────────────────────────────────────┤
│ MAIN CONTENT (scrollable, padding 24px)                             │
│  Renders the active page component                                  │
└──────────────────────────────────────────────────────────────────────┘
```

**Navigation mechanism:** Clicking a Sidebar item calls `setActivePage(id)` in `App.tsx`. This is local React state — no URL routing. The `renderContent()` function switches on `activePage` to return the correct component tree.

**On every Dashboard mount:**
```javascript
useEffect(() => { fetchRemoteData(); }, [fetchRemoteData]);
```
`fetchRemoteData()` fires these **6 parallel API calls**:
```
Promise.all([
  GET /api/v1/dashboard/kpis,
  GET /api/v1/dashboard/policy,
  GET /api/v1/decisions,
  GET /api/v1/analytics/hourly,
  GET /api/v1/analytics/action-distribution,
  GET /api/v1/analytics/quality-metrics,
])
```

---

## 4. Page-by-Page Workflow

---

### 4.1 Control Center (Default Page)

**activePage:** `dashboard`

#### Screen Layout
```
┌─────────────────────────────────────────────────────────────┐
│ ROW 1: 4 × KPI StatCards (large metrics with sparklines)    │
│ ROW 2: 4 × KPI StatCards (smaller operational metrics)      │
│ ROW 3: [SessionFeed — 50%]   [AgentConsole — 50%]          │
│ ROW 4: AnalyticsView (full width, 3 charts)                 │
└─────────────────────────────────────────────────────────────┘
```

#### StatCard KPI Mapping

| Card | Value Formula (Backend) | API Source |
|---|---|---|
| **Sessions Analyzed** | `max(len(SESSIONS_DB), len(DECISIONS_DB))` | `GET /dashboard/kpis` → `total_sessions_analyzed` |
| **High Risk Sessions** | `decisions where risk_score >= 0.6` | same → `high_risk_sessions` |
| **Recovered Cart Value** | `sum(cart_value) where execution_status == "DISPATCHED"` | same → `recovered_cart_value` |
| **Net Incremental Margin** | `sum(expected_incremental_margin)` for all decisions | same → `net_incremental_margin` |
| **Avg Decision Latency** | static `18.4ms` (prod: real p95) | same → `avg_decision_latency_ms` |
| **Policy Pass Rate** | `(count PASSED / total) * 100` | same → `policy_pass_rate` |
| **Critic Block Rate** | `(count REJECTED / total) * 100` | same → `critic_rejection_rate` |
| **Interventions Run** | `count where execution_status == "DISPATCHED"` | same → `interventions_executed` |

**What changes these numbers:**
- Every time a simulation runs or a new event is ingested → `fetchRemoteData()` is called → all numbers update live

---

### 4.2 Live Sessions Page

**activePage:** `sessions` — Layout: `[SessionFeed — 50%] [AgentConsole — 50%]`

#### SessionFeed Component

**Data source:** `useDashboardStore.decisions` ← populated from `GET /api/v1/decisions`

```
Click [ALL]    → filterRisk = 'ALL'    → show all decisions
Click [HIGH]   → filterRisk = 'HIGH'   → filter: risk_score >= 0.6
Click [MEDIUM] → filterRisk = 'MEDIUM' → filter: 0.3 <= risk_score < 0.6
Click [LOW]    → filterRisk = 'LOW'    → filter: risk_score < 0.3
(All filtering is in-memory — no API call)

Type in search box → searchQuery updated
  → in-memory filter on: customer_name, primary_diagnosis, recommended_action

Click a Session Card → setSelectedDecision(d)
  → Zustand store updates selectedDecision
  → AgentConsole immediately re-renders with that decision's Chain-of-Thought
```

**Session Card displays:**
- Customer avatar (first initial) + name + session ID (truncated)
- Cart value + risk % badge
  - Red if risk >= 0.7 (HIGH)
  - Amber if risk >= 0.5 (MEDIUM)
  - Green if risk < 0.5 (LOW)
- Recommended action pill (color-coded)
- Net margin lift `+$XX.XX` or `—`
- Critic verdict badge (APPROVED / REJECTED / MODIFIED)
- Execution status tag (DISPATCHED / NO_ACTION)
- Timestamp

#### AgentConsole Component

**Data source:** `selectedDecision` from Zustand store

**Displays when a session is selected:**
```
Header row:
  Customer name  |  Session ID (mono)
  Abandon Risk: [XX%] (color-coded)  |  Margin Lift: [+$XX.XX]

Decision Banner:
  Final Action: [RETRY_PAYMENT]
  "Critic reasoning text here..."
  [APPROVED] chip

Agent Chain-of-Thought Timeline (scrollable):
  Agent 1  ✓ Session Intelligence Agent
  Agent 2  ✓ Feature Engineering Agent
  Agent 3  ✓ Risk Prediction Agent (XGBoost)
  Agent 4  ✓ Abandonment Diagnosis Agent
  Agent 5  ✓ Decision Intelligence Agent
  Agent 6  ✓/⚠ Business Policy & Guardrail Agent
  Agent 7  ✓/⚠ AI Self-Critic & Validation Agent
  Agent 8  ✓ Notification & Engagement Agent
  Agent 9  ✓ Audit & Explainability Agent
  Agent 10 ✓ Analytics & Continuous Learning Agent
```

Each step shows: **Input Summary → [Reasoning monospace text] → Output Summary** + timestamp

---

### 4.3 Agent Console Page

**activePage:** `agents` — Full-screen `AgentConsole`

Same component as above, full viewport. If `selectedDecision` is null → shows:
```
🧠 Agent Console Idle
"Select an active session from the feed to inspect the real-time
10-Agent Chain-of-Thought reasoning pipeline."
```

---

### 4.4 Policy Engine Page

**activePage:** `policy`

**Data source:** `useDashboardStore.policy` ← `GET /api/v1/dashboard/policy`

#### Screen Layout
```
┌──────────────────────────────────────────────────────────┐
│ Header Banner: "Enterprise Policy Control Plane"          │
│ Status chip: [🔒 GUARDRAILS ACTIVE]                      │
├──────────────────────────────────────────────────────────┤
│ Budget Tracker:                                           │
│  $1,240.50 spent of $5,000.00 daily limit                │
│  ████████░░░░░░░░░░░░░░░░░░░  24.8% utilized             │
│  (bar turns red when > 85%)                              │
├──────────────────────────────────────────────────────────┤
│ 3 Policy Sliders:                                         │
│  Max Discount Cap         [0%────10%────25%]             │
│  Min Net Margin Guardrail [5%────15%────35%]             │
│  Cannibalization Threshold [0%───40%───100%]             │
├──────────────────────────────────────────────────────────┤
│ 2 Toggle Switches:                                        │
│  WhatsApp Opt-In Enforcement  [ON ●]                     │
│  TRAI DND Registry Enforcement [ON ●]                    │
├──────────────────────────────────────────────────────────┤
│ Active Channels: [WHATSAPP] [EMAIL] [IN_APP_MODAL]       │
└──────────────────────────────────────────────────────────┘
```

#### Interactions

| What User Does | Frontend Action | Backend Call | Effect on AI Decisions |
|---|---|---|---|
| Drag **Max Discount Cap** slider | `updatePolicy({ max_discount_percentage: X })` | `PUT /api/v1/dashboard/policy` | Agent 6 rejects any action where discount % exceeds this cap |
| Drag **Min Net Margin** slider | `updatePolicy({ min_cart_margin_percentage: X })` | same | Agent 6 rejects actions that drop net margin below this floor |
| Drag **Cannibalization Threshold** | `updatePolicy({ cannibalization_threshold: X })` | same | Agent 7 Self-Critic uses this to decide if user has organic intent |
| Toggle **WhatsApp Opt-In** OFF | `updatePolicy({ enforce_whatsapp_opt_in: false })` | same | Agent 6 stops blocking WhatsApp for non-opted users |
| Toggle **TRAI DND** OFF | `updatePolicy({ enforce_trai_dnd: false })` | same | Agent 6 allows Email/WhatsApp even for DND-registered users |

**All policy changes take effect on the very next event processed by `_run_agent_pipeline()`.**

---

### 4.5 Audit Ledger Page

**activePage:** `audit`

**Data source:** `useDashboardStore.decisions` ← `GET /api/v1/decisions`

#### Screen Layout
```
┌──────────────────────────────────────────────────────────────────┐
│ Header: "Immutable Decision Audit Ledger"    [↓ Export CSV]      │
├──────────────────────────────────────────────────────────────────┤
│ Table Header (9 columns):                                        │
│ Audit ID·Time | Customer·Session | Cart·Margin | Risk |         │
│ Root Cause | Action | Net Margin Δ | Critic | [expand]          │
├──────────────────────────────────────────────────────────────────┤
│ Row 1: dec_a891f2b1  13:30:05   Aarav Sharma  sess_9021...      │
│        $185  $90    [88% HIGH]  PAYMENT_GATEWAY_FAILURE         │
│        [RETRY_PAYMENT]  +$67.45  [✓ Approved]  [↗][▼]          │
├──────────────────────────────────────────────────────────────────┤
│ ▼ EXPANDED ROW (click row to toggle):                           │
│   LEFT PANEL: SHAP Feature Attribution                          │
│     payment_failure_signal  ████████  45.0%                     │
│     checkout_dwell_time     ████      22.0%                     │
│     high_shipping_fee       █         5.0%                      │
│     price_sensitivity       ░         2.0%                      │
│   RIGHT PANEL: Business Justification                           │
│     "Validated by enterprise policy and AI self-critic engine." │
│     [Policy: PASSED]  [Exec: DISPATCHED]  [Confidence: 92%]    │
└──────────────────────────────────────────────────────────────────┘
```

#### Interactions

| What User Does | What Happens |
|---|---|
| Click a **table row** | Toggles `expanded` state → SHAP panel slides open below that row |
| **SHAP bars** visible | Each feature bar width = `min(value × 200, 100)%` with indigo→violet gradient |
| **Business Justification** visible | Shows `critic_reasoning` + Policy/Exec/Confidence badge chips |
| Click **↗ icon** (External Link) | `setSelectedDecision(d)` → navigate to Agent Console to see full 10-step CoT |
| Click row again | Collapses the expanded SHAP panel |
| **Export CSV** button | Present in UI; download handler not yet wired |

**Color coding:**
- Risk badge: 🔴 Red ≥70% · 🟡 Amber ≥50% · 🟢 Green <50%
- Action pill: Indigo=RETRY_PAYMENT · Amber=COUPON/SHIPPING · Slate=DO_NOTHING · Emerald=others
- Critic: ✓ Green=APPROVED · ✗ Red=REJECTED · ⚠ Amber=MODIFIED

---

### 4.6 Analytics Page

**activePage:** `analytics`

All data is **100% dynamically computed from `DECISIONS_DB`** by the backend.

#### Charts

| Chart | Backend Endpoint | Data Used | Visualization |
|---|---|---|---|
| **Session Volume & Recovery** | `GET /analytics/hourly` | `{ h, sessions, recovered }` per 3-hr bucket | Dual-area chart — indigo (sessions) + emerald (recovered) |
| **Action Distribution** | `GET /analytics/action-distribution` | `{ action, count }[]` for each action type | Color-coded horizontal bar rows with count labels |
| **AI Decision Quality Metrics** | `GET /analytics/quality-metrics` | policy_pass_rate, critic_approval_rate, cannibalization_block_rate, sub_30ms_rate | Progress bar gauges with % and description |
| **Hourly Net Margin Impact** | `GET /analytics/hourly` | `margin` field per time bucket | Purple bar chart with glow shadow |

#### Hourly Analytics Backend Logic
```python
# Groups all sessions and decisions into 3-hour UTC buckets
hours = ["00", "03", "06", "09", "12", "15", "18", "21"]
h = f"{(dt.hour // 3) * 3:02d}"  # e.g. 14:00 → "12"

# Scale multiplier for visual density when dataset is small
multiplier = max(1, 14250 // max(len(SESSIONS_DB), 1))
```

#### Quality Metrics Backend Logic
```python
total    = max(len(DECISIONS_DB), 1)
passed   = count(policy_status == "PASSED")
approved = count(critic_verdict == "APPROVED")
rejected = count(critic_verdict == "REJECTED")

policy_pass_rate           = (passed / total) * 100
critic_approval_rate       = (approved / total) * 100
cannibalization_block_rate = (rejected / total) * 100
sub_30ms_decision_rate     = 94.2  # static
```

---

### 4.7 Settings Page

**activePage:** `settings`

Placeholder stub — shows integration targets:
- Shopify SDK connection
- Magento SDK connection
- WooCommerce SDK connection
- Razorpay SDK connection

No backend endpoint is wired for this page yet.

---

## 5. Simulation Workflow (TopBar Buttons)

The three **Simulate** buttons in the TopBar are the primary demo mechanism for live presentations.

```
User clicks [Payment Fail]  /  [Shipping Friction]  /  [Self-Critic Test]
                    │
                    ▼
  isSimulating = true  (buttons show spinner, are disabled)
                    │
                    ▼
  api.triggerSimulation(scenario)
  → POST /api/v1/simulate  { "scenario": "PAYMENT_FAIL" }
                    │
                    ▼
  Backend constructs a synthetic ClickstreamEventRequest:
  (see Simulation Scenarios table below)
                    │
                    ▼
  _run_agent_pipeline(event)  ← Full 10-agent deterministic execution
                    │
                    ▼
  Returns DecisionResult JSON
                    │
                    ▼
  addDecision(newDecision):
    1. decisions.unshift(newDecision)       ← new session appears at TOP of feed
    2. selectedDecision = newDecision       ← AgentConsole auto-shows new CoT
    3. fetchRemoteData()                    ← all KPIs + charts update
                    │
                    ▼
  isSimulating = false  (buttons re-enable)

  RESULT: StatCards update, Session Feed shows new row at top,
          AgentConsole shows 10-step CoT for the new decision
```

### Simulation Scenarios

| Button Label | Scenario Key | Synthetic Event Parameters | Expected AI Decision |
|---|---|---|---|
| **Payment Fail** | `PAYMENT_FAIL` | cart=$210, cogs=$110, `event_type=PAYMENT_FAILED`, `payment_failures=1`, dwell_payment=85s | Diagnosis: `PAYMENT_GATEWAY_FAILURE` → Action: `RETRY_PAYMENT` → Critic: **APPROVED** |
| **Shipping Friction** | `SHIPPING_FRICTION` | cart=$95, cogs=$45, `shipping_fee=$12.50`, `PRICE_SENSITIVE` segment | Diagnosis: `UNEXPECTED_SHIPPING_COST_FRICTION` → Action: `OFFER_FREE_SHIPPING` → Critic: **APPROVED** |
| **Self-Critic Test** | `CANNIBALIZATION_PREVENTION` | cart=$320, cogs=$180, `dwell_cart=95s`, low risk customer | Diagnosis: `CART_INDECISION` → Agent 5 proposes coupon → Agent 7 **REJECTS** (organic intent 72%) → Final: `DO_NOTHING` |

---

## 6. Live Event Ingestion Pipeline

This is the **production path** — called by the e-commerce SDK embedded on merchant websites.

### Request Payload
```json
{
  "session_id": "sess_abc123",
  "customer_id": "cust_88102",
  "customer_name": "Aarav Sharma",
  "event_type": "PAYMENT_FAILED",
  "cart_value": 185.0,
  "cogs": 95.0,
  "shipping_fee": 0.0,
  "item_count": 3,
  "payment_failures": 1,
  "coupon_failures": 0,
  "dwell_time_cart_seconds": 40,
  "dwell_time_payment_seconds": 85,
  "customer_segment": "REGULAR",
  "customer_ltv": 480.0,
  "whatsapp_opt_in": true,
  "dnd_registered": false
}
```

### Pipeline Execution

```
POST /api/v1/events
      │
      ▼
EVENTS_DB.append(event_record)
      │
      ▼
_run_agent_pipeline(event):
      │
      ├─[1] FEATURE CONSTRUCTION (11 features)
      │      session_duration_seconds = dwell_cart + dwell_payment
      │      total_page_views         = item_count + 2
      │      cart_item_count          = item_count
      │      cart_total_amount        = cart_value
      │      payment_attempt_count    = max(payment_failures, 1 if PAYMENT_FAILED)
      │      payment_failed_count     = payment_failures
      │      cursor_leave_count       = 1 if event_type == "CURSOR_LEAVE" else 0
      │      tab_switch_count         = 1 if event_type == "TAB_SWITCH" else 0
      │      form_stuck_count         = 1 if dwell_payment > 45s else 0
      │      coupon_applied_count     = coupon_failures
      │      time_since_last_event    = 5.0 (default)
      │
      ├─[2] ML RISK SCORING (XGBoost)
      │      FeaturePipeline.to_feature_vector(feature_dict)
      │      → model.predict(DMatrix)
      │      → raw_prob (0.0 to 1.0)
      │      → risk_level: CRITICAL/HIGH/MEDIUM/LOW
      │      → confidence: 0.85 + (abs(risk - 0.5) × 0.25)
      │      → SHAP feature importance dict
      │
      ├─[3] ABANDONMENT DIAGNOSIS
      │      IF payment_failures > 0 OR event == "PAYMENT_FAILED"
      │        → "PAYMENT_GATEWAY_FAILURE"
      │      ELIF shipping / cart_value > 12% OR shipping > $12
      │        → "UNEXPECTED_SHIPPING_COST_FRICTION"
      │      ELIF coupon_failures > 1
      │        → "COUPON_EXPIRED_OR_INVALID"
      │      ELIF dwell_cart > 90s
      │        → "CART_INDECISION_AND_COMPARISON_SHOPPING"
      │      ELSE
      │        → "GENERAL_EXIT_INTENT"
      │
      ├─[4] DECISION INTELLIGENCE
      │      PAYMENT_GATEWAY_FAILURE        → RETRY_PAYMENT      (0% discount)
      │      UNEXPECTED_SHIPPING_FRICTION   → OFFER_FREE_SHIPPING
      │      COUPON_EXPIRED / PRICE_SENSITIVE → OFFER_SMALL_COUPON (8% of cart)
      │      CART_INDECISION               → EXIT_INTENT_POPUP
      │      else                          → DO_NOTHING
      │
      │      inc_margin calculated per action type:
      │        RETRY_PAYMENT:     (base_margin × 0.75) - 0.05
      │        FREE_SHIPPING:     (base_margin - shipping_fee) × 0.65 - 0.02
      │        SMALL_COUPON:      (base_margin - discount) × 0.55 - 0.02
      │        EXIT_INTENT_POPUP: base_margin × 0.40 - 0.01
      │        DO_NOTHING:        0.00
      │
      ├─[5] POLICY GUARDRAIL (Agent 6)
      │      CHECK: discount_pct > max_discount_percentage → REJECT
      │      CHECK: net_margin_pct < min_cart_margin_percentage → REJECT
      │      CHECK: action == WHATSAPP and NOT whatsapp_opt_in → REJECT
      │      CHECK: dnd_registered and action in (WHATSAPP, EMAIL) → REJECT
      │      → policy_status: "PASSED" or "REJECTED"
      │
      ├─[6] SELF-CRITIC VALIDATION (Agent 7)
      │      IF policy_status == "REJECTED"
      │        → critic_verdict = "MODIFIED"
      │        → fallback action: RETRY_PAYMENT if payment_failure else EXIT_INTENT_POPUP
      │      ELIF risk < 0.40 AND action in (COUPON, FREE_SHIPPING)
      │        → critic_verdict = "REJECTED"  (cannibalization prevention)
      │        → action = "DO_NOTHING"
      │      ELSE
      │        → critic_verdict = "APPROVED"
      │
      ├─[7] BUILD 10 COT STEPS
      │      Each agent creates a step record with:
      │        agent_name, timestamp, status (COMPLETED/WARNING),
      │        input_summary, reasoning, output_summary
      │
      ├─[8] EXECUTION STATUS
      │      action == "DO_NOTHING" → exec_status = "NO_ACTION"
      │      else                   → exec_status = "DISPATCHED"
      │
      └─[9] PERSIST + RETURN
             DECISIONS_DB.insert(0, decision)  ← prepend (newest first)
             return DecisionResult JSON
```

---

## 7. 10-Agent AI Pipeline (Detail)

| # | Agent Name | Input | Processing | Output |
|---|---|---|---|---|
| 1 | **Session Intelligence Agent** | Raw clickstream telemetry | Hydrates session context: cart value, device, event type | "Session context hydrated" |
| 2 | **Feature Engineering Agent** | Session state | Computes 45 real-time metrics (11 used by ML) | "Feature vector ready (11 active features)" |
| 3 | **Risk Prediction Agent (XGBoost)** | Feature vector | Runs XGBoost inference: risk_score + confidence | `"Risk Score: 88% — HIGH RISK"` |
| 4 | **Abandonment Diagnosis Agent** | Risk vector + telemetry | Rule-based diagnosis tree | `"Diagnosis: PAYMENT_GATEWAY_FAILURE"` |
| 5 | **Decision Intelligence Agent** | Diagnosis | Action selection + ROI simulation | `"Action: RETRY_PAYMENT (+$67.45)"` |
| 6 | **Business Policy & Guardrail Agent** | Proposed action | Validates against `ACTIVE_POLICY` thresholds | `"Policy: PASSED"` or `"Policy: REJECTED"` |
| 7 | **AI Self-Critic & Validation Agent** | Action + policy status + risk | Cannibalization check, fallback logic | `"Critic: APPROVED"` / `"REJECTED"` / `"MODIFIED"` |
| 8 | **Notification & Engagement Agent** | Final action | Dispatches via WebSocket / Email / WhatsApp | `"Execution: DISPATCHED"` |
| 9 | **Audit & Explainability Agent** | Full execution trace | Saves cryptographic audit record | `"Audit saved with SHAP attribution"` |
| 10 | **Analytics & Continuous Learning** | Outcome | Updates RL bandit model weights | `"RL model updated"` |

---

## 8. Backend API Reference

| Method | Endpoint | Auth Required | Description | Frontend Consumer |
|---|---|---|---|---|
| `GET` | `/health` | None | Health check → `{ status, version, active_agents }` | — |
| `POST` | `/api/v1/auth/register` | None | Register new user, returns token | RegisterPage |
| `POST` | `/api/v1/auth/login` | None | Login with email+password, returns token | LoginPage |
| `GET` | `/api/v1/auth/me` | Demo fallback | Returns current user profile | useAuthStore |
| `GET` | `/api/v1/dashboard/kpis` | Demo fallback | Returns 8 live KPI metrics | StatCards ×8 |
| `GET` | `/api/v1/dashboard/policy` | Demo fallback | Returns current policy guardrail config | PolicyEngine |
| `PUT` | `/api/v1/dashboard/policy` | Demo fallback | Updates guardrails in ACTIVE_POLICY | PolicyEngine sliders/toggles |
| `GET` | `/api/v1/sessions` | Demo fallback | Returns session list (filterable by risk) | SessionFeed |
| `POST` | `/api/v1/sessions` | Demo fallback | Creates a new session record | SDK integration |
| `GET` | `/api/v1/sessions/{id}` | Demo fallback | Returns single session detail | AgentConsole |
| `POST` | `/api/v1/events` | **None** | Ingests event → runs ML pipeline → returns DecisionResult | SDK / api.ingestEvent() |
| `POST` | `/api/v1/simulate` | Demo fallback | Runs named demo scenario through pipeline | TopBar buttons |
| `GET` | `/api/v1/decisions` | Demo fallback | Returns decisions (filterable by risk, searchable) | SessionFeed, AuditLedger |
| `GET` | `/api/v1/decisions/{id}` | Demo fallback | Returns single decision with full CoT steps | AgentConsole |
| `GET` | `/api/v1/audit-logs` | Demo fallback | Returns full audit trail | AuditLedger |
| `GET` | `/api/v1/analytics/hourly` | Demo fallback | Returns 8 time-bucket session/recovery/margin data | AnalyticsView (Area + Bar charts) |
| `GET` | `/api/v1/analytics/action-distribution` | Demo fallback | Returns count of each action type | AnalyticsView (Distribution bars) |
| `GET` | `/api/v1/analytics/quality-metrics` | Demo fallback | Returns pass/approval/rejection % metrics | AnalyticsView (Quality gauges) |

> **"Demo fallback"** = If no valid Bearer token is provided, the backend returns data as `demo@cartsense.ai`. **No 401 errors are ever returned** — the system always serves data.

---

## 9. State Management

### `useAuthStore` — persisted to localStorage (`cartsense-auth`)

```typescript
interface AuthStore {
  user: { name, email, role, avatar } | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  login(email, password)    // POST /auth/login, fallback to DEMO_ACCOUNTS
  register(name, email, password, role) // POST /auth/register, fallback offline
  logout()                  // clears all state
  clearError()
}
```

### `useDashboardStore` — in-memory Zustand (not persisted)

```typescript
interface DashboardStore {
  // Data from backend
  decisions: DecisionResult[]        // GET /decisions
  selectedDecision: DecisionResult | null // clicked by user
  kpis: SystemKPIs                   // GET /dashboard/kpis
  policy: PolicyGuardrails           // GET /dashboard/policy
  hourlyAnalytics: any[]             // GET /analytics/hourly
  actionDistribution: any[]          // GET /analytics/action-distribution
  qualityMetrics: any                // GET /analytics/quality-metrics

  // UI state
  isSimulating: boolean
  filterRisk: 'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'
  searchQuery: string

  // Actions
  fetchRemoteData()          // Parallel fetch of all 6 endpoints on mount
  triggerSimulation(scenario) // POST /simulate → addDecision → fetchRemoteData
  addDecision(d)             // Prepend to decisions[], set selected, re-fetch
  updatePolicy(updates)      // PUT /dashboard/policy
  setSelectedDecision(d)     // Switches AgentConsole view
  setFilterRisk(f)           // In-memory filter (no API call)
  setSearchQuery(q)          // In-memory search (no API call)
}
```

---

## 10. XGBoost ML Model

| Property | Value |
|---|---|
| **Algorithm** | `xgb.XGBClassifier` |
| **Training data** | 10,000 synthetic e-commerce sessions |
| **Target** | Binary: will customer abandon? (1 = abandon, 0 = convert) |
| **Feature count** | 11 behavioral features |
| **Model file** | `backend/app/ml/model.xgb` |
| **Training script** | `backend/scripts/train_ml_model.py` |
| **Accuracy** | 64.7% |
| **ROC-AUC** | 0.6914 |

### Risk Level Thresholds
| Level | Condition | Dashboard Color |
|---|---|---|
| CRITICAL | risk_score >= 0.75 | Red |
| HIGH | risk_score >= 0.50 | Amber |
| MEDIUM | risk_score >= 0.25 | Yellow |
| LOW | risk_score < 0.25 | Green |

### 11 Training Features
```
1. session_duration_seconds       ← dwell_cart + dwell_payment
2. total_page_views               ← item_count + 2
3. cart_item_count                ← item_count
4. cart_total_amount              ← cart_value
5. payment_attempt_count          ← payment_failures (min 1 if PAYMENT_FAILED event)
6. payment_failed_count           ← payment_failures
7. cursor_leave_count             ← 1 if CURSOR_LEAVE event
8. tab_switch_count               ← 1 if TAB_SWITCH event
9. form_stuck_count               ← 1 if dwell_payment > 45 seconds
10. coupon_applied_count          ← coupon_failures
11. time_since_last_event_sec     ← default 5.0
```

### SHAP Feature Attribution
```python
top_features = {
  "payment_failure_signal": payment_failed_count × 0.45,
  "high_shipping_fee":      shipping_fee × 0.05,
  "cursor_leave_count":     cursor_leave_count × 0.25,
  "tab_switch_count":       tab_switch_count × 0.20,
  "cart_total_amount":      cart_total_amount × 0.001,
}
```

---

## 11. Data Initialization (On Server Start)

`_seed_initial_data()` runs once on startup and pre-populates 25 realistic records:

| Customer | Cart Value | Risk | Primary Diagnosis | Action | Critic |
|---|---|---|---|---|---|
| Aarav Sharma | $185 | 0.88 | PAYMENT_GATEWAY_FAILURE | RETRY_PAYMENT | APPROVED |
| Priya Patel | $120 | 0.74 | UNEXPECTED_SHIPPING_COST_FRICTION | OFFER_FREE_SHIPPING | APPROVED |
| Rohan Verma | $450 | 0.35 | CART_INDECISION | DO_NOTHING | REJECTED |
| Vikram Malhotra | $210 | 0.94 | PAYMENT_GATEWAY_FAILURE | RETRY_PAYMENT | APPROVED |
| Ananya Roy | $95 | 0.81 | UNEXPECTED_SHIPPING_COST_FRICTION | OFFER_FREE_SHIPPING | APPROVED |
| ... (20 more) | | | | | |

These seed 25 `DECISIONS_DB` and 25 `SESSIONS_DB` records, powering all initial dashboard KPIs, charts, and feed rows immediately after login.

---

## 12. Key File Map

### Frontend

| File | Purpose |
|---|---|
| `src/main.tsx` | React app entry point, mounts `<App />` into `#root` |
| `src/App.tsx` | Root component: auth guard → Login or Dashboard + page router |
| `src/pages/LoginPage.tsx` | Auth form, demo credentials pre-filled, offline fallback |
| `src/pages/RegisterPage.tsx` | Account creation form |
| `src/store/useAuthStore.ts` | Zustand auth store, persisted to localStorage |
| `src/store/useDashboardStore.ts` | Zustand dashboard store, all data + simulation logic |
| `src/services/api.ts` | All 18 HTTP calls, auto-attaches Bearer token |
| `src/types/index.ts` | TypeScript: DecisionResult, SystemKPIs, PolicyGuardrails, ActionType |
| `src/index.css` | TailwindCSS v4, glassmorphism, animations, custom utility classes |
| `src/components/layout/Sidebar.tsx` | Left nav with 7 page links, system health bars, user card |
| `src/components/layout/TopBar.tsx` | Sticky header with 3 simulate buttons + AI status chip |
| `src/components/layout/StatCard.tsx` | KPI metric card with accent glow + SVG sparkline |
| `src/components/dashboard/SessionFeed.tsx` | Live session list with risk filter pills + search |
| `src/components/dashboard/AgentConsole.tsx` | 10-agent CoT reasoning inspector |
| `src/components/dashboard/AnalyticsView.tsx` | Area chart + bar rows + quality gauges + bar chart |
| `src/components/dashboard/PolicyEngine.tsx` | Guardrail sliders, toggle switches, budget progress bar |
| `src/components/dashboard/AuditLedger.tsx` | Decision audit table with expandable SHAP rows |
| `vite.config.ts` | Vite config: port 3000, proxy `/api → :8000`, TailwindCSS plugin |

### Backend

| File | Purpose |
|---|---|
| `app/main.py` | All 18 FastAPI routes + 10-agent pipeline + seed data (810 lines) |
| `app/ml/predictor.py` | `CartRiskPredictor.predict_abandonment_risk()` |
| `app/ml/model_loader.py` | Loads `model.xgb`, exposes `predict(vector)` |
| `app/ml/feature_pipeline.py` | `FeaturePipeline.to_feature_vector()` — builds 11-feature vector |
| `app/core/constants.py` | `RiskLevel` enum, other constants |
| `app/core/config.py` | Pydantic settings |
| `scripts/train_ml_model.py` | Synthetic dataset generation (10K rows) + XGBoost training |
| `model.xgb` | Trained XGBoost model binary (used by model_loader.py) |

---

## 13. Complete Click-by-Click User Journey (Summary)

```
1. Open http://localhost:3000
   → LoginPage shown (demo@cartsense.ai / Demo@2026 pre-filled)

2. Click "Sign In"
   → POST /api/v1/auth/login
   → Token saved, Dashboard loads
   → fetchRemoteData() fires 6 parallel API calls
   → Control Center renders with live KPIs

3. View StatCards (top of Control Center)
   → Numbers come from GET /dashboard/kpis
   → All computed dynamically from DECISIONS_DB + SESSIONS_DB

4. Scroll down → See SessionFeed (left) and AgentConsole (right)
   → SessionFeed: 25 seeded sessions with risk badges and actions
   → AgentConsole: shows the first session's 10-step reasoning

5. Click a session card in SessionFeed
   → setSelectedDecision(d)
   → AgentConsole immediately shows that session's Chain-of-Thought

6. Click "HIGH" filter pill
   → In-memory filter: only shows risk_score >= 0.6 sessions
   → No API call

7. Type "payment" in search box
   → In-memory filter on customer_name / diagnosis / action
   → No API call

8. Click [Payment Fail] button in TopBar
   → POST /api/v1/simulate { scenario: "PAYMENT_FAIL" }
   → Full 10-agent pipeline runs in backend
   → New decision returned: RETRY_PAYMENT, Critic APPROVED
   → Prepended to feed, KPIs updated, AgentConsole shows CoT

9. Navigate to "Policy Engine" in sidebar
   → GET /api/v1/dashboard/policy loads current guardrails
   → Drag "Max Discount Cap" slider to 15%
   → PUT /api/v1/dashboard/policy updates ACTIVE_POLICY
   → All future decisions use 15% cap

10. Navigate to "Audit Ledger"
    → Decisions table renders
    → Click any row → SHAP feature bars expand below
    → Click ↗ icon → setSelectedDecision → go see CoT in Agent Console

11. Navigate to "Analytics"
    → GET /analytics/hourly → Area chart with 8 time buckets
    → GET /analytics/action-distribution → Bar rows
    → GET /analytics/quality-metrics → Quality gauge bars

12. Click Logout (bottom of Sidebar)
    → useAuthStore.logout() clears state
    → LoginPage shown again
```
