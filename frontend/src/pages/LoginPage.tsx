import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { Zap, Mail, Lock, Eye, EyeOff, ArrowRight, ChevronRight, Shield, Activity, TrendingUp } from 'lucide-react';

const FEATURES = [
  { icon: Activity,   color: '#6366f1', label: '10-Agent AI Pipeline',     desc: 'Real-time LightGBM risk scoring + LLM reasoning' },
  { icon: Shield,     color: '#10b981', label: 'Enterprise Guardrails',     desc: 'Margin protection, TRAI/DND compliance enforced' },
  { icon: TrendingUp, color: '#f59e0b', label: 'Profit-First Optimization', desc: 'Maximize incremental margin, not just conversions' },
];

export const LoginPage: React.FC<{ onSwitchToRegister: () => void }> = ({ onSwitchToRegister }) => {
  const { login, isLoading, error, clearError } = useAuthStore();
  const [email, setEmail]       = useState('demo@cartsense.ai');
  const [password, setPassword] = useState('Demo@2026');
  const [showPass, setShowPass] = useState(false);
  const [mounted, setMounted]   = useState(false);

  useEffect(() => { setMounted(true); return () => clearError(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#04070f' }}>
      {/* Animated mesh background */}
      <div className="mesh-bg" />

      {/* ── Left: Branding Panel ──────────────────────────────────────── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[52%] relative overflow-hidden p-12"
        style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(4,7,15,0.95) 60%, rgba(16,185,129,0.06) 100%)' }}
      >
        {/* Decorative glowing circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full" style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)', filter: 'blur(40px)' }} />

        {/* Grid overlay pattern */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="relative w-11 h-11">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 blur-lg opacity-70" />
            <div className="relative w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-xl">
              <Zap className="h-6 w-6 text-white" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-white tracking-tight">CartSense<span className="text-gradient-indigo"> AI</span></div>
            <div className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Enterprise Decision Platform</div>
          </div>
        </div>

        {/* Main headline */}
        <div className="relative z-10 space-y-6">
          <div>
            <h2 className="text-4xl font-black text-white leading-tight">
              Stop Losing Carts.<br />
              <span className="text-gradient-indigo">Start Winning Margins.</span>
            </h2>
            <p className="mt-4 text-slate-400 text-sm leading-relaxed max-w-md">
              AI BUILD 2026 — Track 2 · A 10-agent autonomous platform that diagnoses cart abandonment root causes and executes profit-optimized interventions in real time.
            </p>
          </div>

          {/* Feature pills */}
          <div className="space-y-3">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="flex items-start gap-3.5 p-4 rounded-xl transition"
                style={{
                  background: 'rgba(15,23,42,0.6)',
                  border: '1px solid rgba(51,65,85,0.4)',
                  animationDelay: `${i * 100}ms`,
                }}
              >
                <div className="p-2 rounded-lg shrink-0" style={{ background: `${f.color}15`, border: `1px solid ${f.color}30` }}>
                  <f.icon className="h-4.5 w-4.5" style={{ width: '18px', height: '18px', color: f.color }} />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-200">{f.label}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-6 pt-2">
            {[['$0.00013', 'Cost/Decision'], ['18.4ms', 'p95 Latency'], ['98.5%', 'Policy Compliance']].map(([v, l]) => (
              <div key={l}>
                <div className="text-xl font-black text-white">{v}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Badge */}
        <div className="relative z-10 flex items-center gap-2 text-xs text-slate-600 font-mono">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 inline-block" />
          AI BUILD 2026 · Student Edition · Track 2
        </div>
      </div>

      {/* ── Right: Login Form ─────────────────────────────────────────── */}
      <div className={`flex-1 flex flex-col items-center justify-center px-6 py-12 relative z-10 transition-all duration-700 ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
        <div className="w-full max-w-md">
          {/* Mobile logo (only on small screens) */}
          <div className="flex lg:hidden items-center gap-2.5 mb-10 justify-center">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-black text-white">CartSense<span className="text-gradient-indigo"> AI</span></span>
          </div>

          {/* Card */}
          <div className="p-8 rounded-2xl" style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(51,65,85,0.5)', backdropFilter: 'blur(20px)' }}>
            <div className="mb-7">
              <h1 className="text-2xl font-black text-white">Welcome back</h1>
              <p className="text-sm text-slate-400 mt-1">Sign in to your CartSense AI dashboard</p>
            </div>

            {/* Demo Hint */}
            <div className="mb-5 p-3 rounded-xl flex items-start gap-2.5" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
              <Zap className="h-4 w-4 text-indigo-400 mt-0.5 shrink-0" />
              <div className="text-xs text-slate-300">
                <span className="font-bold text-indigo-300">Demo credentials pre-filled.</span> Click Sign In to enter the platform.
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="h-4 w-4 absolute left-3.5 top-3.5 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); clearError(); }}
                    placeholder="you@cartsense.ai"
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none transition"
                    style={{ background: 'rgba(4,7,15,0.8)', border: `1px solid ${error ? 'rgba(244,63,94,0.5)' : 'rgba(51,65,85,0.6)'}` }}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="h-4 w-4 absolute left-3.5 top-3.5 text-slate-500" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => { setPassword(e.target.value); clearError(); }}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-11 py-3 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none transition"
                    style={{ background: 'rgba(4,7,15,0.8)', border: `1px solid ${error ? 'rgba(244,63,94,0.5)' : 'rgba(51,65,85,0.6)'}` }}
                    required
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300 transition">
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 rounded-xl text-xs text-rose-300 font-medium" style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.25)' }}>
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl font-bold text-sm text-white transition-all duration-200 disabled:opacity-60 mt-2"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 0 25px -5px rgba(99,102,241,0.5)' }}
              >
                {isLoading ? (
                  <>
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Authenticating…
                  </>
                ) : (
                  <>
                    Sign In to Dashboard
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px" style={{ background: 'rgba(51,65,85,0.5)' }} />
              <span className="text-xs text-slate-600">or</span>
              <div className="flex-1 h-px" style={{ background: 'rgba(51,65,85,0.5)' }} />
            </div>

            {/* Switch to Register */}
            <p className="text-center text-xs text-slate-500">
              New to CartSense AI?{' '}
              <button onClick={onSwitchToRegister} className="text-indigo-400 hover:text-indigo-300 font-semibold transition">
                Create an account <ChevronRight className="h-3 w-3 inline" />
              </button>
            </p>
          </div>

          {/* Accounts hint */}
          <div className="mt-5 p-4 rounded-xl space-y-1.5 text-[10px] font-mono" style={{ background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(51,65,85,0.3)' }}>
            <div className="text-slate-500 font-semibold mb-2 text-[10px] uppercase tracking-wider">Demo Accounts</div>
            {[
              ['admin@cartsense.ai', 'Admin@2026', 'Admin'],
              ['analyst@cartsense.ai', 'Analyst@2026', 'Analyst'],
              ['demo@cartsense.ai', 'Demo@2026', 'Merchant'],
            ].map(([e, p, r]) => (
              <div key={e} className="flex items-center gap-2 text-slate-500 cursor-pointer hover:text-slate-300 transition" onClick={() => { setEmail(e); setPassword(p); }}>
                <span className="px-1 py-0.5 rounded text-[9px] font-bold"
                  style={{ background: r === 'Admin' ? 'rgba(99,102,241,0.15)' : r === 'Analyst' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                    color: r === 'Admin' ? '#818cf8' : r === 'Analyst' ? '#34d399' : '#fbbf24' }}>{r}</span>
                <span>{e}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
