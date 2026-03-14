import React, { useEffect, useMemo, useState } from 'react';

const SNAPSHOT_PATH = '/data/strategies/rsi-adx-gateway/showcase_snapshot_v1.json';

const Emphasis = ({ children }) => <strong className="note-emphasis">{children}</strong>;

function formatPercent(value) {
  if (typeof value !== 'number') return 'N/A';
  return `${value.toFixed(2)}%`;
}

function formatNumber(value) {
  if (typeof value !== 'number') return 'N/A';
  return value.toFixed(2);
}

function formatBarsAndHours(bars, hours) {
  if (typeof bars !== 'number' || typeof hours !== 'number') return 'N/A';
  return `${bars.toFixed(0)} x 15m bars (${hours.toFixed(2)}h)`;
}

function formatDate(iso) {
  if (!iso) return 'Unknown';
  return new Date(iso).toLocaleString();
}

function formatWindowLabel(start, end) {
  if (!start || !end) return 'BACKTEST';
  const startLabel = new Date(start).toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
  const endLabel = new Date(end).toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
  return `${startLabel} - ${endLabel}`;
}

function findEvidenceArtifact(artifacts, predicate) {
  return artifacts.find(predicate) || null;
}

function getChartSemantics(chart) {
  const semanticsByKey = {
    equity: {
      title: 'Equity Curve',
      subtitle: chart.description || 'Strategy equity over the selected research window.',
      xLabel: 'Time',
      yLabel: 'Equity',
    },
    drawdown: {
      title: 'Drawdown',
      subtitle: chart.description || 'Underwater view of peak-to-trough loss over time.',
      xLabel: 'Time',
      yLabel: 'Drawdown (%)',
    },
    btc_price: {
      title: 'BTC Price',
      subtitle: chart.description || 'Underlying BTCUSDT price path across the same horizon.',
      xLabel: 'Time',
      yLabel: 'BTC Price (USD)',
    },
    equity_vs_btc: {
      title: 'Equity vs BTC',
      subtitle: chart.description || 'Both series rebased to the same baseline at the start of the displayed window.',
      xLabel: 'Time',
      yLabel: 'Indexed',
    },
    yearly_returns: {
      title: 'Yearly Returns',
      subtitle: chart.description || 'Calendar-year return breakdown for the displayed span.',
      xLabel: 'Year',
      yLabel: 'Return (%)',
    },
    rolling_sharpe: {
      title: 'Rolling Sharpe',
      subtitle: chart.description || 'Rolling Sharpe over the displayed span.',
      xLabel: 'Time',
      yLabel: 'Sharpe',
    },
    trade_pnl: {
      title: 'Trade PnL',
      subtitle: chart.description || 'Realized profit and loss for each closed trade.',
      xLabel: 'Trade #',
      yLabel: 'PnL',
    },
    exposure: {
      title: 'Exposure',
      subtitle: chart.description || 'Portfolio exposure over the selected backtest period.',
      xLabel: 'Time',
      yLabel: 'Exposure',
    },
  };

  return semanticsByKey[chart.key] || {
    title: chart.title || chart.label,
    subtitle: chart.description || 'Research chart view.',
    xLabel: 'Time',
    yLabel: 'Value',
  };
}

