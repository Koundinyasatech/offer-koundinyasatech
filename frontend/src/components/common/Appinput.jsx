import React, { useState } from 'react';

const AppInput = ({ label, error, type = 'text', style = {}, containerStyle = {}, ...props }) => {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';

  return (
    <div style={{ marginBottom: '14px', ...containerStyle }}>
      {label && <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#1A1A2E' }}>{label}</label>}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <input
          type={isPassword ? (show ? 'text' : 'password') : type}
          style={{
            width: '100%', padding: '11px 14px', fontSize: '15px',
            background: '#EEF3F8', border: `1.5px solid ${error ? '#F44336' : 'transparent'}`,
            borderRadius: '10px', outline: 'none', color: '#1A1A2E',
            fontFamily: 'inherit', paddingRight: isPassword ? '42px' : '14px',
            ...style,
          }}
          onFocus={e => e.target.style.borderColor = '#2196F3'}
          onBlur={e => e.target.style.borderColor = error ? '#F44336' : 'transparent'}
          {...props}
        />
        {isPassword && (
          <button type="button" onClick={() => setShow(v => !v)}
            style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#8FA3B1', padding: '4px' }}>
            {show ? '🙈' : '👁'}
          </button>
        )}
      </div>
      {error && <span style={{ color: '#F44336', fontSize: '12px', marginTop: '4px', display: 'block' }}>{error}</span>}
    </div>
  );
};

export default AppInput;