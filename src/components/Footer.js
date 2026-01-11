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
