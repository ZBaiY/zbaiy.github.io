import React, { useState } from 'react';
import './App.css';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './components/Home';
import SoionLab from './components/SoionLab';
import Projects from './components/Projects';

function App() {
  const [activeTab, setActiveTab] = useState('HOME');

  const renderContent = () => {
    switch (activeTab) {
      case 'SOIONLAB':
        return <SoionLab />;
      case 'PROJECTS':
        return <Projects />;
      case 'HOME':
      default:
        return <Home onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="App">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="App-content">
        {renderContent()}
      </main>
      <Footer />
    </div>
  );
}

export default App;
