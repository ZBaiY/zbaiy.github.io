import React, { useEffect, useMemo, useState } from 'react';

const SNAPSHOT_PATH = '/data/strategies/rsi-adx-gateway/showcase_snapshot_v1.json';
const TIME_RANGE_OPTIONS = [
  { key: 'all', label: 'All' },
  { key: '365d', label: '1Y', days: 365 },
  { key: '180d', label: '180D', days: 180 },
  { key: '90d', label: '90D', days: 90 },
  { key: '30d', label: '30D', days: 30 },
];

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

function formatShortDate(value) {
  if (!value) return '';
  const date = new Date(value);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function findEvidenceArtifact(artifacts, predicate) {
  return artifacts.find(predicate) || null;
}

function isTimeSeriesChart(chart) {
  return chart.chart_type !== 'heatmap'
    && chart.chart_type !== 'histogram'
    && chart.series?.some((point) => typeof point.ts_ms === 'number');
}

function filterChartByRange(chart, rangeKey) {
  if (!chart || !isTimeSeriesChart(chart) || rangeKey === 'all') return chart;
  const option = TIME_RANGE_OPTIONS.find((item) => item.key === rangeKey);
  if (!option?.days) return chart;
  const lastTs = chart.series[chart.series.length - 1]?.ts_ms;
  if (typeof lastTs !== 'number') return chart;
  const cutoff = lastTs - (option.days * 24 * 60 * 60 * 1000);
  const filteredSeries = chart.series.filter((point) => typeof point.ts_ms === 'number' && point.ts_ms >= cutoff);
  return filteredSeries.length >= 2 ? { ...chart, series: filteredSeries } : chart;
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
    rolling_beta: {
      title: 'Rolling Beta to BTC (90d)',
      subtitle: chart.description || '90-day rolling beta of daily strategy returns relative to BTC returns.',
      xLabel: 'Time',
      yLabel: 'Beta',
    },
    rolling_volatility: {
      title: 'Rolling Volatility (90d)',
      subtitle: chart.description || '90-day rolling annualized volatility of daily strategy returns.',
      xLabel: 'Time',
      yLabel: 'Annualized Volatility',
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
    trade_return_distribution: {
      title: 'Trade Return Distribution',
      subtitle: chart.description || 'Histogram of trade-level returns with mean and median markers.',
      xLabel: 'Trade Return (%)',
      yLabel: 'Trades',
    },
    monthly_pnl: {
      title: 'Monthly PnL',
      subtitle: chart.description || 'Monthly aggregated profit and loss.',
      xLabel: 'Month',
      yLabel: 'PnL',
    },
    exposure: {
      title: 'Strategy Exposure Over Time',
      subtitle: chart.description || 'Absolute position size divided by capital.',
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

function chooseNiceStep(range, targetTickCount = 5) {
  const roughStep = Math.max(range / Math.max(targetTickCount - 1, 1), 1);
  const magnitude = 10 ** Math.floor(Math.log10(roughStep));
  const normalized = roughStep / magnitude;

  if (normalized <= 1) return magnitude;
  if (normalized <= 2) return 2 * magnitude;
  if (normalized <= 5) return 5 * magnitude;
  return 10 * magnitude;
}

function buildLinearTicks(min, max, targetTickCount = 5) {
  if (min === max) {
    const delta = Math.abs(min || 1) * 0.1 || 1;
    min -= delta;
    max += delta;
  }
  const step = chooseNiceStep(max - min || 1, targetTickCount);
  const tickMin = Math.floor(min / step) * step;
  const tickMax = Math.ceil(max / step) * step;
  const ticks = [];
  for (let tick = tickMin; tick <= tickMax + (step * 0.5); tick += step) {
    ticks.push(Number(tick.toFixed(8)));
  }
  return {
    min: tickMin,
    max: tickMax,
    ticks,
  };
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

function getChartValueMeta(chart) {
  if (chart.chart_type === 'heatmap') {
    return { keys: ['sharpe'], primaryKey: 'sharpe' };
  }
  if (chart.chart_type === 'histogram') {
    return { keys: ['count'], primaryKey: 'count' };
  }
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
  if (chart.series[0]?.price !== undefined) return { keys: ['price'], primaryKey: 'price' };
  if (chart.series[0]?.rolling_sharpe !== undefined) return { keys: ['rolling_sharpe'], primaryKey: 'rolling_sharpe' };
  if (chart.series[0]?.beta !== undefined) return { keys: ['beta'], primaryKey: 'beta' };
  if (chart.series[0]?.annualized_volatility !== undefined) return { keys: ['annualized_volatility'], primaryKey: 'annualized_volatility' };
  if (chart.series[0]?.exposure_ratio !== undefined) return { keys: ['exposure_ratio'], primaryKey: 'exposure_ratio' };
  return { keys: ['equity'], primaryKey: 'equity' };
}

function getChartTicks(chart) {
  if (!chart.series?.length) {
    return { xTicks: [], yTicks: [] };
  }

  if (chart.chart_type === 'heatmap') {
    const sharpeValues = chart.series.map((point) => point.sharpe).filter((value) => typeof value === 'number');
    return {
      xTicks: chart.thresholds || [],
      yTicks: chart.lookbacks || [],
      colorMin: Math.min(...sharpeValues),
      colorMax: Math.max(...sharpeValues),
    };
  }

  if (chart.chart_type === 'histogram') {
    const counts = chart.series.map((point) => point.count);
    const xMin = chart.series[0]?.bin_start ?? 0;
    const xMax = chart.series[chart.series.length - 1]?.bin_end ?? 1;
    const yDomain = buildLinearTicks(0, Math.max(...counts, 1));
    const xDomain = buildLinearTicks(xMin, xMax);
    return {
      primaryKey: 'count',
      min: yDomain.min,
      max: yDomain.max,
      yTicks: yDomain.ticks,
      xMin: xDomain.min,
      xMax: xDomain.max,
      xTicks: xDomain.ticks,
    };
  }

  const { keys, primaryKey } = getChartValueMeta(chart);
  const values = chart.series.flatMap((point) => keys.map((key) => point[key]).filter((value) => typeof value === 'number'));
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  const rawRange = rawMax - rawMin || 1;
  const domainPadding = chart.chart_type === 'bar' ? rawRange * 0.04 : rawRange * 0.08;
  const paddedMin = rawMin - domainPadding;
  const paddedMax = rawMax + domainPadding;
  const rebasedTicks = chart.key === 'equity_vs_btc' ? buildRebasedTicks(paddedMin, paddedMax) : null;
  const financialTicks = chart.key === 'equity' ? buildFinancialTicks(chart, paddedMin, paddedMax) : null;
  const linearTicks = (!rebasedTicks && !financialTicks) ? buildLinearTicks(paddedMin, paddedMax) : null;
  const min = rebasedTicks?.min ?? financialTicks?.min ?? linearTicks?.min ?? paddedMin;
  const max = rebasedTicks?.max ?? financialTicks?.max ?? linearTicks?.max ?? paddedMax;
  const yTicks = rebasedTicks?.yTicks ?? financialTicks?.yTicks ?? linearTicks?.ticks ?? [];

  const lastIndex = chart.series.length - 1;
  const xIndexes = Array.from(new Set([0, Math.floor(lastIndex / 2), lastIndex]));
  const xTicks = xIndexes.map((index) => {
    const point = chart.series[index];
    return {
      index,
      label: chart.chart_type === 'bar' ? (point.label || `${index + 1}`) : formatShortDate(point.ts || point.ts_ms),
    };
  });

  return {
    primaryKey,
    min,
    max,
    yTicks,
    xTicks,
  };
}

function formatTickValue(value, chart, axis = 'y') {
  if (typeof value !== 'number') return '';
  if (axis === 'x' && chart.chart_type === 'histogram') return `${value.toFixed(1)}%`;
  if (chart.key === 'rolling_beta') return value.toFixed(2);
  if (chart.key === 'rolling_volatility') return `${(value * 100).toFixed(0)}%`;
  if (chart.key === 'drawdown') return `${value.toFixed(0)}%`;
  if (chart.key === 'btc_price') return `$${value.toFixed(0)}`;
  if (chart.key === 'equity_vs_btc') return value.toFixed(0);
  if (chart.key === 'yearly_returns') return `${value.toFixed(0)}%`;
  if (chart.key === 'rolling_sharpe') return value.toFixed(1);
  if (chart.key === 'trade_return_distribution') return value.toFixed(0);
  if (chart.key === 'exposure') return `${(value * 100).toFixed(0)}%`;
  if (chart.key === 'equity' || chart.key === 'monthly_pnl' || chart.key === 'trade_pnl') {
    if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (Math.abs(value) >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
    return value.toFixed(0);
  }
  return value.toFixed(0);
}

function buildBarRects(series, valueKey, width, height, padding, min, max) {
  if (!series?.length) return [];
  const values = series.map((point) => point[valueKey] ?? 0);
  const domainMin = typeof min === 'number' ? min : Math.min(...values, 0);
  const domainMax = typeof max === 'number' ? max : Math.max(...values, 0);
  const range = domainMax - domainMin || 1;
  const innerHeight = height - padding * 2;
  const baseline = height - padding - ((0 - domainMin) / range) * innerHeight;
  const innerWidth = width - padding * 2;
  const barWidth = innerWidth / series.length;
  const gap = barWidth > 2 ? 1 : 0;
  return series.map((point, index) => {
    const value = point[valueKey] ?? 0;
    const scaled = (Math.abs(value) / range) * innerHeight;
    const x = padding + index * barWidth;
    const y = value >= 0 ? baseline - scaled : baseline;
    return {
      x,
      y,
      width: Math.max(barWidth - gap, 0.2),
      height: Math.max(scaled, 1),
      positive: value >= 0,
    };
  });
}

function buildHistogramRects(series, width, height, padding, ticks) {
  if (!series?.length) return [];
  const innerHeight = height - padding * 2;
  const innerWidth = width - padding * 2;
  const xRange = (ticks.xMax - ticks.xMin) || 1;
  const yRange = (ticks.max - ticks.min) || 1;
  return series.map((point) => {
    const x0 = padding + (((point.bin_start - ticks.xMin) / xRange) * innerWidth);
    const x1 = padding + (((point.bin_end - ticks.xMin) / xRange) * innerWidth);
    const barHeight = ((point.count - ticks.min) / yRange) * innerHeight;
    return {
      x: x0,
      y: height - padding - barHeight,
      width: Math.max(x1 - x0 - 0.5, 0.5),
      height: Math.max(barHeight, 1),
    };
  });
}

function formatStatValue(stat, chartKey) {
  if (typeof stat.value !== 'number') return 'N/A';
  if (chartKey === 'trade_return_distribution' && /mean|median/i.test(stat.label)) {
    return `${stat.value.toFixed(2)}%`;
  }
  return stat.value.toFixed(2);
}

function getPrimaryLineColor(chart) {
  if (chart.key === 'btc_price') return '#f59e0b';
  if (chart.key === 'rolling_volatility') return '#34d399';
  if (chart.key === 'exposure') return '#f59e0b';
  return '#7dd3fc';
}

function ShowcaseChart({ chart, windowLabel }) {
  const width = 920;
  const height = 280;
  const padding = 64;
  const coral = '#fb7185';
  const [rangeKey, setRangeKey] = useState('all');

  useEffect(() => {
    setRangeKey('all');
  }, [chart.key]);

  const displayChart = useMemo(() => filterChartByRange(chart, rangeKey), [chart, rangeKey]);
  const semantics = getChartSemantics(displayChart);
  const ticks = getChartTicks(displayChart);
  const lineColor = getPrimaryLineColor(displayChart);
  const plotHeight = height - padding * 2;
  const plotWidth = width - padding * 2;
  const supportsZoom = isTimeSeriesChart(chart) && chart.series?.length > 24;

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

  const scaleHistogramX = (value) => {
    const xRange = (ticks.xMax - ticks.xMin) || 1;
    return padding + (((value - ticks.xMin) / xRange) * plotWidth);
  };

  const heatmapLookup = useMemo(() => {
    if (displayChart.chart_type !== 'heatmap') return new Map();
    return new Map(displayChart.series.map((cell) => [`${cell.lookback}:${cell.threshold}`, cell]));
  }, [displayChart]);

  const renderAxes = () => {
    if (displayChart.chart_type === 'heatmap') {
      return (
        <>
          <line x1={padding} y1={padding} x2={padding} y2={height - padding} className="strategy-chart-axis" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} className="strategy-chart-axis" />
          {(ticks.yTicks || []).map((tick, index) => {
            const y = padding + ((index + 0.5) / Math.max(ticks.yTicks.length, 1)) * plotHeight;
            return (
              <text key={`y-${tick}`} x={padding - 10} y={y + 4} className="strategy-chart-tick strategy-chart-tick-y">
                {tick}
              </text>
            );
          })}
          {(ticks.xTicks || []).map((tick, index) => {
            const x = padding + ((index + 0.5) / Math.max(ticks.xTicks.length, 1)) * plotWidth;
            return (
              <text key={`x-${tick}`} x={x} y={height - padding + 20} textAnchor="middle" className="strategy-chart-tick strategy-chart-tick-x">
                {Number(tick).toFixed(2)}
              </text>
            );
          })}
        </>
      );
    }

    return (
      <>
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} className="strategy-chart-axis" />
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} className="strategy-chart-axis" />
        {(ticks.yTicks || []).map((tick) => {
          const y = scaleY(tick);
          return (
            <g key={`y-${tick}`}>
              <line x1={padding - 6} y1={y} x2={padding} y2={y} className="strategy-chart-axis" />
              <text x={padding - 10} y={y + 4} className="strategy-chart-tick strategy-chart-tick-y">
                {formatTickValue(tick, displayChart)}
              </text>
            </g>
          );
        })}
        {displayChart.chart_type === 'histogram'
          ? (ticks.xTicks || []).map((tick) => {
            const x = scaleHistogramX(tick);
            return (
              <g key={`x-${tick}`}>
                <line x1={x} y1={height - padding} x2={x} y2={height - padding + 6} className="strategy-chart-axis" />
                <text x={x} y={height - padding + 20} textAnchor="middle" className="strategy-chart-tick strategy-chart-tick-x">
                  {formatTickValue(tick, displayChart, 'x')}
                </text>
              </g>
            );
          })
          : (ticks.xTicks || []).map((tick) => {
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
  };

  const renderReferenceLines = () => {
    if (!displayChart.reference_lines?.length) return null;
    return displayChart.reference_lines.map((line) => {
      if (line.axis === 'y' && displayChart.chart_type !== 'heatmap') {
        const y = scaleY(line.value);
        return (
          <g key={`${line.axis}-${line.label}-${line.value}`}>
            <line
              x1={padding}
              y1={y}
              x2={width - padding}
              y2={y}
              className="strategy-chart-reference"
              stroke={line.color}
            />
            <text x={width - padding} y={y - 6} textAnchor="end" className="strategy-chart-reference-label">
              {line.label}
            </text>
          </g>
        );
      }

      if (line.axis === 'x' && displayChart.chart_type === 'histogram') {
        const x = scaleHistogramX(line.value);
        return (
          <g key={`${line.axis}-${line.label}-${line.value}`}>
            <line
              x1={x}
              y1={padding}
              x2={x}
              y2={height - padding}
              className="strategy-chart-reference"
              stroke={line.color}
            />
            <text x={x + 4} y={padding + 12} className="strategy-chart-reference-label">
              {line.label}
            </text>
          </g>
        );
      }

      return null;
    });
  };

  const renderContent = () => {
    if (displayChart.chart_type === 'heatmap') {
      const xTicks = ticks.xTicks || [];
      const yTicks = ticks.yTicks || [];
      const colorRange = (ticks.colorMax - ticks.colorMin) || 1;
      const cellWidth = plotWidth / Math.max(xTicks.length, 1);
      const cellHeight = plotHeight / Math.max(yTicks.length, 1);

      return yTicks.map((lookback, rowIndex) => xTicks.map((threshold, colIndex) => {
        const cell = heatmapLookup.get(`${lookback}:${threshold}`);
        const value = cell?.sharpe ?? 0;
        const ratio = (value - ticks.colorMin) / colorRange;
        const red = Math.round(251 - (ratio * 140));
        const green = Math.round(113 + (ratio * 120));
        const blue = Math.round(133 + (ratio * 80));
        return (
          <g key={`${lookback}-${threshold}`}>
            <rect
              x={padding + (colIndex * cellWidth)}
              y={padding + (rowIndex * cellHeight)}
              width={Math.max(cellWidth - 2, 4)}
              height={Math.max(cellHeight - 2, 4)}
              rx="4"
              fill={`rgba(${red}, ${green}, ${blue}, 0.9)`}
            />
            <text
              x={padding + (colIndex * cellWidth) + (cellWidth / 2)}
              y={padding + (rowIndex * cellHeight) + (cellHeight / 2) + 4}
              textAnchor="middle"
              className="strategy-chart-cell-label"
            >
              {value.toFixed(2)}
            </text>
          </g>
        );
      }));
    }

    if (displayChart.chart_type === 'histogram') {
      const rects = buildHistogramRects(displayChart.series, width, height, padding, ticks);
      return rects.map((rect, index) => (
        <rect
          key={`${displayChart.label}-${index}`}
          x={rect.x}
          y={rect.y}
          width={rect.width}
          height={rect.height}
          rx="1"
          className="strategy-bar-positive"
        />
      ));
    }

    if (displayChart.chart_type === 'bar') {
      const barValueKey = displayChart.series[0]?.return_pct !== undefined ? 'return_pct' : 'pnl';
      const rects = buildBarRects(displayChart.series, barValueKey, width, height, padding, ticks.min, ticks.max);
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

    const valueKey = displayChart.series[0]?.price !== undefined
      ? 'price'
      : displayChart.series[0]?.rolling_sharpe !== undefined
        ? 'rolling_sharpe'
        : displayChart.series[0]?.beta !== undefined
          ? 'beta'
          : displayChart.series[0]?.annualized_volatility !== undefined
            ? 'annualized_volatility'
            : displayChart.series[0]?.exposure_ratio !== undefined
              ? 'exposure_ratio'
              : displayChart.chart_type === 'area'
                ? 'drawdown_pct'
                : 'equity';

    return (
      <polyline
        fill="none"
        stroke={displayChart.chart_type === 'area' ? coral : lineColor}
        strokeWidth="3"
        points={buildPolyline(displayChart.series, valueKey, width, height, padding, ticks.min, ticks.max)}
      />
    );
  };

  return (
    <section className="strategy-panel strategy-chart-panel">
      <div className="strategy-panel-header">
        <div>
          <h3>{semantics.title}</h3>
          <p>{semantics.subtitle}</p>
        </div>
        <span className="strategy-mode-badge">{windowLabel || 'BACKTEST'}</span>
      </div>
      {supportsZoom ? (
        <div className="strategy-chart-zoom" aria-label="Chart range controls">
          {TIME_RANGE_OPTIONS.map((option) => (
            <button
              key={option.key}
              type="button"
              className={option.key === rangeKey ? 'strategy-chart-zoom-btn active' : 'strategy-chart-zoom-btn'}
              onClick={() => setRangeKey(option.key)}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
      <div className="strategy-chart-frame">
        <div className="strategy-chart-y-label" aria-hidden="true">{semantics.yLabel}</div>
        <div className="strategy-chart-canvas">
          <svg className="strategy-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={semantics.title}>
            <rect x="0" y="0" width={width} height={height} rx="18" className="strategy-chart-bg" />
            {renderAxes()}
            {renderReferenceLines()}
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
      {displayChart.stats?.length ? (
        <div className="strategy-chart-stats">
          {displayChart.stats.map((stat) => (
            <article key={stat.label} className="strategy-chart-stat">
              <span>{stat.label}</span>
              <strong>{formatStatValue(stat, displayChart.key)}</strong>
            </article>
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
    const preferredOrder = [
      'equity',
      'drawdown',
      'rolling_beta',
      'rolling_volatility',
      'monthly_pnl',
      'rolling_sharpe',
      'equity_vs_btc',
      'btc_price',
      'trade_pnl',
      'trade_return_distribution',
      'exposure',
      'yearly_returns',
    ];
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
    `${metrics.trade_count ?? 'Trade-level'} closed trades are summarized, with ${formatNumber(metrics.trades_per_year)} trades per year and trade-return diagnostics derived from the same artifact family.`,
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
        <>The research record should be read as <Emphasis>two distinct variants rather than one</Emphasis> stitched track record, and this page intentionally isolates the gateway branch.</>,
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
