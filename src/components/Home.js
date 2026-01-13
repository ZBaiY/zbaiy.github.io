import React from 'react';

const Home = ({ onNavigate }) => {
  return (
    <div className="home-container fade-in">
      <section className="hero-section">
        <h1 className="hero-title">
          <span className="text-accent">Theory-Informed, <br /> </span>Execution-Aware Research
        </h1>
        <p className="hero-subtitle">
          Structure, Time, and Constraints.
        </p>
        <div className="hero-actions">
          <button className="btn-primary hero-cta" onClick={() => onNavigate('SOIONLAB')}>
            Research Engine
          </button>
          <button className="btn-secondary" onClick={() => onNavigate('PROJECTS')}>
            More Projects
          </button>
        </div>
      </section>

      <section className="about-section">
        <div className="about-card">
          <h2>About Me</h2>
          <p>
            I am a <span className="text-accent">PhD researcher in theoretical physics</span> at the Weizmann Institute of Science. 
          </p>
          <p>
            From particle and field-theoretic models to quantitative, time-dependent processes, my work has consistently focused on systems where <span className="text-accent">structure, time, and dynamics</span> matter. 
          </p>
          <p>
            This site documents a personal research lab and research engine built around that principle.
          </p>
          <p>
            It is a space for <span className="text-accent">technical, research-level exploration and collaboration</span>, with links to related research and selected projects for context.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;
