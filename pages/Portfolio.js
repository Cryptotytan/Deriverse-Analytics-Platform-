import React, { useState, useEffect } from 'react';
import { useTradeStore } from '../components/deriverse/useTradeStore';
import { computeMetrics, formatPnl, pnlColor, formatPercent } from '../components/deriverse/metrics';
import TradeForm from '../components/deriverse/TradeForm';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

export default function Portfolio() {
  const { trades, replaceTrade } = useTradeStore();
  const metrics = computeMetrics(trades);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const handler = () => setShowForm(true);
    window.addEventListener('deriverse:openTradeForm', handler);
    return () => window.removeEventListener('deriverse:openTradeForm', handler);
  }, []);

  // Capital efficiency metrics
  const pnlPerVolume = metrics.totalVolume > 0 ? (metrics.totalNet / metrics.totalVolume) * 1000 : 0;
  const grossFeeRatio = metrics.totalFees > 0 ? metrics.totalGross / metrics.totalFees : 0;
  const avgTradeSize = metrics.total > 0 ? metrics.totalVolume / metrics.total : 0;
  const avgFeePerTrade = metrics.total > 0 ? metrics.totalFees / metrics.total : 0;

  // Radar chart data
  const radarData = [
    { metric: 'Win Rate', value: metrics.winRate, max: 100 },
    { metric: 'Profit Factor', value: Math.min(metrics.profitFactor * 20, 100), max: 100 },
    { metric: 'Consistency', value: metrics.consistency, max: 100 },
    { metric: 'Fee Efficiency', value: Math.max(0, 100 - metrics.feeDrag * 2), max: 100 },
    { metric: 'Sharpe', value: Math.min(Math.max(metrics.sharpe, 0) * 50, 100), max: 100 }
  ];

  // Order type distribution
  const orderTypeData = Object.entries(metrics.orderTypeMap).map(([type, stats]) => ({
    name: type,
    pnl: stats.pnl,
    count: stats.count
  }));

  // Leverage distribution
  const leverageData = Object.entries(metrics.leverageBuckets)
    .filter(([_, stats]) => stats.count > 0)
    .map(([bucket, stats]) => ({
      name: bucket,
      pnl: stats.pnl,
      count: stats.count
    }));

  // Symbol exposure (top 5)
  const symbolExposure = Object.entries(metrics.symbolMap)
    .sort((a, b) => b[1].volume - a[1].volume)
    .slice(0, 5)
    .map(([symbol, stats]) => ({
      symbol,
      volume: stats.volume,
      pnl: stats.pnl
    }));

