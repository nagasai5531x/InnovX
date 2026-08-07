import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { Zap, Mail, Lock, Eye, EyeOff, User, Briefcase, ArrowRight, ChevronLeft, CheckCircle } from 'lucide-react';

const ROLES = ['Merchant', 'Analyst', 'Operations Manager', 'Growth Manager', 'Admin'];

const PASSWORD_RULES = [
  { label: 'At least 8 characters',    test: (p: string) => p.length >= 8 },
  { label: 'One uppercase letter',      test: (p: string) => /[A-Z]/.test(p) },
  { label: 'One number',                test: (p: string) => /[0-9]/.test(p) },
  { label: 'One special character',     test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

export const RegisterPage: React.FC<{ onSwitchToLogin: () => void }> = ({ onSwitchToLogin }) => {
  const { register, isLoading, error, clearError } = useAuthStore();

  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [role,     setRole]     = useState('Analyst');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [showPass, setShowPass] = useState(false);
  const [mounted,  setMounted]  = useState(false);

  useEffect(() => { setMounted(true); return () => clearError(); }, []);

  const passwordStrength = PASSWORD_RULES.filter(r => r.test(password)).length;
  const strengthColor = passwordStrength <= 1 ? '#f43f5e' : passwordStrength <= 2 ? '#f59e0b' : passwordStrength <= 3 ? '#6366f1' : '#10b981';
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][passwordStrength];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) return;
    await register(name, email, password, role);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative px-4 py-12" style={{ background: '#04070f' }}>
      <div className="mesh-bg" />

      {/* Decorative blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(99,102,241,0.1) 0%, transparent 70%)', filter: 'blur(60px)' }} />

      <div className={`w-full max-w-lg relative z-10 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {/* Back to Login */}
        <button onClick={onSwitchToLogin} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-400 transition mb-6 font-medium">
          <ChevronLeft className="h-3.5 w-3.5" /> Back to Sign In
        </button>

        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 blur-lg opacity-60" />
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" />
            </div>
          </div>
          <div>
            <div className="text-xl font-black text-white">CartSense<span className="text-gradient-indigo"> AI</span></div>
            <div className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Create your account</div>
          </div>
        </div>

        {/* Card */}
        <div className="p-8 rounded-2xl" style={{ background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(51,65,85,0.5)', backdropFilter: 'blur(20px)' }}>
          <div className="mb-6">
            <h1 className="text-2xl font-black text-white">Create Account</h1>
            <p className="text-sm text-slate-400 mt-1">Join CartSense AI Enterprise Platform</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="h-4 w-4 absolute left-3.5 top-3.5 text-slate-500" />
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Arjun Mehta"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none transition"
                  style={{ background: 'rgba(4,7,15,0.8)', border: '1px solid rgba(51,65,85,0.6)' }}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Work Email</label>
              <div className="relative">
                <Mail className="h-4 w-4 absolute left-3.5 top-3.5 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); clearError(); }}
                  placeholder="you@company.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none transition"
                  style={{ background: 'rgba(4,7,15,0.8)', border: `1px solid ${error ? 'rgba(244,63,94,0.5)' : 'rgba(51,65,85,0.6)'}` }}
                  required
                />
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Your Role</label>
              <div className="relative">
                <Briefcase className="h-4 w-4 absolute left-3.5 top-3.5 text-slate-500" />
                <select
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-slate-200 focus:outline-none transition appearance-none cursor-pointer"
                  style={{ background: 'rgba(4,7,15,0.8)', border: '1px solid rgba(51,65,85,0.6)' }}
                >
                  {ROLES.map(r => <option key={r} value={r} style={{ background: '#0f172a' }}>{r}</option>)}
                </select>
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
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  className="w-full pl-10 pr-11 py-3 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none transition"
                  style={{ background: 'rgba(4,7,15,0.8)', border: '1px solid rgba(51,65,85,0.6)' }}
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300 transition">
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Strength meter */}
              {password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-[10px] mb-1">
                    <span className="text-slate-500">Password Strength</span>
                    <span className="font-bold" style={{ color: strengthColor }}>{strengthLabel}</span>
                  </div>
                  <div className="flex gap-1">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="flex-1 h-1.5 rounded-full transition-all duration-300"
                        style={{ background: i <= passwordStrength ? strengthColor : 'rgba(51,65,85,0.5)' }} />
                    ))}
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-0.5">
                    {PASSWORD_RULES.map(r => (
                      <div key={r.label} className="flex items-center gap-1.5 text-[10px]" style={{ color: r.test(password) ? '#10b981' : '#475569' }}>
                        <CheckCircle className="h-3 w-3 shrink-0" />
                        {r.label}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock className="h-4 w-4 absolute left-3.5 top-3.5 text-slate-500" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Repeat your password"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none transition"
                  style={{
                    background: 'rgba(4,7,15,0.8)',
                    border: `1px solid ${confirm && confirm !== password ? 'rgba(244,63,94,0.5)' : 'rgba(51,65,85,0.6)'}`
                  }}
                  required
                />
              </div>
              {confirm && confirm !== password && (
                <p className="text-[10px] text-rose-400 mt-1">Passwords do not match</p>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 rounded-xl text-xs text-rose-300" style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.25)' }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading || (!!confirm && confirm !== password) || passwordStrength < 2}
              className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl font-bold text-sm text-white transition-all duration-200 disabled:opacity-50 mt-2"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 0 25px -5px rgba(99,102,241,0.4)' }}
            >
              {isLoading ? (
                <>
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating Account…
                </>
              ) : (
                <>
                  Create Account & Launch Dashboard
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-slate-500 mt-5">
            Already have an account?{' '}
            <button onClick={onSwitchToLogin} className="text-indigo-400 hover:text-indigo-300 font-semibold transition">
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
