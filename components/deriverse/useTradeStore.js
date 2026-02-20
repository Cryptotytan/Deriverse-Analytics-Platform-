import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'deriverse:trades';

function loadTrades() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

function persist(trades) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trades));
}

// Simple global state with localStorage
let listeners = new Set();
let currentTrades = loadTrades();

function notify() {
  listeners.forEach(fn => fn([...currentTrades]));
}

export function useTradeStore() {
  const [trades, setTrades] = useState(currentTrades);

  useEffect(() => {
    const handler = (t) => setTrades(t);
    listeners.add(handler);
    return () => listeners.delete(handler);
  }, []);

const addTrade = useCallback((trade) => {
    currentTrades = [...currentTrades, trade];
    persist(currentTrades);
    notify();
  }, []);

  const updateTrade = useCallback((id, updated) => {
    currentTrades = currentTrades.map(t => t.id === id ? { ...t, ...updated } : t);
    persist(currentTrades);
    notify();
  }, []);

  const deleteTrade = useCallback((id) => {
    currentTrades = currentTrades.filter(t => t.id !== id);
    persist(currentTrades);
    notify();
  }, []);

  const replaceTrade = useCallback((trade) => {
    const idx = currentTrades.findIndex(t => t.id === trade.id);
    if (idx >= 0) {
      currentTrades = [...currentTrades];
      currentTrades[idx] = trade;
    } else {
      currentTrades = [...currentTrades, trade];
    }
    persist(currentTrades);
    notify();
  }, []);

  return { trades, addTrade, updateTrade, deleteTrade, replaceTrade };
      }
