# RSI ADX Gateway Flush Research Report

## Objective

Evaluate the refined `RSI-ADX-GATEWAY-FRACTIONAL` variant against the existing RSI dynamic-band family on BTCUSDT OHLCV using real backtest runs. This report tracks model `gateway_refined_bearish_dmi_v2`, where the protective lower-band flush requires bearish DMI confirmation.

## Strategy Variants

- `legacy_default`: `RSI-ADX-SIDEWAYS-FRACTIONAL` with `adx_threshold=25`, `variance_factor=1.8`, `window_RSI_rolling=5`
- `legacy_tuned`: same legacy strategy with prior repo-local tuned challenger `adx_threshold=20`, `variance_factor=1.8`, `window_RSI_rolling=5`
- `new_default`: `RSI-ADX-GATEWAY-FRACTIONAL` with the same default parameters
- `new_tuned`: `RSI-ADX-GATEWAY-FRACTIONAL` with IS best combo `adx_threshold=20`, `variance_factor=1.4`, `mae=0.0`

Behavioral delta of the new strategy:

- lower-band entry is still blocked when ADX is high
- unlike the legacy strategy, an existing long can flatten on lower-band weakness only when ADX is high and bearish DMI confirms `-DI > +DI`
- upper-band exit remains unchanged

Inventory note:

- Repo inspection found one existing registered OHLCV RSI dynamic-band family reference strategy: RSI-ADX-SIDEWAYS-FRACTIONAL. There is no separate registered plain non-ADX dynamic-band strategy under apps/strategy, so comparison uses the legacy default and the prior tuned legacy challenger configuration from docs/strategies/rsi_adxgateway.

## Parameter Scan

- IS windows: ['2024-02-01', '2024-07-01', '2025-03-01', '2025-07-01', '2025-11-01']
- scanned `adx_threshold`: [20, 25, 30]
- scanned `variance_factor`: [1.4, 1.8, 2.2]
- fixed: `window_RSI=14`, `window_ADX=14`, `window_RSI_rolling=5`, `mae=0.0`

| adx_threshold | variance_factor | median_sharpe | mean_return | median_trades | objective |
|---:|---:|---:|---:|---:|---:|
| 20 | 1.4 | -999.0000 | -99900.0000% | 0.0 | -999.0000 |
| 20 | 1.8 | -999.0000 | -99900.0000% | 0.0 | -999.0000 |
| 20 | 2.2 | -999.0000 | -99900.0000% | 0.0 | -999.0000 |
| 25 | 1.4 | -999.0000 | -99900.0000% | 0.0 | -999.0000 |
| 25 | 1.8 | -999.0000 | -99900.0000% | 0.0 | -999.0000 |
| 25 | 2.2 | -999.0000 | -99900.0000% | 0.0 | -999.0000 |
| 30 | 1.4 | -999.0000 | -99900.0000% | 0.0 | -999.0000 |
| 30 | 1.8 | -999.0000 | -99900.0000% | 0.0 | -999.0000 |
| 30 | 2.2 | -999.0000 | -99900.0000% | 0.0 | -999.0000 |

Best IS combo: `adx_threshold=20`, `variance_factor=1.4`, `mae=0.0`.

## In-Sample Results

| variant | mean_sharpe | median_sharpe | mean_return | median_return | mean_trades | positive_return_ratio |
|---|---:|---:|---:|---:|---:|---:|
| legacy_default | 0.3412 | 0.4118 | 2.7026% | 3.6497% | 390.2 | 60.00% |
| legacy_tuned | 0.3154 | 0.6030 | 2.6978% | 4.8368% | 454.8 | 60.00% |
| new_default | 0.3696 | 0.4424 | 4.5847% | 4.1138% | 462.4 | 60.00% |
| new_tuned | 0.0843 | 0.0136 | -0.8179% | -0.9330% | 662.6 | 40.00% |

## Out-of-Sample Results

| variant | mean_sharpe | median_sharpe | mean_return | median_return | mean_trades | positive_return_ratio |
|---|---:|---:|---:|---:|---:|---:|
| legacy_default | 0.1495 | 0.0492 | 0.2660% | -2.9755% | 821.3 | 45.45% |
| legacy_tuned | 0.1622 | 0.1138 | 0.7473% | 0.4495% | 735.8 | 54.55% |
| new_default | 0.2403 | 0.2767 | 3.8479% | 3.2267% | 940.5 | 54.55% |
| new_tuned | 0.2832 | 0.3153 | 2.4169% | 2.7441% | 1348.1 | 72.73% |

## Rolling OOS Window Detail

