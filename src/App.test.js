import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import App from './App';

test('renders home navigation', () => {
  render(<App />);
  expect(screen.getByRole('button', { name: 'Home' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Strategies' })).toBeInTheDocument();
  expect(screen.getAllByRole('button', { name: 'Live Deployment' }).length).toBeGreaterThan(0);
  expect(screen.getByRole('button', { name: 'Experiments' })).toBeInTheDocument();
});

test('renders strategy showcase from static snapshot', async () => {
  const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({
    ok: true,
    json: async () => ({
      strategy: {
        name: 'Dynamic RSI Range + ADX Gateway',
        description: 'Static bundle test',
        symbol: 'BTCUSDT',
        market: 'Binance spot',
        timeframe: '15m',
        mode_label: 'BACKTEST SNAPSHOT',
        period_start: '2025-01-01T00:00:00Z',
        period_end: '2025-12-31T23:59:59Z',
      },
      metrics: {
        total_return_pct: -4.82,
        annualized_return_pct: -4.12,
        sharpe: -9.79,
        max_drawdown_pct: -8.28,
        trade_count: 7,
        trades_per_year: 5.6,
      },
      charts: {
        equity: {
          label: 'Equity',
          title: 'Strategy Equity',
          description: 'Static bundle test',
          chart_type: 'line',
          series: [
            { ts: '2026-03-09T00:00:00Z', ts_ms: 1741478400000, equity: 100 },
            { ts: '2026-03-09T01:00:00Z', ts_ms: 1741482000000, equity: 95 },
          ],
        },
        drawdown: {
          label: 'Drawdown',
          title: 'Underwater Curve',
          description: 'Drawdown test',
          chart_type: 'area',
          series: [
            { ts: '2026-03-09T00:00:00Z', ts_ms: 1741478400000, drawdown_pct: 0 },
            { ts: '2026-03-09T01:00:00Z', ts_ms: 1741482000000, drawdown_pct: -5 },
          ],
        },
        yearly_returns: {
          label: 'Yearly Returns',
          title: 'Calendar-Year Returns',
          description: 'Yearly returns test',
          chart_type: 'bar',
          series: [
            { label: '2025', ts_ms: 1741478400000, return_pct: 12.5 },
            { label: '2026*', ts_ms: 1741482000000, return_pct: -3.2 },
          ],
        },
      },
      evidence: {
        latest_artifact_timestamp: '2026-03-09T07:58:51.983270Z',
        freshness_label: 'Static research snapshot',
        latest_run_label: 'EXP_RSI_ADX_BASELINE_20260309',
        supporting_artifacts: [
          { label: 'Report summary', path: 'SoionLab/artifacts/runs/.../report/summary.json' },
          { label: 'Robustness report', path: 'SoionLab/docs/.../robustness_report.md' },
          { label: 'Smoke summary example', path: 'SoionLab/docs/.../smoke_summary.json' },
        ],
        notes: ['Simulated execution only. No live runtime or API dependency.'],
      },
      selection: {
        selected_horizon_days: 365,
      },
    }),
  });

  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: 'Strategies' }));

  await waitFor(() => {
    expect(screen.getByText('Dynamic RSI Range + ADX Gateway')).toBeInTheDocument();
  });
  expect(screen.getByText(/Static research snapshot\./i)).toBeInTheDocument();
  expect(screen.getAllByRole('button', { name: 'Equity' }).length).toBeGreaterThan(0);
  expect(screen.getByText('Equity Curve')).toBeInTheDocument();
  expect(screen.getByText('Time')).toBeInTheDocument();
  expect(screen.getAllByText('Equity').length).toBeGreaterThan(0);
  expect(screen.getByText('Research Summary')).toBeInTheDocument();
  expect(screen.getByText('Key Observations')).toBeInTheDocument();
  expect(screen.getByText(/Dynamic RSI bounds and ADX gating matter most/i)).toBeInTheDocument();
  expect(screen.getByText('Primary Analysis Window')).toBeInTheDocument();
  expect(screen.getByText('Annualized Return')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Backtest Report' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Method Notes' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Smoke Run Summary' })).toBeInTheDocument();
  expect(fetchMock).toHaveBeenCalledWith('/data/strategies/rsi-adx-gateway/showcase_snapshot_v1.json');

  fetchMock.mockRestore();
});

test('renders experimenting strategies page', () => {
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: 'Experiments' }));

  expect(screen.getByText('Experimenting Strategies')).toBeInTheDocument();
  expect(screen.getByText('RSI + IV Conditioning')).toBeInTheDocument();
  expect(screen.getByText('MACD + ADX Gateway')).toBeInTheDocument();
  expect(screen.getByText('Random Forest Dynamic RSI')).toBeInTheDocument();
  expect(screen.getByText(/An early attempt to extend RSI threshold logic with option-chain implied-volatility context/i)).toBeInTheDocument();
  expect(screen.getAllByText('View details').length).toBeGreaterThan(0);
});

