import React, { useState } from 'react';

const DOCS = [
  {
    id: 'overview',
    title: 'Overview',
    shortTitle: 'Overview',
    content: {
      purpose: 'Scope, failure mode, and inspectable artifacts.',
      sections: [
        {
          heading: 'What SoionLab Is',
          body: `SoionLab is a research engine for inspection of data visibility. It separates event time from arrival time.`,
        },
        {
          heading: 'Why This Engine Exists',
          body: `Many engines collapse event time and arrival time. Missing or delayed data then looks clean. Research conclusions become ambiguous.`,
          list: [
            { term: 'Timing-induced invalidity', def: 'Update rates differ, so step N visibility can be unclear.' },
            { term: 'Degraded-data regimes', def: 'Gaps and delays create missing snapshots; logs mark them.' },
            { term: 'Execution context reconstruction', def: 'Logs show what the system knew at time T.' },
          ],
        },
        {
          heading: 'Current Scope and Limitations',
          body: `SoionLab runs offline replay and controlled mock execution. Live order books are out of scope. Data focus: OHLCV and options.`,
        },
        {
          heading: 'Architecture Choices',
          body: null,
          list: [
            { term: 'Single step clock', def: 'The Driver advances time. Other layers consume step_ts only.' },
            { term: 'Visibility gate', def: 'Snapshots expose data_ts <= step_ts. Future access is a contract failure.' },
            { term: 'Readiness policy', def: 'Hard failures block execution. Soft failures write logs.' },
            { term: 'Mode parity', def: 'Backtest, mock, and realtime share the same step rules.' },
          ],
        },
      ],
    },
  },
  {
    id: 'contract_spec',
    title: 'Contract Spec',
    shortTitle: 'Contracts',
    content: {
      purpose: 'Tick schema, timestamps, and invariants.',
      sections: [
        {
          heading: 'Tick Schema',
          body: `The IngestionTick is the sole object crossing the ingestion boundary. All fields are immutable after creation.`,
          code: `IngestionTick:
  data_ts: int       # When the event occurred (source time)
  arrival_ts: int    # When the system received it
  domain: str        # e.g., "ohlcv", "option_chain", "sentiment"
  symbol: str        # Instrument identifier
  payload: dict      # Domain-specific data`,
        },
        {
          heading: 'Timestamp Semantics',
          body: null,
          list: [
            { term: 'data_ts', def: 'The timestamp of the underlying event at the source. Used for legality checks and snapshot visibility.' },
            { term: 'arrival_ts', def: 'When the tick was received by the ingestion layer. Used for latency analysis, not execution logic.' },
            { term: 'step_ts', def: 'The current simulation/execution timestamp, set by the Driver.' },
          ],
        },
        {
          heading: 'Invariants',
          body: null,
          list: [
            { term: 'Immutability', def: 'Ticks are never modified after creation.' },
            { term: 'Visibility', def: 'A tick is visible at step_ts iff data_ts <= step_ts.' },
            { term: 'Monotonicity', def: 'step_ts must be monotonically increasing within a run.' },
          ],
        },
      ],
    },
  },
  {
    id: 'runtime_semantics',
    title: 'Runtime Semantics',
    shortTitle: 'Runtime',
    content: {
      purpose: 'Step clock rules, time checks, and runtime flow.',
      sections: [
        {
          heading: 'Single Step Clock',
          body: `The Driver advances time. The Engine validates timestamps and does not choose them. Only the Driver sets step order and pace.`,
        },
        {
          heading: 'Layer Responsibilities',
          body: null,
          table: {
            headers: ['Layer', 'Owns Time?', 'Responsibility'],
            rows: [
              ['Strategy', 'No', 'Declare structure and intent only'],
              ['Feature', 'No', 'Snapshot/windowed computation'],
              ['DataHandler', 'No', 'Cache + anti-lookahead gates'],
              ['Engine', 'No', 'Runtime orchestration'],
              ['Driver', 'Yes', 'Single step clock'],
            ],
          },
        },
        {
          heading: 'No Lookahead Guarantees',
          body: null,
          list: [
            { term: 'Strategies never pull data', def: 'They declare dependencies; runtime provides snapshots.' },
            { term: 'Features never advance time', def: 'They receive step_ts and compute on visible data.' },
            { term: 'DataHandlers never decide arrival', def: 'They cache ticks and filter by visibility.' },
            { term: 'Engine never infers timestamps', def: 'All timestamps originate from Driver.' },
          ],
        },
      ],
    },
  },
  {
    id: 'ingestion_boundary',
    title: 'Ingestion Boundary',
    shortTitle: 'Ingestion',
    content: {
      purpose: 'Boundary between external data and runtime, plus readiness rules.',
      sections: [
        {
          heading: 'The Boundary',
          body: `SoionLab separates data ingestion from the runtime. Ingestion is an external subsystem; the runtime never touches raw data sources.`,
          code: `WORLD -> Ingestion -> Tick -> Driver -> Engine -> DataHandler`,
        },
        {
          heading: 'What Runtime Never Does',
          body: null,
          list: [
            { term: 'Fetch data', def: 'Runtime only receives normalized ticks from Driver.' },
            { term: 'Know provenance', def: 'Strategy/Engine/DataHandler never know data source.' },
            { term: 'Block on I/O', def: 'Ingestion may block; runtime is single-threaded and event-driven.' },
            { term: 'Parse raw formats', def: 'All normalization happens in Ingestion layer.' },
          ],
        },
        {
          heading: 'Hard Readiness vs Soft Degradation',
          body: null,
          list: [
            { term: 'Hard (grid-based)', def: 'OHLCV bars must be closed before visible. Violation blocks execution.' },
            { term: 'Soft (non-grid)', def: 'Option chain, sentiment: warnings logged, execution continues.' },
          ],
        },
      ],
    },
  },
  {
    id: 'strategy',
    title: 'Strategy Spec',
    shortTitle: 'Strategy',
    content: {
      purpose: 'Template declaration, binding, and runtime wiring.',
      sections: [
        {
          heading: 'Strategy as Template',
          body: `A strategy class is a static template, not a runtime object. It declares structure but has no state or I/O. Strategy declares structure; state lives in Features/Model; decisions use snapshots.`,
        },
        {
          heading: 'Lifecycle',
          body: null,
          list: [
            { term: 'Declaration', def: 'Template uses placeholders like {A} and {B}.' },
            { term: 'Binding', def: 'bind() resolves placeholders to concrete symbols.' },
            { term: 'Loading', def: 'StrategyLoader wires components. No time has advanced.' },
            { term: 'Execution', def: 'Driver calls engine.step(ts). Time advances here.' },
          ],
        },
        {
          heading: 'Naming Conventions',
          body: null,
          list: [
            { term: 'Registry IDs', def: 'Kebab-case (RSI-MEAN, ATR-SIZER). Type identifiers, never parsed.' },
            { term: 'Runtime names', def: 'TYPE_PURPOSE_SYMBOL format (RSI_DECISION_BTCUSDT). Underscore-delimited.' },
          ],
        },
        {
          heading: 'Complex Examples',
          body: `(example: complex strategy example placeholder)`,
        },
      ],
    },
  },
  {
    id: 'logging',
    title: 'Logging',
    shortTitle: 'Logging',
    content: {
      purpose: 'Audit logs, schema, and failure signatures.',
      sections: [
        {
          heading: 'Purpose',
          body: `Logs support inspection of what happened, when, and why.`,
        },
        {
          heading: 'Log Schema',
          body: null,
          code: `{
  "ts": 1640995200000,
  "event": "soft_domain.not_ready",
  "domain": "option_chain",
  "symbol": "BTC-31DEC21",
  "step_ts": 1640995200000,
  "reason": "no_snapshot"
}`,
        },
        {
          heading: 'Common Failure Signatures',
          body: null,
          list: [
            { term: 'backtest.closed_bar.not_ready', def: 'Hard readiness failure: OHLCV bar not closed at step_ts.' },
            { term: 'soft_domain.not_ready', def: 'Soft degradation: non-grid domain has no valid snapshot.' },
            { term: 'step.monotonicity.violation', def: 'step_ts decreased (should never happen).' },
            { term: 'tick.visibility.future', def: 'Tick with data_ts > step_ts was accessed (lookahead).' },
          ],
        },
      ],
    },
  },
  {
    id: 'sample_data',
    title: 'Sample Data',
    shortTitle: 'Sample Data',
    content: {
      purpose: 'Bundled fixtures for semantics tests.',
      sections: [
        {
          heading: 'What Sample Data Is For',
          body: `Files under data/sample/ are small fixtures for wiring checks. They test contract enforcement, not strategy results.`,
        },
        {
          heading: 'Intended Use',
          body: null,
          list: [
            { term: 'Wiring validation', def: 'Verify engine initialization and component assembly.' },
            { term: 'Readiness checks', def: 'Trigger hard/soft readiness behavior.' },
            { term: 'Log inspection', def: 'Produce traces for schema checks.' },
          ],
        },
        {
          heading: 'Not Intended For',
          body: null,
          list: [
            { term: 'Performance evaluation', def: 'Coverage is too small for metrics.' },
            { term: 'Statistical inference', def: 'Sample size is too small.' },
            { term: 'Strategy development', def: 'Use real data sources for research.' },
          ],
        },
      ],
    },
  },
  {
    id: 'install',
    title: 'Installation',
    shortTitle: 'Install',
    content: {
      purpose: 'Build and run commands.',
      sections: [
        {
          heading: 'Requirements',
          body: `Python 3.11 or 3.12. Ubuntu 22.04 LTS or macOS.`,
        },
        {
          heading: 'Quick Setup (venv)',
          body: null,
          code: `python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt && pip install -e .`,
        },
        {
          heading: 'Run Sample',
          body: null,
          code: `python apps/run_sample.py`,
        },
        {
          heading: 'Run Tests',
          body: null,
          code: `pytest -q -m "not local_data" tests`,
        },
      ],
    },
  },
];

