# RSI-ADX Sideways Robustness Report

## Scope

This note evaluates the existing `RSI-ADX-SIDEWAYS-FRACTIONAL` strategy on multiple real BTCUSDT backtest windows using only OHLCV data. The intent is not to optimize parameters, but to check whether the old RSI+ADX gateway logic is at least directionally stable across different periods.

This report uses the fixed strategy binding:

- `A=BTCUSDT`
- `window_RSI=14`
- `window_ADX=14`
- `window_RSI_rolling=5`
- strategy: `RSI-ADX-SIDEWAYS-FRACTIONAL`
- interval: `15m`

BTCUSDT OHLCV coverage in this repo spans multiple years, so the windows below were chosen across 2024, 2025, and early 2026 rather than from a single local slice.

## Tested Windows

| Window | Run ID | Sharpe | Total Return | Trades | Max Drawdown | Verdict |
|---|---|---:|---:|---:|---:|---|
| 2024-02-01 to 2024-03-01 | `ROBUST_RSI_ADX_20240201_20240301` | 4.4364 | 7.76% | 106 | -3.96% | CLEAN |
| 2024-07-01 to 2024-08-01 | `ROBUST_RSI_ADX_20240701_20240801` | -1.7482 | -5.09% | 68 | -12.48% | CLEAN |
| 2024-11-01 to 2024-12-01 | `ROBUST_RSI_ADX_20241101_20241201` | 3.0826 | 23.05% | 313 | -17.55% | INVALID |
| 2025-03-01 to 2025-04-01 | `ROBUST_RSI_ADX_20250301_20250401` | 1.2989 | 3.65% | 68 | -12.37% | CLEAN |
| 2025-07-01 to 2025-08-01 | `ROBUST_RSI_ADX_20250701_20250801` | -0.2573 | -0.51% | 28 | -7.72% | CLEAN |
| 2025-11-01 to 2025-12-01 | `ROBUST_RSI_ADX_20251101_20251201` | 3.2267 | 7.70% | 73 | -7.60% | CLEAN |
| 2026-01-27 to 2026-02-02 | `ROBUST_RSI_ADX_20260127_20260202` | -9.9498 | -5.19% | 8 | -8.28% | CLEAN |

## Immediate Findings

1. The strategy is live enough to evaluate.
   It generated trades in every tested window, ranging from `8` to `313` trades. This is materially different from the current RSI+IV runtime path, which is still blocked by separate issues.

2. Performance is regime-sensitive.
   The sign of return and Sharpe flips across windows. There are clearly profitable slices and clearly unprofitable slices.

3. The short January 27, 2026 to February 2, 2026 debug window is not representative.
   That slice produced only `8` trades and a highly negative Sharpe. It is too short and too sparse to say much about robustness.

4. Trade frequency is not stable across windows.
   The November 2024 window produced `313` trades, while July 2025 produced only `28`. That means the same fixed parameters interact very differently with changing market structure.

5. One strong window is flagged `INVALID` by the report layer.
   The 2024-11-01 to 2024-12-01 run had the highest return in this sample, but the run summary marks it `INVALID`. That window should not be used as clean supporting evidence until the underlying report warning is understood.

## Robustness Assessment

### What this data does support

- The old RSI+ADX gateway strategy is operational on real multi-window BTCUSDT OHLCV data.
- It is not a degenerate strategy that only works on one handpicked 5-day period.
- The logic can produce meaningful activity across multiple years with the same parameter set.
- The strategy has some regime selectivity. It is capable of strong positive windows, but it is not consistently profitable.

### What this data does not support

- It does not support calling the strategy robust in a strict statistical sense.
- It does not support using Sharpe from any single month as a stable estimate.
- It does not support parameter finalization.
- It does not isolate whether ADX gating is the true source of edge, or whether results are mostly driven by a few market regimes.

## Interpretation

A pragmatic reading of these runs is:

- The old RSI+ADX gateway method is structurally healthier than the current RSI+IV prototypes because it can be exercised across many windows without relying on option-chain ingestion.
- Its behavior is plausible but not stable enough yet to call production-robust.
- The strategy appears to be regime-dependent rather than uniformly resilient.
- The right next step is not more one-off tuning on a 5-day slice. The right next step is broader window coverage and controlled sensitivity analysis.

## Risks and Caveats

1. One reported best-performing window is marked `INVALID`.
   That needs to be resolved before using that run as strong evidence.

2. The windows are still relatively short.
   Monthly windows are good for regime sampling, but they are still noisy.

3. Trade count dispersion is large.
   A strategy that swings from `28` to `313` trades per month may require additional normalization or threshold calibration.

4. No out-of-sample parameter sweep was done here.
   This report evaluates a fixed configuration only.

## Concrete Next Steps

1. Add a wider rolling-window study.
   Use 60-day or 90-day windows with overlap across the full BTCUSDT OHLCV range.

2. Resolve the `INVALID` verdict on `ROBUST_RSI_ADX_20241101_20241201` before treating that result as canonical.

3. Run a local sensitivity grid around the current configuration.
   The natural first parameters are:
   - ADX threshold / sideway threshold
   - RSI rolling window
   - position sizing mode if the fractional path has additional controls

4. Compare robustness against a plain RSI baseline.
   That is the cleanest way to test whether the ADX gate is genuinely improving regime behavior.

## Source Runs

- [summary.json](/Users/zhaoyub/Documents/Tradings/SoionLab/artifacts/runs/ROBUST_RSI_ADX_20240201_20240301/report/summary.json)
- [summary.json](/Users/zhaoyub/Documents/Tradings/SoionLab/artifacts/runs/ROBUST_RSI_ADX_20240701_20240801/report/summary.json)
- [summary.json](/Users/zhaoyub/Documents/Tradings/SoionLab/artifacts/runs/ROBUST_RSI_ADX_20241101_20241201/report/summary.json)
- [summary.json](/Users/zhaoyub/Documents/Tradings/SoionLab/artifacts/runs/ROBUST_RSI_ADX_20250301_20250401/report/summary.json)
- [summary.json](/Users/zhaoyub/Documents/Tradings/SoionLab/artifacts/runs/ROBUST_RSI_ADX_20250701_20250801/report/summary.json)
- [summary.json](/Users/zhaoyub/Documents/Tradings/SoionLab/artifacts/runs/ROBUST_RSI_ADX_20251101_20251201/report/summary.json)
- [summary.json](/Users/zhaoyub/Documents/Tradings/SoionLab/artifacts/runs/ROBUST_RSI_ADX_20260127_20260202/report/summary.json)
