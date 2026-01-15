import React from 'react';

const Header = ({ activeTab, onTabChange }) => {
  return (
    <header className="app-header">
      <div className="logo">
        <span className="logo-text">BART BAI</span>
      </div>
      <nav>
        <button 
          onClick={() => onTabChange('HOME')} 
          className={activeTab === 'HOME' ? 'active' : ''}
        >
          Home
        </button>
        <button 
          onClick={() => onTabChange('SOIONLAB')} 
          className={activeTab === 'SOIONLAB' ? 'active' : ''}
        >
          SoionLab
        </button>
        <button 
          onClick={() => onTabChange('PROJECTS')} 
          className={activeTab === 'PROJECTS' ? 'active' : ''}
        >
          Other Projects
        </button>
        <button 
          onClick={() => onTabChange('PUBLICATIONS')} 
          className={activeTab === 'PUBLICATIONS' ? 'active' : ''}
        >
          Publications
        </button>
        {/* <button 
          onClick={() => onTabChange('CV')} 
          className={activeTab === 'CV' ? 'active' : ''}
        >
          CV */}
        {/* </button> */}
      </nav>
    </header>
  );
};

export default Header;
