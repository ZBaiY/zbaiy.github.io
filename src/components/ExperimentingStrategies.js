import React from 'react';

const Emphasis = ({ children }) => <strong className="note-emphasis">{children}</strong>;

const experimentCards = [
  {
    title: 'RSI + IV Conditioning',
    domain: 'OHLCV + Option Chain',
    thesis: 'An early attempt to extend RSI threshold logic with option-chain implied-volatility context.',
    whyExplored: 'This branch explored whether IV state could improve threshold shaping beyond OHLCV alone while staying close to an RSI-based decision path.',
    learned: 'The current IV notes suggest tenor choice matters: shorter-tenor IV is materially noisier, while medium tenors look more defensible for early prototypes.',
    status: 'The idea remains relevant, but the available history is still too short to support promoting it over the simpler OHLCV-led route.',
  },
  {
    title: 'MACD + ADX Gateway',
    domain: 'Trend Contrast Study',
    thesis: 'A trend-oriented contrast branch testing MACD-style momentum against the RSI-centered sideways route.',
    whyExplored: 'MACD is naturally more trend-seeking than RSI, so it served as a legitimate alternative route for capturing BTCUSDT structure under regime filters.',
    learned: 'Under ADX gating and regime filtering, the branch remained informative as a contrast study, but robustness was weaker than the final RSI-centered route.',
    status: 'It was kept as a real research branch, but the evidence did not support selecting it as the main showcased direction.',
  },
  {
    title: 'Random Forest Dynamic RSI',
    domain: 'ML Threshold Modeling',
    thesis: 'A machine-learning branch testing whether Random Forest models could learn dynamic RSI threshold behavior more effectively than simpler rules.',
    whyExplored: 'This branch explored whether a learned model could improve dynamic RSI thresholding enough to justify moving beyond simpler hand-built logic.',
    learned: 'The results were not sufficiently compelling relative to simpler approaches, so the added modeling complexity did not earn promotion.',
    status: 'The result is included as a negative finding: ML was explored, but the evidence did not support adopting that route.',
  },
];

const ExperimentingStrategies = () => {
  return (
    <div className="strategy-showcase fade-in">
      <section className="strategy-hero">
        <div className="strategy-hero-copy">
          <p className="strategy-kicker">Research-Stage Strategies</p>
          <h1>Experimenting Strategies</h1>
          <p className="strategy-description">
            Additional research branches that were explored, compared, and in some cases discarded.
            The point of this section is to show comparative research process, not to present three equal finalists.
          </p>
        </div>
      </section>

      <section className="experiments-grid" aria-label="Experimenting strategies">
        {experimentCards.map((card) => (
          <details key={card.title} className="experiment-card">
            <summary className="experiment-summary">
              <div className="experiment-card-header">
                <span className="experiment-label">Research Branch</span>
                <span className="experiment-domain">{card.domain}</span>
              </div>
              <h2 className="experiment-title">{card.title}</h2>
              <p className="experiment-description">{card.thesis}</p>
              <span className="experiment-toggle">View details</span>
            </summary>
            <div className="experiment-detail-list" aria-label={`${card.title} details`}>
              <div className="experiment-detail">
                <span>Why explored</span>
                <p>
                  {card.title === 'RSI + IV Conditioning' ? (
                    <>This branch explored whether <Emphasis>IV state</Emphasis> could improve threshold shaping beyond OHLCV alone while staying close to an <Emphasis>RSI-based decision path</Emphasis>.</>
                  ) : card.title === 'MACD + ADX Gateway' ? (
                    <>MACD is naturally more trend-seeking than RSI, so it served as a legitimate <Emphasis>trend-oriented contrast</Emphasis> for capturing BTCUSDT structure under <Emphasis>regime filters</Emphasis>.</>
                  ) : (
                    <>This branch explored whether a learned model could improve <Emphasis>dynamic RSI thresholding</Emphasis> enough to justify moving beyond <Emphasis>simpler hand-built logic</Emphasis>.</>
                  )}
                </p>
              </div>
              <div className="experiment-detail">
                <span>What we learned</span>
                <p>
                  {card.title === 'RSI + IV Conditioning' ? (
                    <>The current IV notes suggest tenor choice matters: <Emphasis>shorter-tenor IV is materially noisier</Emphasis>, while <Emphasis>medium tenors</Emphasis> look more defensible for early prototypes.</>
                  ) : card.title === 'MACD + ADX Gateway' ? (
                    <>Under ADX gating and regime filtering, the branch remained informative as a contrast study, but <Emphasis>robustness was weaker</Emphasis> than the final <Emphasis>RSI-centered route</Emphasis>.</>
                  ) : (
                    <>The results were <Emphasis>not sufficiently compelling</Emphasis> relative to simpler approaches, so the added modeling complexity did not earn promotion.</>
                  )}
                </p>
              </div>
              <div className="experiment-detail">
                <span>Current status</span>
                <p>
                  {card.title === 'RSI + IV Conditioning' ? (
                    <>The idea remains relevant, but the available history is still too short to support promoting it over the <Emphasis>simpler OHLCV-led route</Emphasis>.</>
                  ) : card.title === 'MACD + ADX Gateway' ? (
                    <>It was kept as a real research branch, but the evidence did <Emphasis>not support selecting it</Emphasis> as the main showcased direction.</>
                  ) : (
                    <>The result is included as a <Emphasis>negative finding</Emphasis>: ML was explored, but the evidence did <Emphasis>not support adopting that route</Emphasis>.</>
                  )}
                </p>
              </div>
            </div>
          </details>
        ))}
      </section>

      <p className="experiments-takeaway">
        Stronger research comes from comparing alternatives and discarding complexity when the evidence does not support it.
      </p>
    </div>
  );
};

export default ExperimentingStrategies;
