import React from 'react';

const colors = { green: '#00E5A0', amber: '#F5A623', red: '#FF3B5C' };

export default function RiskDot({ label, status, detail }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-2 h-2 rounded-full" style={{ background: colors[status] }} />
      <div>
        <p className="text-xs text-[#E8ECF1]">{label}</p>
        {detail && <p className="text-[10px] text-[#7A8B9E]">{detail}</p>}
      </div>
    </div>
  );
}
