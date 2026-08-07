import React from 'react';
import { useDashboardStore } from '../../store/useDashboardStore';
import { FileText, CheckCircle, ShieldAlert, AlertTriangle, ExternalLink, Download } from 'lucide-react';

export const AuditLogTable: React.FC = () => {
  const { decisions, setSelectedDecision } = useDashboardStore();

  return (
    <div className="glass-panel rounded-2xl border border-slate-800 p-5 mt-5">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-400" />
            Immutable Decision Audit & Governance Trail
          </h3>
          <p className="text-xs text-slate-400">Cryptographically verifiable record of every decision, diagnosis, and policy check</p>
        </div>

        <button className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition">
          <Download className="h-3.5 w-3.5" />
          Export Audit Ledger (CSV)
        </button>
      </div>

      <div className="overflow-x-auto mt-4">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Audit ID / Timestamp</th>
              <th className="py-3 px-4">Customer / Session</th>
              <th className="py-3 px-4">Cart Value / Margin</th>
              <th className="py-3 px-4">Risk Score</th>
              <th className="py-3 px-4">Primary Diagnosis</th>
              <th className="py-3 px-4">Action Executed</th>
              <th className="py-3 px-4">Net Margin Impact</th>
              <th className="py-3 px-4">Critic Verdict</th>
              <th className="py-3 px-4">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {decisions.map((d) => (
              <tr key={d.decision_id} className="hover:bg-slate-900/40 transition">
                <td className="py-3.5 px-4 font-mono">
                  <div className="font-semibold text-indigo-300">{d.decision_id}</div>
                  <div className="text-[10px] text-slate-500">{new Date(d.created_at).toLocaleTimeString()}</div>
                </td>
                <td className="py-3.5 px-4">
                  <div className="font-medium text-white">{d.customer_name}</div>
                  <div className="text-[10px] text-slate-500 font-mono">{d.session_id.substring(0, 10)}</div>
                </td>
                <td className="py-3.5 px-4">
                  <div className="font-semibold text-white">${d.cart_value.toFixed(2)}</div>
                  <div className="text-[10px] text-emerald-400">Margin: ${d.gross_margin.toFixed(2)}</div>
                </td>
                <td className="py-3.5 px-4">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    d.risk_score >= 0.6 ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}>
                    {(d.risk_score * 100).toFixed(0)}%
                  </span>
                </td>
                <td className="py-3.5 px-4 font-medium text-slate-200">
                  {d.primary_diagnosis.replace(/_/g, ' ')}
                </td>
                <td className="py-3.5 px-4">
                  <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-mono font-semibold text-[11px]">
                    {d.recommended_action}
                  </span>
                </td>
                <td className="py-3.5 px-4 font-bold text-emerald-400">
                  +${d.expected_incremental_margin.toFixed(2)}
                </td>
                <td className="py-3.5 px-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    d.critic_verdict === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                  }`}>
                    {d.critic_verdict}
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  <button
                    onClick={() => setSelectedDecision(d)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-400 transition"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
