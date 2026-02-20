import React from 'react';
import { formatPnl, pnlColor, formatPercent } from './metrics';

export default function SymbolPerformance({ symbolMap }) {
  const sorted = Object.entries(symbolMap)
    .sort((a, b) => b[1].pnl - a[1].pnl)
    .slice(0, 6);

  return (
    <div className="space-y-2">
      {sorted.map(([symbol, stats]) => {
        const wr = stats.count > 0 ? (stats.wins / stats.count) * 100 : 0;
        return (
          <div key={symbol} className="flex items-center justify-between p-3 rounded-lg" style={{ background: '#080B0F', border: '1px solid #1F2D40' }}>
            <div>
              <p className="font-heading font-bold text-sm text-[#E8ECF1]">{symbol}</p>
              <p className="text-[10px] text-[#7A8B9E]">{stats.count} trades</p>
            </div>
            <div className="text-right">
              <p className={`font-mono-numbers font-bold text-sm ${pnlColor(stats.pnl)}`}>
                {formatPnl(stats.pnl)}
              </p>
              <p className={`text-[10px] font-mono-numbers ${wr >= 50 ? 'text-[#00E5A0]' : 'text-[#FF3B5C]'}`}>
                {formatPercent(wr)} WR
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
