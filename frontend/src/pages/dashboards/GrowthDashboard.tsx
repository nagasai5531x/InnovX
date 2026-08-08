import React, { useEffect } from 'react';
import { useRoleDashboardStore } from '../../store/useRoleDashboardStore';
import { TrendingUp, DollarSign, Users, ArrowRight, BarChart3, Percent } from 'lucide-react';

const CHANNEL_COLORS: Record<string, string> = {
  IN_APP_MODAL: '#6366f1',
  WHATSAPP:     '#22c55e',
  EMAIL:        '#3b82f6',
  EXIT_POPUP:   '#f59e0b',
};

function KPICard({ title, value, sub, color, icon: Icon }: any) {
  return (
    <div className="rounded-2xl p-5 flex flex-col gap-2 relative overflow-hidden"
      style={{ background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(51,65,85,0.5)' }}>
      <div className="absolute top-0 right-0 w-28 h-28 rounded-full opacity-5"
        style={{ background: color, filter: 'blur(40px)', transform: 'translate(30%,-30%)' }} />
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
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

export function GrowthDashboard() {
  const { data, isLoading, fetch } = useRoleDashboardStore();

  useEffect(() => {
    fetch('Growth Manager', true);
  }, [fetch]);

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          <span className="text-sm text-slate-400">Loading growth dashboard…</span>
        </div>
      </div>
    );
  }

  const k = data.kpis;
  const funnel: any[] = data.funnel ?? [];
  const channelROI: any[] = data.channel_roi ?? [];
  const marginTrend: any[] = data.margin_trend ?? [];
  const segments: any[] = data.top_segments ?? [];
  const maxMargin = Math.max(...marginTrend.map((d: any) => d.margin), 1);

  return (
    <div className="space-y-6 anim-fade">
      {/* KPI Row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-5">
        <KPICard title="GMV Recovered"        value={`$${(k.total_gmv_recovered / 1000).toFixed(1)}K`}    sub="gross merchandise value"           color="#10b981" icon={DollarSign} />
        <KPICard title="Net Margin"            value={`$${(k.net_incremental_margin / 1000).toFixed(1)}K`} sub={`${k.margin_roi_pct}% ROI`}        color="#6366f1" icon={TrendingUp} />
        <KPICard title="Conversion Lift"       value={`+${k.conversion_lift_pct}%`}                       sub="vs baseline conversion rate"       color="#f59e0b" icon={Percent} />
        <KPICard title="Cannibalization Saved" value={k.cannibalization_prevented}                         sub="discounts blocked by AI critic"    color="#8b5cf6" icon={BarChart3} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Conversion Funnel */}
        <div className="rounded-2xl p-5" style={{ background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(51,65,85,0.5)' }}>
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Conversion Recovery Funnel</h3>
          </div>
          <div className="space-y-4">
            {funnel.map((stage: any, i: number) => {
              const colors = ['#6366f1', '#8b5cf6', '#10b981', '#22c55e'];
              return (
                <div key={stage.stage}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      {i < funnel.length - 1 && (
                        <ArrowRight className="h-3 w-3 text-slate-600" />
                      )}
                      <span className="text-xs text-slate-300">{stage.stage}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-mono text-slate-500">{stage.pct}%</span>
                      <span className="text-xs font-black text-white">{stage.count.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${stage.pct}%`, background: colors[i] }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/60 grid grid-cols-2 gap-3">
            <div>
              <div className="text-[10px] text-slate-500">Avg Recovery Value</div>
              <div className="text-sm font-black text-white">${k.avg_recovery_value}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500">Discount Spend</div>
              <div className="text-sm font-black text-amber-400">${k.total_discount_spend?.toFixed(2)}</div>
            </div>
          </div>
        </div>

        {/* Channel ROI */}
        <div className="rounded-2xl p-5" style={{ background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(51,65,85,0.5)' }}>
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 className="h-4 w-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Channel ROI Performance</h3>
          </div>
          <div className="space-y-4">
            {channelROI.map((ch: any) => {
              const color = CHANNEL_COLORS[ch.channel] ?? '#6366f1';
              const maxROI = Math.max(...channelROI.map((c: any) => c.roi_pct), 1);
              return (
                <div key={ch.channel}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                      <span className="text-xs text-slate-300 font-mono">{ch.channel.replace(/_/g, ' ')}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-slate-500">{ch.conversions}/{ch.interventions} conv</span>
                      <span className="text-xs font-black" style={{ color }}>{ch.roi_pct}% ROI</span>
                    </div>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${(ch.roi_pct / maxROI) * 100}%`, background: color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Margin Trend (7-day) */}
        <div className="rounded-2xl p-5" style={{ background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(51,65,85,0.5)' }}>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">7-Day Margin Trend</h3>
          </div>
          <div className="flex items-end gap-2 h-28">
            {marginTrend.map((d: any) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[9px] font-mono text-emerald-400">${d.margin?.toFixed(0)}</span>
                <div className="w-full rounded-t-sm transition-all duration-700"
                  style={{ height: `${Math.max((d.margin / maxMargin) * 100, 6)}%`, background: 'rgba(16,185,129,0.65)' }} />
                <span className="text-[8px] text-slate-600">{d.day?.slice(4)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Segments */}
        <div className="rounded-2xl p-5" style={{ background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(51,65,85,0.5)' }}>
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-4 w-4 text-violet-400" />
            <h3 className="text-sm font-bold text-white">Top Customer Segments</h3>
          </div>
          <div className="space-y-3">
            {segments.map((seg: any, i: number) => {
              const colors = ['#6366f1','#10b981','#f59e0b','#8b5cf6'];
              return (
                <div key={seg.segment} className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(51,65,85,0.3)' }}>
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: colors[i] }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-slate-200">{seg.segment.replace(/_/g, ' ')}</div>
                    <div className="text-[9px] text-slate-500">{seg.sessions} sessions</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-black text-white">{seg.recovery_rate}%</div>
                    <div className="text-[9px] text-slate-500">recovery</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-black" style={{ color: colors[i] }}>${seg.avg_margin}</div>
                    <div className="text-[9px] text-slate-500">avg margin</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
