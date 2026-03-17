const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const OUTPUT_PATH = path.resolve(__dirname, '..', 'public', 'data', 'live', 'live_deployment_v1.json');
const EVIDENCE_ROOT = path.resolve(__dirname, '..', 'public', 'data', 'live', 'evidence');
const STRATEGY_LABEL = 'Dynamic RSI + ADX';
const PINNED_RUN_ID = '20260313T161132Z';
const RSI_VARIANCE_FACTOR = 1.8;

function readJsonLines(filePath) {
  return fs
    .readFileSync(filePath, 'utf8')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

function toIso(tsMs) {
  return typeof tsMs === 'number' ? new Date(tsMs).toISOString() : null;
}

function copyEvidenceAsset(runId, sourcePath, fileName) {
  const outputPath = path.join(EVIDENCE_ROOT, runId, fileName);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.copyFileSync(sourcePath, outputPath);
  return `/data/live/evidence/${runId}/${fileName}`;
}

function findLatestRunDir(rootDir) {
  const candidates = fs
    .readdirSync(rootDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && /^\d{8}T\d{6}Z$/.test(entry.name))
    .map((entry) => entry.name)
    .sort();

  for (let index = candidates.length - 1; index >= 0; index -= 1) {
    const runDir = path.join(rootDir, candidates[index], 'logs');
    const tracePath = path.join(runDir, 'trace.jsonl');
    const defaultPath = path.join(runDir, 'default.jsonl');
    if (fs.existsSync(tracePath) && fs.existsSync(defaultPath)) {
      return {
        runId: candidates[index],
        tracePath,
        defaultPath,
      };
    }
  }
  return null;
}

function resolveRunDir(rootDir, runId) {
  if (!runId) {
    return findLatestRunDir(rootDir);
  }

  const runDir = path.join(rootDir, runId, 'logs');
  const tracePath = path.join(runDir, 'trace.jsonl');
  const defaultPath = path.join(runDir, 'default.jsonl');
  if (!fs.existsSync(tracePath) || !fs.existsSync(defaultPath)) {
    throw new Error(`Pinned live runtime artifacts were not found for run ${runId}.`);
  }

  return {
    runId,
    tracePath,
    defaultPath,
  };
}

function classifyPortfolioState(positionQty, minLot) {
  if (Math.abs(positionQty || 0) < Math.max(minLot || 0, 1e-12)) {
    return 'Flat';
  }
  return 'Holding';
}

function buildSignalLabel(decisionScore, targetPosition, fillsInWindow) {
  if ((fillsInWindow || 0) > 0) return 'Recent Fill Activity';
  if (Math.abs(targetPosition || 0) > 0) return 'Target Position Active';
  if (Math.abs(decisionScore || 0) > 0) return 'Monitoring Entry Conditions';
  return 'No Active Signal';
}

function normalizeFill(fill, step) {
  if (!fill || typeof fill !== 'object') return null;
  const side = String(fill.side || '').toUpperCase() || 'BUY';
  return {
    side,
    quantity: Math.abs(Number(fill.filled_qty || 0)),
    price: Number(fill.fill_price || 0),
    status: String(fill.exchange_status || 'UNKNOWN').toUpperCase(),
    timestampMs: Number(fill.timestamp || step.ts_ms || 0),
    timestamp: toIso(Number(fill.timestamp || step.ts_ms || 0)),
    symbol: String(fill.symbol || step.symbol || 'BTCUSDT'),
    orderType: String(fill.order_type || 'MARKET').toUpperCase(),
    exchange: String(fill.exchange || ''),
    markerTsMs: Number(step.ts_ms || 0),
    markerTs: toIso(Number(step.ts_ms || 0)),
  };
}

function buildStepMarker(step, valueKey, fallbackValue, markerValue = fallbackValue) {
  const fills = (step.fills || [])
    .map((fill) => normalizeFill(fill, step))
    .filter(Boolean);
  if (!fills.length) return null;

  const latestStepFill = fills[fills.length - 1];
  return {
    side: latestStepFill.side,
    label: fills.map((fill) => fill.side).join('/'),
    fills,
    value: markerValue,
    [valueKey]: fallbackValue,
  };
}

function main() {
  const latestRun = resolveRunDir(ROOT, PINNED_RUN_ID);
  if (!latestRun) {
    throw new Error('No live runtime trace artifacts were found at the repository root.');
  }

  const traceLines = readJsonLines(latestRun.tracePath);
  const defaultLines = readJsonLines(latestRun.defaultPath);
  const header = traceLines.find((entry) => entry.event === 'trace.header') || {};
  const steps = traceLines.filter((entry) => entry.event === 'engine.step.trace');
  if (!steps.length) {
    throw new Error(`No engine.step.trace entries were found in ${latestRun.tracePath}`);
  }

  const latestStep = steps[steps.length - 1];
  const latestHealth = (latestStep.snapshot || {}).health || {};
  const runtimeDecision = defaultLines.find((entry) => entry.event === 'engine.wired');
  const readiness = defaultLines.find((entry) => entry.event === 'realtime.startup.readiness_passed');
  const reconciliations = defaultLines.filter((entry) => entry.event === 'runtime.exchange_account.reconciled');
  const latestReconciliation = reconciliations[reconciliations.length - 1] || null;

  const executionConstraints = header.execution_constraints || {};
  const stepSize = Number(executionConstraints.min_lot || 0);
  const minNotional = Number(executionConstraints.min_notional || 0);
  const tracePortfolio = (((latestStep || {}).portfolio || {}).snapshot_dict || {});
  const latestClose = Number(((((latestStep.market_snapshots || {}).ohlcv || {}).BTCUSDT || {}).numeric || {}).close || 0);
  const currentCash = Number(
    tracePortfolio.cash
      ?? latestReconciliation?.context?.exchange_quote_free
      ?? defaultLines.find((entry) => entry.event === 'realtime.portfolio.startup_cash_synced')?.context?.exchange_quote_free
      ?? 0
  );
  const currentPositionQty = Number(
    tracePortfolio.position_qty
      ?? latestReconciliation?.context?.exchange_base_qty
      ?? defaultLines.find((entry) => entry.event === 'realtime.portfolio.startup_position_synced')?.context?.exchange_position_qty
      ?? 0
  );
  const totalEquity = Number(
    tracePortfolio.total_equity
      ?? (currentCash + (currentPositionQty * latestClose))
      ?? 0
  );
  const feedKey = Object.keys(latestHealth.domains || {}).find((key) => key.startsWith('ohlcv:BTCUSDT'));
  const feedState = feedKey ? latestHealth.domains[feedKey] : {};
  const decisionScore = Number(latestStep.decision_score || 0);
  const targetPosition = Number(latestStep.target_position || 0);
  const fillsInWindow = steps.reduce((count, step) => count + ((step.fills || []).length || 0), 0);
  const latestFillEntry = [...steps]
    .reverse()
    .flatMap((step) => (step.fills || []).map((fill) => normalizeFill(fill, step)))
    .find(Boolean);
  const equitySeries = steps.map((step) => {
    const snapshot = (((step || {}).portfolio || {}).snapshot_dict || {});
    const close = Number((((step.market_snapshots || {}).ohlcv || {}).BTCUSDT || {}).numeric?.close || 0);
    const cash = Number(snapshot.cash ?? 0);
    const positionQty = Number(snapshot.position_qty ?? 0);
    const totalEquityPoint = Number(snapshot.total_equity ?? (cash + (positionQty * close)) ?? 0);

    return {
      ts: toIso(step.ts_ms),
      ts_ms: Number(step.ts_ms || 0),
      totalEquity: totalEquityPoint,
      marker: buildStepMarker(step, 'totalEquity', totalEquityPoint),
    };
  });

  const payload = {
    schema: 'live_deployment_v1',
    generated_at: new Date().toISOString(),
    generated_at_ms: Date.now(),
    source: {
      run_id: latestRun.runId,
      trace_path: copyEvidenceAsset(latestRun.runId, latestRun.tracePath, 'trace.jsonl'),
      default_log_path: copyEvidenceAsset(latestRun.runId, latestRun.defaultPath, 'default.jsonl'),
    },
    environment: {
      strategy: STRATEGY_LABEL,
      venue: readiness?.context?.mainnet ? 'Binance (Mainnet)' : 'Binance',
      market: 'Spot',
      symbol: latestStep.symbol || 'BTCUSDT',
      interval: header.interval || '15m',
      mode: header.engine_mode || 'REALTIME',
      engineStatus: String(latestHealth.global_mode || 'running').toUpperCase(),
      runLabel: latestRun.runId,
      decisionModel: runtimeDecision?.context?.decision || null,
    },
    execution: {
      executionModel: executionConstraints.fractional ? 'Fractional spot execution' : 'Spot execution',
      minNotional,
      minNotionalLabel: `${minNotional.toFixed(0)} USDT`,
      stepSize,
      stepSizeLabel: `${stepSize.toFixed(5)} BTC`,
      executionPermit: latestHealth.execution_permit || 'full',
    },
    runtime: {
      lastUpdateTs: toIso(latestStep.ts_ms),
      lastUpdateMs: Number(latestStep.ts_ms || 0),
      feedState: feedState.state || 'unknown',
      feedStateLabel: feedState.state === 'healthy' ? 'Feed Active' : formatLabel(feedState.state || 'unknown'),
      feedStalenessMs: Number(feedState.staleness_ms || 0),
      observedSteps: steps.length,
      decisionScore,
      targetPosition,
      fillsInWindow,
      signalStateLabel: buildSignalLabel(decisionScore, targetPosition, fillsInWindow),
      liveSignalNote: latestFillEntry
        ? `A live ${latestFillEntry.side} signal has been triggered and filled in the current observation window.`
        : null,
    },
    portfolio: {
      cash: currentCash,
      positionQty: currentPositionQty,
      totalEquity,
      exposure: Number(tracePortfolio.exposure || 0),
      portfolioStateLabel: classifyPortfolioState(currentPositionQty, stepSize),
      quoteAsset: 'USDT',
      baseAsset: 'BTC',
    },
    latestFill: latestFillEntry,
    charts: {
      equity: equitySeries,
      price: steps.map((step) => ({
        ts: toIso(step.ts_ms),
        ts_ms: Number(step.ts_ms || 0),
        close: Number((((step.market_snapshots || {}).ohlcv || {}).BTCUSDT || {}).numeric?.close || 0),
        marker: buildStepMarker(
          step,
          'close',
          Number((((step.market_snapshots || {}).ohlcv || {}).BTCUSDT || {}).numeric?.close || 0),
          Number(
            (step.fills || []).length
              ? (step.fills || [])[step.fills.length - 1]?.fill_price
              : (((step.market_snapshots || {}).ohlcv || {}).BTCUSDT || {}).numeric?.close || 0
          )
        ),
      })),
      rsi: steps.map((step) => {
        const features = step.features || {};
        const rsi = Number(features.RSI_DECISION_BTCUSDT || 0);
        const mean = Number(features['RSI-MEAN_DECISION_BTCUSDT'] || 0);
        const std = Number(features['RSI-STD_DECISION_BTCUSDT'] || 0);
        return {
          ts: toIso(step.ts_ms),
          ts_ms: Number(step.ts_ms || 0),
          rsi,
          rsiMean: mean,
          rsiUpper: mean + (RSI_VARIANCE_FACTOR * std),
          rsiLower: mean - (RSI_VARIANCE_FACTOR * std),
          marker: buildStepMarker(step, 'rsi', rsi),
        };
      }),
      adx: steps.map((step) => ({
        ts: toIso(step.ts_ms),
        ts_ms: Number(step.ts_ms || 0),
        adx: Number((step.features || {}).ADX_DECISION_BTCUSDT || 0),
      })),
    },
    live_note: 'Portfolio state is exchange-synced at startup and reconciled during live runtime.',
    explanatory_note: latestFillEntry
      ? `The strategy is currently running live and the displayed charts reflect a recent observation window from the active runtime trace. The most recent real ${latestFillEntry.side} fill is visible in context without turning the page into a performance claim.`
      : 'The strategy is currently running live and the displayed charts reflect a recent observation window from the active runtime trace. A flat state or no fills in this window is acceptable when entry conditions have not been satisfied yet.',
  };

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  process.stdout.write(`Wrote ${path.relative(ROOT, OUTPUT_PATH)} from run ${latestRun.runId}\n`);
}

function formatLabel(value) {
  return String(value || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

main();
