import React from 'react';
import { useDashboardStore } from '../../store/useDashboardStore';
import { AlertTriangle, CheckCircle, ShieldAlert, Zap, Filter, Search } from 'lucide-react';
import { DecisionResult } from '../../types';

export const LiveSessionTicker: React.FC = () => {
  const { decisions, selectedDecision, setSelectedDecision, filterRisk, setFilterRisk, searchQuery, setSearchQuery } = useDashboardStore();

  const filteredDecisions = decisions.filter(d => {
    if (filterRisk === 'HIGH' && d.risk_score < 0.6) return false;
    if (filterRisk === 'MEDIUM' && (d.risk_score < 0.3 || d.risk_score >= 0.6)) return false;
    if (filterRisk === 'LOW' && d.risk_score >= 0.3) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        d.customer_name.toLowerCase().includes(q) ||
        d.primary_diagnosis.toLowerCase().includes(q) ||
        d.recommended_action.toLowerCase().includes(q) ||
        d.session_id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getRiskBadge = (score: number) => {
    if (score >= 0.6) {
      return (
        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
          <AlertTriangle className="h-3 w-3 text-rose-400" />
          {(score * 100).toFixed(0)}% High Risk
        </span>
      );
    }
    if (score >= 0.3) {
      return (
        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
          <Zap className="h-3 w-3 text-amber-400" />
          {(score * 100).toFixed(0)}% Med Risk
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
        <CheckCircle className="h-3 w-3 text-emerald-400" />
        {(score * 100).toFixed(0)}% Low Risk
      </span>
    );
  };

  const getVerdictBadge = (d: DecisionResult) => {
    if (d.critic_verdict === 'APPROVED') {
      return <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Critic Approved</span>;
    }
    if (d.critic_verdict === 'REJECTED') {
      return <span className="text-xs text-rose-400 font-semibold flex items-center gap-1"><ShieldAlert className="h-3 w-3" /> Critic Blocked</span>;
    }
    return <span className="text-xs text-amber-400 font-semibold">Critic Modified</span>;
  };

  return (
    <div className="glass-panel rounded-2xl border border-slate-800 p-5 flex flex-col h-[580px]">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Zap className="h-4 w-4 text-indigo-400" />
            Live Session Telemetry Ticker
          </h2>
          <p className="text-xs text-slate-400">Click any session to view 10-Agent CoT reasoning</p>
        </div>

        {/* Filters & Search */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-2 text-slate-400" />
            <input
              type="text"
              placeholder="Search session / diagnosis..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-xs rounded-lg pl-8 pr-3 py-1.5 text-slate-200 focus:outline-none focus:border-indigo-500 w-44"
            />
          </div>

          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setFilterRisk('ALL')}
              className={`px-2 py-1 rounded-md text-xs font-medium transition ${filterRisk === 'ALL' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              All
            </button>
            <button
              onClick={() => setFilterRisk('HIGH')}
              className={`px-2 py-1 rounded-md text-xs font-medium transition ${filterRisk === 'HIGH' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              High
            </button>
          </div>
        </div>
      </div>

      {/* Session Stream List */}
      <div className="flex-1 overflow-y-auto mt-4 space-y-3 pr-1">
        {filteredDecisions.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            No matching session telemetry events found.
          </div>
        ) : (
          filteredDecisions.map((d) => {
            const isSelected = selectedDecision?.decision_id === d.decision_id;
            return (
              <div
                key={d.decision_id}
                onClick={() => setSelectedDecision(d)}
                className={`p-4 rounded-xl border transition cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-950/40 border-indigo-500/50 shadow-md shadow-indigo-500/10'
                    : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-white">{d.customer_name}</span>
                    <span className="text-xs text-slate-400 font-mono">({d.session_id.substring(0, 10)})</span>
                  </div>
                  {getRiskBadge(d.risk_score)}
                </div>

                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium truncate max-w-[220px]">
                    🎯 {d.primary_diagnosis.replace(/_/g, ' ')}
                  </span>
                  <span className="text-indigo-300 font-semibold">
                    Cart: ${d.cart_value.toFixed(2)}
                  </span>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Action:</span>
                    <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-semibold font-mono text-[11px]">
                      {d.recommended_action}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getVerdictBadge(d)}
                    <span className="text-emerald-400 font-bold">
                      +{d.expected_incremental_margin > 0 ? `$${d.expected_incremental_margin.toFixed(2)}` : '$0.00'}
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
