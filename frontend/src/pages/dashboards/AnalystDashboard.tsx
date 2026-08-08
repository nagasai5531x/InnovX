import React, { useEffect } from 'react';
import { useRoleDashboardStore } from '../../store/useRoleDashboardStore';
import {
  Brain, Target, Activity, BarChart3,
  CheckCircle, XCircle, TrendingUp, Cpu
} from 'lucide-react';

function MetricBadge({ label, value, color, sub }: any) {
  return (
    <div className="rounded-2xl p-4 flex flex-col gap-1.5 relative overflow-hidden"
      style={{ background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(51,65,85,0.5)' }}>
      <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{label}</div>
      <div className="text-xl font-black" style={{ color }}>{value}</div>
      {sub && <div className="text-[10px] text-slate-600">{sub}</div>}
    </div>
  );
}

const DIAG_COLORS = ['#6366f1','#10b981','#f59e0b','#8b5cf6','#ec4899','#3b82f6'];

export function AnalystDashboard() {
  const { data, isLoading, fetch } = useRoleDashboardStore();

  useEffect(() => {
    fetch('Analyst', true);
  }, [fetch]);

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          <span className="text-sm text-slate-400">Loading analyst dashboard…</span>
        </div>
      </div>
    );
  }

  const m = data.model_metrics;
  const shap: any[] = data.shap_features ?? [];
  const diags: any[] = data.diagnosis_breakdown ?? [];
  const riskDist: any[] = data.risk_distribution ?? [];
  const hourly: any[] = data.hourly_decisions ?? [];
  const maxShap = Math.max(...shap.map((s: any) => s.importance), 0.01);
  const maxDiag = Math.max(...diags.map((d: any) => d.count), 1);
  const maxHourly = Math.max(...hourly.map((h: any) => h.decisions), 1);
  const totalRisk = riskDist.reduce((s: number, r: any) => s + r.count, 0) || 1;

  return (
    <div className="space-y-6 anim-fade">
      {/* Model Performance Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
        <MetricBadge label="Decisions Processed" value={m.total_decisions}               color="#ffffff" sub="lifetime total" />
        <MetricBadge label="Model Precision"      value={`${m.model_precision}%`}         color="#6366f1" sub="LightGBM · XGBoost" />
        <MetricBadge label="Model Recall"         value={`${m.model_recall}%`}            color="#10b981" sub="true positive rate" />
        <MetricBadge label="F1 Score"             value={`${m.model_f1}%`}               color="#f59e0b" sub="harmonic mean" />
        <MetricBadge label="AUC-ROC"              value={m.auc_roc}                       color="#8b5cf6" sub="discrimination power" />
      </div>

      {/* Decision Quality Row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricBadge label="Avg Confidence Score"  value={`${m.avg_confidence_score}%`}    color="#10b981" />
        <MetricBadge label="Avg Risk Score"        value={`${m.avg_risk_score}%`}          color="#f43f5e" />
        <MetricBadge label="Critic Approval Rate"  value={`${m.critic_approval_rate}%`}    color="#22c55e" />
        <MetricBadge label="Policy Pass Rate"      value={`${m.policy_pass_rate}%`}        color="#6366f1" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* SHAP Feature Importance */}
        <div className="rounded-2xl p-5" style={{ background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(51,65,85,0.5)' }}>
          <div className="flex items-center gap-2 mb-4">
            <Brain className="h-4 w-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">SHAP Feature Importance</h3>
            <span className="text-[10px] text-slate-500 ml-auto">avg across decisions</span>
          </div>
          <div className="space-y-4">
            {shap.map((s: any, i: number) => (
              <div key={s.feature}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-300 font-mono">{s.feature.replace(/_/g, ' ')}</span>
                  <span className="text-slate-400 font-bold">{s.importance.toFixed(4)}</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${(s.importance / maxShap) * 100}%`,
                      background: DIAG_COLORS[i % DIAG_COLORS.length],
                    }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Diagnosis Breakdown */}
        <div className="rounded-2xl p-5" style={{ background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(51,65,85,0.5)' }}>
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-4 w-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Abandonment Diagnosis</h3>
          </div>
          <div className="space-y-3">
            {diags.map((d: any, i: number) => (
              <div key={d.diagnosis}>
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-slate-400 truncate pr-2">{d.diagnosis.replace(/_/g, ' ')}</span>
                  <span className="font-mono text-slate-300 font-bold shrink-0">{d.count}</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{
                    width: `${(d.count / maxDiag) * 100}%`,
                    background: DIAG_COLORS[i % DIAG_COLORS.length],
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Risk Distribution */}
        <div className="rounded-2xl p-5" style={{ background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(51,65,85,0.5)' }}>
          <div className="flex items-center gap-2 mb-5">
            <Activity className="h-4 w-4 text-rose-400" />
            <h3 className="text-sm font-bold text-white">Risk Score Distribution</h3>
          </div>
          <div className="flex items-end gap-6 h-32">
            {riskDist.map((r: any, i: number) => {
              const colors = ['#10b981', '#f59e0b', '#f43f5e'];
              const pct = (r.count / totalRisk) * 100;
              return (
                <div key={r.bucket} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-xs font-bold text-white">{r.count}</span>
                  <div className="w-full rounded-t-lg transition-all duration-700"
                    style={{ height: `${Math.max(pct, 5)}%`, background: colors[i], opacity: 0.85 }} />
                  <span className="text-[9px] text-slate-500 text-center leading-tight">{r.bucket}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Hourly Decisions */}
        <div className="rounded-2xl p-5" style={{ background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(51,65,85,0.5)' }}>
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-4 w-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Decisions by Hour</h3>
          </div>
          <div className="grid grid-cols-8 gap-1.5 items-end h-28">
            {hourly.map((h: any) => (
              <div key={h.hour} className="flex flex-col items-center gap-1">
                <div className="w-full rounded-t-sm transition-all duration-700"
                  style={{
                    height: `${Math.max((h.decisions / maxHourly) * 100, 8)}%`,
                    background: `rgba(99,102,241,${0.4 + (h.avg_risk ?? 0.6) * 0.6})`,
                  }} />
                <span className="text-[8px] text-slate-600 font-mono">{h.hour?.slice(0, 2)}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2 text-[10px] text-slate-500">
            <Cpu className="h-3 w-3" />
            <span>Bar opacity = avg risk score</span>
          </div>
        </div>
      </div>

      {/* Critic Verdicts Summary */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="rounded-2xl p-4 flex items-center gap-4"
          style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
          <CheckCircle className="h-8 w-8 text-emerald-400 shrink-0" />
          <div>
            <div className="text-lg font-black text-white">{m.critic_approval_rate}%</div>
            <div className="text-xs text-emerald-400 font-semibold">AI Self-Critic Approval Rate</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Decisions validated and dispatched</div>
          </div>
        </div>
        <div className="rounded-2xl p-4 flex items-center gap-4"
          style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)' }}>
          <XCircle className="h-8 w-8 text-rose-400 shrink-0" />
          <div>
            <div className="text-lg font-black text-white">{m.critic_rejection_rate}%</div>
            <div className="text-xs text-rose-400 font-semibold">Cannibalization Blocked Rate</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Discounts rejected to protect margin</div>
          </div>
        </div>
      </div>
    </div>
  );
}
