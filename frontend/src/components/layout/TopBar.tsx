import React from 'react';
import { Bell, PlayCircle, ShieldCheck, AlertTriangle, Zap } from 'lucide-react';
import { useDashboardStore } from '../../store/useDashboardStore';

interface TopBarProps {
  activePage: string;
  pageTitle: string;
  pageSubtitle: string;
  user: { name: string; email: string; role: string; avatar: string } | null;
}

export const TopBar: React.FC<TopBarProps> = ({ pageTitle, pageSubtitle, user }) => {
  const { triggerSimulation, isSimulating } = useDashboardStore();

  return (
    <header className="glass border-b border-slate-800/60 px-8 py-4 flex items-center justify-between sticky top-0 z-40">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">{pageTitle}</h1>
        <p className="text-xs text-slate-400 mt-0.5">{pageSubtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Live trigger buttons */}
        <div className="hidden xl:flex items-center gap-2">
          <span className="text-xs text-slate-500 font-semibold">Simulate:</span>

          <button
            onClick={() => triggerSimulation('PAYMENT_FAIL')}
            disabled={isSimulating}
            className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 text-rose-300 text-xs font-semibold transition-all hover:shadow-md hover:shadow-rose-500/10 disabled:opacity-40"
          >
            {isSimulating ? (
              <span className="h-3 w-3 rounded-full border-2 border-rose-400 border-t-transparent animate-spin" />
            ) : (
              <PlayCircle className="h-3.5 w-3.5" />
            )}
            Payment Fail
          </button>

          <button
            onClick={() => triggerSimulation('SHIPPING_FRICTION')}
            disabled={isSimulating}
            className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 text-amber-300 text-xs font-semibold transition-all hover:shadow-md hover:shadow-amber-500/10 disabled:opacity-40"
          >
            <PlayCircle className="h-3.5 w-3.5" />
            Shipping Friction
          </button>

          <button
            onClick={() => triggerSimulation('CANNIBALIZATION_PREVENTION')}
            disabled={isSimulating}
            className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition-all hover:shadow-indigo-500/35 disabled:opacity-40"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            Self-Critic Test
          </button>
        </div>

        {/* Notification bell */}
        <button className="relative p-2.5 rounded-xl glass-bright hover:border-slate-700 transition">
          <Bell className="h-4.5 w-4.5 text-slate-400" style={{ height: '18px', width: '18px' }} />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 border-2 border-slate-900" />
        </button>

        {/* AI Engine Status Chip */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl glass-bright border border-indigo-500/15">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-indigo-500" />
          </span>
          <span className="text-xs font-semibold text-indigo-300">AI Engine Active</span>
          <Zap className="h-3.5 w-3.5 text-indigo-400" />
        </div>
        {/* User avatar chip */}
        {user && (
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl glass-bright border border-slate-800/60">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-xs font-black text-white">
              {user.avatar}
            </div>
            <div className="hidden xl:block">
              <div className="text-xs font-semibold text-slate-200 leading-none">{user.name}</div>
              <div className="text-[9px] text-slate-500 font-mono">{user.role}</div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
