// Metrics engine — computes all trading analytics from trades array

export function computeMetrics(trades) {
  if (!trades || trades.length === 0) return emptyMetrics();

  const sorted = [...trades].sort((a, b) => new Date(a.entryTs) - new Date(b.entryTs));
  
  let totalGross = 0, totalFees = 0, totalNet = 0, totalVolume = 0;
  let wins = 0, losses = 0;
  let grossWins = 0, grossLosses = 0;
  let winPnls = [], lossPnls = [];
  let durations = [];
  let longPnl = 0, shortPnl = 0, longCount = 0, shortCount = 0;
  
  const symbolMap = {};
  const strategyMap = {};
  const emotionMap = {};
  const dailyPnlMap = {};
  const cumPnlSeries = [];
  const orderTypeMap = {};
  const leverageBuckets = { '1x': { pnl: 0, count: 0 }, '2-5x': { pnl: 0, count: 0 }, '6-10x': { pnl: 0, count: 0 }, '11x+': { pnl: 0, count: 0 } };

  let cumPnl = 0;

sorted.forEach((t) => {
    const net = t.netPnl || 0;
    const gross = t.grossPnl || 0;
    const fee = t.fee || 0;
    const size = t.size || 0;

    totalGross += gross;
    totalFees += fee;
    totalNet += net;
    totalVolume += size;
    cumPnl += net;

    cumPnlSeries.push({ date: t.entryTs, pnl: cumPnl, tradeId: t.id });

    if (net > 0) { wins++; grossWins += net; winPnls.push(net); }
    else if (net < 0) { losses++; grossLosses += Math.abs(net); lossPnls.push(net); }
    else { wins++; } // breakeven counted as win

    if (t.side === 'LONG') { longPnl += net; longCount++; }
    else { shortPnl += net; shortCount++; }

    // Duration
    if (t.entryTs && t.exitTs) {
      const dur = new Date(t.exitTs) - new Date(t.entryTs);
      if (dur > 0) durations.push(dur);
    }

               // Symbol map
    if (!symbolMap[t.symbol]) symbolMap[t.symbol] = { pnl: 0, wins: 0, losses: 0, count: 0, fees: 0, volume: 0 };
    symbolMap[t.symbol].pnl += net;
    symbolMap[t.symbol].fees += fee;
    symbolMap[t.symbol].volume += size;
    symbolMap[t.symbol].count++;
    if (net > 0) symbolMap[t.symbol].wins++;
    else if (net < 0) symbolMap[t.symbol].losses++;

    // Strategy map
    if (t.strategy) {
      if (!strategyMap[t.strategy]) strategyMap[t.strategy] = { pnl: 0, wins: 0, losses: 0, count: 0 };
      strategyMap[t.strategy].pnl += net;
      strategyMap[t.strategy].count++;
      if (net > 0) strategyMap[t.strategy].wins++;
      else if (net < 0) strategyMap[t.strategy].losses++;
    }

    // Emotion map
    if (t.emotion) {
      if (!emotionMap[t.emotion]) emotionMap[t.emotion] = { pnl: 0, wins: 0, losses: 0, count: 0 };
      emotionMap[t.emotion].pnl += net;
      emotionMap[t.emotion].count++;
      if (net > 0) emotionMap[t.emotion].wins++;
      else if (net < 0) emotionMap[t.emotion].losses++;
    }

    // Daily PnL
    const day = t.entryTs ? t.entryTs.slice(0, 10) : 'unknown';
    if (!dailyPnlMap[day]) dailyPnlMap[day] = { pnl: 0, count: 0 };
    dailyPnlMap[day].pnl += net;
    dailyPnlMap[day].count++;

      // Order type map
    if (t.orderType) {
      if (!orderTypeMap[t.orderType]) orderTypeMap[t.orderType] = { pnl: 0, wins: 0, losses: 0, count: 0, fees: 0 };
      orderTypeMap[t.orderType].pnl += net;
      orderTypeMap[t.orderType].fees += fee;
      orderTypeMap[t.orderType].count++;
      if (net > 0) orderTypeMap[t.orderType].wins++;
      else if (net < 0) orderTypeMap[t.orderType].losses++;
    }

    // Leverage buckets
    const lev = t.leverage || 1;
    let bucket;
    if (lev <= 1) bucket = '1x';
    else if (lev <= 5) bucket = '2-5x';
    else if (lev <= 10) bucket = '6-10x';
    else bucket = '11x+';
    leverageBuckets[bucket].pnl += net;
    leverageBuckets[bucket].count++;
  });

               const total = trades.length;
  const winRate = total > 0 ? (wins / total) * 100 : 0;
  const profitFactor = grossLosses > 0 ? grossWins / grossLosses : grossWins > 0 ? Infinity : 0;
  const avgWin = winPnls.length > 0 ? winPnls.reduce((a, b) => a + b, 0) / winPnls.length : 0;
  const avgLoss = lossPnls.length > 0 ? lossPnls.reduce((a, b) => a + b, 0) / lossPnls.length : 0;
  const avgDuration = durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;
  const feeDrag = totalGross !== 0 ? (totalFees / Math.abs(totalGross)) * 100 : 0;

  // Sharpe ratio (annualized daily)
  const dailyPnls = Object.values(dailyPnlMap).map(d => d.pnl);
  const meanDaily = dailyPnls.length > 0 ? dailyPnls.reduce((a, b) => a + b, 0) / dailyPnls.length : 0;
  const stdDaily = dailyPnls.length > 1 ? Math.sqrt(dailyPnls.reduce((sum, p) => sum + (p - meanDaily) ** 2, 0) / (dailyPnls.length - 1)) : 0;
  const sharpe = stdDaily > 0 ? (meanDaily / stdDaily) * Math.sqrt(252) : 0;

  // Max drawdown
  let peak = 0, maxDD = 0;
  cumPnlSeries.forEach(pt => {
    if (pt.pnl > peak) peak = pt.pnl;
    if (peak > 0) {
      const dd = ((peak - pt.pnl) / peak) * 100;
      if (dd > maxDD) maxDD = dd;
    }
  });

  // Overtrading detection
  const dailyCounts = Object.values(dailyPnlMap).map(d => d.count);
  const avgDailyTrades = dailyCounts.length > 0 ? dailyCounts.reduce((a, b) => a + b, 0) / dailyCounts.length : 0;
  const overtradingDays = dailyCounts.filter(c => c > avgDailyTrades * 2).length;

  // Risk alerts
  const feeEfficiency = feeDrag < 15 ? 'green' : feeDrag < 30 ? 'amber' : 'red';
  const drawdownAlert = maxDD < 10 ? 'green' : maxDD < 25 ? 'amber' : 'red';
  const overtradingAlert = overtradingDays === 0 ? 'green' : overtradingDays <= 2 ? 'amber' : 'red';
  const edgeStrength = profitFactor > 1.5 ? 'green' : profitFactor > 1.0 ? 'amber' : 'red';

  // Consistency (% of winning days)
  const winningDays = Object.values(dailyPnlMap).filter(d => d.pnl > 0).length;
  const totalDays = Object.keys(dailyPnlMap).length;
  const consistency = totalDays > 0 ? (winningDays / totalDays) * 100 : 0;

  return {
    totalNet, totalGross, totalFees, totalVolume,
    wins, losses, total,
    winRate, profitFactor, sharpe, maxDD,
    avgWin, avgLoss, avgDuration, feeDrag,
    longPnl, shortPnl, longCount, shortCount,
    symbolMap, strategyMap, emotionMap,
    dailyPnlMap, cumPnlSeries, orderTypeMap, leverageBuckets,
    riskAlerts: { feeEfficiency, drawdownAlert, overtradingAlert, edgeStrength },
    consistency, overtradingDays, avgDailyTrades
  };
}

