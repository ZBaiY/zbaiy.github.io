import React from 'react';

const Home = ({ onNavigate }) => {
  return (
    <div className="home-container fade-in">
      <section className="hero-section">
        <h1 className="hero-title">
          Quantitative Research <br />
          <span className="text-accent">→ Execution</span>
        </h1>
        <p className="hero-subtitle">
          Explicit time semantics. Execution modeling. Reproducibility.
        </p>
        <div className="hero-actions">
          <button className="btn-primary" onClick={() => onNavigate('SOIONLAB')}>
            Explore SoionLab
          </button>
          <button className="btn-secondary" onClick={() => onNavigate('PROJECTS')}>
            View Projects
          </button>
        </div>
      </section>

      <section className="about-section">
        <div className="about-card">
          <h2>About Me</h2>
          <p>
            I am a <strong>PhD student in theoretical physics</strong> at the Weizmann Institute of Science.
            My work focuses on making research results execution-valid through a strict separation 
            between structure and dynamics.
          </p>
          <p>
            I build systems where backtest, mock, and live trading share one runtime semantics — 
            time is owned by the Driver and never inferred by the model.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;
