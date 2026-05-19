import React from 'react';

const STYLES = {
  base: {
    border: 'none', cursor: 'pointer', borderRadius: '8px',
    padding: '10px 20px', fontSize: '14px', fontWeight: '600',
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    transition: 'opacity 0.2s, transform 0.1s', fontFamily: 'inherit',
  },
  primary:  { background: 'linear-gradient(90deg, #2196F3, #1565C0)', color: '#fff' },
  success:  { background: 'linear-gradient(90deg, #43A047, #2E7D32)', color: '#fff' },
  danger:   { background: 'linear-gradient(90deg, #F44336, #C62828)', color: '#fff' },
  outline:  { background: '#fff', color: '#1A1A2E', border: '1.5px solid #CBD5E1' },
  outlineBlue: { background: 'transparent', color: '#fff', border: '1.5px solid rgba(255,255,255,0.5)' },
};

const AppButton = ({ children, variant = 'primary', loading = false, style = {}, ...props }) => (
  <button
    style={{ ...STYLES.base, ...STYLES[variant], opacity: (loading || props.disabled) ? 0.7 : 1, ...style }}
    disabled={loading || props.disabled}
    {...props}
  >
    {loading && <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />}
    {children}
  </button>
);

export default AppButton;