function emptyMetrics() {
  return {
    totalNet: 0, totalGross: 0, totalFees: 0, totalVolume: 0,
    wins: 0, losses: 0, total: 0,
    winRate: 0, profitFactor: 0, sharpe: 0, maxDD: 0,
    avgWin: 0, avgLoss: 0, avgDuration: 0, feeDrag: 0,
    longPnl: 0, shortPnl: 0, longCount: 0, shortCount: 0,
    symbolMap: {}, strategyMap: {}, emotionMap: {},
    dailyPnlMap: {}, cumPnlSeries: [], orderTypeMap: {}, leverageBuckets: {},
    riskAlerts: { feeEfficiency: 'green', drawdownAlert: 'green', overtradingAlert: 'green', edgeStrength: 'green' },
    consistency: 0, overtradingDays: 0, avgDailyTrades: 0
  };
}

export function formatPnl(val) {
  if (val === undefined || val === null || isNaN(val)) return '$0.00';
  const prefix = val >= 0 ? '+' : '';
  return `${prefix}$${Math.abs(val).toFixed(2)}`;
}

export function formatPercent(val) {
  if (val === undefined || val === null || isNaN(val)) return '0.0%';
  return `${val.toFixed(1)}%`;
}

export function formatDuration(ms) {
  if (!ms || ms <= 0) return '—';
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ${mins % 60}m`;
  const days = Math.floor(hrs / 24);
  return `${days}d ${hrs % 24}h`;
}

export function pnlColor(val) {
  if (val > 0) return 'text-[#00E5A0]';
  if (val < 0) return 'text-[#FF3B5C]';
  return 'text-[#7A8B9E]';
}

export function pnlBg(val) {
  if (val > 0) return 'bg-[#00E5A0]';
  if (val < 0) return 'bg-[#FF3B5C]';
  return 'bg-[#7A8B9E]';
      }
