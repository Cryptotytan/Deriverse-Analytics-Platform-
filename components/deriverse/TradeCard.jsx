import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Edit2, Trash2 } from 'lucide-react';
import { formatPnl, pnlColor, formatDuration } from './metrics';

export default function TradeCard({ trade, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const net = trade.netPnl || 0;
  const dur = trade.entryTs && trade.exitTs ? new Date(trade.exitTs) - new Date(trade.entryTs) : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl overflow-hidden"
      style={{ background: '#111820', border: '1px solid #1F2D40' }}
    >

      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#1F2D40]/30 transition"
      >
        <div className="flex items-center gap-3">
          <div>
            <p className="font-heading font-bold text-sm text-[#E8ECF1]">{trade.symbol}</p>
            <p className={`text-xs font-bold ${trade.side === 'LONG' ? 'text-[#00E5A0]' : 'text-[#FF3B5C]'}`}>
              {trade.side}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className={`font-mono-numbers font-bold text-sm ${pnlColor(net)}`}>
              {formatPnl(net)}
            </p>
            <p className="text-[10px] text-[#7A8B9E]">
              {trade.entryTs ? new Date(trade.entryTs).toLocaleDateString() : '—'}
            </p>
          </div>
          <ChevronDown
            size={16}
            className={`text-[#7A8B9E] transition-transform ${expanded ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="border-t border-[#1F2D40] px-4 py-3 space-y-3"
        >
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
            <div>
              <p className="text-[#7A8B9E]">Size</p>
              <p className="font-mono-numbers text-[#E8ECF1]">${trade.size?.toFixed(2) || '0.00'}</p>
            </div>
            <div>
              <p className="text-[#7A8B9E]">Fee</p>
              <p className="font-mono-numbers text-[#F5A623]">${trade.fee?.toFixed(2) || '0.00'}</p>
            </div>
            <div>
              <p className="text-[#7A8B9E]">Entry</p>
              <p className="font-mono-numbers text-[#E8ECF1]">${trade.entryPrice?.toFixed(4) || '0.00'}</p>
            </div>
            <div>
              <p className="text-[#7A8B9E]">Exit</p>
              <p className="font-mono-numbers text-[#E8ECF1]">${trade.exitPrice?.toFixed(4) || '0.00'}</p>
            </div>
            <div>
              <p className="text-[#7A8B9E]">Leverage</p>
              <p className="font-mono-numbers text-[#E8ECF1]">{trade.leverage || 1}x</p>
            </div>
            <div>
              <p className="text-[#7A8B9E]">Duration</p>
              <p className="font-mono-numbers text-[#E8ECF1]">{formatDuration(dur)}</p>
            </div>
            <div>
              <p className="text-[#7A8B9E]">Gross PnL</p>
              <p className={`font-mono-numbers ${pnlColor(trade.grossPnl)}`}>{formatPnl(trade.grossPnl)}</p>
            </div>
            <div>
              <p className="text-[#7A8B9E]">Order Type</p>
              <p className="text-[#E8ECF1]">{trade.orderType || 'MARKET'}</p>
            </div>
          </div>

          {trade.note && (
            <div className="pt-2 border-t border-[#1F2D40]">
              <p className="text-[10px] text-[#7A8B9E] mb-1">Notes</p>
              <p className="text-xs text-[#E8ECF1] leading-relaxed">{trade.note}</p>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(trade); }}
              className="flex-1 py-2 rounded-lg text-xs font-bold bg-[#1F2D40] text-[#00C2FF] hover:bg-[#2A3D55] transition flex items-center justify-center gap-2"
            >
              <Edit2 size={14} />
              Edit
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(trade.id); }}
              className="flex-1 py-2 rounded-lg text-xs font-bold bg-[#1F2D40] text-[#FF3B5C] hover:bg-[#2A3D55] transition flex items-center justify-center gap-2"
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
