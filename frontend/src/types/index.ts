export type ActionType = 
  | 'DO_NOTHING'
  | 'RETRY_PAYMENT'
  | 'OFFER_COD'
  | 'OFFER_FREE_SHIPPING'
  | 'OFFER_SMALL_COUPON'
  | 'EXIT_INTENT_POPUP'
  | 'EMAIL_REMINDER'
  | 'WHATSAPP_REMINDER';

export interface AgentCoTStep {
  agent_name: string;
  timestamp: string;
  status: 'COMPLETED' | 'SKIPPED' | 'WARNING';
  input_summary: string;
  reasoning: string;
  output_summary: string;
}

export interface DecisionResult {
  decision_id: string;
  session_id: string;
  customer_id: string;
  customer_name: string;
  cart_value: number;
  cogs: number;
  gross_margin: number;
  risk_score: number;
  confidence_score: number;
  primary_diagnosis: string;
  secondary_diagnosis?: string;
  recommended_action: ActionType;
  action_discount_value: number;
  action_cost: number;
  expected_incremental_margin: number;
  policy_status: 'PASSED' | 'REJECTED' | 'OVERRIDDEN';
  policy_violations: string[];
  critic_verdict: 'APPROVED' | 'MODIFIED' | 'REJECTED';
  critic_reasoning: string;
  execution_status: 'DISPATCHED' | 'BLOCKED' | 'NO_ACTION';
  shap_features: Record<string, number>;
  cot_steps: AgentCoTStep[];
  created_at: string;
}

export interface SystemKPIs {
  total_sessions_analyzed: number;
  high_risk_sessions: number;
  interventions_executed: number;
  recovered_cart_value: number;
  net_incremental_margin: number;
  avg_decision_latency_ms: number;
  critic_rejection_rate: number;
  policy_pass_rate: number;
}

export interface PolicyGuardrails {
  max_discount_percentage: number;
  min_cart_margin_percentage: number;
  daily_budget_limit: number;
  current_daily_spend: number;
  enforce_whatsapp_opt_in: boolean;
  enforce_trai_dnd: boolean;
  cannibalization_threshold: number;
  active_channels: string[];
}
