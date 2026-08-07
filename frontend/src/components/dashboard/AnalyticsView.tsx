import React from 'react';
import { useDashboardStore } from '../../store/useDashboardStore';
import {
  RadialBarChart, RadialBar, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area,
} from 'recharts';

// Analytics Charts with premium styling
const AREA_DATA = [
  { h: '00', sessions: 420, recovered: 120, margin: 3200 },
  { h: '03', sessions: 210, recovered:  62, margin: 1600 },
  { h: '06', sessions: 380, recovered: 105, margin: 2800 },
  { h: '09', sessions: 890, recovered: 278, margin: 7400 },
  { h: '12', sessions: 1420, recovered: 489, margin: 13200 },
  { h: '15', sessions: 1100, recovered: 380, margin: 10100 },
  { h: '18', sessions: 1380, recovered: 510, margin: 14200 },
  { h: '21', sessions: 960, recovered: 320, margin: 8600 },
];

const ACTION_DATA = [
  { action: 'Retry Payment',    count: 48, color: '#6366f1' },
  { action: 'Free Shipping',    count: 32, color: '#10b981' },
  { action: 'Small Coupon',     count: 22, color: '#f59e0b' },
  { action: 'Exit Intent',      count: 18, color: '#8b5cf6' },
  { action: 'WhatsApp',         count: 12, color: '#22d3ee' },
  { action: 'Email',            count: 10, color: '#a3e635' },
  { action: 'COD',              count:  8, color: '#fb923c' },
  { action: 'Do Nothing',       count: 38, color: '#475569' },
];

const RADIAL_DATA = [
  { name: 'Policy Pass Rate', value: 98.5, fill: '#10b981' },
  { name: 'Critic Approval',  value: 85.8, fill: '#6366f1' },
  { name: 'Margin Guardrail', value: 100,  fill: '#8b5cf6' },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="p-3 rounded-xl text-xs" style={{ background: 'rgba(4,7,15,0.95)', border: '1px solid rgba(51,65,85,0.6)', backdropFilter: 'blur(12px)' }}>
      <div className="font-semibold text-slate-200 mb-2">{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full shrink-0" style={{ background: p.stroke || p.fill || p.color }} />
          <span className="text-slate-400">{p.name}:</span>
          <span className="font-bold text-white">{typeof p.value === 'number' && p.value > 100 ? `$${p.value.toLocaleString()}` : p.value}</span>
        </div>
      ))}
    </div>
  );
};

export const AnalyticsView: React.FC = () => {
  const { decisions } = useDashboardStore();

  const totalRecoveredMargin = decisions.reduce((a, d) => a + d.expected_incremental_margin, 0);
  const criticBlockRate = ((decisions.filter(d => d.critic_verdict === 'REJECTED').length / Math.max(decisions.length, 1)) * 100).toFixed(1);

  return (
    <div className="space-y-6 anim-fade">
      {/* Section: Session Volume Over Time */}
      <div className="glass rounded-2xl border border-slate-800/50 p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-bold text-white">Session Volume & Recovery Performance</h3>
            <p className="text-xs text-slate-500 mt-0.5">24-hour rolling window · Hourly aggregation</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-slate-400"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: '#6366f1' }} /> Sessions</span>
            <span className="flex items-center gap-1.5 text-slate-400"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: '#10b981' }} /> Recovered</span>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={AREA_DATA} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gradSessions" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradRecovered" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(51,65,85,0.3)" />
            <XAxis dataKey="h" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="sessions" stroke="#6366f1" strokeWidth={2} fill="url(#gradSessions)" name="Sessions" />
            <Area type="monotone" dataKey="recovered" stroke="#10b981" strokeWidth={2} fill="url(#gradRecovered)" name="Recovered" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Action Distribution */}
        <div className="glass rounded-2xl border border-slate-800/50 p-6">
          <h3 className="text-sm font-bold text-white mb-4">Action Distribution (Today)</h3>
          <div className="space-y-2.5">
            {ACTION_DATA.map((a) => (
              <div key={a.action}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">{a.action}</span>
                  <span className="text-slate-400 font-mono">{a.count}</span>
                </div>
                <div className="h-1.5 bg-slate-800/80 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${(a.count / 48) * 100}%`, background: a.color, boxShadow: `0 0 8px ${a.color}60` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* KPI Dials */}
        <div className="glass rounded-2xl border border-slate-800/50 p-6">
          <h3 className="text-sm font-bold text-white mb-4">AI Decision Quality Metrics</h3>
          <div className="space-y-4">
            {[
              { label: 'Policy Pass Rate', val: 98.5, color: '#10b981', desc: 'Margin guardrail compliance' },
              { label: 'Critic Approval Rate', val: 85.8, color: '#6366f1', desc: 'Confirmed by Self-Critic' },
              { label: 'Zero-Cannibalisation Blocks', val: parseFloat(criticBlockRate), color: '#f59e0b', desc: `${criticBlockRate}% of offers prevented` },
              { label: 'Sub-30ms Decision Rate', val: 94.2, color: '#8b5cf6', desc: 'End-to-end pipeline latency' },
            ].map(k => (
              <div key={k.label} className="p-3 rounded-xl" style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(51,65,85,0.3)' }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-slate-300">{k.label}</span>
                  <span className="text-sm font-black" style={{ color: k.color }}>{k.val.toFixed(1)}%</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-1000"
                    style={{ width: `${k.val}%`, background: `linear-gradient(90deg, ${k.color}, ${k.color}90)`, boxShadow: `0 0 10px ${k.color}50` }} />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">{k.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Business Impact Summary */}
      <div className="glass rounded-2xl border border-slate-800/50 p-6">
        <h3 className="text-sm font-bold text-white mb-4">Hourly Net Incremental Margin Impact ($)</h3>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={AREA_DATA} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(51,65,85,0.3)" />
            <XAxis dataKey="h" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="margin" name="Net Margin" fill="#6366f1" radius={[4,4,0,0]}
              style={{ filter: 'drop-shadow(0 0 6px rgba(99,102,241,0.4))' }} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
