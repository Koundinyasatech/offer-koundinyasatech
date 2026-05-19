import React from 'react';

const AppSelect = ({ label, error, options = [], containerStyle = {}, style = {}, ...props }) => (
  <div style={{ marginBottom: '14px', ...containerStyle }}>
    {label && <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#1A1A2E' }}>{label}</label>}
    <select
      style={{
        width: '100%', padding: '11px 14px', fontSize: '15px',
        background: '#EEF3F8', border: `1.5px solid ${error ? '#F44336' : 'transparent'}`,
        borderRadius: '10px', outline: 'none', color: '#1A1A2E',
        fontFamily: 'inherit', cursor: 'pointer', appearance: 'auto',
        ...style,
      }}
      onFocus={e => e.target.style.borderColor = '#2196F3'}
      onBlur={e => e.target.style.borderColor = error ? '#F44336' : 'transparent'}
      {...props}
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
    {error && <span style={{ color: '#F44336', fontSize: '12px', marginTop: '4px', display: 'block' }}>{error}</span>}
  </div>
);

export default AppSelect;