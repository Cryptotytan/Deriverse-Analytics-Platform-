import React from 'react';

export default function MetricCard({ label, value, valueColor, sub, className = '' }) {
  return (
    <div className={`rounded-xl p-4 ${className}`} style={{ background: '#111820', border: '1px solid #1F2D40' }}>
      <p className="text-[10px] text-[#7A8B9E] uppercase tracking-wider mb-1">{label}</p>
      <p className={`font-mono-numbers text-lg font-bold ${valueColor || 'text-[#E8ECF1]'}`}>{value}</p>
      {sub && <p className="text-[11px] text-[#7A8B9E] mt-0.5 font-mono-numbers">{sub}</p>}
    </div>
  );
}
