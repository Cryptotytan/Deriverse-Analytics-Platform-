import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function EquityCurve({ data }) {
  const color = data && data.length > 0 && data[data.length - 1].pnl >= 0 ? '#00E5A0' : '#FF3B5C';

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="pnlGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="date"
          stroke="#7A8B9E"
          tick={{ fontSize: 10, fill: '#7A8B9E' }}
          tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        />
        <YAxis
          stroke="#7A8B9E"
          tick={{ fontSize: 10, fill: '#7A8B9E' }}
          tickFormatter={(val) => `$${val.toFixed(0)}`}
        />
        <Tooltip
          contentStyle={{ background: '#111820', border: '1px solid #1F2D40', borderRadius: 8 }}
          labelStyle={{ color: '#7A8B9E', fontSize: 11 }}
          itemStyle={{ color: '#E8ECF1', fontSize: 12, fontFamily: 'JetBrains Mono' }}
          formatter={(val) => [`$${val.toFixed(2)}`, 'PnL']}
          labelFormatter={(val) => new Date(val).toLocaleDateString()}
        />
        <Area
          type="monotone"
          dataKey="pnl"
          stroke={color}
          strokeWidth={2}
          fill="url(#pnlGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
