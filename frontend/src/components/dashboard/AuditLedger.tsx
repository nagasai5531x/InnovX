import React, { useState } from 'react';
import { useDashboardStore } from '../../store/useDashboardStore';
import { FileText, Download, ExternalLink, ChevronDown, ChevronUp, CheckCircle, XCircle } from 'lucide-react';

export const AuditLedger: React.FC = () => {
  const { decisions, setSelectedDecision } = useDashboardStore();
  const [expanded, setExpanded] = useState<string | null>(null);

  const getRiskColor = (s: number) => s >= 0.7 ? '#f43f5e' : s >= 0.5 ? '#f59e0b' : '#10b981';
  const getActionColor = (a: string) => {
    if (a.includes('COUPON') || a.includes('SHIPPING')) return '#f59e0b';
    if (a === 'RETRY_PAYMENT') return '#6366f1';
    if (a === 'DO_NOTHING') return '#475569';
    return '#10b981';
  };

  return (
    <div className="space-y-5 anim-fade">
      {/* Header */}
      <div className="glass rounded-2xl border border-slate-800/50 px-6 py-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-400" /> Immutable Decision Audit Ledger
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Cryptographically verifiable record of every diagnosis, policy check, and intervention decision
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition"
          style={{ background: 'rgba(51,65,85,0.4)', border: '1px solid rgba(71,85,105,0.4)' }}>
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      {/* Table */}
      <div className="glass rounded-2xl border border-slate-800/50 overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-9 gap-3 px-5 py-3 border-b border-slate-800/60 text-[10px] font-bold uppercase tracking-widest text-slate-500"
          style={{ gridTemplateColumns: '1.4fr 1.2fr 0.8fr 0.8fr 1.4fr 1fr 0.8fr 0.7fr 0.4fr' }}>
          <span>Audit ID · Time</span>
          <span>Customer · Session</span>
          <span>Cart · Margin</span>
          <span>Risk</span>
          <span>Root Cause</span>
          <span>Action</span>
          <span>Net Margin Δ</span>
          <span>Critic</span>
          <span />
        </div>

        {/* Rows */}
        <div className="divide-y divide-slate-800/40">
          {decisions.map((d) => {
            const isOpen = expanded === d.decision_id;
            return (
              <div key={d.decision_id}>
                {/* Main Row */}
                <div
                  className="grid gap-3 px-5 py-3.5 text-xs hover:bg-slate-900/40 transition cursor-pointer items-center"
                  style={{ gridTemplateColumns: '1.4fr 1.2fr 0.8fr 0.8fr 1.4fr 1fr 0.8fr 0.7fr 0.4fr' }}
                  onClick={() => setExpanded(isOpen ? null : d.decision_id)}
                >
                  <div>
                    <div className="font-mono font-semibold text-indigo-300 text-[10px]">{d.decision_id}</div>
                    <div className="text-[10px] text-slate-500">{new Date(d.created_at).toLocaleTimeString()}</div>
                  </div>

                  <div>
                    <div className="font-semibold text-slate-200">{d.customer_name}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{d.session_id.substring(0,12)}</div>
                  </div>

                  <div>
                    <div className="font-bold text-white">${d.cart_value.toFixed(0)}</div>
                    <div className="text-[10px] text-emerald-400">${d.gross_margin.toFixed(0)} gross</div>
                  </div>

                  <div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                      style={{ color: getRiskColor(d.risk_score), background: `${getRiskColor(d.risk_score)}15`, border: `1px solid ${getRiskColor(d.risk_score)}30` }}>
                      {(d.risk_score * 100).toFixed(0)}%
                    </span>
                  </div>

                  <div className="text-slate-300 font-medium leading-tight">
                    {d.primary_diagnosis.replace(/_/g, ' ')}
                  </div>

                  <div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono"
                      style={{ color: getActionColor(d.recommended_action), background: `${getActionColor(d.recommended_action)}15`, border: `1px solid ${getActionColor(d.recommended_action)}30` }}>
                      {d.recommended_action}
                    </span>
                  </div>

                  <div className="font-bold" style={{ color: d.expected_incremental_margin > 0 ? '#34d399' : '#64748b' }}>
                    {d.expected_incremental_margin > 0 ? `+$${d.expected_incremental_margin.toFixed(2)}` : '—'}
                  </div>

                  <div>
                    {d.critic_verdict === 'APPROVED'
                      ? <span className="flex items-center gap-1 text-emerald-400 font-bold text-[10px]"><CheckCircle className="h-3 w-3" /> Approved</span>
                      : d.critic_verdict === 'REJECTED'
                      ? <span className="flex items-center gap-1 text-rose-400 font-bold text-[10px]"><XCircle className="h-3 w-3" /> Rejected</span>
                      : <span className="text-amber-400 text-[10px] font-bold">Modified</span>}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button onClick={e => { e.stopPropagation(); setSelectedDecision(d); }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </button>
                    {isOpen ? <ChevronUp className="h-3.5 w-3.5 text-slate-500" /> : <ChevronDown className="h-3.5 w-3.5 text-slate-500" />}
                  </div>
                </div>

                {/* Expanded SHAP Row */}
                {isOpen && (
                  <div className="px-6 pb-5 border-t border-slate-800/40" style={{ background: 'rgba(4,7,15,0.5)' }}>
                    <div className="pt-4 grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">SHAP Feature Attribution</h4>
                        <div className="space-y-2">
                          {Object.entries(d.shap_features).map(([feat, val]) => (
                            <div key={feat}>
                              <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                                <span>{feat.replace(/_/g, ' ')}</span>
                                <span className="font-mono font-bold text-indigo-300">{(val * 100).toFixed(1)}%</span>
                              </div>
                              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full rounded-full" style={{ width: `${Math.min(val * 200, 100)}%`, background: 'linear-gradient(90deg, #6366f1, #8b5cf6)' }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Business Justification</h4>
                        <p className="text-[11px] text-slate-300 leading-relaxed p-3 rounded-xl"
                          style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(51,65,85,0.4)' }}>
                          {d.critic_reasoning}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono"
                            style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#818cf8' }}>
                            Policy: {d.policy_status}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono"
                            style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#34d399' }}>
                            Exec: {d.execution_status}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono"
                            style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', color: '#a78bfa' }}>
                            Confidence: {(d.confidence_score * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
