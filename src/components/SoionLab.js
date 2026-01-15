import React, { useState, useEffect } from 'react';

const DOCS = [
  {
    id: "semantics",
    title: "Semantics",
    shortTitle: "Semantics",
    content: {
      purpose: "Rules for time, visibility, and step execution.",
      sections: [
        {
          heading: "Time Model",
          body: `SoionLab separates event time from arrival time.
Only the Driver advances the execution clock (step_ts).`,
        },
        {
          heading: "Visibility Rule",
          body: null,
          list: [
            { term: "data_ts", def: "When the event occurred at the source." },
            { term: "arrival_ts", def: "When the system received it (diagnostic only)." },
            { term: "step_ts", def: "Current execution step timestamp (Driver-owned)." },
            { term: "Visibility", def: "Data is visible iff data_ts ≤ step_ts." },
          ],
        },
        {
          heading: "Execution Invariants",
          body: null,
          list: [
            { term: "Single clock", def: "Only the Driver sets step_ts." },
            { term: "No lookahead", def: "Accessing future data is a contract violation." },
            { term: "Monotonicity", def: "step_ts must strictly increase." },
          ],
        },
      ],
    },
  },
  {
    id: "boundaries",
    title: "Boundaries",
    shortTitle: "Boundaries",
    content: {
      purpose: "Where data enters, and where runs may block or degrade.",
      sections: [
        {
          heading: "Ingestion Boundary",
          body: "Ingestion is external. The runtime never fetches or parses raw data.",
          code: `WORLD → Ingestion → Tick → Driver → Engine`,
        },
        {
          heading: "Readiness Policy",
          body: null,
          list: [
            { term: "Hard readiness", def: "Required grid data must be present." },
            { term: "Soft readiness", def: "Optional domains may be missing; an event is logged." },
          ],
        },
        {
          heading: "Failure Modes",
          body: "Failures are surfaced as explicit events, not silently absorbed.",
        },
      ],
    },
  },
  {
    id: "artifacts",
    title: "Artifacts",
    shortTitle: "Artifacts",
    content: {
      purpose: "What you can inspect after a run.",
      sections: [
        {
          heading: "Step Traces",
          body: "Each execution step emits a structured trace.",
        },
        {
          heading: "Audit Logs",
          body: null,
          code: `{
  "event": "soft_domain.not_ready",
  "domain": "option_chain",
  "symbol": "BTCUSDT",
  "step_ts": ...,
  "...": "..."
}`,
        },
        {
          heading: "Reproducibility",
          body: "Artifacts allow reconstructing what the system knew at each step.",
        },
      ],
    },
  },
  {
    id: "strategy",
    title: "Strategy Templates",
    shortTitle: "Strategy",
    content: {
      purpose: "Declarative templates for intent (no time, no I/O).",
      sections: [
        {
          heading: "Template Definition",
          body: `Strategies declare structure and dependencies.
They do not own time, I/O, or execution.`,
        },
        {
          heading: "Lifecycle",
          body: null,
          list: [
            { term: "Declare", def: "Define placeholders and dependencies." },
            { term: "Bind", def: "Resolve placeholders to symbols/params." },
            { term: "Execute", def: "Driver advances steps." },
          ],
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
        {doc.content.sections.map((section, idx) => {
          const sectionId =
            (doc.id ? `${doc.id}-` : "") +
            (section.heading || `section-${idx}`)
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/(^-|-$)/g, "");

          return (
            <section key={idx} className="doc-section" id={sectionId}>
              <h3 className="section-heading">
                {section.heading}
              </h3>

              {section.body && (
                // preserves intentional newlines without introducing <pre>
                <p className="section-body" style={{ whiteSpace: "pre-line" }}>
                  {String(section.body).trim()}
                </p>
              )}

              {section.code && (
                <pre className="section-code">
                  <code>{String(section.code).trim()}</code>
                </pre>
              )}

              {section.list && (
                <dl className="section-list">
                  {section.list.map((item, i) => (
                    <React.Fragment key={i}>
                      <dt className="list-term">{item.term}</dt>
                      <dd className="list-def">{item.def}</dd>
                    </React.Fragment>
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
          );
        })}
      </div>
    </article>
  );
};

const MODES = {
  use: {
    label: 'How to use',
    sections: [
  {
    id: "declared-surface",
    title: "Declaration surface",
    summary: "Bind symbols/params to a strategy template in /apps/run_*.py.",
    bullets: [
      "Select strategy name.",
      "Bind placeholders to concrete values.",
      "Set the replay window (start timestamp and end timestamp).",
    ],
    code: `STRATEGY_NAME = "EXAMPLE"
BIND_SYMBOLS = {"A":"BTCUSDT","B":"ETHUSDT","PARAM1":14, "...":"..."}  # fills template placeholders
START_TS = 1766966400000  # 2025-12-29 00:00:00 UTC (epoch ms)
END_TS   = 1767052800000  # 2025-12-30 00:00:00 UTC (epoch ms)
`,
  },

  {
    id: "run-a-backtest",
    title: "Run a backtest",
    summary: "Execute the run and inspect artifacts.",
    bullets: [
      "Run the entry script.",
      "Per-step traces/logs are written for audit.",
      "Outputs: /artifacts/run/<run_id>/*.jsonl",
    ],
    code: `python apps/run_backtest.py`,
  },

  {
    id: "strategy-design",
    title: "Strategy design",
    summary: "Strategy templates live in /apps/strategy/*.py (data needs + wiring).",
    bullets: [
      "Declare data requirements and placeholders.",
      "Keep optional feeds as soft-readiness (non-blocking when missing).",
      "Layer configs are defined here (features/model/risk/execution/portfolio).",
    ],
    code: `(strategy template excerpt — see source)
@register_strategy("EXAMPLE")
class ExampleStrategy(StrategyBase):
    STRATEGY_NAME="EXAMPLE"; INTERVAL="30m"
    UNIVERSE_TEMPLATE={..., "soft_readiness":{...}}
    DATA={...}; REQUIRED_DATA={...}
    FEATURES_USER=[...]; MODEL_CFG={...}; DECISION_CFG={...}
    RISK_CFG={...}; EXECUTION_CFG={...}; PORTFOLIO_CFG={...}
`,
  },
]
  },
  audit: {
    label: 'Audit logs & traces',
    sections: [
      {
        id: 'trace-step',
        title: 'Per-step trace',
        summary: 'One JSON row per driver step: state, inputs, and guardrails frozen at each step.',
        bullets: [
  'Each step records exactly what the strategy saw at that moment: features, model outputs, portfolio state, and market data.',
  'The trace stores timing checks (last step time and per-data-stream progress) to make time ordering explicit.',
  'For price bars, the trace shows whether the bar was fully closed before the step (with expected vs actual timestamps).',

        ],
        code: `log_step_trace(
    step_ts, feature_output, model_output, decision_score,
    target_position, order_fills, execution_outcomes, portfolio_state,
    market_snapshots, guardrails_checks, ## check timestamp, ticks' visibilities

    # --- part of guardrail checks, better readability ---
    expected_visible_end_ts, # OHLCV expected visible end ts
    actual_last_ts, # primary symbol OHLCV last visible tick ts -- for lookahead check
    closed_bar_ready # OHLCV readiness status, check lookahead,
)`,
      },
      {
      id: 'asyncio-health',
      title: 'Async runtime health',
      summary: 'Dedicated asyncio.jsonl surfaces scheduling and backpressure without polluting trace.',
      bullets: [
  'Separate runtime logs record slow or blocked background tasks (e.g. file replay or parsing), without affecting strategy logic.',
  'These logs explain why some data sources may arrive late even though the strategy logic itself is deterministic.',
      ],
      code: `## Example asyncio audit log
{"event":"asyncio.to_thread.exec_slow",
 "operation":"sync_iter_next","fn_ms":112,
 "worker":"OptionChainWorker","domain":"option_chain","symbol":"BTCUSDT"}`,
    },
    {
      id: 'default-events',
      title: 'Runtime + ingestion events',
      summary: 'default.jsonl records lifecycle, errors, and stop reasons for post-mortem.',
      bullets: [
  'Lifecycle events (worker start and stop, cancellations, errors) are recorded with context for debugging.',
  'Critical failures stop the run with full diagnostics; non-critical issues are logged and the system continues.',
      ],
      code: `## Example default audit log
{"event":"ingestion.worker_stop",
 "worker":"OHLCVWorker","domain":"ohlcv",
 "symbol":"BTCUSDT","stop_reason":"cancelled","poll_seq":2988}`,
    },
      {
      id: 'post-hoc',
      title: 'Post-hoc reconstruction',
      summary: 'Trace is sufficient to reconstruct “what the strategy saw” per step without re-reading data sources.',
      bullets: [
'All traces can be replayed after the run to reconstruct exactly what data was visible at each step.',
  'Timing checks allow verification that no future data leaked into the strategy decisions.',
      ],
      code: `# invariants you can assert offline from trace.jsonl
assert trace.step_ts == trace.guardrails.last_step_ts
assert trace.actual_last_ts >= trace.expected_visible_end_ts
assert all(v.numeric.data_ts <= trace.step_ts for v in trace.market_snapshots.ohlcv.values())`,
    },
    ],
  },
};

const referenceSummaries = {
  semantics: 'Time model, visibility rule, and execution invariants.',
  boundaries: 'Ingestion boundary, readiness policy, and failure modes.',
  artifacts: 'Traces and audit logs emitted by each run.',
  strategy: 'Declarative strategy templates and their lifecycle.',
};

const DeepDocsGrid = ({ items, active, onSelect }) => (
  <div className="deep-docs-grid">
    {items.map(item => (
      <button
        key={item.id}
        type="button"
        className={`deep-doc-item ${active === item.id ? 'active' : ''}`}
        onClick={() => onSelect(item.id)}
        aria-pressed={active === item.id}
      >
        <span className="deep-doc-title">{item.title}</span>
        <span className="deep-doc-desc">{item.desc}</span>
      </button>
    ))}
  </div>
);

const SoionLab = () => {
  const entryDocIds = ['semantics', 'boundaries', 'artifacts', 'strategy'];
  const entryDocs = DOCS.filter(doc => entryDocIds.includes(doc.id));
  const [activeDoc, setActiveDoc] = useState(entryDocs[0]?.id || 'semantics');
  const [activeTab, setActiveTab] = useState('use');
  const [activeSection, setActiveSection] = useState(MODES.use.sections[0].id);

  useEffect(() => {
    setActiveSection(MODES[activeTab].sections[0].id);
  }, [activeTab]);

  const currentDoc = entryDocs.find(d => d.id === activeDoc);
  const mode = MODES[activeTab];
  const section = mode.sections.find(sec => sec.id === activeSection) || mode.sections[0];
  const referenceItems = entryDocs.map(doc => ({
    id: doc.id,
    title: doc.title,
    desc: referenceSummaries[doc.id] || doc.content.purpose,
  }));

  return (
    <div className="soionlab-docs-container">
      <header className="soionlab-page-header">
        <div className="soionlab-title-row">
          <h1 className="soionlab-page-title">SoionLab</h1>
          <a
            className="soionlab-github-link"
            href="https://github.com/ZBaiY/SoionLab"
            target="_blank"
            rel="noreferrer noopener"
            aria-label="SoionLab source code on GitHub"
          >
            View source (GitHub)
          </a>
        </div>
        <p className="soionlab-page-subtitle">
          Research inspection surface for execution semantics and constraints.
        </p>
      </header>

      <div className="soionlab-tabs" role="tablist">
        {Object.entries(MODES).map(([key, tab]) => (
          <button
            key={key}
            type="button"
            role="tab"
            className={`soionlab-tab-button ${activeTab === key ? 'active' : ''}`}
            onClick={() => setActiveTab(key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="soionlab-layout">
        <aside className="soionlab-sidebar">
          <ul>
            {mode.sections.map((sec) => (
              <li key={sec.id}>
                <button
                  type="button"
                  className={`soionlab-section-tab ${activeSection === sec.id ? 'active' : ''}`}
                  onClick={() => setActiveSection(sec.id)}
                >
                  {sec.title}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <main className="soionlab-main-content">
          <h2>{section.title}</h2>
          {section.summary && <p className="section-summary">{section.summary}</p>}
          <ul className="section-bullets">
            {section.bullets.map((bullet, idx) => (
              <li key={idx}>{bullet}</li>
            ))}
          </ul>
          <pre className="section-code"><code>{section.code}</code></pre>
        </main>
      </div>

      <section className="failure-card">
  <h2>Failure case (boundary example)</h2>

  <p>
    <span className="text-accent">Option-chain updates arrive late</span> — after the system has already advanced to the
    next evaluation step — so the run continues with <span className="text-accent">outdated option snapshots</span>.
  </p>

  <p>
    Many standard workflows quietly <span className="text-accent">reuse the last value</span> and keep going, without recording
    that the option data was missing at that step.
  </p>

  <p className="failure-note">
    This is a boundary where <span className="text-accent">data availability changes what the result means</span>.
  </p>

  <div className="failure-columns">
    <div className="failure-list">
      <p className="failure-heading">What standard workflows do</p>
      <ul>
        <li>Assume delayed data is current.</li>
        <li>Reuse old values when updates are missing.</li>
        <li>Leave no record of incomplete inputs.</li>
      </ul>
    </div>

    <div className="failure-list">
      <p className="failure-heading">What is flagged here</p>
      <ul>
        <li>Missing option data is detected explicitly.</li>
        <li>The missing input is recorded as an event.</li>
        <li>The run remains inspectable after the fact.</li>
      </ul>
    </div>
  </div>

  <pre className="section-code">
    <code>{`{
  "ts_ms": 1766838600000,
  "level": "WARNING",
  "event": "soft_domain.not_ready",
  "context": {
    "domain": "option_chain",
    "symbol": "BTCUSDT",
    "last_data_ts": 1766832244603,
    "staleness_ms": 6355397,
    "reasons": ["missing"],
    "max_staleness_ms": 5,
    "run_id": "EXAMPLE20260115T163551Z",
    "mode": "default",
    "...": "..."
  }
}`}</code>
  </pre>
</section>

      <section className="soionlab-entrypoints">
        <header className="entrypoints-header">
          <h2>Deep documentation reference</h2>
          <p>Reference index for contracts, semantics, and boundaries.</p>
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
        <DeepDocsGrid items={referenceItems} active={activeDoc} onSelect={setActiveDoc} />
      </section>

      <section className="soionlab-docs-main">
        {currentDoc && <DocContent doc={currentDoc} />}
      </section>
    </div>
  );
};

export default SoionLab;