| window | legacy_default_ret | legacy_tuned_ret | new_default_ret | new_tuned_ret | legacy_default_trades | new_tuned_trades |
|---|---:|---:|---:|---:|---:|---:|
| 2024-02-01/2024-04-01 | 9.6476% | 6.1996% | 9.2373% | 16.2053% | 1656 | 1754 |
| 2024-04-01/2024-06-01 | -11.0827% | -15.7091% | 3.2267% | -9.6052% | 719 | 1411 |
| 2024-06-01/2024-08-01 | -6.8816% | -9.2543% | -2.7960% | 4.0476% | 540 | 1542 |
| 2024-08-01/2024-10-01 | -2.9755% | -3.2880% | -3.8112% | 3.9082% | 800 | 1608 |
| 2024-12-01/2025-02-01 | -9.8490% | 1.3923% | -13.6141% | 2.3010% | 365 | 1347 |
| 2025-02-01/2025-04-01 | 1.1796% | 4.4551% | 6.8754% | -12.2601% | 420 | 772 |
| 2025-04-01/2025-06-01 | 7.5591% | -3.1792% | 12.7372% | 10.5073% | 667 | 1836 |
| 2025-06-01/2025-08-01 | -7.0993% | -5.8109% | -7.5198% | 2.0153% | 598 | 907 |
| 2025-08-01/2025-10-01 | -3.5979% | 0.4495% | -4.2344% | 7.1983% | 544 | 1383 |
| 2025-10-01/2025-12-01 | 7.9120% | 9.9899% | 15.4780% | -0.4763% | 735 | 801 |
| 2025-12-01/2026-02-01 | 18.1135% | 22.9752% | 26.7479% | 2.7441% | 1990 | 1468 |

## Robustness Checks

1. Rolling-window OOS comparison
- `new_tuned` vs `legacy_default`: {'mean_sharpe_delta': 0.1336608457621837, 'median_sharpe_delta': 0.305295348183744, 'mean_return_delta': 0.021508838069176698, 'median_return_delta': 0.06557655625534523, 'mean_trade_delta': 526.8181818181819, 'return_win_count': 8.0, 'sharpe_win_count': 7.0}
- `new_tuned` vs `legacy_tuned`: {'mean_sharpe_delta': 0.12092416625911587, 'median_sharpe_delta': 0.3333441129450658, 'mean_return_delta': 0.01669597710965181, 'median_return_delta': 0.0674884594093475, 'mean_trade_delta': 612.2727272727273, 'return_win_count': 8.0, 'sharpe_win_count': 7.0}
- `new_tuned` vs `new_default`: {'mean_sharpe_delta': 0.04284883425107038, 'median_sharpe_delta': 0.2990940264494526, 'mean_return_delta': -0.014310312258785835, 'median_return_delta': 0.06843581291234191, 'mean_trade_delta': 407.6363636363636, 'return_win_count': 6.0, 'sharpe_win_count': 7.0}

2. Local sensitivity around the best new point

| mae | median_sharpe | mean_return | median_trades | objective |
|---:|---:|---:|---:|---:|
| 0.0 | -999.0000 | -99900.0000% | 0.0 | -999.0000 |
| 0.25 | -999.0000 | -99900.0000% | 0.0 | -999.0000 |
| 0.5 | -999.0000 | -99900.0000% | 0.0 | -999.0000 |

3. Trade-count interpretation

Trade-count deltas are reported explicitly above so any return improvement can be judged against selectivity changes. A lower trade count alone is not treated as evidence of improvement.

## Answers

1. Behavioral difference: the new strategy adds a lower-band protective flush under high ADX; the legacy strategy does not.
2. Material improvement check: vs legacy default OOS, `new_tuned` mean return delta = 2.1509%, median return delta = 6.5577%, mean Sharpe delta = 0.1337.
3. Selectivity check: `new_tuned` mean trade delta vs legacy default OOS = 526.8; this indicates whether gains came with materially different activity.
4. Locally best new parameter region: adx_threshold near `20` and variance_factor near `1.4` on the tested grid.
5. OOS vs older references: `new_tuned` return wins were 8/11 vs legacy default and 8/11 vs legacy tuned.
6. Robustness evidence should be judged from the rolling OOS table and head-to-head aggregates, not the IS winner alone.
7. Recommendation: `challenger configuration`.

## Conclusion

This study should be read as a sober comparison of a narrow decision-layer variant. Promotion should depend on OOS and rolling-window evidence, not on the IS scan winner alone.

Artifacts:

- `research_results.json`
- `parameter_scan.csv`
- `research_results_gateway_refined_bearish_dmi_v2.json`
- `parameter_scan_gateway_refined_bearish_dmi_v2.csv`
