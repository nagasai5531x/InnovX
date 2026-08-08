import { DecisionResult, SystemKPIs, PolicyGuardrails } from '../types';

const API_BASE = '/api/v1';

function getAuthHeader(): Record<string, string> {
  try {
    const raw = localStorage.getItem('cartsense-auth');
    if (raw) {
      const parsed = JSON.parse(raw);
      const token = parsed?.state?.token;
      if (token) return { Authorization: `Bearer ${token}` };
    }
  } catch (e) {
    // Ignore error
  }
  return {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...(options.headers as Record<string, string> || {}),
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Network response was not ok' }));
    throw new Error(errorData.detail || `HTTP Error ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Auth
  login: async (email: string, password: string) => {
    return request<{ access_token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  register: async (name: string, email: string, password: string, role: string) => {
    return request<{ access_token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
    });
  },

  getMe: async () => {
    return request<any>('/auth/me');
  },

  // Dashboard & KPIs
  getKPIs: async () => {
    return request<SystemKPIs>('/dashboard/kpis');
  },

  getPolicy: async () => {
    return request<PolicyGuardrails>('/dashboard/policy');
  },

  updatePolicy: async (policyUpdates: Partial<PolicyGuardrails>) => {
    return request<PolicyGuardrails>('/dashboard/policy', {
      method: 'PUT',
      body: JSON.stringify(policyUpdates),
    });
  },

  // Decisions & Audit
  getDecisions: async (params?: { limit?: number; risk_filter?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.risk_filter && params.risk_filter !== 'ALL') query.append('risk_filter', params.risk_filter);
    if (params?.search) query.append('search', params.search);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request<{ decisions: DecisionResult[]; total: number }>(`/decisions${queryString}`);
  },

  getDecisionById: async (decisionId: string) => {
    return request<DecisionResult>(`/decisions/${decisionId}`);
  },

  // Simulation
  triggerSimulation: async (scenario: 'PAYMENT_FAIL' | 'SHIPPING_FRICTION' | 'CANNIBALIZATION_PREVENTION') => {
    return request<DecisionResult>('/simulate', {
      method: 'POST',
      body: JSON.stringify({ scenario }),
    });
  },

  // Ingest Event (Clickstream SDK)
  ingestEvent: async (eventData: any) => {
    return request<DecisionResult>('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  },

  // Analytics
  getHourlyAnalytics: async () => {
    return request<{ hourly: any[] }>('/analytics/hourly');
  },

  getActionDistribution: async () => {
    return request<{ distribution: any[] }>('/analytics/action-distribution');
  },

  getQualityMetrics: async () => {
    return request<any>('/analytics/quality-metrics');
  },

  // Role-specific dashboards
  getMerchantDashboard: async () => {
    return request<any>('/dashboard/merchant');
  },

  getAnalystDashboard: async () => {
    return request<any>('/dashboard/analyst');
  },

  getOperationsDashboard: async () => {
    return request<any>('/dashboard/operations');
  },

  getGrowthDashboard: async () => {
    return request<any>('/dashboard/growth');
  },

  getAdminDashboard: async () => {
    return request<any>('/dashboard/admin');
  },
};
