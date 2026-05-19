import React from 'react';

const PageBackground = ({ children }) => (
  <div className="bg-gradient" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
    <div style={{ flex: 1 }}>{children}</div>
    <footer style={{ textAlign: 'center', padding: '16px', color: '#B0C4D8', fontSize: '13px' }}>
      © 2026 - KTS - All rights reserved.
    </footer>
  </div>
);

export default PageBackground;