const DocContent = ({ doc }) => {
  return (
    <article className="doc-article">
      <header className="doc-header">
        <h2 className="doc-title">{doc.title}</h2>
        <p className="doc-purpose">{doc.content.purpose}</p>
      </header>

      <div className="doc-body">
        {doc.content.sections.map((section, idx) => (
          <section key={idx} className="doc-section">
            <h3 className="section-heading">{section.heading}</h3>

            {section.body && (
              <p className="section-body">{section.body}</p>
            )}

            {section.code && (
              <pre className="section-code"><code>{section.code}</code></pre>
            )}

            {section.list && (
              <dl className="section-list">
                {section.list.map((item, i) => (
                  <div key={i} className="list-item">
                    <dt>{item.term}</dt>
                    <dd>{item.def}</dd>
                  </div>
                ))}
              </dl>
            )}

            {section.table && (
              <div className="section-table-wrapper">
                <table className="section-table">
                  <thead>
                    <tr>
                      {section.table.headers.map((h, i) => (
                        <th key={i}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {section.table.rows.map((row, i) => (
                      <tr key={i}>
                        {row.map((cell, j) => (
                          <td key={j}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ))}
      </div>
    </article>
  );
};

const SoionLab = () => {
  const entryDocIds = [
    'overview',
    'contract_spec',
    'runtime_semantics',
    'ingestion_boundary',
    'strategy',
    'logging',
    'sample_data',
    'install',
  ];
  const entryDocs = DOCS.filter(doc => entryDocIds.includes(doc.id));
  const [activeDoc, setActiveDoc] = useState(entryDocs[0]?.id || 'contract_spec');

  const currentDoc = DOCS.find(d => d.id === activeDoc);

  return (
    <div className="soionlab-docs-container">
      <header className="soionlab-page-header">
        <h1 className="soionlab-page-title">SoionLab</h1>
        <p className="soionlab-page-subtitle">
          Research inspection surface for execution semantics and constraints.
        </p>
        <p className="soionlab-page-subtitle soionlab-page-subtitle-secondary">
          Focus on visibility, timing, and readiness under imperfect data.
        </p>
      </header>

      <section className="soionlab-banner">
        <p className="banner-line">
          <span className="banner-label">Failure mode:</span> event time and arrival time are collapsed.
        </p>
        <p className="banner-line">
          <span className="banner-label">Constraint:</span> step clock + visibility rules are enforced.
        </p>
        <p className="banner-line">
          <span className="banner-label">Scope:</span> inspectable visibility, readiness, and audit traces.
        </p>
        <p className="banner-line">
          <span className="banner-label">Artifact chain:</span> event time vs arrival time → visibility policy → audit trace → visible data at step N.
        </p>
      </section>

      <section className="soionlab-constraints">
        <div className="constraint-card">
          <h2>Two clocks: event vs arrival</h2>
          <ul>
            <li>Each tick carries event time and arrival time.</li>
            <li>Logs preserve both clocks per step.</li>
            <li>Visibility uses event time only.</li>
          </ul>
        </div>
        <div className="constraint-card">
          <h2>Single step clock</h2>
          <ul>
            <li>Only the Driver advances step_ts.</li>
            <li>All components consume the same step_ts.</li>
            <li>Step order is monotonic.</li>
          </ul>
        </div>
        <div className="constraint-card">
          <h2>Explicit readiness policy</h2>
          <ul>
            <li>Readiness rules are declared per domain.</li>
            <li>Hard failures block execution.</li>
            <li>Soft failures write an audit event.</li>
          </ul>
        </div>
      </section>

      <section className="soionlab-artifacts">
        <div className="artifact-card">
          <p className="artifact-title">Code</p>
          <p className="artifact-subtitle">Tick schema + visibility rule</p>
          <p className="artifact-placeholder">(example: code snippet placeholder)</p>
        </div>
        <div className="artifact-card">
          <p className="artifact-title">Diagram</p>
          <p className="artifact-subtitle">Ingestion boundary + step clock</p>
          <p className="artifact-placeholder">(example: diagram placeholder)</p>
        </div>
        <div className="artifact-card">
          <p className="artifact-title">Trace</p>
          <p className="artifact-subtitle">Audit trace: what was visible at step N</p>
          <p className="artifact-note">Fields include step_ts, data_ts, arrival_ts, event.</p>
        </div>
      </section>

      <section className="soionlab-entrypoints">
        <header className="entrypoints-header">
          <h2>Deep Documentation</h2>
          <p>Drill-down references for contracts, semantics, and boundaries.</p>
        </header>
        <label className="entrypoints-select-label" htmlFor="soionlab-doc-select">
          Select a document
        </label>
        <select
          id="soionlab-doc-select"
          className="entrypoints-select"
          value={activeDoc}
          onChange={(event) => setActiveDoc(event.target.value)}
        >
          {entryDocs.map(doc => (
            <option key={doc.id} value={doc.id}>
              {doc.title}
            </option>
          ))}
        </select>
        <ul className="entrypoints-list">
          {entryDocs.map(doc => (
            <li key={doc.id}>
              <button
                className={`entrypoint-button ${activeDoc === doc.id ? 'active' : ''}`}
                onClick={() => setActiveDoc(doc.id)}
              >
                <span className="entrypoint-title">{doc.title}</span>
                <span className="entrypoint-purpose">{doc.content.purpose}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="soionlab-docs-main">
        {currentDoc && <DocContent doc={currentDoc} />}
      </section>
    </div>
  );
};

export default SoionLab;
