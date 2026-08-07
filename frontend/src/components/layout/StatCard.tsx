import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  accentColor: 'indigo' | 'emerald' | 'rose' | 'amber' | 'violet';
  subtitle?: string;
  sparkData?: number[];
}

const colorMap = {
  indigo:  { border: 'rgba(99,102,241,0.25)',  bg: 'rgba(99,102,241,0.08)',  text: '#818cf8', glow: 'rgba(99,102,241,0.3)',  iconBg: 'rgba(99,102,241,0.15)' },
  emerald: { border: 'rgba(16,185,129,0.25)',  bg: 'rgba(16,185,129,0.08)',  text: '#34d399', glow: 'rgba(16,185,129,0.25)', iconBg: 'rgba(16,185,129,0.15)' },
  rose:    { border: 'rgba(244,63,94,0.25)',   bg: 'rgba(244,63,94,0.08)',   text: '#fb7185', glow: 'rgba(244,63,94,0.25)',  iconBg: 'rgba(244,63,94,0.15)'  },
  amber:   { border: 'rgba(245,158,11,0.25)',  bg: 'rgba(245,158,11,0.08)',  text: '#fbbf24', glow: 'rgba(245,158,11,0.2)',  iconBg: 'rgba(245,158,11,0.15)' },
  violet:  { border: 'rgba(139,92,246,0.25)',  bg: 'rgba(139,92,246,0.08)',  text: '#a78bfa', glow: 'rgba(139,92,246,0.3)',  iconBg: 'rgba(139,92,246,0.15)' },
};

export const StatCard: React.FC<StatCardProps> = ({
  title, value, change, changeType = 'positive', icon: Icon, accentColor, subtitle, sparkData = []
}) => {
  const c = colorMap[accentColor];

  const TrendIcon = changeType === 'positive' ? TrendingUp : changeType === 'negative' ? TrendingDown : Minus;
  const trendColor = changeType === 'positive' ? '#34d399' : changeType === 'negative' ? '#fb7185' : '#94a3b8';

  // Mini sparkline
  const max = Math.max(...sparkData, 1);
  const min = Math.min(...sparkData, 0);
  const range = max - min || 1;
  const points = sparkData.map((v, i) => {
    const x = (i / (sparkData.length - 1)) * 100;
    const y = 100 - ((v - min) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div
      className="relative p-6 rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] cursor-default group anim-slide-up"
      style={{
        background: `linear-gradient(135deg, ${c.bg} 0%, rgba(4,7,15,0.6) 100%)`,
        border: `1px solid ${c.border}`,
        boxShadow: `0 0 40px -15px ${c.glow}`,
      }}
    >
      {/* Hover glow overlay */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none"
        style={{ background: `radial-gradient(ellipse at top right, ${c.bg}, transparent 70%)` }}
      />

      <div className="relative flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{title}</span>
          <div className="mt-2 text-3xl font-black text-white tracking-tight" style={{ textShadow: `0 0 30px ${c.glow}` }}>
            {value}
          </div>
          {subtitle && (
            <p className="mt-1.5 text-xs text-slate-500">{subtitle}</p>
          )}
          {change && (
            <div className="mt-3 flex items-center gap-1.5">
              <TrendIcon className="h-3.5 w-3.5" style={{ color: trendColor }} />
              <span className="text-xs font-semibold" style={{ color: trendColor }}>{change}</span>
            </div>
          )}
        </div>

        <div
          className="p-3 rounded-xl shrink-0"
          style={{ background: c.iconBg, border: `1px solid ${c.border}` }}
        >
          <Icon className="h-6 w-6" style={{ color: c.text }} />
        </div>
      </div>

      {/* Sparkline */}
      {sparkData.length > 2 && (
        <div className="mt-4 h-10">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full opacity-40 group-hover:opacity-70 transition-opacity">
            <defs>
              <linearGradient id={`grad-${accentColor}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={c.text} stopOpacity="0.4" />
                <stop offset="100%" stopColor={c.text} stopOpacity="0" />
              </linearGradient>
            </defs>
            <polyline
              points={points}
              fill="none"
              stroke={c.text}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}
    </div>
  );
};
