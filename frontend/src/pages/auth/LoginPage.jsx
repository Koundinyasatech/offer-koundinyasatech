import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { validateLogin, hasErrors } from '../../validations/employeeValidation';
import ktsLogo from '../../assets/images/kts1.png';
import { useWindowWidth } from '../../hooks/useWindowWidth';


/* ── Spin keyframe injected once ── */
const spinStyle = `
  @keyframes kts-spin { to { transform: rotate(360deg); } }
  @keyframes kts-fadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

export default function LoginPage() {
  const { login } = useAuth();
  const navigate   = useNavigate();
  const w          = useWindowWidth();
  const isMobile   = w < 480;
  const isSmall    = w < 360;

  const [form,     setForm]     = useState({ Userid: '', code: '' });
  const [errors,   setErrors]   = useState({});
  const [loading,  setLoading]  = useState(false);
  const [showCode, setShowCode] = useState(false);

  const set = (f, v) => {
    setForm(p => ({ ...p, [f]: v }));
    if (errors[f]) setErrors(p => { const n = { ...p }; delete n[f]; return n; });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateLogin(form);
    setErrors(errs);
    if (hasErrors(errs)) return;
    setLoading(true);
    try {
      const user = await login(form.Userid.trim(), form.code.trim());
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/employee/dashboard', { replace: true });
    } catch (err) {
      if (err?.response?.status === 403) {
        toast.warning(err.response.data.message);
      } else {
        toast.error(err?.response?.data?.message || 'Invalid credentials. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  /* ── Derived sizes ── */
  const cardPadding   = isSmall ? '20px 16px' : isMobile ? '28px 20px' : '40px 36px';
  const cardMaxWidth  = '460px';
  const logoWidth     = isSmall ? '160px' : isMobile ? '200px' : '260px';
  const headingSize   = isMobile ? '20px' : '24px';
  const inputPadding  = isMobile ? '13px 14px' : '12px 14px';
  const inputFontSize = '16px'; /* always 16px — prevents iOS zoom */
  const btnPadding    = isMobile ? '15px' : '14px';

  /* ── Shared input style factory ── */
  const inputStyle = (hasError) => ({
    width: '100%',
    padding: inputPadding,
    fontSize: inputFontSize,
    background: '#EEF3F8',
    border: `1.5px solid ${hasError ? '#F44336' : 'transparent'}`,
    borderRadius: '10px',
    outline: 'none',
    color: '#1A1A2E',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    transition: 'border-color 0.18s',
  });

  return (
    <>
      {/* Inject keyframes once */}
      <style>{spinStyle}</style>

      <div style={{
        minHeight: '100vh',
        minHeight: '100dvh', /* dynamic viewport for mobile browsers */
        background: 'linear-gradient(135deg, #1e4a5f 0%, #153347 50%, #0d2535 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? '16px 12px 70px' : '24px 16px 70px',
        boxSizing: 'border-box',
      }}>

        {/* ── Logo ── */}
        <div style={{
          marginBottom: isMobile ? '20px' : '28px',
          animation: 'kts-fadeUp 0.5s ease both',
        }}>
          <img
            src={ktsLogo}
            alt="KTS Logo"
            style={{
              width: logoWidth,
              maxWidth: '88vw',
              objectFit: 'contain',
              display: 'block',
            }}
          />
        </div>

        {/* ── Login Card ── */}
        <div style={{
          background: '#fff',
          borderRadius: isMobile ? '16px' : '20px',
          padding: cardPadding,
          width: '100%',
          maxWidth: cardMaxWidth,
          boxShadow: '0 12px 48px rgba(0,0,0,0.28)',
          boxSizing: 'border-box',
          animation: 'kts-fadeUp 0.55s ease 0.08s both',
        }}>

          <h2 style={{
            textAlign: 'center',
            marginBottom: isMobile ? '20px' : '28px',
            fontSize: headingSize,
            fontWeight: '700',
            color: '#1A1A2E',
          }}>
            Welcome to KTS
          </h2>

          <form onSubmit={handleSubmit} noValidate>

            {/* ── Employee ID ── */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                marginBottom: '7px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#1A1A2E',
              }}>
                Employee Id
              </label>
              <input
                type="text"
                value={form.Userid}
                onChange={e => set('Userid', e.target.value)}
                placeholder="Enter your Employee ID"
                autoComplete="username"
                style={inputStyle(errors.Userid)}
                onFocus={e  => (e.target.style.borderColor = '#2196F3')}
                onBlur={e   => (e.target.style.borderColor = errors.Userid ? '#F44336' : 'transparent')}
              />
              {errors.Userid && (
                <span style={{ color: '#F44336', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                  {errors.Userid}
                </span>
              )}
            </div>

            {/* ── Code ── */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                marginBottom: '7px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#1A1A2E',
              }}>
                Code
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showCode ? 'text' : 'password'}
                  value={form.code}
                  onChange={e => set('code', e.target.value)}
                  placeholder="Enter your code"
                  autoComplete="current-password"
                  style={{ ...inputStyle(errors.code), paddingRight: '46px' }}
                  onFocus={e  => (e.target.style.borderColor = '#2196F3')}
                  onBlur={e   => (e.target.style.borderColor = errors.code ? '#F44336' : 'transparent')}
                />
                {/* Toggle visibility — 44×44 touch target */}
                <button
                  type="button"
                  onClick={() => setShowCode(v => !v)}
                  aria-label={showCode ? 'Hide code' : 'Show code'}
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: 0,
                    height: '100%',
                    width: '44px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '17px',
                    color: '#8FA3B1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '0 10px 10px 0',
                  }}
                >
                  {showCode ? '🙈' : '👁'}
                </button>
              </div>
              {errors.code && (
                <span style={{ color: '#F44336', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                  {errors.code}
                </span>
              )}
            </div>

            {/* ── Submit ── */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: btnPadding,
                fontSize: '16px',
                fontWeight: '700',
                background: loading ? '#90CAF9' : 'linear-gradient(90deg, #2196F3 0%, #1565C0 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontFamily: 'inherit',
                transition: 'opacity 0.2s, transform 0.1s',
                minHeight: '48px', /* solid touch target */
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = '0.92'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
              onMouseDown={e  => { if (!loading) e.currentTarget.style.transform = 'scale(0.985)'; }}
              onMouseUp={e    => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
              {loading && (
                <span style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid rgba(255,255,255,0.35)',
                  borderTopColor: '#fff',
                  borderRadius: '50%',
                  display: 'inline-block',
                  animation: 'kts-spin 0.7s linear infinite',
                  flexShrink: 0,
                }} />
              )}
              {loading ? 'Logging in…' : 'Login'}
            </button>

          </form>
        </div>

        {/* ── Footer ── */}
        <footer style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '14px 16px',
          paddingBottom: 'max(14px, env(safe-area-inset-bottom))',
          color: '#B0C4D8',
          fontSize: isMobile ? '11px' : '13px',
          textAlign: 'center',
          background: 'rgba(13, 37, 53, 0.92)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          zIndex: 100,
          letterSpacing: '0.01em',
        }}>
          © 2026 Koundinyasa Technology Services All Rights Reserved.
        </footer>

      </div>
    </>
  );
}