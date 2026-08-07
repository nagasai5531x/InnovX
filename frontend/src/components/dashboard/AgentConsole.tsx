import React from 'react';
import { useDashboardStore } from '../../store/useDashboardStore';
import { Brain, CheckCircle, AlertTriangle, HelpCircle } from 'lucide-react';

const agentColors: Record<number, string> = {
  0: '#6366f1', 1: '#8b5cf6', 2: '#06b6d4',
  3: '#f59e0b', 4: '#10b981', 5: '#ef4444',
  6: '#f43f5e', 7: '#34d399', 8: '#6366f1', 9: '#8b5cf6',
};

export const AgentConsole: React.FC = () => {
  const { selectedDecision } = useDashboardStore();

  if (!selectedDecision) {
    return (
      <div className="glass rounded-2xl border border-slate-800/50 flex flex-col items-center justify-center text-center h-full p-10">
        <div className="relative mb-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600/20 to-violet-500/20 border border-indigo-500/20 flex items-center justify-center">
            <Brain className="h-8 w-8 text-indigo-400" />
          </div>
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-slate-900 border-2 border-indigo-500/30 flex items-center justify-center">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
          </span>
        </div>
        <h3 className="text-base font-bold text-slate-200">Agent Console Idle</h3>
        <p className="text-xs text-slate-500 max-w-xs mt-2 leading-relaxed">
          Select an active session from the feed to inspect the real-time 10-Agent Chain-of-Thought reasoning pipeline.
        </p>
      </div>
    );
  }

  const d = selectedDecision;
  const riskColor = d.risk_score >= 0.7 ? '#f43f5e' : d.risk_score >= 0.5 ? '#f59e0b' : '#10b981';
  const criticApproved = d.critic_verdict === 'APPROVED';

  return (
    <div className="glass rounded-2xl border border-slate-800/50 flex flex-col h-full overflow-hidden">
      {/* Agent Console Header */}
      <div className="px-5 pt-5 pb-4 border-b border-slate-800/50">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Brain className="h-5 w-5 text-indigo-400" />
              <h2 className="text-base font-bold text-white">Agent Chain-of-Thought</h2>
            </div>
            <p className="text-xs text-slate-500 font-mono">{d.customer_name} · {d.session_id.substring(0,16)}</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest">Abandon Risk</div>
              <div className="text-2xl font-black" style={{ color: riskColor, textShadow: `0 0 20px ${riskColor}60` }}>
                {(d.risk_score * 100).toFixed(0)}%
              </div>
            </div>
            <div className="text-right border-l border-slate-800 pl-3">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest">Margin Lift</div>
              <div className="text-2xl font-black text-emerald-400" style={{ textShadow: '0 0 20px rgba(16,185,129,0.4)' }}>
                +${d.expected_incremental_margin.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Decision summary banner */}
        <div className="mt-3 p-3 rounded-xl flex items-center justify-between gap-3"
          style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(51,65,85,0.5)' }}>
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="p-1.5 rounded-lg" style={{ background: 'rgba(99,102,241,0.15)' }}>
              <Brain className="h-4 w-4 text-indigo-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-slate-400">Final Action:</span>
                <span className="px-2 py-0.5 rounded bg-indigo-600 text-white text-[11px] font-bold font-mono">
                  {d.recommended_action}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 truncate italic">
                "{d.critic_reasoning}"
              </p>
            </div>
          </div>
          <div>
            <span className="px-2 py-1 rounded-lg text-[11px] font-bold"
              style={{
                background: criticApproved ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)',
                color: criticApproved ? '#34d399' : '#f43f5e',
                border: `1px solid ${criticApproved ? 'rgba(16,185,129,0.3)' : 'rgba(244,63,94,0.3)'}`,
              }}>
              {d.critic_verdict}
            </span>
          </div>
        </div>
      </div>

      {/* Timeline of Agent Steps */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {d.cot_steps.map((step, idx) => {
          const color = agentColors[idx] ?? '#6366f1';
          const StatusIcon = step.status === 'COMPLETED' ? CheckCircle : step.status === 'WARNING' ? AlertTriangle : HelpCircle;
          const statusColor = step.status === 'COMPLETED' ? '#10b981' : step.status === 'WARNING' ? '#f59e0b' : '#64748b';

          return (
            <div key={idx} className="agent-line flex gap-3 pb-2">
              {/* Timeline dot */}
              <div className="flex flex-col items-center shrink-0">
                <div className="w-8 h-8 rounded-full flex items-center justify-center border-2 text-[10px] font-black"
                  style={{ borderColor: `${color}50`, background: `${color}15`, color }}>
                  {idx + 1}
                </div>
              </div>

              {/* Step Content */}
              <div className="flex-1 min-w-0 p-3 rounded-xl border transition hover:border-slate-700/50"
                style={{ background: 'rgba(15,23,42,0.6)', borderColor: 'rgba(51,65,85,0.3)' }}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <StatusIcon className="h-3.5 w-3.5 shrink-0" style={{ color: statusColor }} />
                    <span className="text-xs font-bold text-slate-200">{step.agent_name}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">
                    {new Date(step.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
                <p className="text-[11px] font-mono text-slate-400 leading-relaxed p-2 rounded-lg"
                  style={{ background: 'rgba(4,7,15,0.5)' }}>
                  {step.reasoning}
                </p>
                <div className="mt-1.5 flex items-center justify-between text-[10px]">
                  <span className="text-slate-500">→ <strong className="text-slate-300">{step.output_summary}</strong></span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
