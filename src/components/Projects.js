import React from 'react';

const projects = [
  {
    title: "Stochastic Calculus in Finance",
    description: "Connecting Itô calculus with working Python code for option pricing, IV surfaces. Experiment for the option chain modules in SoionLab.",
    link: "https://github.com/ZBaiY/option-mini-lab.git",
    tags: ["Python", "Finance", "Itô Calculus"]
  },
  {
    title: "WIS Deeplearning",
    description: "U-Net based deep learning models for noisy physics data matrix analysis.",
    link: "https://github.com/ZBaiY/WIS_Deeplearning.git",
    tags: ["Deep Learning", "PyTorch", "Physics"]
  },
];

const Projects = () => {
  return (
    <div className="projects-container fade-in">
      <div className="section-header">
        <h2>Other Selected Projects</h2>
        <p>Experiments, tools.</p>
      </div>
      
      <div className="projects-grid">
        {projects.map((project, index) => (
          <div className="project-card" key={index}>
            <div className="project-content">
              <h3>{project.title}</h3>
              <p>{project.description}</p>
              <div className="project-tags">
                {project.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
              </div>
            </div>
            <div className="project-footer">
              <a href={project.link} target="_blank" rel="noopener noreferrer" className="btn-text">
                View Source →
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Projects;