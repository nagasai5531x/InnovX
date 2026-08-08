import { create } from 'zustand';
import { DecisionResult, SystemKPIs, PolicyGuardrails, ActionType } from '../types';
import { api } from '../services/api';

// Mock Initial Decisions for instant visual feedback
const INITIAL_DECISIONS: DecisionResult[] = [
  {
    decision_id: "dec_a891f2b1",
    session_id: "sess_9021481a",
    customer_id: "cust_88102",
    customer_name: "Aarav Sharma",
    cart_value: 185.00,
    cogs: 95.00,
    gross_margin: 90.00,
    risk_score: 0.88,
    confidence_score: 0.94,
    primary_diagnosis: "PAYMENT_GATEWAY_FAILURE",
    secondary_diagnosis: "CARD_DECLINE_OR_TIMEOUT",
    recommended_action: "RETRY_PAYMENT",
    action_discount_value: 0.00,
    action_cost: 0.05,
    expected_incremental_margin: 67.45,
    policy_status: "PASSED",
    policy_violations: [],
    critic_verdict: "APPROVED",
    critic_reasoning: "Payment failure diagnosed. Retrying payment modal recovers conversion with zero discount cannibalization.",
    execution_status: "DISPATCHED",
    shap_features: {
      "payment_failure_signal": 0.45,
      "checkout_dwell_time": 0.22,
      "high_shipping_fee": 0.05,
      "price_sensitivity": 0.02
    },
    cot_steps: [
      {
        agent_name: "1. Session Intelligence Agent",
        timestamp: "2026-08-07T13:30:00Z",
        status: "COMPLETED",
        input_summary: "Raw Clickstream Telemetry",
        reasoning: "Session active for 3m 40s. Payment gateway returned HDFC_TIMEOUT code on HDFC_UPI.",
        output_summary: "Session hydrated: Payment failure detected"
      },
      {
        agent_name: "2. Feature Engineering Agent",
        timestamp: "2026-08-07T13:30:01Z",
        status: "COMPLETED",
        input_summary: "Session State",
        reasoning: "Computed 45 real-time metrics in 3.8ms. Payment Failure Signal = 1.0, Cart Ratio = 1.25 AOV.",
        output_summary: "Feature Vector ready"
      },
      {
        agent_name: "3. Risk Prediction Agent (LightGBM)",
        timestamp: "2026-08-07T13:30:01Z",
        status: "COMPLETED",
        input_summary: "Feature Vector",
        reasoning: "LightGBM model scored abandonment probability = 88% (Confidence 94%).",
        output_summary: "Risk Score: 88% (HIGH RISK)"
      },
      {
        agent_name: "4. Abandonment Diagnosis Agent",
        timestamp: "2026-08-07T13:30:02Z",
        status: "COMPLETED",
        input_summary: "Risk Vector",
        reasoning: "Identified high friction spike on HDFC UPI gateway response payload.",
        output_summary: "Diagnosis: PAYMENT_GATEWAY_FAILURE"
      },
      {
        agent_name: "5. Decision Intelligence Agent",
        timestamp: "2026-08-07T13:30:02Z",
        status: "COMPLETED",
        input_summary: "Diagnosis: PAYMENT_GATEWAY_FAILURE",
        reasoning: "Simulated RETRY_PAYMENT vs OFFER_COUPON. RETRY_PAYMENT yields highest net margin (+$67.45).",
        output_summary: "Selected Action: RETRY_PAYMENT"
      },
      {
        agent_name: "6. Business Policy & Guardrail Agent",
        timestamp: "2026-08-07T13:30:03Z",
        status: "COMPLETED",
        input_summary: "Action: RETRY_PAYMENT",
        reasoning: "Verified 0% discount, 100% margin compliance. TRAI/DND non-applicable for in-app modal.",
        output_summary: "Policy Validation: PASSED"
      },
      {
        agent_name: "7. AI Self-Critic & Validation Agent",
        timestamp: "2026-08-07T13:30:03Z",
        status: "COMPLETED",
        input_summary: "Proposed Action: RETRY_PAYMENT",
        reasoning: "Counterfactual check confirmed user has high intent; no coupon cannibalization risk.",
        output_summary: "Critic Verdict: APPROVED"
      },
      {
        agent_name: "8. Notification & Engagement Agent",
        timestamp: "2026-08-07T13:30:04Z",
        status: "COMPLETED",
        input_summary: "Action: RETRY_PAYMENT",
        reasoning: "Dispatched direct WebSockets UPI Retry Modal payload to user screen.",
        output_summary: "Execution: DISPATCHED"
      },
      {
        agent_name: "9. Audit & Explainability Agent",
        timestamp: "2026-08-07T13:30:04Z",
        status: "COMPLETED",
        input_summary: "Execution Trace",
        reasoning: "Logged cryptographic decision audit record dec_a891f2b1.",
        output_summary: "Audit Saved"
      },
      {
        agent_name: "10. Analytics & Continuous Learning Agent",
        timestamp: "2026-08-07T13:30:05Z",
        status: "COMPLETED",
        input_summary: "RL Feedback Loop",
        reasoning: "Updated online bandit reward parameters for gateway retry policy.",
        output_summary: "Bandit Model Updated"
      }
    ],
    created_at: "2026-08-07T13:30:05Z"
  },
  {
    decision_id: "dec_b994d8e2",
    session_id: "sess_7718290c",
    customer_id: "cust_99411",
    customer_name: "Priya Patel",
    cart_value: 120.00,
    cogs: 60.00,
    gross_margin: 60.00,
    risk_score: 0.74,
    confidence_score: 0.91,
    primary_diagnosis: "UNEXPECTED_SHIPPING_COST_FRICTION",
    secondary_diagnosis: "HIGH_SHIPPING_TO_CART_RATIO",
    recommended_action: "OFFER_FREE_SHIPPING",
    action_discount_value: 12.00,
    action_cost: 0.02,
    expected_incremental_margin: 31.18,
    policy_status: "PASSED",
    policy_violations: [],
    critic_verdict: "APPROVED",
    critic_reasoning: "Shipping cost friction ($12) is causing drop-off. Waiving shipping leaves $31.18 net margin (26%), above 15% guardrail.",
    execution_status: "DISPATCHED",
    shap_features: {
      "high_shipping_fee": 0.48,
      "price_sensitivity": 0.22,
      "checkout_dwell_time": 0.15,
      "payment_failure_signal": 0.01
    },
    cot_steps: [
      {
        agent_name: "1. Session Intelligence Agent",
        timestamp: "2026-08-07T13:28:10Z",
        status: "COMPLETED",
        input_summary: "Clickstream Stream",
        reasoning: "User paused on Checkout Step 2 (Shipping Calculation) for 45s.",
        output_summary: "Shipping Dwell Spike detected"
      },
      {
        agent_name: "4. Abandonment Diagnosis Agent",
        timestamp: "2026-08-07T13:28:12Z",
        status: "COMPLETED",
        input_summary: "Shipping Fee $12 on Cart $120",
        reasoning: "Shipping represents 10% of total cart; customer segment is PRICE_SENSITIVE.",
        output_summary: "Diagnosis: UNEXPECTED_SHIPPING_COST_FRICTION"
      },
      {
        agent_name: "5. Decision Intelligence Agent",
        timestamp: "2026-08-07T13:28:13Z",
        status: "COMPLETED",
        input_summary: "Diagnosis: Shipping Friction",
        reasoning: "Free shipping waives $12 fee. Projected net margin: $31.18 vs $0 on drop-off.",
        output_summary: "Selected Action: OFFER_FREE_SHIPPING"
      },
      {
        agent_name: "7. AI Self-Critic & Validation Agent",
        timestamp: "2026-08-07T13:28:14Z",
        status: "COMPLETED",
        input_summary: "Proposed: OFFER_FREE_SHIPPING",
        reasoning: "Verified shipping cost is sole blocker. Approved.",
        output_summary: "Critic Verdict: APPROVED"
      }
    ],
    created_at: "2026-08-07T13:28:14Z"
  },
  {
    decision_id: "dec_c10238a9",
    session_id: "sess_5510294b",
    customer_id: "cust_10293",
    customer_name: "Rohan Verma",
    cart_value: 450.00,
    cogs: 270.00,
    gross_margin: 180.00,
    risk_score: 0.35,
    confidence_score: 0.88,
    primary_diagnosis: "CART_INDECISION_AND_COMPARISON_SHOPPING",
    secondary_diagnosis: "SEARCHING_FOR_PROMO_CODES",
    recommended_action: "DO_NOTHING",
    action_discount_value: 0.00,
    action_cost: 0.00,
    expected_incremental_margin: 0.00,
    policy_status: "PASSED",
    policy_violations: [],
    critic_verdict: "REJECTED",
    critic_reasoning: "Decision Agent proposed 10% Coupon ($45). Self-Critic REJECTED discount: User organic conversion probability is 65%. Giving a discount would cannibalize $45 in margin.",
    execution_status: "NO_ACTION",
    shap_features: {
      "checkout_dwell_time": 0.18,
      "price_sensitivity": 0.08,
      "high_shipping_fee": 0.02,
      "payment_failure_signal": 0.00
    },
    cot_steps: [
      {
        agent_name: "5. Decision Intelligence Agent",
        timestamp: "2026-08-07T13:20:00Z",
        status: "COMPLETED",
        input_summary: "Indecision Diagnosis",
        reasoning: "Proposed OFFER_SMALL_COUPON (10% = $45.00).",
        output_summary: "Proposed Action: OFFER_SMALL_COUPON"
      },
      {
        agent_name: "7. AI Self-Critic & Validation Agent",
        timestamp: "2026-08-07T13:20:02Z",
        status: "WARNING",
        input_summary: "Proposed: OFFER_SMALL_COUPON on Risk 0.35",
        reasoning: "Cannibalization Alert! User risk is low (35%). Organic conversion likelihood is 65%. Discount rejected.",
        output_summary: "Critic Verdict: REJECTED -> Fallback to DO_NOTHING"
      }
    ],
    created_at: "2026-08-07T13:20:02Z"
  }
];

