const STORAGE_PREFIX = 'deriverse:';

export function loadUserTrades(username) {
  const key = `${STORAGE_PREFIX}${username}:trades`;
  const raw = localStorage.getItem(key);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveUserTrades(username, trades) {
  const key = `${STORAGE_PREFIX}${username}:trades`;
  localStorage.setItem(key, JSON.stringify(trades));
}

export function addUserTrade(username, trade) {
  const trades = loadUserTrades(username);
  trades.push(trade);
  saveUserTrades(username, trades);
  return trades;
}

export function updateUserTrade(username, tradeId, updatedTrade) {
  const trades = loadUserTrades(username);
  const idx = trades.findIndex(t => t.id === tradeId);
  if (idx >= 0) {
    trades[idx] = { ...trades[idx], ...updatedTrade };
    saveUserTrades(username, trades);
  }
  return trades;
}

export function deleteUserTrade(username, tradeId) {
  const trades = loadUserTrades(username);
  const filtered = trades.filter(t => t.id !== tradeId);
  saveUserTrades(username, filtered);
  return filtered;
}

export function getStoredUsername() {
  return localStorage.getItem(`${STORAGE_PREFIX}username`) || null;
}

export function setStoredUsername(username) {
  localStorage.setItem(`${STORAGE_PREFIX}username`, username);
}

export function clearStoredUsername() {
  localStorage.removeItem(`${STORAGE_PREFIX}username`);
}
