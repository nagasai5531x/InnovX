import React from 'react';
import { useDashboardStore } from '../../store/useDashboardStore';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Activity, BarChart2, Layers } from 'lucide-react';

export const DiagnosisBreakdown: React.FC = () => {
  const { decisions, selectedDecision } = useDashboardStore();

  // Aggregate Diagnosis Distribution
  const diagnosisCounts: Record<string, number> = {};
  decisions.forEach(d => {
    const key = d.primary_diagnosis.replace(/_/g, ' ');
    diagnosisCounts[key] = (diagnosisCounts[key] || 0) + 1;
  });

  const pieData = Object.keys(diagnosisCounts).map(name => ({
    name,
    value: diagnosisCounts[name]
  }));

  const COLORS = ['#6366f1', '#f43f5e', '#eab308', '#10b981', '#a855f7'];

  // SHAP Feature Data for Selected Decision
  const shapData = selectedDecision
    ? Object.keys(selectedDecision.shap_features).map(key => ({
        feature: key.replace(/_/g, ' '),
        impact: Number((selectedDecision.shap_features[key] * 100).toFixed(1))
      }))
    : [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* Chart 1: Root Cause Diagnosis Breakdown */}
      <div className="glass-panel rounded-2xl border border-slate-800 p-5 flex flex-col h-[280px]">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <PieChart className="h-4 w-4 text-indigo-400" />
            Abandonment Diagnosis Distribution
          </h3>
          <span className="text-xs text-slate-400">{decisions.length} Total Sessions</span>
        </div>

        <div className="flex-1 w-full h-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                itemStyle={{ color: '#f8fafc' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: SHAP Feature Attribution for Active Decision */}
      <div className="glass-panel rounded-2xl border border-slate-800 p-5 flex flex-col h-[280px]">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-emerald-400" />
            SHAP Risk Attribution Signals
          </h3>
          <span className="text-xs text-slate-400">LightGBM Latent Signals</span>
        </div>

        <div className="flex-1 w-full h-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={shapData} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <YAxis dataKey="feature" type="category" tick={{ fill: '#cbd5e1', fontSize: 10 }} width={120} />
              <Tooltip
                contentStyle={{ background: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                itemStyle={{ color: '#f8fafc' }}
              />
              <Bar dataKey="impact" fill="#6366f1" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