const COLORS = ['#00C2FF', '#00E5A0', '#F5A623', '#FF3B5C', '#7A8B9E'];

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Capital Efficiency */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="rounded-xl p-4" style={{ background: '#111820', border: '1px solid #1F2D40' }}>
            <p className="text-[10px] text-[#7A8B9E] uppercase tracking-wider mb-1">PnL per $1K Volume</p>
            <p className={`font-mono-numbers text-lg font-bold ${pnlColor(pnlPerVolume)}`}>
              {formatPnl(pnlPerVolume)}
            </p>
          </div>
          <div className="rounded-xl p-4" style={{ background: '#111820', border: '1px solid #1F2D40' }}>
            <p className="text-[10px] text-[#7A8B9E] uppercase tracking-wider mb-1">Gross/Fee Ratio</p>
            <p className="font-mono-numbers text-lg font-bold text-[#E8ECF1]">{grossFeeRatio.toFixed(2)}x</p>
          </div>
          <div className="rounded-xl p-4" style={{ background: '#111820', border: '1px solid #1F2D40' }}>
            <p className="text-[10px] text-[#7A8B9E] uppercase tracking-wider mb-1">Avg Trade Size</p>
            <p className="font-mono-numbers text-lg font-bold text-[#E8ECF1]">${avgTradeSize.toFixed(0)}</p>
          </div>
          <div className="rounded-xl p-4" style={{ background: '#111820', border: '1px solid #1F2D40' }}>
            <p className="text-[10px] text-[#7A8B9E] uppercase tracking-wider mb-1">Fee per Trade</p>
            <p className="font-mono-numbers text-lg font-bold text-[#F5A623]">${avgFeePerTrade.toFixed(2)}</p>
          </div>
        </div>

     {/* Symbol Exposure */}
        <div className="rounded-xl p-4" style={{ background: '#111820', border: '1px solid #1F2D40' }}>
          <p className="text-xs text-[#7A8B9E] uppercase tracking-wider mb-3">Symbol Exposure (by Volume)</p>
          <div className="space-y-2">
            {symbolExposure.map((item, idx) => {
              const pct = (item.volume / metrics.totalVolume) * 100;
              return (
                <div key={item.symbol}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#E8ECF1]">{item.symbol}</span>
                    <span className="text-[#7A8B9E]">${item.volume.toFixed(0)} ({pct.toFixed(1)}%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#080B0F]">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, background: COLORS[idx % COLORS.length] }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Performance Radar */}
        <div className="rounded-xl p-4 h-80" style={{ background: '#111820', border: '1px solid #1F2D40' }}>
          <p className="text-xs text-[#7A8B9E] uppercase tracking-wider mb-3">Performance Radar</p>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="#1F2D40" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: '#7A8B9E', fontSize: 11 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#7A8B9E', fontSize: 10 }} />
              <Radar dataKey="value" stroke="#00C2FF" fill="#00C2FF" fillOpacity={0.3} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

{/* Order Type & Leverage */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Order Type */}
          <div className="rounded-xl p-4" style={{ background: '#111820', border: '1px solid #1F2D40' }}>
            <p className="text-xs text-[#7A8B9E] uppercase tracking-wider mb-3">Order Type Breakdown</p>
            <div className="space-y-2">
              {orderTypeData.map((item) => {
                const wr = item.count > 0 ? (metrics.orderTypeMap[item.name].wins / item.count) * 100 : 0;
                return (
                  <div key={item.name} className="flex items-center justify-between p-3 rounded-lg" style={{ background: '#080B0F', border: '1px solid #1F2D40' }}>
                    <div>
                      <p className="text-sm text-[#E8ECF1]">{item.name}</p>
                      <p className="text-[10px] text-[#7A8B9E]">{item.count} trades • {formatPercent(wr)} WR</p>
                    </div>
                    <p className={`font-mono-numbers font-bold text-sm ${pnlColor(item.pnl)}`}>
                      {formatPnl(item.pnl)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Leverage */}
          <div className="rounded-xl p-4" style={{ background: '#111820', border: '1px solid #1F2D40' }}>
            <p className="text-xs text-[#7A8B9E] uppercase tracking-wider mb-3">Leverage Distribution</p>
            <div className="space-y-2">
              {leverageData.map((item) => (
                <div key={item.name} className="flex items-center justify-between p-3 rounded-lg" style={{ background: '#080B0F', border: '1px solid #1F2D40' }}>
                  <div>
                    <p className="text-sm text-[#E8ECF1]">{item.name}</p>
                    <p className="text-[10px] text-[#7A8B9E]">{item.count} trades</p>
                  </div>
                  <p className={`font-mono-numbers font-bold text-sm ${pnlColor(item.pnl)}`}>
                    {formatPnl(item.pnl)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
{/* Risk Summary */}
        <div className="rounded-xl p-4" style={{ background: '#111820', border: '1px solid #1F2D40' }}>
          <p className="text-xs text-[#7A8B9E] uppercase tracking-wider mb-3">Risk Summary</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-[10px] text-[#7A8B9E] mb-1">Max Drawdown</p>
              <p className={`font-mono-numbers text-lg font-bold ${metrics.maxDD > 25 ? 'text-[#FF3B5C]' : metrics.maxDD > 10 ? 'text-[#F5A623]' : 'text-[#00E5A0]'}`}>
                {formatPercent(metrics.maxDD)}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-[#7A8B9E] mb-1">Fee Drag</p>
              <p className="font-mono-numbers text-lg font-bold text-[#F5A623]">
                {formatPercent(metrics.feeDrag)}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-[#7A8B9E] mb-1">Consistency</p>
              <p className={`font-mono-numbers text-lg font-bold ${metrics.consistency >= 60 ? 'text-[#00E5A0]' : 'text-[#7A8B9E]'}`}>
                {formatPercent(metrics.consistency)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <TradeForm open={showForm} onClose={() => setShowForm(false)} onSubmit={replaceTrade} />
    </>
  );
}