function buildPolyline(series, valueKey, width, height, padding, minValue, maxValue) {
  if (!series?.length) return '';
  const values = series.map((point) => point[valueKey] ?? 0);
  const min = typeof minValue === 'number' ? minValue : Math.min(...values);
  const max = typeof maxValue === 'number' ? maxValue : Math.max(...values);
  const range = max - min || 1;
  return series
    .map((point, index) => {
      const x = padding + (index / Math.max(series.length - 1, 1)) * (width - padding * 2);
      const y = height - padding - ((point[valueKey] - min) / range) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(' ');
}

function buildRebasedEquityVsBtcChart(charts) {
  const comparisonChart = charts.equity_vs_btc;
  const equitySeries = charts.equity?.series || [];
  const btcSeries = charts.btc_price?.series || [];

  if (!comparisonChart?.series?.length || !equitySeries.length || !btcSeries.length) {
    return comparisonChart;
  }

  const btcByTs = new Map(btcSeries.map((point) => [point.ts_ms, point]));
  const alignedEquitySeries = equitySeries.filter((point) => btcByTs.has(point.ts_ms));

  if (!alignedEquitySeries.length) {
    return comparisonChart;
  }

  const startTs = alignedEquitySeries[0].ts_ms;
  const startEquity = alignedEquitySeries[0].equity || 1;
  const startBtc = btcByTs.get(startTs)?.price || 1;

  return {
    ...comparisonChart,
    description: 'Strategy equity and BTC price rebased to the same starting value. This view highlights whether the system adds value beyond passive BTC exposure rather than simply tracking the market.',
    series: alignedEquitySeries.map((equityPoint) => {
      const btcPoint = btcByTs.get(equityPoint.ts_ms);
      return {
        ts: equityPoint.ts,
        ts_ms: equityPoint.ts_ms,
        normalized_strategy: startEquity ? (100 * equityPoint.equity) / startEquity : 100,
        normalized_btc: startBtc ? (100 * btcPoint.price) / startBtc : 100,
      };
    }),
  };
}

function formatShortDate(value) {
  if (!value) return '';
  const date = new Date(value);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function getChartValueMeta(chart) {
  if (chart.chart_type === 'bar') {
    const primaryKey = chart.series[0]?.return_pct !== undefined ? 'return_pct' : 'pnl';
    return { keys: [primaryKey], primaryKey };
  }
  if (chart.chart_type === 'multi_line') {
    return {
      keys: (chart.lines || []).map((line) => line.key),
      primaryKey: chart.lines?.[0]?.key || 'value',
    };
  }
  if (chart.chart_type === 'area') {
    return { keys: ['drawdown_pct'], primaryKey: 'drawdown_pct' };
  }
  if (chart.series[0]?.price !== undefined) {
    return { keys: ['price'], primaryKey: 'price' };
  }
  if (chart.series[0]?.rolling_sharpe !== undefined) {
    return { keys: ['rolling_sharpe'], primaryKey: 'rolling_sharpe' };
  }
  if (chart.series[0]?.exposure !== undefined) {
    return { keys: ['exposure'], primaryKey: 'exposure' };
  }
  return { keys: ['equity'], primaryKey: 'equity' };
}

function chooseNiceStep(range, targetTickCount = 5) {
  const roughStep = Math.max(range / Math.max(targetTickCount - 1, 1), 1);
  const magnitude = 10 ** Math.floor(Math.log10(roughStep));
  const normalized = roughStep / magnitude;

  if (normalized <= 1) return magnitude;
  if (normalized <= 2) return 2 * magnitude;
  if (normalized <= 5) return 5 * magnitude;
  return 10 * magnitude;
}

function buildRebasedTicks(min, max) {
  const lower = Math.min(min, 100);
  const upper = Math.max(max, 100);
  const step = chooseNiceStep(upper - lower || 10);
  const tickMin = Math.floor(lower / step) * step;
  const tickMax = Math.ceil(upper / step) * step;
  const yTicks = [];

  for (let tick = tickMin; tick <= tickMax + step * 0.5; tick += step) {
    yTicks.push(tick);
  }

  if (!yTicks.includes(100)) {
    yTicks.push(100);
    yTicks.sort((a, b) => a - b);
  }

  return {
    min: tickMin,
    max: tickMax,
    yTicks,
  };
}

function buildFinancialTicks(chart, min, max) {
  const startEquity = chart.series?.[0]?.equity;
  const lower = Math.min(min, typeof startEquity === 'number' ? startEquity : min);
  const upper = Math.max(max, typeof startEquity === 'number' ? startEquity : max);
  const step = chooseNiceStep(upper - lower || 1000);
  const tickMin = Math.floor(lower / step) * step;
  const tickMax = Math.ceil(upper / step) * step;
  const yTicks = [];

  for (let tick = tickMin; tick <= tickMax + step * 0.5; tick += step) {
    yTicks.push(tick);
  }

  if (typeof startEquity === 'number' && startEquity >= tickMin && startEquity <= tickMax && !yTicks.includes(startEquity)) {
    yTicks.push(startEquity);
    yTicks.sort((a, b) => a - b);
  }

  return {
    min: tickMin,
    max: tickMax,
    yTicks,
  };
}

function getChartTicks(chart) {
  if (!chart.series?.length) {
    return { xTicks: [], yTicks: [] };
  }

  const { keys, primaryKey } = getChartValueMeta(chart);
  const values = chart.series.flatMap((point) => keys.map((key) => point[key]).filter((value) => typeof value === 'number'));
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  const rawRange = rawMax - rawMin || 1;
  const domainPadding = chart.chart_type === 'bar'
    ? rawRange * 0.04
    : rawRange * 0.08;
  const paddedMin = rawMin - domainPadding;
  const paddedMax = rawMax + domainPadding;
  const rebasedTicks = chart.key === 'equity_vs_btc'
    ? buildRebasedTicks(paddedMin, paddedMax)
    : null;
  const financialTicks = chart.key === 'equity'
    ? buildFinancialTicks(chart, paddedMin, paddedMax)
    : null;
  const min = rebasedTicks?.min ?? financialTicks?.min ?? paddedMin;
  const max = rebasedTicks?.max ?? financialTicks?.max ?? paddedMax;
  const range = max - min || 1;
  const yTicks = rebasedTicks?.yTicks ?? financialTicks?.yTicks ?? Array.from({ length: 4 }, (_, index) => {
    const ratio = 1 - index / 3;
    return min + range * ratio;
  });

  const lastIndex = chart.series.length - 1;
  const xIndexes = Array.from(new Set([0, Math.floor(lastIndex / 2), lastIndex]));
  const xTicks = xIndexes.map((index) => {
    const point = chart.series[index];
    const label = chart.chart_type === 'bar'
      ? (point.label || `${index + 1}`)
      : formatShortDate(point.ts || point.ts_ms);
    return { index, label };
  });

  return {
    primaryKey,
    min,
    max,
    yTicks,
    xTicks,
  };
}

function formatTickValue(value, chart) {
  if (typeof value !== 'number') return '';
  if (chart.key === 'drawdown') return `${value.toFixed(0)}%`;
  if (chart.key === 'btc_price') return `$${value.toFixed(0)}`;
  if (chart.key === 'equity_vs_btc') return value.toFixed(0);
  if (chart.key === 'yearly_returns') return `${value.toFixed(0)}%`;
  if (chart.key === 'rolling_sharpe') return value.toFixed(1);
  if (chart.key === 'equity') {
    if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
    if (Math.abs(value) >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
    return value.toFixed(0);
  }
  if (chart.key === 'trade_pnl') return value.toFixed(0);
  if (chart.key === 'exposure') return value.toFixed(2);
  return value.toFixed(0);
}

function buildBarRects(series, valueKey, width, height, padding) {
  if (!series?.length) return [];
  const values = series.map((point) => point[valueKey] ?? 0);
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 0);
  const range = max - min || 1;
  const innerHeight = height - padding * 2;
  const baseline = height - padding - ((0 - min) / range) * innerHeight;
  const innerWidth = width - padding * 2;
  const barWidth = innerWidth / series.length;
  const gap = barWidth > 2 ? 1 : 0;
  return series.map((point, index) => {
    const value = point[valueKey] ?? 0;
    const scaled = (Math.abs(value) / range) * innerHeight;
    const x = padding + index * barWidth;
    const y = value >= 0 ? baseline - scaled : baseline;
    const rectHeight = Math.max(scaled, 1);
    return { x, y, width: Math.max(barWidth - gap, 0.2), height: rectHeight, positive: value >= 0 };
  });
}

function ShowcaseChart({ chart, windowLabel }) {
  const width = 920;
  const height = 280;
  const padding = 64;
  const lineColor = '#7dd3fc';
  const amber = '#f59e0b';
  const coral = '#fb7185';
  const displayChart = chart;
  const semantics = getChartSemantics(displayChart);
  const ticks = getChartTicks(displayChart);
  const plotHeight = height - padding * 2;
  const plotWidth = width - padding * 2;

  const scaleY = (value) => {
    const min = ticks.min ?? 0;
    const max = ticks.max ?? 1;
    const range = max - min || 1;
    return height - padding - ((value - min) / range) * plotHeight;
  };

  const scaleX = (index) => {
    const seriesLength = Math.max(displayChart.series.length - 1, 1);
    return padding + (index / seriesLength) * plotWidth;
  };

  const renderContent = () => {
    if (displayChart.chart_type === 'bar') {
      const barValueKey = displayChart.series[0]?.return_pct !== undefined ? 'return_pct' : 'pnl';
      const rects = buildBarRects(displayChart.series, barValueKey, width, height, padding);
      const baseline = scaleY(0);
      return (
        <>
          <line x1={padding} y1={baseline} x2={width - padding} y2={baseline} className="strategy-chart-axis" />
          {rects.map((rect, index) => (
            <rect
              key={`${displayChart.label}-${index}`}
              x={rect.x}
              y={rect.y}
              width={rect.width}
              height={rect.height}
              rx="1"
              className={rect.positive ? 'strategy-bar-positive' : 'strategy-bar-negative'}
            />
          ))}
        </>
      );
    }

    if (displayChart.chart_type === 'multi_line') {
      return displayChart.lines.map((line) => (
        <polyline
          key={line.key}
          fill="none"
          stroke={line.color}
          strokeWidth="3"
          points={buildPolyline(displayChart.series, line.key, width, height, padding, ticks.min, ticks.max)}
        />
      ));
    }

    const valueKey = displayChart.chart_type === 'line' && displayChart.series[0]?.price !== undefined
      ? 'price'
      : displayChart.chart_type === 'line' && displayChart.series[0]?.rolling_sharpe !== undefined
        ? 'rolling_sharpe'
      : displayChart.chart_type === 'line' && displayChart.series[0]?.exposure !== undefined
        ? 'exposure'
        : displayChart.chart_type === 'area'
          ? 'drawdown_pct'
          : 'equity';
    return (
      <>
        {displayChart.chart_type === 'area' ? (
          <polyline
            fill="none"
            stroke={coral}
            strokeWidth="3"
            points={buildPolyline(displayChart.series, valueKey, width, height, padding, ticks.min, ticks.max)}
          />
        ) : (
          <polyline
            fill="none"
            stroke={valueKey === 'price' ? amber : lineColor}
            strokeWidth="3"
            points={buildPolyline(displayChart.series, valueKey, width, height, padding, ticks.min, ticks.max)}
          />
        )}
      </>
    );
  };

  const renderAxes = () => (
    <>
      <line x1={padding} y1={padding} x2={padding} y2={height - padding} className="strategy-chart-axis" />
      <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} className="strategy-chart-axis" />
      {ticks.yTicks?.map((tick) => {
        const y = scaleY(tick);
        return (
          <g key={`y-${tick}`}>
            <line x1={padding - 6} y1={y} x2={padding} y2={y} className="strategy-chart-axis" />
            <text x={padding - 10} y={y + 4} className="strategy-chart-tick strategy-chart-tick-y">
              {formatTickValue(tick, chart)}
            </text>
          </g>
        );
      })}
      {ticks.xTicks?.map((tick) => {
        const x = scaleX(tick.index);
        return (
          <g key={`x-${tick.index}`}>
            <line x1={x} y1={height - padding} x2={x} y2={height - padding + 6} className="strategy-chart-axis" />
            <text x={x} y={height - padding + 20} textAnchor="middle" className="strategy-chart-tick strategy-chart-tick-x">
              {tick.label}
            </text>
          </g>
        );
      })}
    </>
  );

  return (
    <section className="strategy-panel strategy-chart-panel">
      <div className="strategy-panel-header">
        <div>
          <h3>{semantics.title}</h3>
          <p>{semantics.subtitle}</p>
        </div>
        <span className="strategy-mode-badge">{windowLabel || 'BACKTEST'}</span>
      </div>
      <div className="strategy-chart-frame">
        <div className="strategy-chart-y-label" aria-hidden="true">{semantics.yLabel}</div>
        <div className="strategy-chart-canvas">
          <svg className="strategy-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={semantics.title}>
            <rect x="0" y="0" width={width} height={height} rx="18" className="strategy-chart-bg" />
            {renderAxes()}
            {renderContent()}
          </svg>
          <div className="strategy-chart-x-label" aria-hidden="true">{semantics.xLabel}</div>
        </div>
      </div>
      {displayChart.lines?.length ? (
        <div className="strategy-chart-legend">
          {displayChart.lines.map((line) => (
            <span key={line.key}>
              <i style={{ backgroundColor: line.color }} />
              {line.label}
            </span>
          ))}
        </div>
      ) : null}
    </section>
  );
}

const StrategyShowcase = () => {
  const [snapshot, setSnapshot] = useState(null);
  const [error, setError] = useState(null);
  const [activeChartKey, setActiveChartKey] = useState('equity');

  useEffect(() => {
    let cancelled = false;

    fetch(SNAPSHOT_PATH)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load snapshot: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (!cancelled) {
          setSnapshot(data);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const chartEntries = useMemo(() => {
    const preferredOrder = ['equity', 'drawdown', 'yearly_returns', 'rolling_sharpe', 'btc_price', 'equity_vs_btc', 'trade_pnl'];
    const charts = snapshot?.charts || {};
    return preferredOrder
      .map((key) => {
        if (key === 'equity_vs_btc') {
          const rebasedChart = buildRebasedEquityVsBtcChart(charts);
          return rebasedChart?.series?.length ? { key, ...rebasedChart } : null;
        }
        return charts[key]?.series?.length ? { key, ...charts[key] } : null;
      })
      .filter(Boolean);
  }, [snapshot]);

  useEffect(() => {
    if (!chartEntries.length) return;
    if (!chartEntries.find((entry) => entry.key === activeChartKey)) {
      setActiveChartKey(chartEntries[0].key);
    }
  }, [activeChartKey, chartEntries]);

  if (error) {
    return (
      <section className="strategy-showcase strategy-showcase-error">
        <h1>Strategy Showcase</h1>
        <p>{error}</p>
      </section>
    );
  }

  if (!snapshot) {
    return (
      <section className="strategy-showcase strategy-showcase-loading">
        <h1>Strategy Showcase</h1>
        <p>Loading static snapshot...</p>
      </section>
    );
  }

  const { strategy, metrics, evidence, diagnostics = {} } = snapshot;
  const windowLabel = formatWindowLabel(strategy.period_start, strategy.period_end);
  const evidencePeriodLabel = strategy.period_start && strategy.period_end
    ? `${new Date(strategy.period_start).toLocaleDateString()} - ${new Date(strategy.period_end).toLocaleDateString()}`
    : null;
  const activeChart = chartEntries.find((entry) => entry.key === activeChartKey) || chartEntries[0];
  const supportingArtifacts = evidence.supporting_artifacts || [];
  const showcaseRunId = snapshot.selection?.selected_run_id || evidence?.latest_run_label || 'current backtest artifact';
  const horizonDays = Math.round(snapshot.selection?.selected_horizon_days || 0);
  const reportArtifact = findEvidenceArtifact(
    supportingArtifacts,
    (artifact) => artifact.label === 'Report summary',
  );
  const methodArtifact = findEvidenceArtifact(
    supportingArtifacts,
    (artifact) => artifact.label === 'Robustness report',
  );
  const legacyArtifact = findEvidenceArtifact(
    supportingArtifacts,
    (artifact) => artifact.label === 'Legacy strategy note',
  );
  const evidenceItems = [
    `${horizonDays || 'Full'}-day BTCUSDT 15-minute backtest window covering ${evidencePeriodLabel || 'the selected backtest period'}.`,
    `All chart panels on this page are sourced from the direct continuous gateway run ${showcaseRunId}.`,
    `${metrics.trade_count ?? 'Trade-level'} closed trades are summarized, with ${formatNumber(metrics.trades_per_year)} trades per year and per-trade PnL shown without mixing in stitched showcase data.`,
    `Old-vs-new family interpretation is retained in the linked research notes, but the graphs on this page remain gateway-only and non-comparative.`,
  ];
  const evidenceActions = [
    reportArtifact ? { label: 'Backtest Report', path: reportArtifact.path } : null,
    methodArtifact ? { label: 'Research Notes', path: methodArtifact.path } : null,
    legacyArtifact ? { label: 'Legacy Notes', path: legacyArtifact.path } : null,
  ].filter(Boolean);
  const strategySummarySections = [
    {
      title: 'Objective',
      summary: 'This page presents the gateway flush variant directly from a continuous backtest run.',
      details: [
        <>This page presents the gateway flush variant directly from a <Emphasis>continuous backtest run</Emphasis>.</>,
        <>The goal is not to showcase stitched performance, but to expose a <Emphasis>single research artifact</Emphasis> with transparent diagnostics.</>,
      ],
    },
    {
      title: 'Key Findings',
      summary: 'The strategy behaves as a selective long/flat intraday BTC timing system rather than a market-neutral alpha engine.',
      details: [
        <>The strategy behaves as a <Emphasis>selective long/flat intraday BTC timing system</Emphasis> rather than a market-neutral alpha engine.</>,
        <>Performance comes from <Emphasis>tactical exposure control</Emphasis>: the system spends a large fraction of time flat and deploys capital aggressively when signals trigger.</>,
      ],
    },
    {
      title: 'Robustness and Limits',
      summary: 'The current evidence is bounded to the tested BTCUSDT window.',
      details: [
        <>The run demonstrates coherent behavior and <Emphasis>non-trivial excess return periods versus BTC</Emphasis>, but it does not yet prove cross-asset robustness, cross-exchange portability, deployable capacity, or realistic market impact.</>,
        <>These remain the next research steps before claiming deployable alpha. The page should be read as a <Emphasis>research artifact</Emphasis>, not a finished production claim.</>,
      ],
    },
    {
      title: 'Current Showcase Configuration',
      summary: 'Charts shown here are sourced from a single continuous backtest artifact to avoid stitched or cherry-picked results.',
      details: [
        <>The current showcase is anchored to the direct continuous <Emphasis>`{showcaseRunId}`</Emphasis> artifact.</>,
        <>An <Emphasis>hours-level discontinuity in the Binance data caused by exchange maintenance</Emphasis> blocks extending this backtest family further back than March 2023, so the showcased window stops at the last continuous range before that gap.</>,
      ],
    },
  ];
  const primaryMetricCards = [
    { label: 'Annualized Return', value: formatPercent(metrics.annualized_return_pct) },
    { label: 'Sharpe', value: formatNumber(metrics.sharpe) },
    { label: 'Max Drawdown', value: formatPercent(metrics.max_drawdown_pct) },
    { label: 'Trades', value: metrics.trade_count ?? 'N/A' },
    {
      label: 'Execution Cost Assumption',
      value: '~20 bps round trip',
      subtitle: '10 bps observed fee baseline + 10 bps slippage allowance',
    },
    {
      label: 'Strategy Beta to BTC',
      value: formatNumber(diagnostics.strategy_beta_to_btc),
      subtitle: 'Directional but sub-1 beta exposure',
    },
    {
      label: 'Return Correlation to BTC',
      value: formatNumber(diagnostics.return_correlation_to_btc),
      subtitle: 'Moderate dependence on BTC moves',
    },
    {
      label: 'Time in Market',
      value: formatPercent((diagnostics.time_in_market_ratio || 0) * 100),
      subtitle: 'Strategy is flat most of the time',
    },
    {
      label: 'Mean Leverage When Active',
      value: formatNumber(diagnostics.mean_leverage_when_active),
      subtitle: 'Near-fully deployed when signals trigger',
    },
    {
      label: 'Holding Horizon',
      value: formatBarsAndHours(diagnostics.avg_holding_steps, diagnostics.avg_holding_hours),
      subtitle: 'Intraday tactical positioning',
    },
    {
      label: 'Trade Frequency',
      value: `${formatNumber(diagnostics.trade_frequency_per_day)} trades/day`,
      subtitle: 'Short-horizon tactical turnover',
    },
  ];

  return (
    <div className="strategy-showcase fade-in">
      <section className="strategy-hero">
        <div className="strategy-hero-copy">
          <p className="strategy-kicker">Research Showcase</p>
          <h1>{strategy.name}</h1>
          <p className="strategy-description">{strategy.description}</p>
        </div>
        <div className="strategy-hero-meta">
          <span>{strategy.symbol}</span>
          <span>{strategy.market}</span>
          <span>{strategy.timeframe}</span>
          <span>{strategy.mode_label}</span>
        </div>
      </section>

      <section className="strategy-summary-strip">
        <div className="strategy-summary-header">
          <h3>Research Summary</h3>
          <p>
            This page is framed as a quant research artifact: benchmark-relative diagnostics, directional exposure,
            and stated robustness limits rather than promotional headline framing.
          </p>
        </div>
        <div className="strategy-summary-list">
          {strategySummarySections.map((section) => (
            <details key={section.title} className="strategy-summary-item">
              <summary>
                <span>{section.title}</span>
                <p>{section.summary}</p>
              </summary>
              <div className="strategy-summary-body">
                {section.details.map((detail, index) => (
                  <p key={`${section.title}-${index}`}>{detail}</p>
                ))}
              </div>
            </details>
          ))}
        </div>
      </section>

      <section className="strategy-window-strip">
        <div className="strategy-window-header">
          <h3>Primary Analysis Window</h3>
          <p>
            The charts below use the direct continuous gateway backtest run currently selected for the website snapshot.
            <Emphasis> An hours-level discontinuity in the Binance data caused by exchange maintenance blocks extending this backtest family further back than March 2023, so the showcased window stops at the last continuous range before that gap.</Emphasis>
          </p>
        </div>

        <section className="strategy-execution-strip" aria-label="Execution assumptions">
          <div className="strategy-execution-header">
            <h3>Execution Assumptions</h3>
            <p>
              The backtest applies an intentionally conservative round-trip trading-cost assumption of about 20 bps per
              completed trade.
            </p>
          </div>
          <div className="strategy-execution-body">
            <p>
              Roughly 10 bps reflects the effective fee level observed from real Binance trading experience, and
              another ~10 bps is applied as a linear slippage allowance.
            </p>
            <p>
              This is not a full order-book execution simulator; it is a deliberately practical baseline used to avoid
              overstating edge.
            </p>
          </div>
        </section>

        <section className="strategy-metrics-row" aria-label="Primary analysis metrics">
          {primaryMetricCards.map((card) => (
            <article key={card.label} className="strategy-metric-card">
              <span>{card.label}</span>
              <strong>{card.value}</strong>
              {card.subtitle ? <p className="strategy-metric-subtitle">{card.subtitle}</p> : null}
            </article>
          ))}
        </section>

        <section className="strategy-panel strategy-chart-shell">
          <div className="strategy-chart-tabs" role="tablist" aria-label="Chart views">
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
          {activeChart ? <ShowcaseChart chart={activeChart} windowLabel={windowLabel} /> : null}
        </section>
      </section>

      <section className="strategy-evidence-strip">
        <div className="strategy-evidence-header">
          <h3>Evidence</h3>
          <p>
            {evidence.freshness_label}. Updated {formatDate(evidence.latest_artifact_timestamp)}.
            This is a presentation-safe summary of the research record behind the snapshot.
          </p>
        </div>
        <div className="strategy-evidence-grid" aria-label="Evidence summary">
          {evidenceItems.map((item) => (
            <article key={item} className="strategy-evidence-card">
              <p>{item}</p>
            </article>
          ))}
        </div>
        <div className="strategy-evidence-actions" aria-label="Evidence links">
          {evidenceActions.map((action) => (
            <a
              key={action.label}
              className="strategy-evidence-action"
              href={action.path}
              title={action.path}
            >
              {action.label}
            </a>
          ))}
        </div>
      </section>
    </div>
  );
};

export default StrategyShowcase;
