import React, { useState } from 'react';

const ArchitectureFlow = () => (
  <div className="arch-flow">
    <div className="arch-step" data-step="1">
      <span className="step-label">Layer 0</span>
      <strong>Data Sources</strong>
      <small>Trades, Market Data, Alt Data</small>
    </div>
    <div className="arch-arrow">↓</div>
    <div className="arch-step" data-step="2">
      <span className="step-label">Layer 1</span>
      <strong>Ingestion</strong>
      <small>Normalization, Persistence</small>
    </div>
    <div className="arch-arrow">↓</div>
    <div className="arch-step" data-step="3">
      <span className="step-label">Layer 2</span>
      <strong>Feature Extraction</strong>
      <small>TA, Microstructure, Sentiment</small>
    </div>
    <div className="arch-arrow">↓</div>
    <div className="arch-step" data-step="4">
      <span className="step-label">Layer 3-5</span>
      <strong>Model → Decision → Risk</strong>
      <small>Signal Fusion, Sizing</small>
    </div>
    <div className="arch-arrow">↓</div>
    <div className="arch-step" data-step="5">
      <span className="step-label">Layer 6</span>
      <strong>Execution</strong>
      <small>Router, Slippage, Matching</small>
    </div>
  </div>
);

const SoionLab = () => {
  const [activeSection, setActiveSection] = useState('OVERVIEW');

  return (
    <div className="soionlab-container fade-in">
      <aside className="soionlab-sidebar">
        <div className="sidebar-header">
          <h2>SoionLab</h2>
          <div className="badges">
            <span className="badge badge-blue">Python 3.11+</span>
            <span className="badge badge-green">CI Passing</span>
          </div>
        </div>
        <nav className="sidebar-nav">
          <button 
            className={activeSection === 'OVERVIEW' ? 'active' : ''} 
            onClick={() => setActiveSection('OVERVIEW')}
          >
            Overview & Core Principles
          </button>
          <button 
            className={activeSection === 'ARCHITECTURE' ? 'active' : ''} 
            onClick={() => setActiveSection('ARCHITECTURE')}
          >
            Architecture
          </button>
          <button 
            className={activeSection === 'CODE' ? 'active' : ''} 
            onClick={() => setActiveSection('CODE')}
          >
            Code Structure
          </button>
        </nav>
      </aside>

      <main className="soionlab-main">
        {activeSection === 'OVERVIEW' && (
          <div className="content-block fade-in">
            <h3>Contract-Driven Quant Research</h3>
            <p className="lead">
              SoionLab is a framework with <strong>one unified runtime semantics</strong> across Backtest, Mock, and Live trading.
            </p>
            
            <div className="principle-cards">
              <div className="card">
                <h4>Single Time Authority</h4>
                <p>
                  The <strong>Driver</strong> owns time. The Engine and Strategy never infer or advance time themselves. 
                  This guarantees zero lookahead bias by design.
                </p>
              </div>
              <div className="card">
                <h4>Explicit Contracts</h4>
                <p>
                  Components communicate via Protocol Buffers/Contracts. Logic boundaries are enforced, preventing
                  implicit state leakage.
                </p>
              </div>
              <div className="card">
                <h4>Ingestion Boundary</h4>
                <p>
                  Runtime never touches raw data sources. It only consumes normalized, immutable ticks provided by the Ingestion layer.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'ARCHITECTURE' && (
          <div className="content-block fade-in">
            <h3>System Architecture</h3>
            <p>
              Data flows through strict layers. Each layer depends only on contracts, not implementations.
            </p>
            <ArchitectureFlow />
            
            <div className="info-box">
              <h5>Event-Driven → Contract-Driven</h5>
              <p>
                Earlier legacy bots relied on implicit control flow. SoionLab keeps the runtime event-driven,
                but logic boundaries are enforced by strict contracts.
              </p>
            </div>
          </div>
        )}

        {activeSection === 'CODE' && (
          <div className="content-block fade-in">
            <h3>Strategy Structure</h3>
            <p>
              Strategies are static templates. They declare structure but contain no state or time semantics.
            </p>
            
            <div className="code-window">
              <div className="code-header">
                <span className="dot red"></span>
                <span className="dot yellow"></span>
                <span className="dot green"></span>
                <span className="title">example_strategy.py</span>
              </div>
              <pre>
{`# 1) Define strategy template (Stateless)
strategy_tpl = ExampleStrategy()

# 2) Bind concrete universe (Structural only)
strategy = strategy_tpl.bind(
    A="BTCUSDT",
    B="ETHUSDT",
)

# 3) Assembly: BoundStrategy -> StrategyEngine
# No time has advanced yet.
engine = StrategyLoader.from_config(
    strategy=strategy,
    mode=EngineMode.BACKTEST,
)

# 4) Driver: The Single Time Authority
BacktestEngine(
    engine=engine,
    start_ts=1640995200.0,
    end_ts=1672531200.0,
).run()`}
              </pre>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default SoionLab;
