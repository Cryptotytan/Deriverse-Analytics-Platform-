import React, { useState, useEffect } from 'react';
import { useTradeStore } from '../components/deriverse/useTradeStore';
import { computeMetrics, formatPnl, formatPercent, pnlColor } from '../components/deriverse/metrics';
import TradeForm from '../components/deriverse/TradeForm';
import MetricCard from '../components/deriverse/MetricCard';
import EquityCurve from '../components/deriverse/EquityCurve';
import DailyPnlChart from '../components/deriverse/DailyPnlChart';
import SymbolPerformance from '../components/deriverse/SymbolPerformance';
import RiskDot from '../components/deriverse/RiskDot';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function Home() {
  const { trades, replaceTrade } = useTradeStore();
  const metrics = computeMetrics(trades);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const handler = () => setShowForm(true);
    window.addEventListener('deriverse:openTradeForm', handler);
    return () => window.removeEventListener('deriverse:openTradeForm', handler);
  }, []);

  const handleSubmit = (trade) => {
    replaceTrade(trade);
  };

  if (trades.length === 0) {
    return (
      <>
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="font-heading text-3xl font-bold text-[#E8ECF1] mb-3">
            Welcome to <span className="text-[#00C2FF]">Deriverse</span>
          </h1>
          <p className="text-[#7A8B9E] mb-8">Your Solana trading journal & analytics dashboard</p>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 rounded-xl font-bold text-sm transition-all hover:brightness-110"
            style={{ background: 'linear-gradient(135deg, #00C2FF, #00E5A0)', color: '#080B0F' }}
          >
            Log Your First Trade
          </button>
        </div>
        <TradeForm open={showForm} onClose={() => setShowForm(false)} onSubmit={handleSubmit} />
      </>
    );
      }

      return (
    <>
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Summary Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard
            label="Total Net PnL"
            value={formatPnl(metrics.totalNet)}
            valueColor={pnlColor(metrics.totalNet)}
            sub={`${metrics.total} trades`}
          />
          <MetricCard
            label="Win Rate"
            value={formatPercent(metrics.winRate)}
            valueColor={metrics.winRate >= 50 ? 'text-[#00E5A0]' : 'text-[#FF3B5C]'}
            sub={`${metrics.wins}W / ${metrics.losses}L`}
          />
          <MetricCard
            label="Profit Factor"
            value={metrics.profitFactor === Infinity ? '∞' : metrics.profitFactor.toFixed(2)}
            valueColor={metrics.profitFactor >= 1.5 ? 'text-[#00E5A0]' : metrics.profitFactor >= 1.0 ? 'text-[#F5A623]' : 'text-[#FF3B5C]'}
          />
          <MetricCard
            label="Sharpe Ratio"
            value={metrics.sharpe.toFixed(2)}
            valueColor={metrics.sharpe >= 1 ? 'text-[#00E5A0]' : 'text-[#7A8B9E]'}
          />
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-xl p-4 h-64" style={{ background: '#111820', border: '1px solid #1F2D40' }}>
            <p className="text-xs text-[#7A8B9E] uppercase tracking-wider mb-3">Equity Curve</p>
            <EquityCurve data={metrics.cumPnlSeries} />
          </div>
          <div className="rounded-xl p-4 h-64" style={{ background: '#111820', border: '1px solid #1F2D40' }}>
            <p className="text-xs text-[#7A8B9E] uppercase tracking-wider mb-3">Daily PnL</p>
            <DailyPnlChart data={metrics.dailyPnlMap} />
          </div>
        </div>
{/* Performance Breakdown */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Symbol Performance */}
          <div className="rounded-xl p-4" style={{ background: '#111820', border: '1px solid #1F2D40' }}>
            <p className="text-xs text-[#7A8B9E] uppercase tracking-wider mb-3">Symbol Performance</p>
            <SymbolPerformance symbolMap={metrics.symbolMap} />
          </div>

          {/* Directional Bias + Risk */}
          <div className="space-y-4">
            <div className="rounded-xl p-4" style={{ background: '#111820', border: '1px solid #1F2D40' }}>
              <p className="text-xs text-[#7A8B9E] uppercase tracking-wider mb-3">Directional Bias</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3">
                  <TrendingUp className="text-[#00E5A0]" size={20} />
                  <div>
                    <p className="text-[10px] text-[#7A8B9E]">LONG</p>
                    <p className={`font-mono-numbers text-sm font-bold ${pnlColor(metrics.longPnl)}`}>
                      {formatPnl(metrics.longPnl)}
                    </p>
                    <p className="text-[10px] text-[#7A8B9E]">{metrics.longCount} trades</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <TrendingDown className="text-[#FF3B5C]" size={20} />
                  <div>
                    <p className="text-[10px] text-[#7A8B9E]">SHORT</p>
                    <p className={`font-mono-numbers text-sm font-bold ${pnlColor(metrics.shortPnl)}`}>
                      {formatPnl(metrics.shortPnl)}
                    </p>
                    <p className="text-[10px] text-[#7A8B9E]">{metrics.shortCount} trades</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl p-4" style={{ background: '#111820', border: '1px solid #1F2D40' }}>
              <p className="text-xs text-[#7A8B9E] uppercase tracking-wider mb-3">Risk Alerts</p>
              <div className="space-y-2">
                <RiskDot label="Fee Efficiency" status={metrics.riskAlerts.feeEfficiency} detail={`${metrics.feeDrag.toFixed(1)}% drag`} />
                <RiskDot label="Drawdown" status={metrics.riskAlerts.drawdownAlert} detail={`${metrics.maxDD.toFixed(1)}% max`} />
                <RiskDot label="Edge Strength" status={metrics.riskAlerts.edgeStrength} detail={`${metrics.profitFactor.toFixed(2)}x factor`} />
                <RiskDot label="Overtrading" status={metrics.riskAlerts.overtradingAlert} detail={`${metrics.overtradingDays} red days`} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <TradeForm open={showForm} onClose={() => setShowForm(false)} onSubmit={handleSubmit} />
    </>
  );
}
