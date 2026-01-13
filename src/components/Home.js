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
            I am a PhD researcher in theoretical physics at the Weizmann Institute of Science. From particle and field-theoretic models to quantitative, time-dependent processes, my work has consistently focused on systems where structure, time, and dynamics matter. 
          </p>
          <p>
            My work leads me to treat time semantics, execution constraints, and reproducibility as first-class objects when designing research systems.
          </p>
          <p>
            This site documents a personal research lab and research engine built around that principle, and serves as a space for technical, research-level exploration and collaboration, with links to related research and selected projects provided for context.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;
