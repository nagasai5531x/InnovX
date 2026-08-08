import React, { useEffect } from 'react';
import { useRoleDashboardStore } from '../../store/useRoleDashboardStore';
import {
  ShoppingCart, TrendingUp, DollarSign, Percent,
  RefreshCw, Truck, Tag, Bell, Clock, ChevronRight
} from 'lucide-react';

const ACTION_LABEL: Record<string, { label: string; color: string }> = {
  RETRY_PAYMENT:       { label: 'Payment Retry',   color: '#6366f1' },
  OFFER_FREE_SHIPPING: { label: 'Free Shipping',   color: '#10b981' },
  OFFER_SMALL_COUPON:  { label: 'Coupon Offer',    color: '#f59e0b' },
  EXIT_INTENT_POPUP:   { label: 'Exit Popup',      color: '#8b5cf6' },
  WHATSAPP_REMINDER:   { label: 'WhatsApp',        color: '#22c55e' },
  EMAIL_REMINDER:      { label: 'Email',           color: '#3b82f6' },
  OFFER_COD:           { label: 'Cash on Delivery',color: '#ec4899' },
  DO_NOTHING:          { label: 'No Action',       color: '#475569' },
};

const ACTION_ICONS: Record<string, React.ReactNode> = {
  RETRY_PAYMENT:       <RefreshCw className="h-4 w-4" />,
  OFFER_FREE_SHIPPING: <Truck className="h-4 w-4" />,
  OFFER_SMALL_COUPON:  <Tag className="h-4 w-4" />,
  EXIT_INTENT_POPUP:   <Bell className="h-4 w-4" />,
};

function KPICard({ title, value, sub, color, icon: Icon }: any) {
  return (
    <div className="rounded-2xl p-5 flex flex-col gap-2 relative overflow-hidden"
      style={{ background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(51,65,85,0.5)' }}>
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-5"
        style={{ background: color, filter: 'blur(40px)', transform: 'translate(30%,-30%)' }} />
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</span>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: `${color}20`, color }}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="text-2xl font-black text-white">{value}</div>
      {sub && <div className="text-xs text-slate-500">{sub}</div>}
    </div>
  );
}

export function MerchantDashboard() {
  const { data, isLoading, fetch } = useRoleDashboardStore();

  useEffect(() => {
    fetch('Merchant', true);
  }, [fetch]);

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          <span className="text-sm text-slate-400">Loading merchant dashboard…</span>
        </div>
      </div>
    );
  }

  const k = data?.kpis ?? {
    total_carts_analyzed: 25,
    carts_recovered: 17,
    recovery_rate_pct: 68.0,
    gmv_recovered: 2845.5,
    discount_spend: 187.3,
    net_incremental_margin: 785.4,
    avg_cart_value: 167.38,
    roi_pct: 419.3,
  };

  const actions: { action: string; count: number }[] = data?.top_actions ?? [];
  const feed: any[] = data?.recent_interventions ?? [];
  const heatmap: any[] = data?.hourly_heatmap ?? [];
  const maxAbandoned = Math.max(...heatmap.map((h: any) => h?.abandoned ?? 0), 1);

  const gmvRecoveredK = ((k?.gmv_recovered ?? 0) / 1000).toFixed(1);
  const netMarginK = ((k?.net_incremental_margin ?? 0) / 1000).toFixed(1);

  return (
    <div className="space-y-6 anim-fade">
      {/* KPI Row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-5">
        <KPICard title="Carts Recovered"         value={k?.carts_recovered ?? 0}                            sub={`of ${k?.total_carts_analyzed ?? 0} analyzed`}  color="#10b981" icon={ShoppingCart} />
        <KPICard title="Recovery Rate"            value={`${k?.recovery_rate_pct ?? 0}%`}                    sub="cart abandonment rescue"                         color="#6366f1" icon={Percent} />
        <KPICard title="GMV Recovered"            value={`$${gmvRecoveredK}K`}                              sub="gross merchandise value"                        color="#f59e0b" icon={TrendingUp} />
        <KPICard title="Net Incremental Margin"   value={`$${netMarginK}K`}                                  sub={`${k?.roi_pct ?? 0}% ROI`}                       color="#22c55e" icon={DollarSign} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Top Intervention Actions */}
        <div className="rounded-2xl p-5" style={{ background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(51,65,85,0.5)' }}>
          <h3 className="text-sm font-bold text-white mb-4">Top Intervention Actions</h3>
          <div className="space-y-3">
            {actions.map((a) => {
              const meta = ACTION_LABEL[a.action] ?? { label: a.action, color: '#6366f1' };
              const maxCount = Math.max(...actions.map(x => x.count), 1);
              return (
                <div key={a.action}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: meta.color }} />
                      <span className="text-xs text-slate-300">{meta.label}</span>
                    </div>
                    <span className="text-xs font-bold text-slate-200 font-mono">{a.count}</span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${(a.count / maxCount) * 100}%`, background: meta.color }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-800/60 flex justify-between text-xs text-slate-500">
            <span>Discount Spend</span>
            <span className="font-mono text-amber-400">${k.discount_spend?.toFixed(2)}</span>
          </div>
        </div>

        {/* Live Intervention Feed */}
        <div className="xl:col-span-2 rounded-2xl p-5" style={{ background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(51,65,85,0.5)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white">Recent Interventions</h3>
            <span className="flex items-center gap-1.5 text-xs text-emerald-400">
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
              Live
            </span>
          </div>
          <div className="space-y-2">
            {feed.map((item: any, i: number) => {
              const meta = ACTION_LABEL[item.action] ?? { label: item.action, color: '#6366f1' };
              return (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800/40 transition"
                  style={{ border: '1px solid rgba(51,65,85,0.3)' }}>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: `${meta.color}18`, color: meta.color }}>
                    {ACTION_ICONS[item.action] ?? <ShoppingCart className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-200">{item.customer_name}</div>
                    <div className="text-[10px] text-slate-500">{meta.label} · Cart ${item.cart_value}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-emerald-400">+${item.margin_saved?.toFixed(2)}</div>
                    <div className="text-[10px] text-slate-600 font-mono">margin saved</div>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-600 shrink-0" />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Hourly Abandonment Heatmap */}
      <div className="rounded-2xl p-5" style={{ background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(51,65,85,0.5)' }}>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-4 w-4 text-indigo-400" />
          <h3 className="text-sm font-bold text-white">Hourly Abandonment vs Recovery</h3>
        </div>
        <div className="grid grid-cols-8 gap-2">
          {heatmap.map((h: any) => (
            <div key={h.hour} className="text-center">
              <div className="text-[9px] text-slate-500 font-mono mb-1.5">{h.hour}</div>
              <div className="relative h-20 bg-slate-900/60 rounded-lg overflow-hidden flex flex-col justify-end">
                <div className="w-full rounded-b-lg transition-all duration-700"
                  style={{ height: `${(h.abandoned / maxAbandoned) * 100}%`, background: 'rgba(244,63,94,0.4)' }} />
                <div className="absolute bottom-0 w-full rounded-b-lg transition-all duration-700"
                  style={{ height: `${(h.recovered / maxAbandoned) * 100}%`, background: 'rgba(16,185,129,0.6)' }} />
              </div>
              <div className="text-[9px] font-mono text-rose-400 mt-1">{h.abandoned}</div>
              <div className="text-[9px] font-mono text-emerald-400">{h.recovered}</div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-6 mt-3 justify-center">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ background: 'rgba(244,63,94,0.4)' }} />Abandoned
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ background: 'rgba(16,185,129,0.6)' }} />Recovered
          </div>
        </div>
      </div>
    </div>
  );
}
