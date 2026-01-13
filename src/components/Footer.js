import React from 'react';

const Footer = () => {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="social-links">
          <a href="https://github.com/ZBaiY" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          <a href="https://www.linkedin.com/" target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>
          <a href="https://scholar.google.com/citations?user=8GKj69MAAAAJ&hl=en&oi=ao" target="_blank" rel="noopener noreferrer">
            Google Scholar
          </a>
          <a href="https://inspirehep.net/authors/1895128?ui-citation-summary=true" target="_blank" rel="noopener noreferrer">
            Inspire HEP
          </a>
          <a href="mailto:zbaiy.imsoion@yahoo.com">
            zbaiy.imsoion@yahoo.com
          </a>
        </div>
        <p className="copyright">© {new Date().getFullYear()} Bart Bai. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
