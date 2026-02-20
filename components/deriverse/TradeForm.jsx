import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown } from 'lucide-react';
import { MARKETS, ORDER_TYPES, STRATEGIES, EMOTIONS } from './constants';

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function nowLocal() {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

export default function TradeForm({ open, onClose, onSubmit, editTrade }) {
  const defaults = {
    symbol: 'SOL-PERP', side: 'LONG', orderType: 'MARKET',
    size: '', entryPrice: '', exitPrice: '', leverage: '1', fee: '0',
    strategy: '', emotion: '', note: '', tags: '',
    entryTs: nowLocal(), exitTs: ''
  };

const [form, setForm] = useState(defaults);

  useEffect(() => {
    if (editTrade) {
      setForm({
        symbol: editTrade.symbol || 'SOL-PERP',
        side: editTrade.side || 'LONG',
        orderType: editTrade.orderType || 'MARKET',
        size: String(editTrade.size || ''),
        entryPrice: String(editTrade.entryPrice || ''),
        exitPrice: String(editTrade.exitPrice || ''),
        leverage: String(editTrade.leverage || '1'),
        fee: String(editTrade.fee || '0'),
        strategy: editTrade.strategy || '',
        emotion: editTrade.emotion || '',
        note: editTrade.note || '',
        tags: (editTrade.tags || []).join(', '),
        entryTs: editTrade.entryTs || nowLocal(),
        exitTs: editTrade.exitTs || ''
      });
    } else {
      setForm({ ...defaults, entryTs: nowLocal() });
    }
  }, [editTrade, open]);


const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const preview = useMemo(() => {
    const size = parseFloat(form.size) || 0;
    const entry = parseFloat(form.entryPrice) || 0;
    const exit = parseFloat(form.exitPrice) || 0;
    const fee = parseFloat(form.fee) || 0;
    const dir = form.side === 'LONG' ? 1 : -1;
    const gross = entry > 0 ? size * dir * (exit - entry) / entry : 0;
    const net = gross - fee;
    return { gross, fee, net };
  }, [form.size, form.entryPrice, form.exitPrice, form.fee, form.side]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const size = parseFloat(form.size) || 0;
    const entry = parseFloat(form.entryPrice) || 0;
    const exit = parseFloat(form.exitPrice) || 0;
    const fee = parseFloat(form.fee) || 0;
    const lev = parseFloat(form.leverage) || 1;
    const dir = form.side === 'LONG' ? 1 : -1;
    const gross = entry > 0 ? size * dir * (exit - entry) / entry : 0;
    const net = gross - fee;

    const trade = {
      id: editTrade?.id || genId(),
      createdAt: editTrade?.createdAt || new Date().toISOString(),
      symbol: form.symbol,
      side: form.side,
      orderType: form.orderType,
      size, entryPrice: entry, exitPrice: exit, leverage: lev,
      grossPnl: Math.round(gross * 100) / 100,
      fee: Math.round(fee * 100) / 100,
      netPnl: Math.round(net * 100) / 100,
      strategy: form.strategy,
      emotion: form.emotion,
      note: form.note,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      entryTs: form.entryTs || new Date().toISOString(),
      exitTs: form.exitTs || null
    };
    onSubmit(trade);
    onClose();
  };

const inputCls = "w-full px-3 py-2.5 rounded-lg font-mono-numbers text-sm outline-none transition-all focus:ring-2 focus:ring-[#00C2FF]/30";
  const inputStyle = { background: '#080B0F', border: '1px solid #1F2D40', color: '#E8ECF1' };
  const labelCls = "text-[10px] text-[#7A8B9E] uppercase tracking-wider font-medium mb-1.5 block";

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 max-h-[92vh] overflow-y-auto rounded-t-3xl"
            style={{ background: '#111820', border: '1px solid #1F2D40', borderBottom: 'none' }}
          >

            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-[#1F2D40]" />
            </div>

            <div className="px-5 pb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-heading text-lg font-600 text-[#E8ECF1]">
                  {editTrade ? 'Edit Trade' : 'Log Trade'}
                </h2>
                <button onClick={onClose} className="p-2 rounded-lg hover:bg-[#1F2D40] transition">
                  <X size={18} className="text-[#7A8B9E]" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Market + Side */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Market</label>
                    <select value={form.symbol} onChange={e => set('symbol', e.target.value)}
                      className={inputCls} style={inputStyle}>
                      {MARKETS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className={labelCls}>Side</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {['LONG', 'SHORT'].map(s => (
                        <button key={s} type="button"
                          onClick={() => set('side', s)}
                          className={`py-2.5 rounded-lg text-xs font-bold tracking-wide transition-all ${
                            form.side === s
                              ? s === 'LONG' ? 'bg-[#00E5A0]/20 text-[#00E5A0] ring-1 ring-[#00E5A0]/40' : 'bg-[#FF3B5C]/20 text-[#FF3B5C] ring-1 ring-[#FF3B5C]/40'
                              : 'bg-[#080B0F] text-[#7A8B9E] border border-[#1F2D40]'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Size + Leverage */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Position Size (USD)</label>
                    <input type="number" value={form.size} onChange={e => set('size', e.target.value)}
                      placeholder="1000" className={inputCls} style={inputStyle} step="any" />
                  </div>
                  <div>
                    <label className={labelCls}>Leverage</label>
                    <input type="number" value={form.leverage} onChange={e => set('leverage', e.target.value)}
                      placeholder="1" className={inputCls} style={inputStyle} step="any" min="1" />
                  </div>
                </div>

                {/* Entry + Exit Price */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Entry Price</label>
                    <input type="number" value={form.entryPrice} onChange={e => set('entryPrice', e.target.value)}
                      placeholder="0.00" className={inputCls} style={inputStyle} step="any" />
                  </div>
                  <div>
                    <label className={labelCls}>Exit Price</label>
                    <input type="number" value={form.exitPrice} onChange={e => set('exitPrice', e.target.value)}
                      placeholder="0.00" className={inputCls} style={inputStyle} step="any" />
                  </div>
                </div>

                {/* Fee + Order Type */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Fee (USD)</label>
                    <input type="number" value={form.fee} onChange={e => set('fee', e.target.value)}
                      placeholder="0.00" className={inputCls} style={inputStyle} step="any" />
                  </div>
                  <div>
                    <label className={labelCls}>Order Type</label>
                    <select value={form.orderType} onChange={e => set('orderType', e.target.value)}
                      className={inputCls} style={inputStyle}>
                      {ORDER_TYPES.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                </div>

                {/* Timestamps */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Entry Time</label>
                    <input type="datetime-local" value={form.entryTs} onChange={e => set('entryTs', e.target.value)}
                      className={inputCls} style={inputStyle} />
                  </div>
                  <div>
                    <label className={labelCls}>Exit Time</label>
                    <input type="datetime-local" value={form.exitTs} onChange={e => set('exitTs', e.target.value)}
                      className={inputCls} style={inputStyle} />
                  </div>
                </div>

                {/* Strategy + Emotion */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Strategy</label>
                    <select value={form.strategy} onChange={e => set('strategy', e.target.value)}
                      className={inputCls} style={inputStyle}>
                      <option value="">Select...</option>
                      {STRATEGIES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Emotion</label>
                    <select value={form.emotion} onChange={e => set('emotion', e.target.value)}
                      className={inputCls} style={inputStyle}>
                      <option value="">Select...</option>
                      {EMOTIONS.map(em => <option key={em} value={em}>{em}</option>)}
                    </select>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className={labelCls}>Tags (comma separated)</label>
                  <input type="text" value={form.tags} onChange={e => set('tags', e.target.value)}
                    placeholder="breakout, high-volume" className={inputCls} style={inputStyle} />
                </div>

                {/* Notes */}
                <div>
                  <label className={labelCls}>Journal Notes</label>
                  <textarea value={form.note} onChange={e => set('note', e.target.value)}
                    placeholder="What was your thesis? What did you learn?"
                    rows={3}
                    className={`${inputCls} resize-none`} style={inputStyle} />
                </div>

                {/* PnL Preview */}
                <div className="rounded-xl p-4" style={{ background: '#080B0F', border: '1px solid #1F2D40' }}>
                  <p className="text-[10px] text-[#7A8B9E] uppercase tracking-wider mb-3">PnL Preview</p>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <p className="text-[10px] text-[#7A8B9E]">Gross</p>
                      <p className={`font-mono-numbers text-sm font-bold ${preview.gross >= 0 ? 'text-[#00E5A0]' : 'text-[#FF3B5C]'}`}>
                        {preview.gross >= 0 ? '+' : ''}{preview.gross.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#7A8B9E]">Fee</p>
                      <p className="font-mono-numbers text-sm font-bold text-[#F5A623]">
                        -{preview.fee.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#7A8B9E]">Net</p>
                      <p className={`font-mono-numbers text-sm font-bold ${preview.net >= 0 ? 'text-[#00E5A0]' : 'text-[#FF3B5C]'}`}>
                        {preview.net >= 0 ? '+' : ''}{preview.net.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl font-heading font-600 text-sm tracking-wide transition-all hover:brightness-110 active:scale-[0.98]"
                  style={{ background: 'linear-gradient(135deg, #00C2FF, #00E5A0)', color: '#080B0F' }}
                >
                  {editTrade ? 'Update Trade' : 'Log Trade'}
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
            
