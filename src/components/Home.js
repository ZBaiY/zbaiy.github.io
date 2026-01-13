import React from 'react';

const Home = ({ onNavigate }) => {
  return (
    <div className="home-container fade-in">
      <section className="hero-section">
        <h1 className="hero-title">
          Quantitative Research <span className="text-accent">→ Execution Semantics</span>
        </h1>
        <p className="hero-subtitle">
          Research on time semantics, execution modeling, and reproducibility.
        </p>
        <div className="hero-actions">
          <button className="btn-primary hero-cta" onClick={() => onNavigate('SOIONLAB')}>
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
            I study systems where backtest and mock runs share one runtime semantics — 
            time is owned by the Driver and never inferred by the model.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;
