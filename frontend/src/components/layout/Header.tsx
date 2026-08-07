import React from 'react';
import { ShieldCheck, Activity, Zap, PlayCircle, Lock } from 'lucide-react';
import { useDashboardStore } from '../../store/useDashboardStore';

export const Header: React.FC = () => {
  const { kpis, triggerSimulation, isSimulating } = useDashboardStore();

  return (
    <header className="glass-panel border-b border-slate-800/80 px-6 py-4 sticky top-0 z-50 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Zap className="h-6 w-6 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white">CartSense AI</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Enterprise v2.6
            </span>
          </div>
          <p className="text-xs text-slate-400">Autonomous Cart Abandonment Diagnosis & Profit Intelligence Platform</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Live System Status Badges */}
        <div className="hidden lg:flex items-center gap-3 bg-slate-900/80 border border-slate-800 rounded-lg px-3 py-1.5 text-xs">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-300 font-medium">10 Agents Online</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1.5 text-slate-400">
            <Activity className="h-3.5 w-3.5 text-indigo-400" />
            <span>p95 Latency: <strong className="text-white font-semibold">{kpis.avg_decision_latency_ms}ms</strong></span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1.5 text-slate-400">
            <Lock className="h-3.5 w-3.5 text-emerald-400" />
            <span>TRAI/DND: <strong className="text-emerald-400 font-semibold">ENFORCED</strong></span>
          </div>
        </div>

        {/* Live Scenario Triggers */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => triggerSimulation('PAYMENT_FAIL')}
            disabled={isSimulating}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-medium transition disabled:opacity-50"
          >
            <PlayCircle className="h-3.5 w-3.5" />
            Simulate Payment Fail
          </button>

          <button
            onClick={() => triggerSimulation('SHIPPING_FRICTION')}
            disabled={isSimulating}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-medium transition disabled:opacity-50"
          >
            <PlayCircle className="h-3.5 w-3.5" />
            Simulate Shipping Friction
          </button>

          <button
            onClick={() => triggerSimulation('CANNIBALIZATION_PREVENTION')}
            disabled={isSimulating}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-md shadow-indigo-600/30 transition disabled:opacity-50"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            Test Self-Critic Cannibalization
          </button>
        </div>
      </div>
    </header>
  );
};
