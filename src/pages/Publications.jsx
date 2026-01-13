import React from 'react';

const Publications = () => {
  return (
    <div className="home-container fade-in">
      <section className="about-section">
        <div className="about-card">
          <h2>Publications</h2>
          <p>Peer-reviewed papers and preprints (selected).</p>

          <h3>Preprints</h3>
          <ul>
            <li>[HOLDER] Authors. “Title.” arXiv:XXXX.XXXXX (Year). [link placeholder]</li>
            <li>[HOLDER] Authors. “Title.” arXiv:XXXX.XXXXX (Year). [link placeholder]</li>
          </ul>

          <h3>Peer-reviewed</h3>
          <ul>
            <li>[HOLDER] Authors. “Title.” Journal (Year). [link placeholder]</li>
          </ul>

          <p>Full list available upon request.</p>
        </div>
      </section>
    </div>
  );
};

export default Publications;
