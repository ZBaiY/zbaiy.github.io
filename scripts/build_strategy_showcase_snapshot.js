const fs = require('fs');
const path = require('path');

const WORKSPACE_ROOT = path.resolve(__dirname, '..', '..');
const SITE_ROOT = path.resolve(__dirname, '..');
const RUN_ID = 'RSI-ADX-GATEWAY-FRACTIONAL20260314T120457Z';
const RUN_ROOT = path.join(WORKSPACE_ROOT, 'SoionLab', 'artifacts', 'runs', RUN_ID);
const OUTPUT_PATH = path.join(SITE_ROOT, 'public', 'data', 'strategies', 'rsi-adx-gateway', 'showcase_snapshot_v1.json');
const EVIDENCE_PUBLIC_ROOT = path.join(SITE_ROOT, 'public', 'data', 'strategies', 'rsi-adx-gateway', 'evidence');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function readJsonLines(filePath) {
  return fs.readFileSync(filePath, 'utf8')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

function copyEvidenceAsset(sourcePath, fileName) {
  const outputPath = path.join(EVIDENCE_PUBLIC_ROOT, fileName);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.copyFileSync(sourcePath, outputPath);
  return `/data/strategies/rsi-adx-gateway/evidence/${fileName}`;
}

function toIso(tsMs) {
  return new Date(tsMs).toISOString();
}

function mean(values) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function median(values) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

function sampleStd(values) {
  if (values.length <= 1) return 0;
  const avg = mean(values);
  const variance = values.reduce((sum, value) => sum + ((value - avg) ** 2), 0) / (values.length - 1);
  return Math.sqrt(Math.max(variance, 0));
}

function sampleCovariance(xs, ys) {
  if (xs.length <= 1 || ys.length <= 1 || xs.length !== ys.length) return 0;
  const meanX = mean(xs);
  const meanY = mean(ys);
  return xs.reduce((sum, value, index) => sum + ((value - meanX) * (ys[index] - meanY)), 0) / (xs.length - 1);
}

function skewness(values) {
  if (values.length < 3) return 0;
  const avg = mean(values);
  const std = sampleStd(values);
  if (!std) return 0;
  return mean(values.map((value) => ((value - avg) / std) ** 3));
}

function kurtosis(values) {
  if (values.length < 4) return 0;
  const avg = mean(values);
  const std = sampleStd(values);
  if (!std) return 0;
  return mean(values.map((value) => ((value - avg) / std) ** 4));
}

function getNearestClose(closeByTs, tsMs) {
  if (closeByTs.has(tsMs)) return closeByTs.get(tsMs);
  return null;
}

function buildDailyEquity(equityCurve) {
  const byDay = new Map();
  equityCurve.forEach(([tsMs, equity]) => {
    const day = new Date(tsMs).toISOString().slice(0, 10);
    byDay.set(day, { day, tsMs, equity });
  });
  return [...byDay.values()].sort((a, b) => a.tsMs - b.tsMs);
}

function buildDailyPriceSeries(closeByTs) {
  const byDay = new Map();
  [...closeByTs.entries()]
    .sort((a, b) => a[0] - b[0])
    .forEach(([tsMs, price]) => {
      const day = new Date(tsMs).toISOString().slice(0, 10);
      byDay.set(day, { day, tsMs, price });
    });
  return [...byDay.values()].sort((a, b) => a.tsMs - b.tsMs);
}

function buildDailyReturns(series, valueKey, outputKey) {
  const result = [];
  for (let index = 1; index < series.length; index += 1) {
    const prev = series[index - 1];
    const curr = series[index];
    const prevValue = Number(prev[valueKey]);
    const currValue = Number(curr[valueKey]);
    if (!(prevValue > 0 && currValue > 0)) continue;
    result.push({
      day: curr.day,
      ts: toIso(curr.tsMs),
      ts_ms: curr.tsMs,
      [outputKey]: (currValue / prevValue) - 1,
    });
  }
  return result;
}

function alignDailyReturns(strategyReturns, btcReturns) {
  const btcByDay = new Map(btcReturns.map((point) => [point.day, point.btc_return]));
  return strategyReturns
    .filter((point) => btcByDay.has(point.day))
    .map((point) => ({
      day: point.day,
      ts: point.ts,
      ts_ms: point.ts_ms,
      strategy_return: point.strategy_return,
      btc_return: btcByDay.get(point.day),
    }));
}

function buildYearlyReturns(dailyEquity, startTsMs, endTsMs) {
  const groups = new Map();

  dailyEquity.forEach((point) => {
    const year = new Date(point.tsMs).getUTCFullYear();
    if (!groups.has(year)) groups.set(year, []);
    groups.get(year).push(point);
  });

  return [...groups.entries()].map(([year, points]) => {
    const first = points[0];
    const last = points[points.length - 1];
    const returnPct = ((last.equity / first.equity) - 1) * 100;
    const yearStart = Date.UTC(year, 0, 1);
    const yearEnd = Date.UTC(year, 11, 31, 23, 59, 59, 999);
    return {
      year,
      label: (first.tsMs > startTsMs || last.tsMs < endTsMs || first.tsMs > yearStart || last.tsMs < yearEnd) ? `${year}*` : `${year}`,
      return_pct: returnPct,
      start_ts_ms: first.tsMs,
      end_ts_ms: last.tsMs,
      ts_ms: last.tsMs,
      is_partial: first.tsMs > yearStart || last.tsMs < yearEnd,
    };
  });
}

function buildRollingSharpe(dailyReturns, windowDays = 90) {
  const result = [];
  for (let index = windowDays - 1; index < dailyReturns.length; index += 1) {
    const windowSlice = dailyReturns.slice(index - windowDays + 1, index + 1);
    const values = windowSlice.map((point) => point.strategy_return);
    const std = sampleStd(values);
    const sharpe = std > 0 ? (mean(values) / std) * Math.sqrt(365) : 0;
    result.push({
      ts: dailyReturns[index].ts,
      ts_ms: dailyReturns[index].ts_ms,
      rolling_sharpe: sharpe,
    });
  }
  return result;
}

function buildRollingBeta(alignedReturns, windowDays = 90) {
  const result = [];
  for (let index = windowDays - 1; index < alignedReturns.length; index += 1) {
    const windowSlice = alignedReturns.slice(index - windowDays + 1, index + 1);
    const strategyValues = windowSlice.map((point) => point.strategy_return);
    const btcValues = windowSlice.map((point) => point.btc_return);
    const btcVariance = sampleStd(btcValues) ** 2;
    const beta = btcVariance > 0 ? sampleCovariance(strategyValues, btcValues) / btcVariance : 0;
    result.push({
      ts: alignedReturns[index].ts,
      ts_ms: alignedReturns[index].ts_ms,
      beta,
    });
  }
  return result;
}

function buildRollingVolatility(dailyReturns, windowDays = 90) {
  const result = [];
  for (let index = windowDays - 1; index < dailyReturns.length; index += 1) {
    const windowSlice = dailyReturns.slice(index - windowDays + 1, index + 1);
    const values = windowSlice.map((point) => point.strategy_return);
    result.push({
      ts: dailyReturns[index].ts,
      ts_ms: dailyReturns[index].ts_ms,
      annualized_volatility: sampleStd(values) * Math.sqrt(365),
    });
  }
  return result;
}

function buildMonthlyPnl(dailyEquity) {
  const groups = new Map();
  dailyEquity.forEach((point) => {
    const month = point.day.slice(0, 7);
    if (!groups.has(month)) groups.set(month, []);
    groups.get(month).push(point);
  });

  return [...groups.entries()].map(([month, points]) => {
    const first = points[0];
    const last = points[points.length - 1];
    return {
      month,
      label: month,
      ts_ms: last.tsMs,
      pnl: last.equity - first.equity,
      return_pct: ((last.equity / first.equity) - 1) * 100,
    };
  });
}

function buildTradeReturnHistogram(trades, binCount = 50) {
  const values = trades
    .map((trade) => Number(trade.return_pct))
    .filter((value) => Number.isFinite(value));

  if (!values.length) {
    return {
      series: [],
      stats: [],
      referenceLines: [],
    };
  }

  let minValue = Math.min(...values);
  let maxValue = Math.max(...values);
  if (minValue === maxValue) {
    minValue -= 1;
    maxValue += 1;
  }

  const binWidth = (maxValue - minValue) / binCount;
  const bins = Array.from({ length: binCount }, (_, index) => ({
    index,
    bin_start: minValue + index * binWidth,
    bin_end: minValue + (index + 1) * binWidth,
    count: 0,
  }));

  values.forEach((value) => {
    const rawIndex = Math.floor((value - minValue) / binWidth);
    const index = Math.min(Math.max(rawIndex, 0), binCount - 1);
    bins[index].count += 1;
  });

  const avg = mean(values);
  const med = median(values);

  return {
    series: bins.map((bin) => ({
      ...bin,
      label: `${bin.bin_start.toFixed(2)}%`,
      bin_center: (bin.bin_start + bin.bin_end) / 2,
    })),
    stats: [
      { label: 'Mean', value: avg },
      { label: 'Median', value: med },
      { label: 'Skewness', value: skewness(values) },
      { label: 'Kurtosis', value: kurtosis(values) },
    ],
    referenceLines: [
      { axis: 'x', value: avg, label: 'Mean', color: '#7dd3fc' },
      { axis: 'x', value: med, label: 'Median', color: '#f59e0b' },
    ],
  };
}

function buildExposureRatioSeries(report) {
  const exposureCurve = report.exposure_curve || [];
  const equityCurve = report.equity_curve || [];
  return exposureCurve.map(([tsMs, exposure], index) => {
    const equity = Number(equityCurve[index]?.[1] || 0);
    return {
      ts: toIso(tsMs),
      ts_ms: Number(tsMs),
      exposure_ratio: equity > 0 ? Math.abs(Number(exposure)) / equity : 0,
    };
  });
}

function main() {
  const viewsRoot = path.join(RUN_ROOT, 'views');
  const reportRoot = path.join(RUN_ROOT, 'report');
  const logsRoot = path.join(RUN_ROOT, 'logs');

  const backtestCard = readJson(path.join(viewsRoot, 'backtest_card.json'));
  const performanceSummary = readJson(path.join(viewsRoot, 'performance_summary.json'));
  const equityChart = readJson(path.join(viewsRoot, 'equity_chart.json'));
  const drawdownChart = readJson(path.join(viewsRoot, 'drawdown_chart.json'));
  const report = readJson(path.join(reportRoot, 'report.json'));
  const summary = readJson(path.join(reportRoot, 'summary.json'));
  const traceLines = readJsonLines(path.join(logsRoot, 'trace.jsonl'));
  const backtestCardPublicPath = copyEvidenceAsset(path.join(viewsRoot, 'backtest_card.json'), 'backtest_card.json');
  const performanceSummaryPublicPath = copyEvidenceAsset(path.join(viewsRoot, 'performance_summary.json'), 'performance_summary.json');
  const reportSummaryPublicPath = copyEvidenceAsset(path.join(reportRoot, 'summary.json'), 'report_summary.json');
  const traceLogPublicPath = copyEvidenceAsset(path.join(logsRoot, 'trace.jsonl'), 'trace.jsonl');
  const researchNotesPublicPath = copyEvidenceAsset(
    path.join(
      WORKSPACE_ROOT,
      'SoionLab',
      'docs',
      'strategies',
      'rsi_adx_gateway_flush',
      'rsi_adx_gateway_flush_research_report.md'
    ),
    'rsi_adx_gateway_flush_research_report.md'
  );
  const legacyNotesPublicPath = copyEvidenceAsset(
    path.join(
      WORKSPACE_ROOT,
      'SoionLab',
      'docs',
      'strategies',
      'dynamical_rsi_adxgateway',
      'rsi_adx_gateway_robustness_report.md'
    ),
    'rsi_adx_gateway_robustness_report.md'
  );

  const steps = traceLines.filter((entry) => entry.event === 'engine.step.trace');
  const closeByTs = new Map(
    steps.map((step) => [
      Number(step.ts_ms || 0),
      Number((((step.market_snapshots || {}).ohlcv || {}).BTCUSDT || {}).numeric?.close || 0),
    ])
  );

  const equitySeries = equityChart.series.map((point) => ({
    ts: point.ts,
    ts_ms: point.ts_ms,
    equity: point.total_equity,
  }));
  const drawdownSeries = drawdownChart.series.map((point) => ({
    ts: point.ts,
    ts_ms: point.ts_ms,
    drawdown_pct: point.drawdown_pct,
  }));
  const btcPriceSeries = equityChart.series
    .map((point) => {
      const price = getNearestClose(closeByTs, point.ts_ms);
      return price === null ? null : {
        ts: point.ts,
        ts_ms: point.ts_ms,
        price,
      };
    })
    .filter(Boolean);
  const firstEquity = equitySeries[0]?.equity || 1;
  const firstBtc = btcPriceSeries[0]?.price || 1;
  const equityVsBtcSeries = equitySeries
    .filter((point) => closeByTs.has(point.ts_ms))
    .map((point) => ({
      ts: point.ts,
      ts_ms: point.ts_ms,
      normalized_strategy: point.equity / firstEquity,
      normalized_btc: closeByTs.get(point.ts_ms) / firstBtc,
    }));

  const dailyEquity = buildDailyEquity(report.equity_curve || []);
  const dailyBtc = buildDailyPriceSeries(closeByTs);
  const strategyDailyReturns = buildDailyReturns(dailyEquity, 'equity', 'strategy_return');
  const btcDailyReturns = buildDailyReturns(dailyBtc, 'price', 'btc_return');
  const alignedDailyReturns = alignDailyReturns(strategyDailyReturns, btcDailyReturns);
  const yearlyReturns = buildYearlyReturns(
    dailyEquity,
    backtestCard.time_range.start_ms,
    backtestCard.time_range.end_ms
  );
  const rollingSharpe = buildRollingSharpe(strategyDailyReturns, 90);
  const rollingBeta = buildRollingBeta(alignedDailyReturns, 90);
  const rollingVolatility = buildRollingVolatility(strategyDailyReturns, 90);
  const monthlyPnl = buildMonthlyPnl(dailyEquity);

  const trades = report.trade_round_trips || [];
  const tradePnlSeries = trades.map((trade, index) => ({
    ts: trade.exit_time,
    ts_ms: trade.exit_time_ms,
    trade_index: index + 1,
    pnl: trade.net_pnl,
    return_pct: trade.return_pct,
  }));
  const tradeReturnDistribution = buildTradeReturnHistogram(trades, 50);

  const benchmarkPairs = report.equity_curve
    .slice(1)
    .map((point, index) => {
      const [prevTs, prevEquity] = report.equity_curve[index];
      const [tsMs, equity] = point;
      const prevClose = closeByTs.get(prevTs);
      const close = closeByTs.get(tsMs);
      if (!(prevEquity > 0 && equity > 0 && prevClose > 0 && close > 0)) return null;
      return {
        strategyReturn: (equity / prevEquity) - 1,
        btcReturn: (close / prevClose) - 1,
      };
    })
    .filter(Boolean);
  const strategyReturns = benchmarkPairs.map((pair) => pair.strategyReturn);
  const btcReturns = benchmarkPairs.map((pair) => pair.btcReturn);
  const covariance = sampleCovariance(strategyReturns, btcReturns);
  const btcVariance = sampleStd(btcReturns) ** 2;
  const returnCorrelationToBtc = covariance && btcVariance
    ? covariance / (sampleStd(strategyReturns) * sampleStd(btcReturns))
    : 0;
  const strategyBetaToBtc = btcVariance ? covariance / btcVariance : 0;

  const exposureRatioSeries = buildExposureRatioSeries(report);
  const avgExposure = mean(exposureRatioSeries.map((point) => point.exposure_ratio));
  const activeExposure = exposureRatioSeries.filter((point) => point.exposure_ratio > 0);
  const avgHoldingSteps = mean(trades.map((trade) => trade.holding_steps));

  const horizonDays = Number(backtestCard.time_range.duration_days || 0);
  const tradeCount = Number(performanceSummary.metrics.trade_count || 0);

  const snapshot = {
    schema: 'showcase_snapshot_v1',
    generated_at: new Date().toISOString(),
    strategy: {
      slug: 'rsi-adx-gateway',
      name: 'Dynamic RSI Range + ADX Gateway',
      description: 'BTCUSDT dynamic-band RSI strategy with ADX gating and a bearish-DMI-confirmed protective lower-band flush while already long.',
      symbol: performanceSummary.symbol || 'BTCUSDT',
      market: 'Binance spot',
      timeframe: performanceSummary.interval || '15m',
      mode_label: 'BACKTEST SNAPSHOT',
      quality_label: backtestCard.quality.verdict === 'CLEAN' ? 'Qualified' : backtestCard.quality.verdict,
      period_start: backtestCard.time_range.start,
      period_end: backtestCard.time_range.end,
    },
    horizon: {
      days: horizonDays,
      label: `${horizonDays} days`,
    },
    diagnostics: {
      strategy_beta_to_btc: strategyBetaToBtc,
      return_correlation_to_btc: returnCorrelationToBtc,
      time_in_market_ratio: activeExposure.length / Math.max(exposureRatioSeries.length, 1),
      mean_leverage_when_active: activeExposure.length
        ? mean(activeExposure.map((point) => point.exposure_ratio))
        : 0,
      avg_holding_steps: avgHoldingSteps,
      avg_holding_hours: avgHoldingSteps * 0.25,
      trade_frequency_per_day: horizonDays ? tradeCount / horizonDays : 0,
      mean_trade_return_pct: tradeReturnDistribution.stats[0]?.value || 0,
      median_trade_return_pct: tradeReturnDistribution.stats[1]?.value || 0,
      trade_return_skewness: tradeReturnDistribution.stats[2]?.value || 0,
      trade_return_kurtosis: tradeReturnDistribution.stats[3]?.value || 0,
      average_exposure_ratio: avgExposure,
    },
    metrics: {
      total_return_pct: performanceSummary.metrics.total_return_pct,
      annualized_return_pct: performanceSummary.metrics.annualized_return_pct,
      sharpe: performanceSummary.metrics.sharpe_ratio,
      max_drawdown_pct: performanceSummary.metrics.max_drawdown_pct,
      trade_count: tradeCount,
      trades_per_year: horizonDays ? tradeCount / (horizonDays / 365.25) : null,
      avg_trades_per_month: horizonDays ? tradeCount / (horizonDays / 30.4375) : null,
    },
    chart: {
      primary_key: 'equity',
    },
    charts: {
      equity: {
        label: 'Equity',
        title: 'Strategy Equity',
        description: 'Continuous gateway-run equity curve over the displayed backtest window.',
        chart_type: 'line',
        source: 'direct_continuous_backtest',
        series: equitySeries,
      },
      drawdown: {
        label: 'Drawdown',
        title: 'Underwater Curve',
        description: 'Peak-to-trough drawdown from the same continuous gateway run.',
        chart_type: 'area',
        source: 'direct_continuous_backtest',
        series: drawdownSeries,
      },
      rolling_beta: {
        label: 'Rolling Beta',
        title: 'Rolling Beta to BTC (90d)',
        description: '90-day rolling beta of daily strategy returns relative to daily BTC returns.',
        chart_type: 'line',
        source: 'derived_from_daily_strategy_and_btc_returns',
        reference_lines: [
          { axis: 'y', value: 0, label: 'Beta = 0', color: 'rgba(148, 163, 184, 0.6)' },
        ],
        series: rollingBeta,
      },
      rolling_volatility: {
        label: 'Rolling Vol',
        title: 'Rolling Volatility (90d)',
        description: '90-day rolling annualized volatility computed from daily strategy returns.',
        chart_type: 'line',
        source: 'derived_from_daily_strategy_returns',
        series: rollingVolatility,
      },
      btc_price: {
        label: 'BTC Price',
        title: 'BTC Underlying Price',
        description: 'Underlying BTCUSDT price path aligned to the same continuous backtest window.',
        chart_type: 'line',
        source: 'derived_from_trace_ohlcv',
        series: btcPriceSeries,
      },
      equity_vs_btc: {
        label: 'Equity vs BTC',
        title: 'Rebased Equity vs BTC',
        description: 'Strategy equity and BTC price rebased to the same starting value. This view highlights whether the system adds value beyond passive BTC exposure rather than simply tracking the market.',
        chart_type: 'multi_line',
        source: 'derived_from_continuous_equity_and_btc',
        lines: [
          { key: 'normalized_strategy', label: 'Strategy', color: '#7dd3fc' },
          { key: 'normalized_btc', label: 'BTC', color: '#f59e0b' },
        ],
        series: equityVsBtcSeries,
      },
      yearly_returns: {
        label: 'Yearly Returns',
        title: 'Calendar-Year Returns',
        description: 'Calendar-year return breakdown for the displayed span. Asterisk labels indicate partial-year coverage.',
        chart_type: 'bar',
        source: 'derived_from_continuous_equity',
        series: yearlyReturns,
      },
      rolling_sharpe: {
        label: 'Rolling Sharpe',
        title: 'Rolling Sharpe',
        description: '90-day rolling Sharpe computed from daily equity changes over the displayed span.',
        chart_type: 'line',
        source: 'derived_from_daily_strategy_returns',
        series: rollingSharpe,
      },
      trade_pnl: {
        label: 'Trade PnL',
        title: 'Realized Trade PnL',
        description: 'Chronological realized PnL per closed trade from the same continuous gateway run.',
        chart_type: 'bar',
        source: 'derived_from_trade_round_trips',
        series: tradePnlSeries,
      },
      trade_return_distribution: {
        label: 'Trade Distribution',
        title: 'Trade Return Distribution',
        description: 'Histogram of trade-level returns with mean and median markers.',
        chart_type: 'histogram',
        source: 'derived_from_trade_round_trips',
        reference_lines: tradeReturnDistribution.referenceLines,
        stats: tradeReturnDistribution.stats,
        series: tradeReturnDistribution.series,
      },
      monthly_pnl: {
        label: 'Monthly PnL',
        title: 'Monthly PnL',
        description: 'Monthly equity change over the displayed backtest horizon.',
        chart_type: 'bar',
        source: 'derived_from_daily_equity',
        series: monthlyPnl,
      },
      exposure: {
        label: 'Exposure',
        title: 'Strategy Exposure Over Time',
        description: 'Absolute position size divided by capital, with the average exposure shown as a guide.',
        chart_type: 'line',
        source: 'derived_from_backtest_exposure_curve',
        reference_lines: [
          { axis: 'y', value: avgExposure, label: 'Avg Exposure', color: 'rgba(125, 211, 252, 0.5)' },
        ],
        series: exposureRatioSeries,
      },
    },
    evidence: {
      latest_artifact_timestamp: backtestCard.meta.report_generated_at,
      freshness_label: 'Static research snapshot',
      latest_run_label: RUN_ID,
      supporting_artifacts: [
        {
          label: 'Backtest card',
          path: backtestCardPublicPath,
          kind: 'artifact_json',
        },
        {
          label: 'Performance summary',
          path: performanceSummaryPublicPath,
          kind: 'artifact_json',
        },
        {
          label: 'Report summary',
          path: reportSummaryPublicPath,
          kind: 'artifact_json',
        },
        {
          label: 'Trace log',
          path: traceLogPublicPath,
          kind: 'artifact_jsonl',
        },
        {
          label: 'Robustness report',
          path: researchNotesPublicPath,
          kind: 'report_markdown',
        },
        {
          label: 'Legacy strategy note',
          path: legacyNotesPublicPath,
          kind: 'report_markdown',
        },
      ],
      notes: [
        'Charts on this page use a direct continuous gateway backtest run, not a stitched showcase aggregate.',
        'Simulated execution only. No live runtime or API dependency.',
      ],
    },
    selection: {
      selected_run_id: RUN_ID,
      selected_horizon_days: horizonDays,
      selected_artifact_root: `SoionLab/artifacts/runs/${RUN_ID}`,
      selection_kind: 'direct_continuous_backtest_run',
    },
    provenance: {
      backtest_run_id: RUN_ID,
      backtest_run_path: `SoionLab/artifacts/runs/${RUN_ID}`,
      source_contracts: [
        'backtest_card_v1',
        'performance_summary_v1',
        'equity_chart_v1',
        'drawdown_chart_v1',
        'report_v1',
        'trace_v2',
      ],
    },
    credibility: {
      yearly_returns: yearlyReturns,
      rolling_quality: rollingSharpe,
      report_summary: summary,
      research_docs: [
        'SoionLab/docs/strategies/rsi_adx_gateway_flush/rsi_adx_gateway_flush_research_report.md',
        'SoionLab/docs/strategies/dynamical_rsi_adxgateway/rsi_adx_gateway_robustness_report.md',
      ],
    },
  };

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');
  process.stdout.write(`Wrote ${path.relative(WORKSPACE_ROOT, OUTPUT_PATH)} from ${RUN_ID}\n`);
}

main();
