import React, { useEffect, useMemo, useState } from 'react';

const LIVE_DEPLOYMENT_PATH = '/data/live/live_deployment_v1.json';

function formatCurrency(value, currency = 'USDT') {
  if (typeof value !== 'number' || Number.isNaN(value)) return 'N/A';
  return `${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${currency}`;
}

function formatQuantity(value, digits = 8, suffix = 'BTC') {
  if (typeof value !== 'number' || Number.isNaN(value)) return 'N/A';
  return `${value.toFixed(digits)} ${suffix}`;
}

function formatTimestamp(value) {
  if (!value) return 'Unknown';
  return new Date(value).toLocaleString();
}

function formatExecutionStatus(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatCompactNumber(value, digits = 2) {
  if (typeof value !== 'number' || Number.isNaN(value)) return 'N/A';
  return value.toFixed(digits);
}

function formatShortTime(value) {
  if (!value) return '';
  const date = new Date(value);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function chooseNiceStep(range, targetTickCount = 5) {
  const roughStep = Math.max(range / Math.max(targetTickCount - 1, 1), 1e-9);
  const magnitude = 10 ** Math.floor(Math.log10(roughStep));
  const normalized = roughStep / magnitude;

  if (normalized <= 1) return magnitude;
  if (normalized <= 2) return 2 * magnitude;
  if (normalized <= 5) return 5 * magnitude;
  return 10 * magnitude;
}

function buildNumericTicks(min, max, targetTickCount = 5) {
  const safeMin = Number.isFinite(min) ? min : 0;
  const safeMax = Number.isFinite(max) ? max : 1;
  const range = safeMax - safeMin || 1;
  const step = chooseNiceStep(range, targetTickCount);
  const tickMin = Math.floor(safeMin / step) * step;
  const tickMax = Math.ceil(safeMax / step) * step;
  const ticks = [];

  for (let tick = tickMin; tick <= tickMax + step * 0.5; tick += step) {
    ticks.push(Number(tick.toFixed(8)));
  }

  return {
    min: tickMin,
    max: tickMax,
    ticks,
  };
}

function buildPath(series, key, width, height, padding, domainMin, domainMax) {
  if (!series.length) return '';
  const range = domainMax - domainMin || 1;
  return series
    .map((point, index) => {
      const x = padding + (index / Math.max(series.length - 1, 1)) * (width - padding * 2);
      const y = height - padding - ((point[key] - domainMin) / range) * (height - padding * 2);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');
}

function buildHorizontalGuide(value, width, height, padding, domainMin, domainMax) {
  const range = domainMax - domainMin || 1;
  const y = height - padding - ((value - domainMin) / range) * (height - padding * 2);
  return `M ${padding} ${y} L ${width - padding} ${y}`;
}

function getXTickIndexes(length) {
  if (length <= 1) return [0];
  if (length === 2) return [0, 1];
  if (length === 3) return [0, 1, 2];
  return Array.from(new Set([0, Math.floor((length - 1) / 2), length - 1]));
}

function getLiveChartConfig(charts) {
  return [
    {
      key: 'equity',
      label: 'Equity',
      title: 'Portfolio Equity',
      subtitle: 'Exchange-synced total equity across the observed live runtime window.',
      yLabel: 'Equity (USDT)',
      xLabel: 'Time',
      lines: [{ key: 'totalEquity', label: 'Total Equity', color: '#22c55e', strokeWidth: 3 }],
      guides: [],
      series: charts.equity || [],
      formatTick: (value) => formatCompactNumber(value, 2),
      getDomain: (series) => {
        const values = series.map((point) => point.totalEquity).filter((value) => typeof value === 'number');
        if (!values.length) return buildNumericTicks(0, 1);
        const min = Math.min(...values);
        const max = Math.max(...values);
        const padding = Math.max((max - min) * 0.12, 0.05);
        return buildNumericTicks(min - padding, max + padding, 4);
      },
      markerKey: 'totalEquity',
    },
    {
      key: 'price',
      label: 'BTC Price',
      title: 'BTC Price',
      subtitle: 'Recent live BTCUSDT closes from the observed runtime trace window.',
      yLabel: 'BTC Price (USD)',
      xLabel: 'Time',
      lines: [{ key: 'close', label: 'Close', color: '#f59e0b', strokeWidth: 3 }],
      guides: [],
      series: charts.price || [],
      formatTick: (value) => `$${formatCompactNumber(value, 0)}`,
      getDomain: (series) => {
        const values = series.map((point) => point.close).filter((value) => typeof value === 'number');
        if (!values.length) return buildNumericTicks(0, 1);
        const min = Math.min(...values);
        const max = Math.max(...values);
        const padding = Math.max((max - min) * 0.1, max * 0.0025, 1);
        return buildNumericTicks(min - padding, max + padding, 4);
      },
      markerKey: 'close',
    },
    {
      key: 'rsi',
      label: 'RSI Diagnostics',
      title: 'RSI Diagnostics',
      subtitle: 'RSI against its live rolling mean and variance-adjusted decision envelope.',
      yLabel: 'RSI',
      xLabel: 'Time',
      lines: [
        { key: 'rsi', label: 'RSI', color: '#f8fafc', strokeWidth: 2.6 },
        { key: 'rsiMean', label: 'RSI Mean', color: '#38bdf8', strokeWidth: 2.2 },
        { key: 'rsiUpper', label: 'Mean + variance factor (=1.8) * Std', color: '#f59e0b', strokeWidth: 2 },
        { key: 'rsiLower', label: 'Mean - variance factor (=1.8) * Std', color: '#f59e0b', strokeWidth: 2 },
      ],
      guides: [
        { label: '30', value: 30 },
        { label: '70', value: 70 },
      ],
      series: charts.rsi || [],
      formatTick: (value) => formatCompactNumber(value, 0),
      getDomain: (series, guides) => {
        const values = series.flatMap((point) => [point.rsi, point.rsiMean, point.rsiUpper, point.rsiLower]);
        values.push(...guides.map((guide) => guide.value));
        const filtered = values.filter((value) => typeof value === 'number');
        if (!filtered.length) return buildNumericTicks(0, 100, 5);
        const min = Math.max(0, Math.min(...filtered) - 5);
        const max = Math.min(100, Math.max(...filtered) + 5);
        return buildNumericTicks(min, max, 5);
      },
      markerKey: 'rsi',
    },
    {
      key: 'adx',
      label: 'ADX Regime',
      title: 'ADX Regime Indicator',
      subtitle: 'ADX level over the same live window to show current regime strength.',
      yLabel: 'ADX',
      xLabel: 'Time',
      lines: [{ key: 'adx', label: 'ADX', color: '#34d399', strokeWidth: 2.6 }],
      guides: [
        { label: '20', value: 20 },
        { label: '25', value: 25 },
      ],
      series: charts.adx || [],
      formatTick: (value) => formatCompactNumber(value, 0),
      getDomain: (series, guides) => {
        const values = series.map((point) => point.adx).concat(guides.map((guide) => guide.value));
        const filtered = values.filter((value) => typeof value === 'number');
        if (!filtered.length) return buildNumericTicks(0, 50, 5);
        const min = Math.max(0, Math.min(...filtered) - 4);
        const max = Math.max(...filtered) + 4;
        return buildNumericTicks(min, max, 5);
      },
      markerKey: 'adx',
    },
  ];
}

function MetadataAccordion({ title, summary, items, note }) {
  return (
    <details className="live-meta-accordion">
      <summary className="live-meta-accordion-summary">
        <div className="live-meta-accordion-head">
          <span className="live-meta-accordion-title">{title}</span>
          <span className="live-meta-accordion-preview">{summary}</span>
        </div>
        <span className="live-meta-accordion-chevron" aria-hidden="true">▾</span>
      </summary>
      <div className="live-meta-accordion-body">
        <dl className="live-meta-compact-list">
          {items.map((item) => (
            <div key={item.label} className="live-meta-compact-row">
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
        </dl>
        {note ? <p className="live-runtime-note">{note}</p> : null}
      </div>
    </details>
  );
}

function SwitchCardSection({ title, description, tabs, activeKey, onChange, badge }) {
  const activeTab = tabs.find((tab) => tab.key === activeKey) || tabs[0];

  return (
    <section className="live-switch-section">
      <div className="live-card-header">
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        {badge ? <span className="live-card-badge">{badge}</span> : null}
      </div>
      <div className="strategy-chart-tabs live-switch-tabs" role="tablist" aria-label={`${title} views`}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={tab.key === activeTab?.key ? 'strategy-chart-tab active' : 'strategy-chart-tab'}
            onClick={() => onChange(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="live-monitor-card live-switch-card">
        <div className="live-switch-card-body">
          <span className="live-switch-card-kicker">{activeTab.kicker}</span>
          <strong className="live-switch-card-value">{activeTab.value}</strong>
          {activeTab.secondary ? <p className="live-switch-card-secondary">{activeTab.secondary}</p> : null}
          {activeTab.meta?.length ? (
            <dl className="live-switch-card-meta">
              {activeTab.meta.map((item) => (
                <div key={`${activeTab.key}-${item.label}`} className="live-switch-card-meta-row">
                  <dt>{item.label}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
          {activeTab.note ? <p className="live-runtime-note">{activeTab.note}</p> : null}
        </div>
      </div>
    </section>
  );
}

function MonitoringChart({ chart, windowLabel }) {
  const width = 920;
  const height = 280;
  const padding = 64;
  const series = chart.series || [];
  const domain = chart.getDomain(series, chart.guides || []);
  const xTickIndexes = getXTickIndexes(series.length);
  const xTicks = xTickIndexes.map((index) => ({
    index,
    label: formatShortTime(series[index]?.ts),
  }));

  if (!series.length) {
    return (
      <section className="strategy-panel live-chart-panel">
        <div className="strategy-panel-header">
          <div>
            <h3>{chart.title}</h3>
            <p>{chart.subtitle}</p>
          </div>
        </div>
        <div className="live-empty-state">Recent live trace data is not available for this chart.</div>
      </section>
    );
  }

  const plotHeight = height - padding * 2;
  const plotWidth = width - padding * 2;
  const scaleY = (value) => {
    const range = domain.max - domain.min || 1;
    return height - padding - ((value - domain.min) / range) * plotHeight;
  };
  const scaleX = (index) => padding + (index / Math.max(series.length - 1, 1)) * plotWidth;
  const markerPoints = series
    .map((point, index) => ({ point, index }))
    .filter(({ point }) => point.marker && chart.markerKey && typeof point[chart.markerKey] === 'number');

  return (
    <section className="strategy-panel live-chart-panel">
      <div className="strategy-panel-header">
        <div>
          <h3>{chart.title}</h3>
          <p>{chart.subtitle}</p>
        </div>
        <span className="strategy-mode-badge">{windowLabel}</span>
      </div>
      <div className="strategy-chart-frame">
        <div className="strategy-chart-y-label" aria-hidden="true">{chart.yLabel}</div>
        <div className="strategy-chart-canvas">
          <svg className="strategy-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={chart.title}>
            <rect x="0" y="0" width={width} height={height} rx="18" className="strategy-chart-bg" />
            <line x1={padding} y1={padding} x2={padding} y2={height - padding} className="strategy-chart-axis" />
            <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} className="strategy-chart-axis" />
            {chart.guides.map((guide) => (
              <path
                key={`${chart.key}-${guide.label}`}
                d={buildHorizontalGuide(guide.value, width, height, padding, domain.min, domain.max)}
                className="live-chart-guide"
              />
            ))}
            {domain.ticks.map((tick) => {
              const y = scaleY(tick);
              return (
                <g key={`${chart.key}-y-${tick}`}>
                  <line x1={padding - 6} y1={y} x2={padding} y2={y} className="strategy-chart-axis" />
                  <text x={padding - 10} y={y + 4} className="strategy-chart-tick strategy-chart-tick-y">
                    {chart.formatTick(tick)}
                  </text>
                </g>
              );
            })}
            {xTicks.map((tick) => {
              const x = scaleX(tick.index);
              return (
                <g key={`${chart.key}-x-${tick.index}`}>
                  <line x1={x} y1={height - padding} x2={x} y2={height - padding + 6} className="strategy-chart-axis" />
                  <text x={x} y={height - padding + 20} textAnchor="middle" className="strategy-chart-tick strategy-chart-tick-x">
                    {tick.label}
                  </text>
                </g>
              );
            })}
            {chart.lines.map((line) => (
              <path
                key={line.key}
                d={buildPath(series, line.key, width, height, padding, domain.min, domain.max)}
                fill="none"
                stroke={line.color}
                strokeWidth={line.strokeWidth || 2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
            {markerPoints.map(({ point, index }) => (
              <g key={`${chart.key}-marker-${point.ts_ms || index}`}>
                <circle
                  cx={scaleX(index)}
                  cy={scaleY(point[chart.markerKey])}
                  r="6"
                  className={`live-event-marker live-event-marker-${String(point.marker?.side || '').toLowerCase()}`}
                />
                <text
                  x={scaleX(index)}
                  y={scaleY(point[chart.markerKey]) - 12}
                  textAnchor="middle"
                  className={`live-event-marker-label live-event-marker-label-${String(point.marker?.side || '').toLowerCase()}`}
                >
                  {point.marker?.label || point.marker?.side || 'FILL'}
                </text>
              </g>
            ))}
          </svg>
          <div className="strategy-chart-x-label" aria-hidden="true">{chart.xLabel}</div>
        </div>
      </div>
      <div className="strategy-chart-legend" aria-label={`${chart.title} legend`}>
        {chart.lines.map((line) => (
          <span key={line.key}>
            <i style={{ backgroundColor: line.color }} />
            {line.label}
          </span>
        ))}
      </div>
      {chart.guides.length ? (
        <div className="live-chart-guides">
          {chart.guides.map((guide) => (
            <span key={`${chart.key}-${guide.label}`} className="live-chart-guide-item">
              <span className="live-chart-guide-line" />
              Guide {guide.label}
            </span>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function LiveDeployment() {
  const [state, setState] = useState({ status: 'loading', payload: null, error: null });
  const [activeChartKey, setActiveChartKey] = useState('equity');
  const [activePortfolioKey, setActivePortfolioKey] = useState('equity');
  const [activeTradeKey, setActiveTradeKey] = useState('fill');
  const [activeSignalKey, setActiveSignalKey] = useState('decision');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch(LIVE_DEPLOYMENT_PATH);
        if (!response.ok) {
          throw new Error(`Failed to load live deployment data (${response.status})`);
        }
        const payload = await response.json();
        if (!cancelled) {
          setState({ status: 'ready', payload, error: null });
        }
      } catch (error) {
        if (!cancelled) {
          setState({ status: 'error', payload: null, error });
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const payload = state.payload || {};
  const environment = payload.environment || {};
  const execution = payload.execution || {};
  const portfolio = payload.portfolio || {};
  const runtime = payload.runtime || {};
  const latestFill = payload.latestFill || null;
  const latestRsi = payload.charts?.rsi?.[payload.charts?.rsi?.length - 1] || null;
  const latestAdx = payload.charts?.adx?.[payload.charts?.adx?.length - 1] || null;
  const chartEntries = useMemo(
    () => getLiveChartConfig(payload.charts || {}).filter((entry) => entry.series?.length),
    [payload.charts]
  );
  const activeChart = chartEntries.find((entry) => entry.key === activeChartKey) || chartEntries[0] || null;
  const windowLabel = runtime.observedSteps ? `${runtime.observedSteps} live steps` : 'LIVE WINDOW';
  const liveNote = payload.live_note || 'Portfolio state is exchange-synced at startup and reconciled during live runtime.';
  const portfolioTabs = [
    {
      key: 'equity',
      label: 'Equity',
      kicker: 'Total Equity',
      value: formatCurrency(portfolio.totalEquity, portfolio.quoteAsset || 'USDT'),
      secondary: 'Current exchange-synced portfolio value in the live runtime.',
      meta: [
        { label: 'State', value: portfolio.portfolioStateLabel || 'Flat' },
        { label: 'Symbol', value: environment.symbol || 'BTCUSDT' },
      ],
    },
    {
      key: 'cash',
      label: 'Cash',
      kicker: 'Available Cash',
      value: formatCurrency(portfolio.cash, portfolio.quoteAsset || 'USDT'),
      secondary: 'Quote balance currently available after the live fill.',
      meta: [
        { label: 'Asset', value: portfolio.quoteAsset || 'USDT' },
        { label: 'Permit', value: execution.executionPermit || 'full' },
      ],
    },
    {
      key: 'position',
      label: 'Position',
      kicker: 'Position Quantity',
      value: formatQuantity(portfolio.positionQty || 0, 8, portfolio.baseAsset || 'BTC'),
      secondary: 'Base asset quantity currently held by the live portfolio.',
      meta: [
        { label: 'Asset', value: portfolio.baseAsset || 'BTC' },
        { label: 'State', value: portfolio.portfolioStateLabel || 'Flat' },
      ],
    },
    {
      key: 'exposure',
      label: 'Exposure',
      kicker: 'Gross Exposure',
      value: formatCurrency(portfolio.exposure || 0, portfolio.quoteAsset || 'USDT'),
      secondary: 'Current marked exposure from the live portfolio snapshot.',
      meta: [
        { label: 'Position Qty', value: formatQuantity(portfolio.positionQty || 0, 8, portfolio.baseAsset || 'BTC') },
        { label: 'Equity', value: formatCurrency(portfolio.totalEquity, portfolio.quoteAsset || 'USDT') },
      ],
    },
  ];
  const tradeTabs = latestFill
    ? [
        {
          key: 'fill',
          label: 'Fill',
          kicker: 'Latest Fill',
          value: `${latestFill.side} ${formatQuantity(latestFill.quantity, 8, portfolio.baseAsset || 'BTC')}`,
          secondary: formatCurrency(latestFill.price, portfolio.quoteAsset || 'USDT'),
          meta: [
            { label: 'Status', value: formatExecutionStatus(latestFill.status) },
            { label: 'Timestamp', value: formatTimestamp(latestFill.timestamp) },
          ],
          note: runtime.liveSignalNote || 'A live BUY signal has been triggered and filled in the current observation window.',
        },
        {
          key: 'order',
          label: 'Order',
          kicker: 'Order Routing',
          value: latestFill.orderType || 'MARKET',
          secondary: latestFill.symbol || environment.symbol || 'BTCUSDT',
          meta: [
            { label: 'Exchange', value: latestFill.exchange || 'binance' },
            { label: 'Side', value: latestFill.side },
          ],
        },
        {
          key: 'execution',
          label: 'Execution',
          kicker: 'Execution Status',
          value: formatExecutionStatus(latestFill.status),
          secondary: formatTimestamp(latestFill.timestamp),
          meta: [
            { label: 'Price', value: formatCurrency(latestFill.price, portfolio.quoteAsset || 'USDT') },
            { label: 'Quantity', value: formatQuantity(latestFill.quantity, 8, portfolio.baseAsset || 'BTC') },
          ],
        },
      ]
    : [
        {
          key: 'fill',
          label: 'Fill',
          kicker: 'Latest Fill',
          value: 'No live fill yet',
          secondary: 'The page remains ready to surface the first real execution event.',
          note: 'No trade signal has been triggered in the current observation window.',
        },
      ];
  const signalTabs = [
    {
      key: 'rsi',
      label: 'RSI',
      kicker: 'RSI Context',
      value: latestRsi ? `RSI ${formatCompactNumber(latestRsi.rsi, 1)}` : 'RSI unavailable',
      secondary: latestRsi ? `Mean ${formatCompactNumber(latestRsi.rsiMean, 2)} • Variance factor (=1.8) * Std ${formatCompactNumber(latestRsi.rsiUpper - latestRsi.rsiMean, 2)}` : null,
      meta: latestRsi ? [
        { label: 'Mean', value: formatCompactNumber(latestRsi.rsiMean, 2) },
        { label: 'Variance factor (=1.8) * Std', value: formatCompactNumber(latestRsi.rsiUpper - latestRsi.rsiMean, 2) },
      ] : [],
    },
    {
      key: 'adx',
      label: 'ADX',
      kicker: 'ADX Context',
      value: latestAdx ? `ADX ${formatCompactNumber(latestAdx.adx, 1)}` : 'ADX unavailable',
      secondary: 'Regime strength at the latest observed live step.',
      meta: [
        { label: 'Guide 20', value: 'Regime threshold' },
        { label: 'Guide 25', value: 'Higher-strength threshold' },
      ],
    },
    {
      key: 'decision',
      label: 'Decision',
      kicker: 'Decision Context',
      value: `Score ${formatCompactNumber(runtime.decisionScore, 3)}`,
      secondary: `Target position ${formatCompactNumber(runtime.targetPosition, 4)}`,
      meta: [
        { label: 'Observed Steps', value: String(runtime.observedSteps || 0) },
        { label: 'Fills In Window', value: String(runtime.fillsInWindow || 0) },
      ],
      note: latestFill
        ? (runtime.liveSignalNote || 'A live BUY signal has been triggered and filled in the current observation window.')
        : 'No trade signal has been triggered in the current observation window.',
    },
  ];
  const environmentItems = [
    { label: 'Strategy', value: environment.strategy || 'Dynamic RSI + ADX' },
    { label: 'Venue', value: environment.venue || 'Binance (Mainnet)' },
    { label: 'Market', value: environment.market || 'Spot' },
    { label: 'Symbol', value: environment.symbol || 'BTCUSDT' },
    { label: 'Interval', value: environment.interval || '15m' },
    { label: 'Mode', value: environment.mode || 'REALTIME' },
    { label: 'Engine Status', value: environment.engineStatus || 'RUNNING' },
    { label: 'Last Update', value: formatTimestamp(runtime.lastUpdateTs) },
  ];
  const executionItems = [
    { label: 'Execution Model', value: execution.executionModel || 'Fractional spot execution' },
    { label: 'Min Notional', value: execution.minNotionalLabel || '5 USDT' },
    { label: 'Step Size', value: execution.stepSizeLabel || '0.00001 BTC' },
    { label: 'Execution Permit', value: execution.executionPermit || 'full' },
  ];
  const environmentSummary = `${environment.strategy || 'Dynamic RSI + ADX'} • ${environment.venue || 'Binance (Mainnet)'} • ${environment.symbol || 'BTCUSDT'} • ${environment.interval || '15m'}`;
  const executionSummary = `${execution.executionModel || 'Fractional spot execution'} • Min notional ${execution.minNotionalLabel || '5 USDT'} • Step ${execution.stepSizeLabel || '0.00001 BTC'}`;

  useEffect(() => {
    if (!chartEntries.length) return;
    if (!chartEntries.find((entry) => entry.key === activeChartKey)) {
      setActiveChartKey(chartEntries[0].key);
    }
  }, [activeChartKey, chartEntries]);

  if (state.status === 'loading') {
    return <div className="live-loading-state">Loading live deployment state...</div>;
  }

  if (state.status === 'error') {
    return (
      <div className="live-error-state">
        <h1>Live Deployment</h1>
        <p>{state.error?.message || 'Live deployment data is unavailable.'}</p>
      </div>
    );
  }

  return (
    <div className="live-monitor-page fade-in">
      <section className="live-monitor-hero">
        <div className="live-monitor-hero-copy">
          <p className="strategy-kicker">Live Runtime Monitor</p>
          <h1>Live Deployment</h1>
          <p className="live-monitor-description">
            Current live runtime state for the deployed BTCUSDT strategy. The page shows liveness,
            current exchange-synced portfolio state, and the recent indicator window without turning
            a short live session into a performance narrative.
          </p>
        </div>
        <div className="live-status-pill-group">
          <span className="live-status-pill live-status-pill-active">{environment.engineStatus || 'RUNNING'}</span>
          <span className="live-status-pill">{environment.mode || 'REALTIME'}</span>
          <span className="live-status-pill">{runtime.feedStateLabel || 'Feed Active'}</span>
        </div>
      </section>

      <section className="live-monitor-card live-meta-stack">
        <MetadataAccordion
          title="Environment"
          summary={environmentSummary}
          items={environmentItems}
        />
        <MetadataAccordion
          title="Execution Constraints"
          summary={executionSummary}
          items={executionItems}
          note={liveNote}
        />
      </section>

      <section className="live-monitor-card live-chart-shell">
        <div className="live-chart-shell-header">
          <div>
            <h2>Chart Window</h2>
            <p>Switch between equity, market price, RSI diagnostics, and ADX regime using the same interaction pattern as the strategies page.</p>
            {latestFill ? (
              <p className="live-runtime-note">
                {runtime.liveSignalNote || 'A live BUY signal has been triggered and filled in the current observation window.'}
              </p>
            ) : null}
          </div>
        </div>
        <div className="strategy-chart-tabs" role="tablist" aria-label="Live chart views">
          {chartEntries.map((entry) => (
            <button
              key={entry.key}
              type="button"
              className={entry.key === activeChart?.key ? 'strategy-chart-tab active' : 'strategy-chart-tab'}
              onClick={() => setActiveChartKey(entry.key)}
            >
              {entry.label}
            </button>
          ))}
        </div>
        {activeChart ? <MonitoringChart chart={activeChart} windowLabel={windowLabel} /> : null}
      </section>

      <section className="live-monitor-grid live-support-grid">
        <div className="live-support-grid-primary">
          <SwitchCardSection
            title="Portfolio Summary"
            description="Exchange-reconciled balances and position state for the active live runtime."
            tabs={portfolioTabs}
            activeKey={activePortfolioKey}
            onChange={setActivePortfolioKey}
            badge={portfolio.portfolioStateLabel || 'Flat'}
          />
        </div>

        <div className="live-support-grid-primary">
          <SwitchCardSection
            title="Latest Live Trade"
            description="Most recent live execution event from the current observation window."
            tabs={tradeTabs}
            activeKey={activeTradeKey}
            onChange={setActiveTradeKey}
            badge={latestFill?.side || null}
          />
        </div>

        <div className="live-support-grid-secondary">
          <SwitchCardSection
            title="Signal Context"
            description="Current decision state from the live strategy at the latest observed step."
            tabs={signalTabs}
            activeKey={activeSignalKey}
            onChange={setActiveSignalKey}
            badge={runtime.signalStateLabel || 'No Active Signal'}
          />
        </div>
      </section>

      <section className="live-monitor-card">
        <div className="live-card-header">
          <div>
            <h2>Live Note</h2>
            <p>Professional context for interpreting a short live runtime window.</p>
          </div>
        </div>
        <p className="live-note-copy">{payload.explanatory_note}</p>
      </section>
    </div>
  );
}

export default LiveDeployment;
