import React from 'react';

const Publications = () => {
  return (
    <div className="home-container fade-in">
      <section className="about-section">
        <div className="about-card">
          <h2>Publications</h2>
          <p>Peer-reviewed papers and preprints.</p>

          <h3>Preprints</h3>
          <ul>
            <li>
              Bai, Z. et al. “Stellar Superradiance and Low-Energy Absorption in Dense Nuclear Media.”
              arXiv:2512.13816 (hep-ph, 2025).{' '}
              <a href="https://arxiv.org/abs/2512.13816" target="_blank" rel="noreferrer">arXiv</a>
              {' '}·{' '}
              <a href="https://inspirehep.net/literature/3093256" target="_blank" rel="noreferrer">INSPIRE</a>
            </li>
            <li>
              Bai, Z. et al. “Probing Axions via Spectroscopic Measurements of S-stars at the Galactic Center.”
              arXiv:2507.07482 (hep-ph, 2025).{' '}
              <a href="https://arxiv.org/abs/2507.07482" target="_blank" rel="noreferrer">arXiv</a>
              {' '}·{' '}
              <a href="https://inspirehep.net/literature/2944593" target="_blank" rel="noreferrer">INSPIRE</a>
            </li>
          </ul>

          <h3>Peer-reviewed</h3>
          <ul>
            <li>
              Bai, Z. et al. “New physics searches with an optical dump at LUXE.”
              Phys. Rev. D 106 (2022) 115034.{' '}
              <a href="https://doi.org/10.1103/PhysRevD.106.115034" target="_blank" rel="noreferrer">DOI</a>
              {' '}·{' '}
              <a href="https://arxiv.org/abs/2107.13554" target="_blank" rel="noreferrer">arXiv:2107.13554</a>
              {' '}·{' '}
              <a href="https://inspirehep.net/literature/2619768" target="_blank" rel="noreferrer">INSPIRE</a>
            </li>
            <li>
              Abramowicz, H. et al. “Conceptual design report for the LUXE experiment.”
              Eur. Phys. J. Spec. Top. 230 (2021) 2445–2560.{' '}
              <a href="https://doi.org/10.1140/epjs/s11734-021-00249-z" target="_blank" rel="noreferrer">DOI</a>
              {' '}·{' '}
              <a href="https://arxiv.org/abs/2102.02032" target="_blank" rel="noreferrer">arXiv:2102.02032</a>
              {' '}·{' '}
              <a href="https://inspirehep.net/literature/1844569" target="_blank" rel="noreferrer">INSPIRE</a>
            </li>
          </ul>

          <p>Full list available upon request.</p>
        </div>
      </section>
    </div>
  );
};

export default Publications;
