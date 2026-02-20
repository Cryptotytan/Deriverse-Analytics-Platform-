import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function DailyPnlChart({ data }) {
  const chartData = Object.entries(data).map(([date, { pnl }]) => ({
    date,
    pnl: Math.round(pnl * 100) / 100
  })).sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <XAxis
          dataKey="date"
          stroke="#7A8B9E"
          tick={{ fontSize: 10, fill: '#7A8B9E' }}
          tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        />
        <YAxis
          stroke="#7A8B9E"
          tick={{ fontSize: 10, fill: '#7A8B9E' }}
          tickFormatter={(val) => `$${val}`}
        />
        <Tooltip
          contentStyle={{ background: '#111820', border: '1px solid #1F2D40', borderRadius: 8 }}
          labelStyle={{ color: '#7A8B9E', fontSize: 11 }}
          itemStyle={{ color: '#E8ECF1', fontSize: 12, fontFamily: 'JetBrains Mono' }}
          formatter={(val) => [`$${val.toFixed(2)}`, 'Daily PnL']}
          labelFormatter={(val) => new Date(val).toLocaleDateString()}
        />
        <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
          {chartData.map((entry, idx) => (
            <Cell key={idx} fill={entry.pnl >= 0 ? '#00E5A0' : '#FF3B5C'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
