import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { fileService } from '../../services/fileService';
import AppButton from '../../components/common/AppButton';
import ktsLogo from '../../assets/images/kts1.png';
import { useWindowWidth } from '../../hooks/useWindowWidth';

/* ── Keyframes ── */
const fadeUpStyle = `
  @keyframes kts-spin {
    to { transform: rotate(360deg); }
  }
  @keyframes kts-fadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

export default function EmployeeDashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const w        = useWindowWidth();
  const isMobile = w < 480;
  const isTablet = w < 768;

  const [files,       setFiles]       = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [downloading, setDownloading] = useState(null);

  useEffect(() => {
    const empId = user?.Employeeid || user?.Userid;
    if (!empId) return;
    setLoading(true);
    fileService
      .getByEmployee(empId)
      .then(data => setFiles(Array.isArray(data) ? data : []))
      .catch(() => toast.error('Failed to load files'))
      .finally(() => setLoading(false));
  }, [user?.Employeeid, user?.Userid]);

  const handleDownload = async (file) => {
    setDownloading(file.Id);
    try {
      await fileService.download(file.Empid, file.ActualfileName || file.FileName);
      toast.success('Download started');
    } catch {
      toast.error('Download failed');
    } finally {
      setDownloading(null);
    }
  };

  const handleLogout = () => { logout(); navigate('/login', { replace: true }); };

  /* ── Layout values ── */
  const pagePad   = isMobile ? '14px 12px 80px' : isTablet ? '18px 16px 80px' : '24px 24px 80px';
  const logoWidth = isMobile ? '180px' : isTablet ? '220px' : '260px';

  const card = {
    background: '#fff',
    borderRadius: isMobile ? '12px' : '16px',
    boxShadow: '0 2px 14px rgba(0,0,0,0.10)',
    marginBottom: '16px',
    boxSizing: 'border-box',
    overflow: 'hidden',
  };

  /* ── Table cell styles ── */
  const th = {
    padding: isMobile ? '12px 14px' : '14px 20px',
    color: '#fff',
    fontWeight: '600',
    fontSize: isMobile ? '12px' : '14px',
    textAlign: 'left',
    whiteSpace: 'nowrap',
  };
  const td = {
    padding: isMobile ? '12px 14px' : '13px 20px',
    fontSize: isMobile ? '13px' : '14px',
    color: '#1A1A2E',
    borderBottom: '1px solid #E0EAF4',
    verticalAlign: 'middle',
  };

  /* ── Spinner ── */
  const Spinner = ({ size = 16, color = '#fff' }) => (
    <span style={{
      width: size, height: size,
      border: `2px solid ${color}40`,
      borderTopColor: color,
      borderRadius: '50%',
      display: 'inline-block',
      flexShrink: 0,
      animation: 'kts-spin 0.7s linear infinite',
    }} />
  );

  /* ── Mobile card view for each file row ── */
  const MobileFileCard = ({ file, index }) => (
    <div style={{
      padding: '14px 16px',
      borderBottom: '1px solid #E0EAF4',
      background: index % 2 === 0 ? '#fff' : '#F7FAFD',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
    }}>
      {/* Employee ID badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '12px', color: '#8FA3B1', fontWeight: '500', width: '90px', flexShrink: 0 }}>
          Employee ID
        </span>
        <span style={{
          fontWeight: '600', color: '#2196F3',
          background: '#EEF3F8', padding: '3px 10px',
          borderRadius: '6px', fontSize: '13px',
        }}>
          {file.Empid}
        </span>
      </div>

      {/* File name */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
        <span style={{ fontSize: '12px', color: '#8FA3B1', fontWeight: '500', width: '90px', flexShrink: 0, paddingTop: '2px' }}>
          Offer Letter
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: '18px', flexShrink: 0 }}>📄</span>
          <span style={{ fontWeight: '500', color: '#1A1A2E', fontSize: '13px', wordBreak: 'break-word' }}>
            {file.ActualfileName || file.FileName || '—'}
          </span>
        </span>
      </div>

      {/* Download button */}
      <button
        onClick={() => handleDownload(file)}
        disabled={downloading === file.Id}
        style={{
          background: downloading === file.Id
            ? '#90CAF9'
            : 'linear-gradient(135deg, #2196F3, #1565C0)',
          color: '#fff', border: 'none', borderRadius: '8px',
          padding: '11px 16px', fontSize: '13px', fontWeight: '600',
          cursor: downloading === file.Id ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          width: '100%', minHeight: '44px',
          transition: 'opacity 0.2s',
        }}
      >
        {downloading === file.Id
          ? <><Spinner /><span>Downloading…</span></>
          : '⬇ Download Offer Letter'
        }
      </button>
    </div>
  );

  return (
    <>
      <style>{fadeUpStyle}</style>

      <div style={{
        minHeight: '100vh',
        minHeight: '100dvh',
        background: 'linear-gradient(135deg, #1e4a5f 0%, #153347 50%, #0d2535 100%)',
        padding: pagePad,
        boxSizing: 'border-box',
      }}>

        {/* ── Logo ── */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: isMobile ? '16px' : '24px',
          animation: 'kts-fadeUp 0.4s ease both',
        }}>
          <img
            src={ktsLogo}
            alt="KTS Logo"
            style={{ width: logoWidth, maxWidth: '88vw', objectFit: 'contain', display: 'block' }}
          />
        </div>

        {/* ── Header ── */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'stretch' : 'center',
          flexDirection: isMobile ? 'column' : 'row',
          marginBottom: isMobile ? '16px' : '24px',
          gap: '12px',
          animation: 'kts-fadeUp 0.45s ease 0.06s both',
        }}>
          <div>
            <h2 style={{
              color: '#f2f3f4',
              fontSize: isMobile ? '20px' : isTablet ? '22px' : '26px',
              fontWeight: '700',
              margin: 0,
              lineHeight: 1.2,
            }}>
              Welcome, {user?.name}
            </h2>
          </div>
          <AppButton
            variant="outline"
            onClick={handleLogout}
            style={{ width: isMobile ? '100%' : 'auto', minHeight: '44px' }}
          >
            Logout
          </AppButton>
        </div>

        {/* ── Files Card ── */}
        <div style={{ ...card, animation: 'kts-fadeUp 0.5s ease 0.12s both' }}>

          {/* Loading state */}
          {loading && (
            <div style={{
              padding: '60px 20px',
              textAlign: 'center',
              color: '#8FA3B1',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
            }}>
              <span style={{
                width: 28, height: 28,
                border: '3px solid #E0EAF4',
                borderTopColor: '#2196F3',
                borderRadius: '50%',
                display: 'inline-block',
                animation: 'kts-spin 0.7s linear infinite',
              }} />
              <span style={{ fontSize: '14px' }}>Loading your files…</span>
            </div>
          )}

          {/* Empty state */}
          {!loading && files.length === 0 && (
            <div style={{
              padding: '60px 20px',
              textAlign: 'center',
              color: '#8FA3B1',
            }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>📄</div>
              <p style={{ fontSize: '15px', fontWeight: '500', margin: '0 0 6px' }}>No files yet</p>
              <p style={{ fontSize: '13px', margin: 0 }}>Your uploaded documents will appear here.</p>
            </div>
          )}

          {/* ── Mobile: card list ── */}
          {!loading && files.length > 0 && isMobile && (
            <div>
              {files.map((file, i) => (
                <MobileFileCard key={file.Id || i} file={file} index={i} />
              ))}
            </div>
          )}

          {/* ── Tablet / Desktop: table with horizontal scroll ── */}
          {!loading && files.length > 0 && !isMobile && (
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '480px' }}>
                <thead>
                  <tr style={{ background: 'linear-gradient(90deg, #2196F3, #1976D2)' }}>
                    <th style={th}>Employee ID</th>
                    <th style={th}>Offer Letter</th>
                    <th style={{ ...th, textAlign: 'center' }}>Download</th>
                  </tr>
                </thead>
                <tbody>
                  {files.map((file, i) => (
                    <tr
                      key={file.Id || i}
                      style={{ background: i % 2 === 0 ? '#fff' : '#F7FAFD', transition: 'background 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#EEF6FF')}
                      onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? '#fff' : '#F7FAFD')}
                    >
                      <td style={td}>
                        <span style={{
                          fontWeight: '600', color: '#2196F3',
                          background: '#EEF3F8', padding: '3px 10px',
                          borderRadius: '6px', fontSize: '13px',
                        }}>
                          {file.Empid}
                        </span>
                      </td>

                      <td style={td}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '20px', flexShrink: 0 }}>📄</span>
                          <span style={{ fontWeight: '500', color: '#1A1A2E', wordBreak: 'break-word' }}>
                            {file.ActualfileName || file.FileName || '—'}
                          </span>
                        </span>
                      </td>

                      <td style={{ ...td, textAlign: 'center' }}>
                        <button
                          onClick={() => handleDownload(file)}
                          disabled={downloading === file.Id}
                          style={{
                            background: downloading === file.Id
                              ? '#90CAF9'
                              : 'linear-gradient(135deg, #2196F3, #1565C0)',
                            color: '#fff', border: 'none', borderRadius: '8px',
                            padding: '8px 20px', fontSize: '13px', fontWeight: '600',
                            cursor: downloading === file.Id ? 'not-allowed' : 'pointer',
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            boxShadow: '0 2px 6px rgba(33,150,243,0.25)',
                            transition: 'opacity 0.2s',
                            minHeight: '36px',
                          }}
                          onMouseEnter={e => { if (downloading !== file.Id) e.currentTarget.style.opacity = '0.88'; }}
                          onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                        >
                          {downloading === file.Id
                            ? <><Spinner size={12} /><span>Downloading…</span></>
                            : '⬇ Download'
                          }
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
        }}>
          © 2026 Koundinyasa Technology Services All Rights Reserved.
        </footer>

      </div>
    </>
  );
}