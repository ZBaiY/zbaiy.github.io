import React, { useState } from 'react';
import './App.css';

// --- Components for each tab ---

const HomeTab = () => (
  <div className="tab-content">
    <h1>A heading placeholder.</h1>
    <p>A short placeholder line describing focus.</p>
    <p className="worldview-hook">An emphasized “worldview hook” placeholder line.</p>
    <p>A short bridge line that points to the main project.</p>
  </div>
);

const SoionlabTab = () => {
  const [activeSection, setActiveSection] = useState('what');

  const renderContent = () => {
    switch (activeSection) {
      case 'how':
        return (
          <div className="soionlab-content">
            <h3>How It Works</h3>
            <div className="system-diagram">
              <div className="node" tabIndex="0" aria-label="World: External data sources."><span>WORLD</span></div>
              <div className="connector"></div>
              <div className="node" tabIndex="0" aria-label="Ingestion: Normalizes raw data into ticks outside the runtime."><span>INGESTION</span></div>
              <div className="connector"></div>
              <div className="node" tabIndex="0" aria-label="Driver: The single time authority, feeding ticks to the Engine."><span>DRIVER</span></div>
              <div className="connector"></div>
              <div className="node" tabIndex="0" aria-label="Engine: Core logic orchestration, but does not control time."><span>ENGINE</span></div>
              <div className="connector"></div>
              <div className="node" tabIndex="0" aria-label="Execution/Portfolio: Simulates/executes trades and manages state."><span>EXECUTION</span></div>
            </div>
          </div>
        );
      case 'run':
        return (
          <div className="soionlab-content">
            <h3>Does It Run?</h3>
            <div className="backtest-card">
              <div className="backtest-image-placeholder"></div>
              <p>Sample backtest result. Placeholder disclaimer: Past performance is not indicative of future results.</p>
            </div>
            <details className="expandable-section">
              <summary>Traceability & Logging</summary>
              <ul>
                <li>Placeholder for logging detail 1.</li>
                <li>Placeholder for logging detail 2.</li>
                <li>Placeholder for logging detail 3.</li>
              </ul>
            </details>
          </div>
        );
      case 'what':
      default:
        return (
          <div className="soionlab-content">
            <h3>What is SoionLab?</h3>
            <p>A placeholder paragraph describing the project's core idea. It's a contract-driven framework for quant research and execution with unified runtime semantics.</p>
            <ul>
              <li>Placeholder bullet point 1: Key feature or principle.</li>
              <li>Placeholder bullet point 2: Another key aspect.</li>
              <li>Placeholder bullet point 3: High-level benefit.</li>
              <li>Placeholder bullet point 4: Core design philosophy.</li>
            </ul>
          </div>
        );
    }
  };

  return (
    <div className="tab-content soionlab-tab">
      <div className="soionlab-nav">
        <button onClick={() => setActiveSection('what')} className={activeSection === 'what' ? 'active' : ''}>What is SoionLab?</button>
        <button onClick={() => setActiveSection('how')} className={activeSection === 'how' ? 'active' : ''}>How does it work?</button>
        <button onClick={() => setActiveSection('run')} className={activeSection === 'run' ? 'active' : ''}>Does it run?</button>
      </div>
      <div className="soionlab-panel">
        {renderContent()}
      </div>
    </div>
  );
};


const OtherProjectsTab = () => (
  <div className="tab-content">
    <ul className="project-list">
      <li>
        <a href="https://github.com/ZBaiY" target="_blank" rel="noopener noreferrer">Project Name Placeholder 1</a>
        <p>A one-line description placeholder for this project.</p>
      </li>
      <li>
        <a href="https://github.com/ZBaiY" target="_blank" rel="noopener noreferrer">Project Name Placeholder 2</a>
        <p>A one-line description placeholder for this project.</p>
      </li>
      <li>
        <a href="https://github.com/ZBaiY" target="_blank" rel="noopener noreferrer">Project Name Placeholder 3</a>
        <p>A one-line description placeholder for this project. This one might be a bit longer to see how text wraps.</p>
      </li>
    </ul>
  </div>
);


// --- Main App Component ---

function App() {
  const [activeTab, setActiveTab] = useState('HOME');
  const [transitioning, setTransitioning] = useState(false);

  const handleTabClick = (tab) => {
    if (tab !== activeTab) {
      setTransitioning(true);
      setTimeout(() => {
        setActiveTab(tab);
        setTransitioning(false);
      }, 300); // Corresponds to CSS transition duration
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'SOIONLAB':
        return <SoionlabTab />;
      case 'OTHER_PROJECTS':
        return <OtherProjectsTab />;
      case 'HOME':
      default:
        return <HomeTab />;
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <nav>
          <button onClick={() => handleTabClick('HOME')} className={activeTab === 'HOME' ? 'active' : ''}>HOME</button>
          <button onClick={() => handleTabClick('SOIONLAB')} className={activeTab === 'SOIONLAB' ? 'active' : ''}>SOIONLAB</button>
          <button onClick={() => handleTabClick('OTHER_PROJECTS')} className={activeTab === 'OTHER_PROJECTS' ? 'active' : ''}>OTHER PROJECTS</button>
        </nav>
      </header>
      
      <main className={`App-content ${transitioning ? 'fade-out' : 'fade-in'}`}>
        {renderTabContent()}
      </main>

      <footer className="App-footer">
        <a href="https://github.com/ZBaiY" target="_blank" rel="noopener noreferrer">GitHub</a>
        <a href="https://www.linkedin.com/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
        <a href="mailto:placeholder@example.com">Email</a>
      </footer>
    </div>
  );
}

export default App;