test('renders live deployment page from projected runtime data', async () => {
  const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({
    ok: true,
    json: async () => ({
      environment: {
        strategy: 'Dynamic RSI + ADX',
        venue: 'Binance (Mainnet)',
        market: 'Spot',
        symbol: 'BTCUSDT',
        interval: '15m',
        mode: 'REALTIME',
        engineStatus: 'RUNNING',
      },
      execution: {
        executionModel: 'Fractional spot execution',
        minNotionalLabel: '5 USDT',
        stepSizeLabel: '0.00001 BTC',
        executionPermit: 'full',
      },
      runtime: {
        lastUpdateTs: '2026-03-11T05:30:00Z',
        lastUpdateMs: Date.now() - 10_000,
        feedStateLabel: 'Feed Active',
        observedSteps: 4,
        decisionScore: -1,
        targetPosition: 0,
        fillsInWindow: 2,
        signalStateLabel: 'Recent Fill Activity',
        liveSignalNote: 'A live SELL signal has been triggered and filled in the current observation window.',
      },
      portfolio: {
        cash: 0.63,
        positionQty: 0.0002,
        totalEquity: 14.62,
        portfolioStateLabel: 'Holding',
        quoteAsset: 'USDT',
        baseAsset: 'BTC',
      },
      latestFill: {
        side: 'SELL',
        quantity: 0.0002,
        price: 69511.0,
        status: 'FILLED',
        timestamp: '2026-03-11T06:45:05Z',
        markerTs: '2026-03-11T06:45:00Z',
      },
      charts: {
        equity: [
          { ts: '2026-03-11T04:15:00Z', totalEquity: 14.95, marker: { side: 'BUY', label: 'BUY', value: 14.95 } },
          { ts: '2026-03-11T04:30:00Z', totalEquity: 14.81 },
          { ts: '2026-03-11T06:45:00Z', totalEquity: 14.62, marker: { side: 'SELL', label: 'SELL', value: 14.62 } },
        ],
        price: [
          { ts: '2026-03-11T04:15:00Z', close: 69500, marker: { side: 'BUY', label: 'BUY', price: 69500 } },
          { ts: '2026-03-11T04:30:00Z', close: 69750 },
          { ts: '2026-03-11T06:45:00Z', close: 69511.0, marker: { side: 'SELL', label: 'SELL', price: 69511.0 } },
        ],
        rsi: [
          { ts: '2026-03-11T04:15:00Z', rsi: 42, rsiMean: 48, rsiUpper: 55.2, rsiLower: 40.8, marker: { side: 'BUY', label: 'BUY', value: 42 } },
          { ts: '2026-03-11T04:30:00Z', rsi: 45, rsiMean: 47, rsiUpper: 54.2, rsiLower: 39.8 },
          { ts: '2026-03-11T06:45:00Z', rsi: 51.5, rsiMean: 60.3, rsiUpper: 64.98, rsiLower: 55.62, marker: { side: 'SELL', label: 'SELL', value: 51.5 } },
        ],
        adx: [
          { ts: '2026-03-11T04:15:00Z', adx: 18 },
          { ts: '2026-03-11T04:30:00Z', adx: 21 },
          { ts: '2026-03-11T05:30:00Z', adx: 13.6 },
        ],
      },
      live_note: 'Portfolio state is exchange-synced at startup and reconciled during live runtime.',
      explanatory_note:
        'The strategy is currently running live and the displayed charts reflect a recent observation window from the active runtime trace. The first real BUY fill is visible in context without turning the page into a performance claim.',
    }),
  });

  render(<App />);
  fireEvent.click(screen.getAllByRole('button', { name: 'Live Deployment' })[0]);

  await waitFor(() => {
    expect(screen.getByText('Dynamic RSI + ADX')).toBeInTheDocument();
  });

  expect(screen.getByRole('heading', { name: 'Live Deployment' })).toBeInTheDocument();
  expect(screen.getByText('Fractional spot execution')).toBeInTheDocument();
  expect(screen.getByText('Latest Live Trade')).toBeInTheDocument();
  expect(screen.getAllByText('SELL').length).toBeGreaterThan(0);
  expect(screen.getByText('Filled')).toBeInTheDocument();
  expect(screen.getAllByText('A live SELL signal has been triggered and filled in the current observation window.').length).toBeGreaterThan(0);
  expect(screen.getAllByRole('button', { name: 'Equity' }).length).toBeGreaterThan(0);
  expect(screen.getByRole('button', { name: 'BTC Price' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'RSI Diagnostics' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'ADX Regime' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Portfolio Equity' })).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'BTC Price' }));
  expect(screen.getByRole('heading', { name: 'BTC Price' })).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'RSI Diagnostics' }));
  expect(screen.getByRole('heading', { name: 'RSI Diagnostics' })).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'ADX Regime' }));
  expect(screen.getByRole('heading', { name: 'ADX Regime Indicator' })).toBeInTheDocument();
  expect(fetchMock).toHaveBeenCalledWith('/data/live/live_deployment_v1.json');

  fetchMock.mockRestore();
});
