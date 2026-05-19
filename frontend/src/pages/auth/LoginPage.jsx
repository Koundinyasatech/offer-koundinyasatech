import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { validateLogin, hasErrors } from '../../validations/employeeValidation';
import ktsLogo from '../../assets/images/kts1.png';

export default function LoginPage() {
  const { login }   = useAuth();
  const navigate    = useNavigate();
  const [form, setForm]     = useState({ Userid: '', code: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
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
      if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/employee/dashboard', { replace: true });
      }
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
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e4a5f 0%, #153347 50%, #0d2535 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between',
      padding: '40px 16px 0',
    }}>

      {/* ── Logo ── */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '28px' }}>
        <img src={ktsLogo} alt="KTS Logo" style={{ width: '280px', maxWidth: '90vw', objectFit: 'contain' }} />
      </div>

      {/* ── Login Card ── */}
      <div style={{
        background: '#fff', borderRadius: '20px', padding: '36px 32px',
        width: '100%', maxWidth: '440px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.25)',
        flex: 'none',
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '28px', fontSize: '24px', fontWeight: '700', color: '#1A1A2E' }}>
          Welcome to KTS
        </h2>

        <form onSubmit={handleSubmit} noValidate>
          {/* User ID */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '7px', fontSize: '14px', fontWeight: '500', color: '#1A1A2E' ,alignContent:"flex-start"}}>Employee Id</label>
            <input
              type="text"
              value={form.Userid}
              onChange={e => set('Userid', e.target.value)}
              placeholder="Enter your Employee ID"
              autoComplete="username"
              style={{
                width: '100%', padding: '12px 14px', fontSize: '15px',
                background: '#EEF3F8', border: `1.5px solid ${errors.Userid ? '#F44336' : 'transparent'}`,
                borderRadius: '10px', outline: 'none', color: '#1A1A2E',
                fontFamily: 'inherit', boxSizing: 'border-box',
              }}
              onFocus={e => e.target.style.borderColor = '#2196F3'}
              onBlur={e => e.target.style.borderColor = errors.Userid ? '#F44336' : 'transparent'}
            />
            {errors.Userid && <span style={{ color: '#F44336', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.Userid}</span>}
          </div>

          {/* Code */}
          <div style={{ marginBottom: '22px' }}>
            <label style={{ display: 'block', marginBottom: '7px', fontSize: '14px', fontWeight: '500', color: '#1A1A2E' }}>Code</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showCode ? 'text' : 'password'}
                value={form.code}
                onChange={e => set('code', e.target.value)}
                placeholder="Enter your code"
                autoComplete="current-password"
                style={{
                  width: '100%', padding: '12px 42px 12px 14px', fontSize: '15px',
                  background: '#EEF3F8', border: `1.5px solid ${errors.code ? '#F44336' : 'transparent'}`,
                  borderRadius: '10px', outline: 'none', color: '#1A1A2E',
                  fontFamily: 'inherit', boxSizing: 'border-box',
                }}
                onFocus={e => e.target.style.borderColor = '#2196F3'}
                onBlur={e => e.target.style.borderColor = errors.code ? '#F44336' : 'transparent'}
              />
              <button type="button" onClick={() => setShowCode(v => !v)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#8FA3B1', padding: '4px', lineHeight: 1 }}>
                {showCode ? '🙈' : '👁'}
              </button>
            </div>
            {errors.code && <span style={{ color: '#F44336', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.code}</span>}
          </div>

          {/* Login Button */}
          <button type="submit" disabled={loading}
            style={{
              width: '100%', padding: '14px', fontSize: '16px', fontWeight: '700',
              background: loading ? '#90CAF9' : 'linear-gradient(90deg, #2196F3, #1565C0)',
              color: '#fff', border: 'none', borderRadius: '10px', cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              transition: 'opacity 0.2s', fontFamily: 'inherit',
            }}>
            {loading && <span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />}
            Login
          </button>
        </form>
      </div>

      {/* ── Footer ── */}
      <footer style={{ padding: '20px', color: '#B0C4D8', fontSize: '13px', textAlign: 'center' }}>
        © 2026 - KTS - All rights reserved.
      </footer>

    </div>
  );
}