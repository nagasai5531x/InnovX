import React, { useEffect, useState } from 'react';
import { useRoleDashboardStore } from '../../store/useRoleDashboardStore';
import {
  ShieldCheck, Users, Settings2, FileText, Server,
  TrendingUp, Zap, CheckCircle, AlertTriangle, ChevronRight
} from 'lucide-react';
import { useDashboardStore } from '../../store/useDashboardStore';
import { PolicyEngine } from '../../components/dashboard/PolicyEngine';

const ROLE_COLORS: Record<string, string> = {
  Admin:              '#f43f5e',
  Analyst:            '#6366f1',
  Merchant:           '#10b981',
  'Operations Manager': '#f59e0b',
  'Growth Manager':   '#8b5cf6',
};

type AdminTab = 'overview' | 'users' | 'policy' | 'audit';

function StatPill({ label, value, color }: { label: string; value: any; color: string }) {
  return (
    <div className="rounded-xl p-4 flex flex-col gap-1"
      style={{ background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(51,65,85,0.4)' }}>
      <span className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</span>
      <span className="text-xl font-black" style={{ color }}>{value}</span>
    </div>
  );
}

export function AdminDashboard() {
  const { data, isLoading, fetch } = useRoleDashboardStore();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  useEffect(() => {
    fetch('Admin', true);
  }, [fetch]);

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          <span className="text-sm text-slate-400">Loading admin dashboard…</span>
        </div>
      </div>
    );
  }

  const kpis = data.system_kpis;
  const registry = data.user_registry;
  const audit = data.audit_summary;
  const agents: any[] = data.agent_health ?? [];

  const tabs: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview',     icon: <TrendingUp className="h-3.5 w-3.5" /> },
    { id: 'users',    label: 'Users',        icon: <Users className="h-3.5 w-3.5" /> },
    { id: 'policy',   label: 'Policy Engine',icon: <Settings2 className="h-3.5 w-3.5" /> },
    { id: 'audit',    label: 'Audit Summary',icon: <FileText className="h-3.5 w-3.5" /> },
  ];

  return (
    <div className="space-y-5 anim-fade">
      {/* Admin Header Badge */}
      <div className="flex items-center gap-3 p-4 rounded-2xl"
        style={{ background: 'rgba(244,63,94,0.07)', border: '1px solid rgba(244,63,94,0.2)' }}>
        <ShieldCheck className="h-6 w-6 text-rose-400" />
        <div>
          <div className="text-sm font-black text-white">Admin Control Panel</div>
          <div className="text-[10px] text-slate-500">Full system access · All operations visible · Policy management enabled</div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-emerald-400 font-bold">{kpis.agents_online} Agents Online</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(51,65,85,0.4)' }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}>
            {tab.icon}{tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-5">
          {/* Top KPIs */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            <StatPill label="Sessions Analyzed"    value={kpis.total_sessions_analyzed}                            color="#ffffff" />
            <StatPill label="Interventions Run"    value={kpis.interventions_executed}                             color="#10b981" />
            <StatPill label="GMV Recovered"        value={`$${(kpis.recovered_cart_value/1000).toFixed(1)}K`}     color="#f59e0b" />
            <StatPill label="Net Margin"           value={`$${(kpis.net_incremental_margin/1000).toFixed(1)}K`}   color="#22c55e" />
          </div>
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            <StatPill label="Decision Latency"     value={`${kpis.avg_decision_latency_ms}ms`}                    color="#6366f1" />
            <StatPill label="Policy Pass Rate"     value={`${(kpis.policy_pass_rate*100).toFixed(1)}%`}           color="#10b981" />
            <StatPill label="Critic Approval"      value={`${(kpis.critic_approval_rate*100).toFixed(1)}%`}       color="#22c55e" />
            <StatPill label="System Uptime"        value={`${kpis.system_uptime_pct}%`}                           color="#10b981" />
          </div>

          {/* Agent Health Grid */}
          <div className="rounded-2xl p-5" style={{ background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(51,65,85,0.5)' }}>
            <div className="flex items-center gap-2 mb-4">
              <Server className="h-4 w-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">Agent Fleet Health</h3>
            </div>
            <div className="grid grid-cols-5 gap-3">
              {agents.map((a: any) => (
                <div key={a.id} className="text-center p-3 rounded-xl"
                  style={{ background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(16,185,129,0.15)' }}>
                  <div className="text-lg font-black text-emerald-400">{a.uptime_pct}%</div>
                  <div className="text-[8px] text-slate-500 font-mono mt-0.5">Agent {a.id}</div>
                  <div className="mt-1 flex justify-center">
                    <CheckCircle className="h-3 w-3 text-emerald-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="rounded-2xl p-5 space-y-4" style={{ background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(51,65,85,0.5)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">User Registry</h3>
            </div>
            <span className="text-xs text-slate-500">{registry.total_users} total users</span>
          </div>

          {/* Role Distribution */}
          <div className="flex gap-3 flex-wrap">
            {registry.by_role?.map((r: any) => (
              <div key={r.role} className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                style={{ background: `${ROLE_COLORS[r.role] ?? '#6366f1'}15`, border: `1px solid ${ROLE_COLORS[r.role] ?? '#6366f1'}30` }}>
                <div className="w-2 h-2 rounded-full" style={{ background: ROLE_COLORS[r.role] ?? '#6366f1' }} />
                <span className="text-xs font-semibold" style={{ color: ROLE_COLORS[r.role] ?? '#6366f1' }}>{r.role}</span>
                <span className="text-xs text-slate-400 font-mono">{r.count}</span>
              </div>
            ))}
          </div>

          {/* User Table */}
          <div className="space-y-2">
            {registry.users?.map((u: any) => (
              <div key={u.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-800/40 transition"
                style={{ border: '1px solid rgba(51,65,85,0.3)' }}>
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-[10px] font-black text-white shrink-0">
                  {u.name?.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-200">{u.name}</div>
                  <div className="text-[10px] text-slate-500 font-mono">{u.email}</div>
                </div>
                <div className="px-2.5 py-1 rounded-lg text-[10px] font-bold"
                  style={{
                    background: `${ROLE_COLORS[u.role] ?? '#6366f1'}15`,
                    color: ROLE_COLORS[u.role] ?? '#6366f1',
                    border: `1px solid ${ROLE_COLORS[u.role] ?? '#6366f1'}30`,
                  }}>
                  {u.role}
                </div>
                <span className="text-[9px] text-slate-600 font-mono">{u.id}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'policy' && (
        <div>
          <PolicyEngine />
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="space-y-5">
          {/* Summary KPIs */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            <StatPill label="Total Audit Records"  value={audit.total_audit_records}   color="#ffffff" />
            <StatPill label="Approved Decisions"   value={audit.approved_decisions}    color="#10b981" />
            <StatPill label="Rejected Decisions"   value={audit.rejected_decisions}    color="#f43f5e" />
            <StatPill label="Policy Violations"    value={audit.policy_violations}     color={audit.policy_violations > 0 ? '#f59e0b' : '#10b981'} />
          </div>

          {/* Recent Audit Records */}
          <div className="rounded-2xl p-5" style={{ background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(51,65,85,0.5)' }}>
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-4 w-4 text-slate-400" />
              <h3 className="text-sm font-bold text-white">Recent Audit Records</h3>
            </div>
            {audit.recent_records?.length > 0 ? (
              <div className="space-y-2">
                {audit.recent_records.map((r: any) => (
                  <div key={r.decision_id} className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(51,65,85,0.3)' }}>
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${r.critic_verdict === 'APPROVED' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-200">{r.customer_name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{r.decision_id} · {r.recommended_action}</div>
                    </div>
                    <div className={`text-[10px] font-bold px-2 py-0.5 rounded ${r.critic_verdict === 'APPROVED' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {r.critic_verdict}
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 text-xs">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-40" />
                No recent audit records
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
