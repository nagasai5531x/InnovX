import React from 'react';
import { useDashboardStore } from '../../store/useDashboardStore';
import { Brain, CheckCircle, AlertTriangle, ShieldCheck, HelpCircle, ArrowRight, DollarSign, Activity, FileText } from 'lucide-react';

export const AgentReasoningView: React.FC = () => {
  const { selectedDecision } = useDashboardStore();

  if (!selectedDecision) {
    return (
      <div className="glass-panel rounded-2xl border border-slate-800 p-8 flex flex-col items-center justify-center text-center h-[580px]">
        <Brain className="h-12 w-12 text-slate-600 mb-3 animate-pulse" />
        <h3 className="text-base font-semibold text-slate-300">No Session Selected</h3>
        <p className="text-xs text-slate-400 max-w-xs mt-1">
          Select an active customer session from the live ticker to inspect the 10-Agent Chain-of-Thought reasoning.
        </p>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    if (status === 'COMPLETED') return <CheckCircle className="h-4 w-4 text-emerald-400" />;
    if (status === 'WARNING') return <AlertTriangle className="h-4 w-4 text-amber-400" />;
    return <HelpCircle className="h-4 w-4 text-slate-400" />;
  };

  return (
    <div className="glass-panel rounded-2xl border border-slate-800 p-5 flex flex-col h-[580px]">
      {/* Header Info */}
      <div className="pb-4 border-b border-slate-800 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">Agentic Chain-of-Thought Reasoning</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Session: <strong className="text-slate-200 font-mono">{selectedDecision.session_id}</strong> ({selectedDecision.customer_name})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Predicted Abandon Risk</span>
            <span className="text-base font-black text-rose-400">
              {(selectedDecision.risk_score * 100).toFixed(1)}%
            </span>
          </div>

          <div className="text-right border-l border-slate-800 pl-3">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Net Margin Lift</span>
            <span className="text-base font-black text-emerald-400">
              +${selectedDecision.expected_incremental_margin.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Action Summary Banner */}
      <div className="my-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Final Action:</span>
              <span className="text-xs font-bold text-white px-2 py-0.5 rounded bg-indigo-600 font-mono">
                {selectedDecision.recommended_action}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5 italic">
              "{selectedDecision.critic_reasoning}"
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Critic Verdict:</span>
          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
            selectedDecision.critic_verdict === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
          }`}>
            {selectedDecision.critic_verdict}
          </span>
        </div>
      </div>

      {/* Chain-of-Thought Steps List */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {selectedDecision.cot_steps.map((step, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 transition"
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                {getStatusIcon(step.status)}
                <span className="text-xs font-bold text-slate-200">{step.agent_name}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {new Date(step.timestamp).toLocaleTimeString()}
              </span>
            </div>

            <div className="mt-1 pl-6 text-xs text-slate-300 space-y-1">
              <p className="font-mono text-[11px] text-slate-400 leading-relaxed bg-slate-950/60 p-2 rounded-lg border border-slate-800/50">
                {step.reasoning}
              </p>
              <div className="flex items-center justify-between text-[11px] pt-1 text-slate-400">
                <span>Input: <strong className="text-slate-300">{step.input_summary}</strong></span>
                <span className="text-indigo-400 font-medium">Output: <strong>{step.output_summary}</strong></span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
