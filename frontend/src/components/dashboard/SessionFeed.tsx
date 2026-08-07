import React from 'react';
import { useDashboardStore } from '../../store/useDashboardStore';
import { DecisionResult } from '../../types';
import { AlertTriangle, CheckCircle, ShieldAlert, Zap, Search, Clock } from 'lucide-react';

export const SessionFeed: React.FC = () => {
  const { decisions, selectedDecision, setSelectedDecision, filterRisk, setFilterRisk, searchQuery, setSearchQuery } = useDashboardStore();

  const filtered = decisions.filter(d => {
    if (filterRisk === 'HIGH'   && d.risk_score < 0.6)  return false;
    if (filterRisk === 'MEDIUM' && (d.risk_score < 0.3 || d.risk_score >= 0.6)) return false;
    if (filterRisk === 'LOW'    && d.risk_score >= 0.3)  return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return d.customer_name.toLowerCase().includes(q) || d.primary_diagnosis.toLowerCase().includes(q) || d.recommended_action.toLowerCase().includes(q);
    }
    return true;
  });

  const riskBadge = (score: number) => {
    if (score >= 0.7) return { label: `${(score*100).toFixed(0)}%`, color: '#f43f5e', bg: 'rgba(244,63,94,0.12)', border: 'rgba(244,63,94,0.3)', icon: <AlertTriangle className="h-3 w-3" /> };
    if (score >= 0.5) return { label: `${(score*100).toFixed(0)}%`, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', icon: <Zap className="h-3 w-3" /> };
    return         { label: `${(score*100).toFixed(0)}%`, color: '#10b981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)', icon: <CheckCircle className="h-3 w-3" /> };
  };

  const actionColor = (a: string): string => {
    if (a.includes('COUPON') || a.includes('SHIPPING') || a.includes('COD')) return '#f59e0b';
    if (a === 'RETRY_PAYMENT') return '#6366f1';
    if (a === 'EXIT_INTENT_POPUP') return '#8b5cf6';
    if (a === 'DO_NOTHING') return '#64748b';
    return '#34d399';
  };

  return (
    <div className="glass rounded-2xl border border-slate-800/50 flex flex-col h-full">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-slate-800/50">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-60" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-rose-500" />
              </span>
              Live Session Telemetry
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">{filtered.length} sessions · Click to inspect reasoning</p>
          </div>

          {/* Filter pills */}
          <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-[11px] font-semibold gap-0.5">
            {(['ALL','HIGH','MEDIUM','LOW'] as const).map(f => (
              <button key={f} onClick={() => setFilterRisk(f as any)}
                className={`px-2.5 py-1 rounded-md transition-all ${filterRisk === f ? (f==='HIGH'?'bg-rose-600 text-white':f==='MEDIUM'?'bg-amber-600 text-white':f==='LOW'?'bg-emerald-700 text-white':'bg-indigo-600 text-white') : 'text-slate-400 hover:text-slate-200'}`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="relative">
          <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name, diagnosis, action..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/80 border border-slate-800 text-xs rounded-xl pl-9 pr-4 py-2 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>
      </div>

      {/* Feed List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-600 text-xs">No matching sessions found.</div>
        ) : (
          filtered.map((d, idx) => {
            const isSelected = selectedDecision?.decision_id === d.decision_id;
            const rb = riskBadge(d.risk_score);
            return (
              <div
                key={d.decision_id}
                onClick={() => setSelectedDecision(d)}
                className="p-4 rounded-xl border cursor-pointer transition-all duration-200 group"
                style={{
                  background: isSelected ? 'rgba(99,102,241,0.1)' : 'rgba(15,23,42,0.5)',
                  borderColor: isSelected ? 'rgba(99,102,241,0.4)' : 'rgba(51,65,85,0.4)',
                  boxShadow: isSelected ? '0 0 20px -8px rgba(99,102,241,0.3)' : 'none',
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-[10px] font-black text-white shrink-0">
                      {d.customer_name.charAt(0)}
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-white">{d.customer_name}</span>
                      <span className="text-[10px] text-slate-500 ml-1.5 font-mono">#{d.session_id.substring(5,13)}</span>
                    </div>
                  </div>
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                    style={{ color: rb.color, background: rb.bg, border: `1px solid ${rb.border}` }}>
                    {rb.icon}{rb.label}
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 mb-2.5 truncate">
                  📍 {d.primary_diagnosis.replace(/_/g, ' ')}
                </p>

                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold font-mono"
                    style={{ color: actionColor(d.recommended_action), background: `${actionColor(d.recommended_action)}15`, border: `1px solid ${actionColor(d.recommended_action)}30` }}>
                    {d.recommended_action}
                  </span>

                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="text-slate-400">${d.cart_value.toFixed(0)}</span>
                    <span className="font-bold" style={{ color: d.expected_incremental_margin > 0 ? '#34d399' : '#64748b' }}>
                      {d.expected_incremental_margin > 0 ? `+$${d.expected_incremental_margin.toFixed(2)}` : '—'}
                    </span>
                    <span className="flex items-center gap-1 text-slate-500">
                      <Clock className="h-3 w-3" />
                      {new Date(d.created_at).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit',second:'2-digit'})}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