interface DashboardStore {
  decisions: DecisionResult[];
  selectedDecision: DecisionResult | null;
  kpis: SystemKPIs;
  policy: PolicyGuardrails;
  hourlyAnalytics: any[];
  actionDistribution: any[];
  qualityMetrics: any;
  isSimulating: boolean;
  filterRisk: 'ALL' | 'HIGH' | 'MEDIUM' | 'LOW';
  searchQuery: string;

  // Actions
  setSelectedDecision: (decision: DecisionResult | null) => void;
  addDecision: (decision: DecisionResult) => void;
  updatePolicy: (updates: Partial<PolicyGuardrails>) => void;
  setFilterRisk: (filter: 'ALL' | 'HIGH' | 'MEDIUM' | 'LOW') => void;
  setSearchQuery: (query: string) => void;
  triggerSimulation: (scenario: 'PAYMENT_FAIL' | 'SHIPPING_FRICTION' | 'CANNIBALIZATION_PREVENTION') => Promise<void>;
  fetchRemoteData: () => Promise<void>;
}

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  decisions: INITIAL_DECISIONS,
  selectedDecision: INITIAL_DECISIONS[0],
  kpis: {
    total_sessions_analyzed: 25,
    high_risk_sessions: 16,
    interventions_executed: 17,
    recovered_cart_value: 1845.00,
    net_incremental_margin: 785.40,
    avg_decision_latency_ms: 18.4,
    critic_rejection_rate: 0.32,
    policy_pass_rate: 1.0
  },
  policy: {
    max_discount_percentage: 10.0,
    min_cart_margin_percentage: 15.0,
    daily_budget_limit: 5000.0,
    current_daily_spend: 1240.50,
    enforce_whatsapp_opt_in: true,
    enforce_trai_dnd: true,
    cannibalization_threshold: 0.40,
    active_channels: ["WHATSAPP", "EMAIL", "IN_APP_MODAL"]
  },
  hourlyAnalytics: [],
  actionDistribution: [],
  qualityMetrics: null,
  isSimulating: false,
  filterRisk: 'ALL',
  searchQuery: '',

  setSelectedDecision: (decision) => set({ selectedDecision: decision }),
  
  addDecision: (decision) => {
    set((state) => ({
      decisions: [decision, ...state.decisions],
      selectedDecision: decision,
    }));
    // Re-fetch all dynamic totals and aggregations from backend
    get().fetchRemoteData();
  },

  updatePolicy: async (updates) => {
    set((state) => ({ policy: { ...state.policy, ...updates } }));
    try {
      await api.updatePolicy(updates);
    } catch (e) {
      // Ignore if offline
    }
  },

  setFilterRisk: (filter) => set({ filterRisk: filter }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  fetchRemoteData: async () => {
    try {
      const [kpis, policy, decs, hourly, actions, quality] = await Promise.all([
        api.getKPIs(),
        api.getPolicy(),
        api.getDecisions(),
        api.getHourlyAnalytics(),
        api.getActionDistribution(),
        api.getQualityMetrics(),
      ]);
      const currentSel = get().selectedDecision;
      set({
        kpis: { ...get().kpis, ...kpis },
        policy: { ...get().policy, ...policy },
        decisions: decs.decisions.length > 0 ? decs.decisions : get().decisions,
        selectedDecision: currentSel || (decs.decisions.length > 0 ? decs.decisions[0] : null),
        hourlyAnalytics: hourly.hourly || [],
        actionDistribution: actions.distribution || [],
        qualityMetrics: quality,
      });
    } catch (e) {
      console.warn('Offline mode or fetch error:', e);
    }
  },

  triggerSimulation: async (scenario) => {
    set({ isSimulating: true });
    
    try {
      const newDecision = await api.triggerSimulation(scenario);
      get().addDecision(newDecision);
      set({ isSimulating: false });
      return;
    } catch (e) {
      console.warn('Backend API simulation failed, executing offline demo scenario:', e);
    }

    // Offline fallback scenario generation
    await new Promise((res) => setTimeout(res, 800));

    let newDecision: DecisionResult;
    const now = new Date().toISOString();

    if (scenario === 'PAYMENT_FAIL') {
      newDecision = {
        decision_id: `dec_${Math.random().toString(36).substring(2, 10)}`,
        session_id: `sess_${Math.random().toString(36).substring(2, 10)}`,
        customer_id: `cust_${Math.floor(10000 + Math.random() * 90000)}`,
        customer_name: "Vikram Malhotra",
        cart_value: 210.00,
        cogs: 110.00,
        gross_margin: 100.00,
        risk_score: 0.94,
        confidence_score: 0.96,
        primary_diagnosis: "PAYMENT_GATEWAY_FAILURE",
        secondary_diagnosis: "UPI_GATEWAY_RESPONSE_TIMEOUT",
        recommended_action: "RETRY_PAYMENT" as ActionType,
        action_discount_value: 0.00,
        action_cost: 0.05,
        expected_incremental_margin: 74.95,
        policy_status: "PASSED",
        policy_violations: [],
        critic_verdict: "APPROVED",
        critic_reasoning: "Verified payment failure. Payment retry modal dispatched.",
        execution_status: "DISPATCHED",
        shap_features: {
          "payment_failure_signal": 0.58,
          "checkout_dwell_time": 0.25,
          "price_sensitivity": 0.03
        },
        cot_steps: [
          { agent_name: "1. Session Intelligence Agent", timestamp: now, status: "COMPLETED", input_summary: "Live Clickstream", reasoning: "Captured PAYMENT_FAILED event on Razorpay UPI gateway.", output_summary: "Payment Failure State Hydrated" },
          { agent_name: "3. Risk Prediction Agent (LightGBM)", timestamp: now, status: "COMPLETED", input_summary: "Feature Vector", reasoning: "Scored risk = 94%. High certainty of imminent drop-off.", output_summary: "Risk Score: 94%" },
          { agent_name: "5. Decision Intelligence Agent", timestamp: now, status: "COMPLETED", input_summary: "Diagnosis: Payment Failure", reasoning: "Selected RETRY_PAYMENT. Zero discount required.", output_summary: "Action: RETRY_PAYMENT" },
          { agent_name: "7. AI Self-Critic & Validation Agent", timestamp: now, status: "COMPLETED", input_summary: "Proposed Action", reasoning: "Approved. Zero cannibalization risk.", output_summary: "Critic Verdict: APPROVED" }
        ],
        created_at: now
      };
    } else if (scenario === 'SHIPPING_FRICTION') {
      newDecision = {
        decision_id: `dec_${Math.random().toString(36).substring(2, 10)}`,
        session_id: `sess_${Math.random().toString(36).substring(2, 10)}`,
        customer_id: `cust_${Math.floor(10000 + Math.random() * 90000)}`,
        customer_name: "Ananya Roy",
        cart_value: 95.00,
        cogs: 45.00,
        gross_margin: 50.00,
        risk_score: 0.81,
        confidence_score: 0.90,
        primary_diagnosis: "UNEXPECTED_SHIPPING_COST_FRICTION",
        secondary_diagnosis: "HIGH_SHIPPING_TO_CART_RATIO",
        recommended_action: "OFFER_FREE_SHIPPING" as ActionType,
        action_discount_value: 8.50,
        action_cost: 0.02,
        expected_incremental_margin: 23.98,
        policy_status: "PASSED",
        policy_violations: [],
        critic_verdict: "APPROVED",
        critic_reasoning: "Shipping waiver ($8.50) yields 25.2% net margin, exceeding 15% guardrail.",
        execution_status: "DISPATCHED",
        shap_features: {
          "high_shipping_fee": 0.52,
          "price_sensitivity": 0.28,
          "checkout_dwell_time": 0.12
        },
        cot_steps: [
          { agent_name: "1. Session Intelligence Agent", timestamp: now, status: "COMPLETED", input_summary: "Checkout Telemetry", reasoning: "Dwell time on shipping step exceeded 50s.", output_summary: "Shipping Friction Hydrated" },
          { agent_name: "4. Abandonment Diagnosis Agent", timestamp: now, status: "COMPLETED", input_summary: "Risk 81%", reasoning: "Shipping fee ($8.50) is 9% of total cart.", output_summary: "Diagnosis: UNEXPECTED_SHIPPING_COST_FRICTION" },
          { agent_name: "7. AI Self-Critic & Validation Agent", timestamp: now, status: "COMPLETED", input_summary: "Proposed Action", reasoning: "Approved. Incremental net margin +$23.98.", output_summary: "Critic Verdict: APPROVED" }
        ],
        created_at: now
      };
    } else {
      newDecision = {
        decision_id: `dec_${Math.random().toString(36).substring(2, 10)}`,
        session_id: `sess_${Math.random().toString(36).substring(2, 10)}`,
        customer_id: `cust_${Math.floor(10000 + Math.random() * 90000)}`,
        customer_name: "Karan Iyer",
        cart_value: 320.00,
        cogs: 180.00,
        gross_margin: 140.00,
        risk_score: 0.28,
        confidence_score: 0.89,
        primary_diagnosis: "CART_INDECISION_AND_COMPARISON_SHOPPING",
        secondary_diagnosis: "ORGANIC_BUYING_INTENT",
        recommended_action: "DO_NOTHING" as ActionType,
        action_discount_value: 0.00,
        action_cost: 0.00,
        expected_incremental_margin: 0.00,
        policy_status: "PASSED",
        policy_violations: [],
        critic_verdict: "REJECTED",
        critic_reasoning: "Agent proposed 8% Coupon ($25.60). Self-Critic REJECTED discount: User organic conversion chance is 72%. Discount blocked to prevent margin erosion.",
        execution_status: "NO_ACTION",
        shap_features: {
          "price_sensitivity": 0.10,
          "checkout_dwell_time": 0.08,
          "high_shipping_fee": 0.01
        },
        cot_steps: [
          { agent_name: "3. Risk Prediction Agent", timestamp: now, status: "COMPLETED", input_summary: "Session Features", reasoning: "Risk score is LOW (28%). High organic conversion probability.", output_summary: "Risk Score: 28%" },
          { agent_name: "5. Decision Intelligence Agent", timestamp: now, status: "COMPLETED", input_summary: "Indecision State", reasoning: "Proposed OFFER_SMALL_COUPON ($25.60).", output_summary: "Proposed Action: OFFER_SMALL_COUPON" },
          { agent_name: "7. AI Self-Critic & Validation Agent", timestamp: now, status: "WARNING", input_summary: "Cannibalization Check", reasoning: "REJECTED DISCOUNT! High organic intent (72%). Fallback to DO_NOTHING.", output_summary: "Critic Verdict: REJECTED" }
        ],
        created_at: now
      };
    }

    get().addDecision(newDecision);
    set({ isSimulating: false });
  }
}));
