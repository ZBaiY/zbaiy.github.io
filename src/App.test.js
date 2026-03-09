import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import App from './App';

test('renders home navigation', () => {
  render(<App />);
  expect(screen.getByRole('button', { name: 'Home' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Strategies' })).toBeInTheDocument();
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
  expect(screen.getByRole('button', { name: 'Equity' })).toBeInTheDocument();
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
