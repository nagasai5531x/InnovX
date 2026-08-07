import React from 'react';
import { useDashboardStore } from '../../store/useDashboardStore';
import { Sliders, ShieldCheck, DollarSign, Lock, AlertOctagon, Check } from 'lucide-react';

export const PolicySimulator: React.FC = () => {
  const { policy, updatePolicy } = useDashboardStore();

  return (
    <div className="glass-panel rounded-2xl border border-slate-800 p-5">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sliders className="h-5 w-5 text-indigo-400" />
            Enterprise Guardrail & Policy Control Plane
          </h3>
          <p className="text-xs text-slate-400">Live parameter adjustments enforced across all 10 agents</p>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5" />
          Guardrails Active
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
        {/* Policy 1: Max Discount % */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-300">Max Discount Limit</label>
            <span className="text-sm font-bold text-indigo-400">{policy.max_discount_percentage}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="25"
            step="1"
            value={policy.max_discount_percentage}
            onChange={(e) => updatePolicy({ max_discount_percentage: Number(e.target.value) })}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
          <p className="text-[11px] text-slate-400 mt-2">
            Strict cap on promotional discount values to prevent margin erosion.
          </p>
        </div>

        {/* Policy 2: Min Net Margin % */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-300">Min Cart Margin Guardrail</label>
            <span className="text-sm font-bold text-emerald-400">{policy.min_cart_margin_percentage}%</span>
          </div>
          <input
            type="range"
            min="5"
            max="30"
            step="1"
            value={policy.min_cart_margin_percentage}
            onChange={(e) => updatePolicy({ min_cart_margin_percentage: Number(e.target.value) })}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <p className="text-[11px] text-slate-400 mt-2">
            Net profit margin after product COGS + action costs + discount incentives.
          </p>
        </div>

        {/* Policy 3: Cannibalization Sensitivity */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-300">Cannibalization Shield</label>
            <span className="text-sm font-bold text-amber-400">{(policy.cannibalization_threshold * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="0.10"
            max="0.80"
            step="0.05"
            value={policy.cannibalization_threshold}
            onChange={(e) => updatePolicy({ cannibalization_threshold: Number(e.target.value) })}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
          <p className="text-[11px] text-slate-400 mt-2">
            Reject discounts if customer organic conversion probability exceeds threshold.
          </p>
        </div>
      </div>

      {/* Compliance Toggles */}
      <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={policy.enforce_trai_dnd}
              onChange={(e) => updatePolicy({ enforce_trai_dnd: e.target.checked })}
              className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
            />
            <span className="text-slate-300 font-medium">TRAI / National DND Filter</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={policy.enforce_whatsapp_opt_in}
              onChange={(e) => updatePolicy({ enforce_whatsapp_opt_in: e.target.checked })}
              className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
            />
            <span className="text-slate-300 font-medium">WhatsApp Business Opt-in Requirement</span>
          </label>
        </div>

        <div className="text-slate-400">
          Daily Campaign Spend: <strong className="text-white">${policy.current_daily_spend.toFixed(2)}</strong> / ${policy.daily_budget_limit.toFixed(2)}
        </div>
      </div>
    </div>
  );
};
