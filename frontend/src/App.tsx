import React, { useState, useEffect } from 'react';
import { useAuthStore } from './store/useAuthStore';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { StatCard } from './components/layout/StatCard';
import { SessionFeed } from './components/dashboard/SessionFeed';
import { AgentConsole } from './components/dashboard/AgentConsole';
import { AnalyticsView } from './components/dashboard/AnalyticsView';
import { PolicyEngine } from './components/dashboard/PolicyEngine';
import { AuditLedger } from './components/dashboard/AuditLedger';
import { useDashboardStore } from './store/useDashboardStore';
import { ShoppingCart, AlertTriangle, TrendingUp, DollarSign, Zap, ShieldCheck } from 'lucide-react';

const pages: Record<string, { title: string; subtitle: string }> = {
  dashboard:  { title: 'Control Center',    subtitle: 'Real-time cart abandonment risk · AI-powered intervention · Profit optimization' },
  sessions:   { title: 'Live Sessions',     subtitle: 'Active customer session telemetry stream · Click any row to inspect agent reasoning' },
  agents:     { title: 'Agent Console',     subtitle: '10-agent chain-of-thought reasoning inspector · SHAP feature attribution' },
  policy:     { title: 'Policy Engine',     subtitle: 'Enterprise guardrail & compliance control plane · Live margin protection' },
  audit:      { title: 'Audit Ledger',      subtitle: 'Immutable governance trail · Cryptographic decision records · SHAP explainability' },
  analytics:  { title: 'Analytics',         subtitle: 'Session volume · Recovery performance · Decision quality KPIs' },
  settings:   { title: 'Settings',          subtitle: 'System configuration & integration management' },
};

const sparkSessions  = [820, 950, 1100, 890, 1250, 1420, 1100, 1380];
const sparkMargin    = [3200, 3800, 4200, 3100, 4800, 6200, 4900, 5800];
const sparkRisk      = [15, 18, 22, 16, 24, 29, 21, 25];

function Dashboard() {
  const [activePage, setActivePage] = useState('dashboard');
  const { kpis, fetchRemoteData } = useDashboardStore();
  const { user, logout } = useAuthStore();
  const page = pages[activePage] ?? pages.dashboard;

  useEffect(() => {
    fetchRemoteData();
  }, [fetchRemoteData]);

  const renderContent = () => {
    switch (activePage) {
      case 'sessions':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-120px)]">
            <SessionFeed />
            <AgentConsole />
          </div>
        );
      case 'agents':
        return <div className="h-[calc(100vh-120px)]"><AgentConsole /></div>;
      case 'policy':
        return <PolicyEngine />;
      case 'audit':
        return <AuditLedger />;
      case 'analytics':
        return <AnalyticsView />;
      case 'settings':
        return (
          <div className="flex items-center justify-center h-72 glass rounded-2xl border border-slate-800/50 anim-fade">
            <div className="text-center">
              <div className="text-3xl mb-3">⚙️</div>
              <h3 className="text-base font-bold text-slate-200 mb-1">Integration Settings</h3>
              <p className="text-xs text-slate-500">Shopify · Magento · WooCommerce · Razorpay SDK connections</p>
            </div>
          </div>
        );
      default:
        return (
          <div className="space-y-6 anim-fade">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
              <StatCard title="Sessions Analyzed" value={kpis.total_sessions_analyzed.toLocaleString()} change="+12.4% vs yesterday" changeType="positive" icon={ShoppingCart} accentColor="indigo" subtitle="Real-time clickstream pipeline" sparkData={sparkSessions} />
              <StatCard title="High Risk Sessions" value={kpis.high_risk_sessions.toLocaleString()} change="16.9% abandonment rate" changeType="negative" icon={AlertTriangle} accentColor="rose" subtitle="LightGBM score ≥ 0.60" sparkData={sparkRisk} />
              <StatCard title="Recovered Cart Value" value={`$${(kpis.recovered_cart_value / 1000).toFixed(1)}K`} change="+28.4% conversion lift" changeType="positive" icon={TrendingUp} accentColor="emerald" subtitle="1,890 interventions executed" sparkData={[45, 62, 58, 74, 88, 110, 98, 124]} />
              <StatCard title="Net Incremental Margin" value={`$${(kpis.net_incremental_margin / 1000).toFixed(1)}K`} change="38.7% net ROI" changeType="positive" icon={DollarSign} accentColor="emerald" subtitle="After costs & incentives" sparkData={sparkMargin} />
            </div>

            <div className="grid grid-cols-2 xl:grid-cols-4 gap-5">
              <StatCard title="Avg Decision Latency" value={`${kpis.avg_decision_latency_ms}ms`} icon={Zap} accentColor="indigo" subtitle="p95 end-to-end" />
              <StatCard title="Policy Pass Rate" value={`${(kpis.policy_pass_rate * 100).toFixed(1)}%`} icon={ShieldCheck} accentColor="emerald" subtitle="Margin compliance" />
              <StatCard title="Critic Block Rate" value={`${(kpis.critic_rejection_rate * 100).toFixed(1)}%`} icon={ShieldCheck} accentColor="violet" subtitle="Cannibalization prevented" />
              <StatCard title="Interventions Run" value={kpis.interventions_executed.toLocaleString()} icon={Zap} accentColor="amber" subtitle="Actions dispatched today" />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="h-[580px]"><SessionFeed /></div>
              <div className="h-[580px]"><AgentConsole /></div>
            </div>

            <AnalyticsView />
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen relative" style={{ background: '#04070f' }}>
      <div className="mesh-bg" />
      <Sidebar activePage={activePage} setActivePage={setActivePage} user={user} onLogout={logout} />
      <div className="flex-1 flex flex-col ml-64 relative z-10">
        <TopBar activePage={activePage} pageTitle={page.title} pageSubtitle={page.subtitle} user={user} />
        <main className="flex-1 p-6 overflow-y-auto">{renderContent()}</main>
        <footer className="px-6 py-3 border-t border-slate-900/80 flex items-center justify-between text-[10px] font-mono text-slate-600">
          <span>CartSense AI · Enterprise Decision Intelligence Platform</span>
          <span>AI BUILD 2026 Student Edition · Track 2 · v2.6.0</span>
        </footer>
      </div>
    </div>
  );
}

export function App() {
  const { isAuthenticated } = useAuthStore();
  const [showRegister, setShowRegister] = useState(false);

  if (!isAuthenticated) {
    return showRegister
      ? <RegisterPage onSwitchToLogin={() => setShowRegister(false)} />
      : <LoginPage onSwitchToRegister={() => setShowRegister(true)} />;
  }

  return <Dashboard />;
}

export default App;
