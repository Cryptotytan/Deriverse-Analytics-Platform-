import React, { useState, useEffect, useMemo } from 'react';
import { useTradeStore } from '../components/deriverse/useTradeStore';
import { formatPnl, pnlColor, formatDuration } from '../components/deriverse/metrics';
import TradeForm from '../components/deriverse/TradeForm';
import { Search, ChevronUp, ChevronDown, Edit2, Trash2 } from 'lucide-react';

export default function History() {
  const { trades, deleteTrade, replaceTrade } = useTradeStore();
  const [showForm, setShowForm] = useState(false);
  const [editTrade, setEditTrade] = useState(null);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('entryTs');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(0);
  const perPage = 20;

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

const filteredSorted = useMemo(() => {
    let filtered = trades.filter(t =>
      t.symbol?.toLowerCase().includes(search.toLowerCase()) ||
      t.strategy?.toLowerCase().includes(search.toLowerCase()) ||
      t.emotion?.toLowerCase().includes(search.toLowerCase()) ||
      t.note?.toLowerCase().includes(search.toLowerCase())
    );
    filtered.sort((a, b) => {
      let aVal = a[sortKey];
      let bVal = b[sortKey];
      if (sortKey === 'entryTs' || sortKey === 'exitTs') {
        aVal = aVal ? new Date(aVal) : 0;
        bVal = bVal ? new Date(bVal) : 0;
      }
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return filtered;
  }, [trades, search, sortKey, sortDir]);

  const paged = filteredSorted.slice(page * perPage, (page + 1) * perPage);
  const totalPages = Math.ceil(filteredSorted.length / perPage);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const SortIcon = ({ col }) => {
    if (sortKey !== col) return null;
    return sortDir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

return (
    <>
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A8B9E]" size={18} />
          <input
            type="text"
            placeholder="Search trades..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-[#00C2FF]/30"
            style={{ background: '#111820', border: '1px solid #1F2D40', color: '#E8ECF1' }}
          />
        </div>

{/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto rounded-xl" style={{ background: '#111820', border: '1px solid #1F2D40' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid #1F2D40' }}>
                <th className="text-left p-3 text-[#7A8B9E] text-xs uppercase tracking-wider cursor-pointer hover:text-[#E8ECF1]" onClick={() => toggleSort('entryTs')}>
                  <div className="flex items-center gap-1">Entry <SortIcon col="entryTs" /></div>
                </th>
                <th className="text-left p-3 text-[#7A8B9E] text-xs uppercase tracking-wider cursor-pointer hover:text-[#E8ECF1]" onClick={() => toggleSort('symbol')}>
                  <div className="flex items-center gap-1">Symbol <SortIcon col="symbol" /></div>
                </th>
                <th className="text-left p-3 text-[#7A8B9E] text-xs uppercase tracking-wider cursor-pointer hover:text-[#E8ECF1]" onClick={() => toggleSort('side')}>
                  <div className="flex items-center gap-1">Side <SortIcon col="side" /></div>
                </th>
                <th className="text-right p-3 text-[#7A8B9E] text-xs uppercase tracking-wider cursor-pointer hover:text-[#E8ECF1]" onClick={() => toggleSort('size')}>
                  <div className="flex items-center gap-1 justify-end">Size <SortIcon col="size" /></div>
                </th>
                <th className="text-right p-3 text-[#7A8B9E] text-xs uppercase tracking-wider cursor-pointer hover:text-[#E8ECF1]" onClick={() => toggleSort('netPnl')}>
                  <div className="flex items-center gap-1 justify-end">Net PnL <SortIcon col="netPnl" /></div>
                </th>
                <th className="text-left p-3 text-[#7A8B9E] text-xs uppercase tracking-wider">Strategy</th>
                <th className="text-center p-3 text-[#7A8B9E] text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.map(t => {
                const dur = t.entryTs && t.exitTs ? new Date(t.exitTs) - new Date(t.entryTs) : null;
                return (
                  <tr key={t.id} style={{ borderBottom: '1px solid #1F2D40' }} className="hover:bg-[#1F2D40]/20">
                    <td className="p-3 text-[#7A8B9E] text-xs">
                      {t.entryTs ? new Date(t.entryTs).toLocaleString() : '—'}
                    </td>
                    <td className="p-3 font-heading font-bold text-[#E8ECF1]">{t.symbol}</td>
                    <td className="p-3">
                      <span className={`text-xs font-bold ${t.side === 'LONG' ? 'text-[#00E5A0]' : 'text-[#FF3B5C]'}`}>
                        {t.side}
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono-numbers text-[#E8ECF1]">${t.size?.toFixed(0) || '0'}</td>
                    <td className="p-3 text-right">
                      <span className={`font-mono-numbers font-bold ${pnlColor(t.netPnl)}`}>
                        {formatPnl(t.netPnl)}
                      </span>
                    </td>
                    <td className="p-3 text-[#7A8B9E] text-xs">{t.strategy || '—'}</td>
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleEdit(t)} className="p-1.5 rounded hover:bg-[#1F2D40] text-[#00C2FF]">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => deleteTrade(t.id)} className="p-1.5 rounded hover:bg-[#1F2D40] text-[#FF3B5C]">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

{/* Mobile Cards */}
        <div className="md:hidden space-y-3">
          {paged.map(t => (
            <div key={t.id} className="rounded-xl p-4" style={{ background: '#111820', border: '1px solid #1F2D40' }}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-heading font-bold text-sm text-[#E8ECF1]">{t.symbol}</p>
                  <p className={`text-xs font-bold ${t.side === 'LONG' ? 'text-[#00E5A0]' : 'text-[#FF3B5C]'}`}>{t.side}</p>
                </div>
                <p className={`font-mono-numbers font-bold text-sm ${pnlColor(t.netPnl)}`}>
                  {formatPnl(t.netPnl)}
                </p>
              </div>
              <div className="text-xs text-[#7A8B9E] space-y-1 mb-3">
                <p>Size: ${t.size?.toFixed(0) || '0'}</p>
                <p>Entry: {t.entryTs ? new Date(t.entryTs).toLocaleString() : '—'}</p>
                {t.strategy && <p>Strategy: {t.strategy}</p>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(t)} className="flex-1 py-2 rounded-lg text-xs font-bold bg-[#1F2D40] text-[#00C2FF] flex items-center justify-center gap-2">
                  <Edit2 size={14} />
                  Edit
                </button>
                <button onClick={() => deleteTrade(t.id)} className="flex-1 py-2 rounded-lg text-xs font-bold bg-[#1F2D40] text-[#FF3B5C] flex items-center justify-center gap-2">
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

                  {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#1F2D40] text-[#E8ECF1] disabled:opacity-30"
            >
              Previous
            </button>
            <span className="text-xs text-[#7A8B9E]">
              Page {page + 1} of {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page === totalPages - 1}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#1F2D40] text-[#E8ECF1] disabled:opacity-30"
            >
              Next
            </button>
          </div>
        )}
      </div>

      <TradeForm open={showForm} onClose={() => { setShowForm(false); setEditTrade(null); }} onSubmit={handleSubmit} editTrade={editTrade} />
    </>
  );
}
