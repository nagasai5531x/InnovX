import React from 'react';
import { useDashboardStore } from '../../store/useDashboardStore';
import { ShieldCheck, AlertOctagon, Lock, Sliders, RefreshCw } from 'lucide-react';

export const PolicyEngine: React.FC = () => {
  const { policy, updatePolicy } = useDashboardStore();

  const spendPct = (policy.current_daily_spend / policy.daily_budget_limit) * 100;

  return (
    <div className="space-y-6 anim-fade">
      {/* Header Banner */}
      <div className="glass rounded-2xl border border-indigo-500/20 p-6"
        style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(4,7,15,0.6))' }}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl" style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)' }}>
              <ShieldCheck className="h-6 w-6 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Enterprise Policy Control Plane</h2>
              <p className="text-xs text-slate-400">All agent decisions are validated in real-time against these live guardrails</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)' }}>
            <Lock className="h-4 w-4 text-emerald-400" />
            <span className="text-sm font-bold text-emerald-400">GUARDRAILS ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Budget Tracker */}
      <div className="glass rounded-2xl border border-slate-800/50 p-6">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <RefreshCw className="h-4 w-4 text-indigo-400" /> Daily Campaign Budget Tracker
        </h3>
        <div className="flex items-end justify-between mb-3">
          <div>
            <div className="text-3xl font-black text-white">${policy.current_daily_spend.toFixed(2)}</div>
            <div className="text-xs text-slate-400 mt-0.5">spent of ${policy.daily_budget_limit.toFixed(2)} daily limit</div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black text-emerald-400">${(policy.daily_budget_limit - policy.current_daily_spend).toFixed(2)}</div>
            <div className="text-xs text-slate-400 mt-0.5">remaining budget</div>
          </div>
        </div>
        <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${Math.min(spendPct, 100)}%`,
              background: spendPct > 85 ? 'linear-gradient(90deg, #f43f5e, #fb7185)' : 'linear-gradient(90deg, #6366f1, #8b5cf6)',
              boxShadow: spendPct > 85 ? '0 0 10px rgba(244,63,94,0.5)' : '0 0 10px rgba(99,102,241,0.5)',
            }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
          <span>0%</span>
          <span className={spendPct > 85 ? 'text-rose-400 font-bold' : ''}>{spendPct.toFixed(1)}% utilized</span>
          <span>100%</span>
        </div>
      </div>

      {/* Policy Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          {
            label: 'Max Discount Cap',
            key: 'max_discount_percentage' as const,
            val: policy.max_discount_percentage,
            min: 0, max: 25, step: 1,
            color: '#f59e0b',
            unit: '%',
            desc: 'Hard ceiling on any discount offer issued by Decision Agent'
          },
          {
            label: 'Min Net Margin Guardrail',
            key: 'min_cart_margin_percentage' as const,
            val: policy.min_cart_margin_percentage,
            min: 5, max: 35, step: 1,
            color: '#10b981',
            unit: '%',
            desc: 'Post-incentive net margin must exceed this threshold or action is blocked'
          },
          {
            label: 'Cannibalization Shield',
            key: 'cannibalization_threshold' as const,
            val: policy.cannibalization_threshold * 100,
            min: 10, max: 80, step: 5,
            color: '#6366f1',
            unit: '%',
            desc: 'Rejects discount if user organic conversion probability exceeds this'
          },
        ].map(s => (
          <div key={s.key} className="glass rounded-2xl border border-slate-800/50 p-5">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300">{s.label}</label>
              <span className="text-xl font-black" style={{ color: s.color }}>
                {s.val.toFixed(0)}{s.unit}
              </span>
            </div>
            <input
              type="range"
              min={s.min} max={s.max} step={s.step}
              value={s.val}
              onChange={e => {
                const v = Number(e.target.value);
                if (s.key === 'cannibalization_threshold') {
                  updatePolicy({ cannibalization_threshold: v / 100 });
                } else {
                  updatePolicy({ [s.key]: v });
                }
              }}
              className="w-full h-2 rounded-full appearance-none cursor-pointer mt-3 mb-3"
              style={{ accentColor: s.color }}
            />
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1">
              <div className="h-full rounded-full" style={{ width: `${((s.val - s.min) / (s.max - s.min)) * 100}%`, background: s.color, opacity: 0.7 }} />
            </div>
            <p className="text-[10px] text-slate-500 mt-3 leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>

      {/* Compliance Toggles */}
      <div className="glass rounded-2xl border border-slate-800/50 p-6">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <AlertOctagon className="h-4 w-4 text-amber-400" /> Regulatory & Compliance Controls
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              label: 'TRAI National DND Registry Filter',
              desc: 'Blocks all outbound notifications (WhatsApp, Email, SMS) to users registered on TRAI Do Not Disturb list.',
              key: 'enforce_trai_dnd' as const,
              val: policy.enforce_trai_dnd,
              badgeOn: 'ENFORCED', badgeOff: 'DISABLED',
              colorOn: '#10b981',
            },
            {
              label: 'WhatsApp Business Opt-In Requirement',
              desc: 'Only dispatches WhatsApp messages to users who have explicitly opted into business communication.',
              key: 'enforce_whatsapp_opt_in' as const,
              val: policy.enforce_whatsapp_opt_in,
              badgeOn: 'ENFORCED', badgeOff: 'DISABLED',
              colorOn: '#10b981',
            },
          ].map(t => (
            <div key={t.key} className="p-4 rounded-xl flex items-start gap-4" style={{ background: 'rgba(15,23,42,0.7)', border: '1px solid rgba(51,65,85,0.4)' }}>
              <label className="relative inline-flex items-center cursor-pointer mt-0.5 shrink-0">
                <input type="checkbox" checked={t.val} onChange={e => updatePolicy({ [t.key]: e.target.checked })} className="sr-only peer" />
                <div className="w-10 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:bg-indigo-600 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
              </label>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-slate-200">{t.label}</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold"
                    style={{ color: t.val ? t.colorOn : '#64748b', background: t.val ? `${t.colorOn}15` : 'rgba(100,116,139,0.1)', border: `1px solid ${t.val ? `${t.colorOn}30` : 'rgba(100,116,139,0.2)'}` }}>
                    {t.val ? t.badgeOn : t.badgeOff}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">{t.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
