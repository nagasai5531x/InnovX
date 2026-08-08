import React, { useEffect } from 'react';
import { useRoleDashboardStore } from '../../store/useRoleDashboardStore';
import {
  Server, Wifi, WifiOff, AlertTriangle, CheckCircle,
  Activity, Zap, ShieldCheck, Radio
} from 'lucide-react';

const STATUS_COLOR: Record<string, string> = {
  ONLINE:   '#10b981',
  DEGRADED: '#f59e0b',
  OFFLINE:  '#f43f5e',
};

function LatencyBar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = Math.min((value / max) * 100, 100);
  const color = value < 20 ? '#10b981' : value < 35 ? '#f59e0b' : '#f43f5e';
  return (
    <div className="flex items-center gap-3">
      <span className="text-[10px] text-slate-400 w-12 shrink-0 font-mono">{label}</span>
      <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-[10px] font-bold text-slate-200 font-mono w-12 text-right">{value}ms</span>
    </div>
  );
}

export function OperationsDashboard() {
  const { data, isLoading, fetch } = useRoleDashboardStore();

  useEffect(() => {
    fetch('Operations Manager', true);
  }, [fetch]);

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          <span className="text-sm text-slate-400">Loading operations dashboard…</span>
        </div>
      </div>
    );
  }

  const health = data.system_health;
  const latency = data.latency_percentiles;
  const agents: any[] = data.agents ?? [];
  const throughput: any[] = data.throughput_trend ?? [];
  const channels: any[] = data.channel_health ?? [];
  const maxThroughput = Math.max(...throughput.map((t: any) => t.decisions_per_min), 1);

  return (
    <div className="space-y-6 anim-fade">
      {/* System Health Banner */}
      <div className="rounded-2xl p-5 flex flex-wrap gap-6"
        style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.25)' }}>
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
              <Server className="h-6 w-6 text-emerald-400" />
            </div>
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-900 animate-pulse" />
          </div>
          <div>
            <div className="text-base font-black text-emerald-400">{health.overall_status}</div>
            <div className="text-xs text-slate-400">{health.agents_online}/{health.agents_total} Agents Online</div>
          </div>
        </div>
        {[
          { label: 'Uptime',       value: `${health.uptime_pct}%`,               color: '#10b981' },
          { label: 'Decisions',    value: health.total_decisions_processed,       color: '#ffffff' },
          { label: 'Active Sessions', value: health.active_sessions,             color: '#6366f1' },
          { label: 'Policy Compliance', value: `${health.policy_compliance_pct}%`, color: '#10b981' },
          { label: 'Events/sec',   value: health.events_per_second,              color: '#f59e0b' },
        ].map(item => (
          <div key={item.label} className="flex flex-col gap-0.5">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">{item.label}</span>
            <span className="text-lg font-black" style={{ color: item.color }}>{item.value}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* All 10 Agents Panel */}
        <div className="rounded-2xl p-5" style={{ background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(51,65,85,0.5)' }}>
          <div className="flex items-center gap-2 mb-4">
            <Radio className="h-4 w-4 text-indigo-400 animate-pulse" />
            <h3 className="text-sm font-bold text-white">Agent Fleet Status</h3>
          </div>
          <div className="space-y-2">
            {agents.map((agent: any) => (
              <div key={agent.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-800/40 transition"
                style={{ border: '1px solid rgba(51,65,85,0.2)' }}>
                <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: `${STATUS_COLOR[agent.status]}18`, color: STATUS_COLOR[agent.status] }}>
                  <span className="text-[9px] font-black">{agent.id}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-semibold text-slate-300 truncate">{agent.name}</div>
                </div>
                <div className="text-[9px] font-mono text-slate-500 shrink-0">{agent.latency_ms}ms</div>
                <div className="flex items-center gap-1 shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: STATUS_COLOR[agent.status] }} />
                  <span className="text-[9px] font-bold" style={{ color: STATUS_COLOR[agent.status] }}>{agent.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          {/* Latency Percentiles */}
          <div className="rounded-2xl p-5" style={{ background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(51,65,85,0.5)' }}>
            <div className="flex items-center gap-2 mb-4">
              <Zap className="h-4 w-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Decision Latency</h3>
            </div>
            <div className="space-y-3">
              <LatencyBar label="p50" value={latency.p50_ms} max={latency.max_ms} />
              <LatencyBar label="p90" value={latency.p90_ms} max={latency.max_ms} />
              <LatencyBar label="p95" value={latency.p95_ms} max={latency.max_ms} />
              <LatencyBar label="p99" value={latency.p99_ms} max={latency.max_ms} />
              <LatencyBar label="max" value={latency.max_ms} max={latency.max_ms} />
            </div>
          </div>

          {/* Channel Health */}
          <div className="rounded-2xl p-5" style={{ background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(51,65,85,0.5)' }}>
            <div className="flex items-center gap-2 mb-4">
              <Wifi className="h-4 w-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Delivery Channel Health</h3>
            </div>
            <div className="space-y-3">
              {channels.map((ch: any) => (
                <div key={ch.channel} className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: STATUS_COLOR[ch.status] }} />
                  <span className="text-xs text-slate-300 flex-1 font-mono">{ch.channel}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full rounded-full"
                        style={{ width: `${ch.success_rate}%`, background: STATUS_COLOR[ch.status] }} />
                    </div>
                    <span className="text-[10px] font-bold font-mono"
                      style={{ color: STATUS_COLOR[ch.status] }}>{ch.success_rate}%</span>
                  </div>
                  {ch.status !== 'ONLINE' && <WifiOff className="h-3 w-3 text-amber-400" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Throughput Trend */}
      <div className="rounded-2xl p-5" style={{ background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(51,65,85,0.5)' }}>
        <div className="flex items-center gap-2 mb-4">
          <Activity className="h-4 w-4 text-indigo-400" />
          <h3 className="text-sm font-bold text-white">Decision Throughput (decisions/min)</h3>
        </div>
        <div className="grid grid-cols-8 gap-2 items-end h-24">
          {throughput.map((t: any) => (
            <div key={t.hour} className="flex flex-col items-center gap-1">
              <div className="w-full rounded-t-sm transition-all"
                style={{
                  height: `${Math.max((t.decisions_per_min / maxThroughput) * 100, 8)}%`,
                  background: t.errors > 0 ? 'rgba(244,63,94,0.7)' : 'rgba(99,102,241,0.7)',
                }} />
              <span className="text-[8px] text-slate-600 font-mono">{t.hour?.slice(0, 2)}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-6 mt-3 text-[10px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-sm" style={{ background: 'rgba(99,102,241,0.7)' }} />Normal
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-sm" style={{ background: 'rgba(244,63,94,0.7)' }} />Errors detected
          </div>
        </div>
      </div>
    </div>
  );
}
