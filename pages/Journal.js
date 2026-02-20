import React, { useState, useEffect } from 'react';
import { useTradeStore } from '../components/deriverse/useTradeStore';
import { computeMetrics, formatPnl, pnlColor, formatPercent } from '../components/deriverse/metrics';
import TradeForm from '../components/deriverse/TradeForm';
import TradeCard from '../components/deriverse/TradeCard';

export default function Journal() {
  const { trades, deleteTrade, replaceTrade } = useTradeStore();
  const metrics = computeMetrics(trades);
  const [showForm, setShowForm] = useState(false);
  const [editTrade, setEditTrade] = useState(null);
  const [sideFilter, setSideFilter] = useState('ALL');
  const [emotionFilter, setEmotionFilter] = useState('ALL');
  const [strategyFilter, setStrategyFilter] = useState('ALL');

  useEffect(() => {
    const handler = () => setShowForm(true);
    window.addEventListener('deriverse:openTradeForm', handler);
    return () => window.removeEventListener('deriverse:openTradeForm', handler);
  }, []);

  const handleEdit = (trade) => {
    setEditTrade(trade);
    setShowForm(true);
  };

  const handleSubmit = (trade) => {
    replaceTrade(trade);
    setEditTrade(null);
  };

  const filteredTrades = trades.filter(t => {
    if (sideFilter !== 'ALL' && t.side !== sideFilter) return false;
    if (emotionFilter !== 'ALL' && t.emotion !== emotionFilter) return false;
    if (strategyFilter !== 'ALL' && t.strategy !== strategyFilter) return false;
    return true;
  }).sort((a, b) => new Date(b.entryTs) - new Date(a.entryTs));

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Emotional Performance */}
        <div className="rounded-xl p-4" style={{ background: '#111820', border: '1px solid #1F2D40' }}>
          <p className="text-xs text-[#7A8B9E] uppercase tracking-wider mb-3">Emotional Performance</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(metrics.emotionMap).map(([emotion, stats]) => {
              const wr = stats.count > 0 ? (stats.wins / stats.count) * 100 : 0;
              return (
                <div key={emotion} className="p-3 rounded-lg" style={{ background: '#080B0F', border: '1px solid #1F2D40' }}>
                  <p className="text-xs text-[#E8ECF1] mb-1">{emotion}</p>
                  <p className={`font-mono-numbers text-sm font-bold ${pnlColor(stats.pnl)}`}>
                    {formatPnl(stats.pnl)}
                  </p>
                  <p className="text-[10px] text-[#7A8B9E]">
                    {formatPercent(wr)} WR • {stats.count} trades
                  </p>
                </div>
              );
            })}
          </div>
        </div>

{/* Strategy Performance */}
        <div className="rounded-xl p-4" style={{ background: '#111820', border: '1px solid #1F2D40' }}>
          <p className="text-xs text-[#7A8B9E] uppercase tracking-wider mb-3">Strategy Performance</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(metrics.strategyMap).map(([strategy, stats]) => {
              const wr = stats.count > 0 ? (stats.wins / stats.count) * 100 : 0;
              return (
                <div key={strategy} className="p-3 rounded-lg" style={{ background: '#080B0F', border: '1px solid #1F2D40' }}>
                  <p className="text-xs text-[#E8ECF1] mb-1">{strategy}</p>
                  <p className={`font-mono-numbers text-sm font-bold ${pnlColor(stats.pnl)}`}>
                    {formatPnl(stats.pnl)}
                  </p>
                  <p className="text-[10px] text-[#7A8B9E]">
                    {formatPercent(wr)} WR • {stats.count} trades
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {['ALL', 'LONG', 'SHORT'].map(s => (
            <button key={s} onClick={() => setSideFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                sideFilter === s ? 'bg-[#00C2FF] text-[#080B0F]' : 'bg-[#1F2D40] text-[#7A8B9E]'
              }`}>
              {s}
            </button>
          ))}
          <select value={emotionFilter} onChange={e => setEmotionFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-xs bg-[#1F2D40] text-[#E8ECF1] border-0 outline-none">
            <option value="ALL">All Emotions</option>
            {Object.keys(metrics.emotionMap).map(e => <option key={e} value={e}>{e}</option>)}
          </select>
          <select value={strategyFilter} onChange={e => setStrategyFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-xs bg-[#1F2D40] text-[#E8ECF1] border-0 outline-none">
            <option value="ALL">All Strategies</option>
            {Object.keys(metrics.strategyMap).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
              {/* Trade Cards */}
        <div className="space-y-3">
          {filteredTrades.map(trade => (
            <TradeCard
              key={trade.id}
              trade={trade}
              onEdit={handleEdit}
              onDelete={deleteTrade}
            />
          ))}
        </div>
      </div>

      <TradeForm
        open={showForm}
        onClose={() => { setShowForm(false); setEditTrade(null); }}
        onSubmit={handleSubmit}
        editTrade={editTrade}
      />
    </>
  );
            }
