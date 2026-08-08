import React, { useState } from 'react';
import {
  LayoutDashboard, Activity, Brain, ShieldCheck,
  FileText, BarChart3, Settings, ChevronRight,
  Zap, Wifi, LogOut
} from 'lucide-react';

interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
  user: { name: string; email: string; role: string; avatar: string } | null;
  onLogout: () => void;
}

const navItems = [
  { id: 'dashboard',  icon: LayoutDashboard, label: 'Control Center',    badge: null },
  { id: 'sessions',   icon: Activity,         label: 'Live Sessions',      badge: '14' },
  { id: 'agents',     icon: Brain,            label: 'Agent Console',      badge: null },
  { id: 'policy',     icon: ShieldCheck,      label: 'Policy Engine',      badge: null },
  { id: 'audit',      icon: FileText,         label: 'Audit Ledger',       badge: null },
  { id: 'analytics',  icon: BarChart3,        label: 'Analytics',          badge: null },
];

const ROLE_NAV_ALLOWED: Record<string, string[]> = {
  'Merchant':           ['dashboard', 'sessions'],
  'Analyst':            ['dashboard', 'analytics', 'agents', 'audit'],
  'Operations Manager': ['dashboard', 'sessions', 'agents', 'policy'],
  'Growth Manager':     ['dashboard', 'analytics'],
  'Admin':              ['dashboard', 'sessions', 'agents', 'policy', 'audit', 'analytics'],
};

export const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage, user, onLogout }) => {
  const [hovered, setHovered] = useState<string | null>(null);

  const userRole = user?.role || 'Admin';
  const allowedNavIds = ROLE_NAV_ALLOWED[userRole] || ROLE_NAV_ALLOWED['Admin'];
  const filteredNavItems = navItems.filter(item => allowedNavIds.includes(item.id));

  return (
    <aside className="glass-sidebar w-64 min-h-screen flex flex-col fixed left-0 top-0 z-50">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-indigo-500/10">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 blur-md opacity-60" />
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg">
              <Zap className="h-5 w-5 text-white" />
            </div>
          </div>
          <div>
            <div className="text-base font-bold tracking-tight text-white">CartSense<span className="text-gradient-indigo"> AI</span></div>
            <div className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Decision Intelligence</div>
          </div>
        </div>
      </div>

      {/* Live Status Bar */}
      <div className="mx-4 mt-4 mb-2 px-3 py-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/20 flex items-center gap-2.5">
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-semibold text-emerald-400">ALL 10 AGENTS ONLINE</div>
          <div className="text-[9px] text-emerald-600 font-mono">p95: 18.4ms · Decisions: 1,890</div>
        </div>
        <Wifi className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        {filteredNavItems.map((item) => {
          const isActive = activePage === item.id;
          const isHovered = hovered === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              onMouseEnter={() => setHovered(item.id)}
              onMouseLeave={() => setHovered(null)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-left ${
                isActive
                  ? 'nav-active text-indigo-300'
                  : isHovered
                  ? 'bg-slate-800/50 text-slate-200'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <item.icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? 'text-indigo-400' : ''}`} style={{ height: '18px', width: '18px' }} />
              <span className="flex-1 truncate">{item.label}</span>
              {item.badge && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 font-mono">
                  {item.badge}
                </span>
              )}
              {isActive && <ChevronRight className="h-3.5 w-3.5 text-indigo-400" />}
            </button>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="mx-4 border-t border-slate-800/60" />

      {/* Version & Settings */}
      <div className="px-4 py-4 space-y-2">
        <button
          onClick={() => setActivePage('settings')}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${activePage === 'settings' ? 'nav-active text-indigo-300' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/40'}`}
        >
          <Settings style={{ height: '18px', width: '18px' }} className="shrink-0" />
          <span>Settings</span>
        </button>

        {/* System Health */}
        <div className="px-4 py-3 rounded-xl bg-slate-950/60 border border-slate-800/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest">System Health</span>
            <span className="text-[10px] text-emerald-400 font-mono font-bold">99.8%</span>
          </div>
          <div className="space-y-1.5">
            {[
              { label: 'LightGBM Engine', val: 98, color: '#6366f1' },
              { label: 'Policy Guardrail', val: 100, color: '#10b981' },
              { label: 'Self-Critic Agent', val: 97, color: '#8b5cf6' },
            ].map(m => (
              <div key={m.label}>
                <div className="flex justify-between text-[9px] text-slate-500 mb-0.5">
                  <span>{m.label}</span>
                  <span className="font-mono">{m.val}%</span>
                </div>
                <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${m.val}%`, background: m.color, opacity: 0.8 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="px-1 pb-1">
          <div className="flex items-center justify-between text-[9px] text-slate-600 font-mono">
            <span>CartSense AI v2.6.0</span>
            <span className="text-indigo-600">AI BUILD 2026</span>
          </div>
        </div>

        {/* User Profile Card */}
        {user && (
          <div className="mx-1 p-3 rounded-xl flex items-center gap-3" style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(51,65,85,0.4)' }}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-xs font-black text-white shrink-0">
              {user.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-slate-200 truncate">{user.name}</div>
              <div className="text-[9px] text-slate-500 truncate font-mono">{user.role}</div>
            </div>
            <button onClick={onLogout} title="Sign out" className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition shrink-0">
              <LogOut style={{ width: '14px', height: '14px' }} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
