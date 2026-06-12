import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { fileService } from '../../services/fileService';
import AppButton from '../../components/common/AppButton';
import ktsLogo from '../../assets/images/kts1.png';
import { useWindowWidth } from '../../hooks/useWindowWidth';

const fadeUpStyle = `
  @keyframes kts-spin    { to { transform: rotate(360deg); } }
  @keyframes kts-fadeUp  {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

const Spinner = ({ size = 16, color = '#fff' }) => (
  <span style={{
    width: size, height: size,
    border: `2px solid ${color}40`, borderTopColor: color,
    borderRadius: '50%', display: 'inline-block', flexShrink: 0,
    animation: 'kts-spin 0.7s linear infinite',
  }} />
);

const formatDt = (dt) => {
  if (!dt) return '—';
  try { return new Date(dt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return dt; }
};

export default function EmployeeDashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const w        = useWindowWidth();
  const isMobile = w < 480;
  const isTablet = w < 768;

  const [files,       setFiles]       = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [viewing,     setViewing]     = useState(null);
  const [downloading, setDownloading] = useState(null);

  useEffect(() => {
    const empId = user?.Employeeid || user?.Userid;
    if (!empId) return;
    setLoading(true);
    fileService
      .getFilesList(String(empId))
      .then(data => setFiles(Array.isArray(data) ? data : []))
      .catch(() => toast.error('Failed to load files'))
      .finally(() => setLoading(false));
  }, [user?.Employeeid, user?.Userid]);

  const handleView = async (file) => {
    setViewing(file.id);
    try { await fileService.viewPdf(file.id); }
    catch { toast.error('Failed to open file'); }
    finally { setViewing(null); }
  };

  const handleDownload = async (file) => {
    setDownloading(file.id);
    try {
      await fileService.download(file.id, file.ActualfileName);
      toast.success('Download started');
    } catch { toast.error('Download failed'); }
    finally { setDownloading(null); }
  };

  const handleLogout = () => { logout(); navigate('/login', { replace: true }); };

  const pagePad   = isMobile ? '14px 12px 80px' : isTablet ? '18px 16px 80px' : '24px 24px 80px';
  const logoWidth = isMobile ? '180px' : isTablet ? '220px' : '260px';

  const card = {
    background: '#fff', borderRadius: isMobile ? '12px' : '16px',
    boxShadow: '0 2px 14px rgba(0,0,0,0.10)', marginBottom: '16px',
    boxSizing: 'border-box', overflow: 'hidden',
  };

  const th = {
    padding: isMobile ? '12px 14px' : '14px 20px',
    color: '#fff', fontWeight: '600',
    fontSize: isMobile ? '12px' : '14px',
    textAlign: 'left', whiteSpace: 'nowrap',
  };
  const td = {
    padding: isMobile ? '12px 14px' : '13px 20px',
    fontSize: isMobile ? '13px' : '14px', color: '#1A1A2E',
    borderBottom: '1px solid #E0EAF4', verticalAlign: 'middle',
  };

  /* ── Mobile file card ── */
  const MobileFileCard = ({ file, index }) => (
    <div style={{
      padding: '14px 16px', borderBottom: '1px solid #E0EAF4',
      background: file.Islatest ? '#F0F8FF' : (index % 2 === 0 ? '#fff' : '#F7FAFD'),
      display: 'flex', flexDirection: 'column', gap: '10px',
    }}>
      {/* File name + latest badge */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
        <span style={{ fontSize: '24px', flexShrink: 0 }}>📄</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: '600', fontSize: '13px', color: '#1A1A2E', wordBreak: 'break-word' }}>
              {file.ActualfileName || file.FileName || 'document.pdf'}
            </span>
            {file.Islatest && (
              <span style={{ background: '#2196F3', color: '#fff', fontSize: '10px', fontWeight: '700', padding: '2px 7px', borderRadius: '99px' }}>
                LATEST
              </span>
            )}
          </div>
          <span style={{ fontSize: '12px', color: '#8FA3B1' }}>Uploaded: {formatDt(file.CreatedDatetime)}</span>
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={() => handleView(file)}
          disabled={viewing === file.id}
          style={{
            flex: 1, minHeight: '40px',
            background: viewing === file.id ? '#E3F2FD' : 'linear-gradient(135deg, #2196F3, #1565C0)',
            color: viewing === file.id ? '#2196F3' : '#fff',
            border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600',
            cursor: viewing === file.id ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
          }}
        >
          {viewing === file.id ? <><Spinner size={12} color="#2196F3" /> Viewing…</> : '👁 View'}
        </button>
        <button
          onClick={() => handleDownload(file)}
          disabled={downloading === file.id}
          style={{
            flex: 1, minHeight: '40px',
            background: downloading === file.id ? '#E8F5E9' : 'linear-gradient(135deg, #43A047, #2E7D32)',
            color: downloading === file.id ? '#43A047' : '#fff',
            border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600',
            cursor: downloading === file.id ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
          }}
        >
          {downloading === file.id ? <><Spinner size={12} color="#43A047" /> Downloading…</> : '⬇ Download'}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <style>{fadeUpStyle}</style>

      <div style={{
        minHeight: '100vh', minHeight: '100dvh',
        background: 'linear-gradient(135deg, #1e4a5f 0%, #153347 50%, #0d2535 100%)',
        padding: pagePad, boxSizing: 'border-box',
      }}>

        {/* ── Logo ── */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: isMobile ? '16px' : '24px', animation: 'kts-fadeUp 0.4s ease both' }}>
          <img src={ktsLogo} alt="KTS Logo" style={{ width: logoWidth, maxWidth: '88vw', objectFit: 'contain', display: 'block' }} />
        </div>

        {/* ── Header ── */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: isMobile ? 'stretch' : 'center',
          flexDirection: isMobile ? 'column' : 'row',
          marginBottom: isMobile ? '16px' : '24px',
          gap: '12px', animation: 'kts-fadeUp 0.45s ease 0.06s both',
        }}>
          <div>
            <h2 style={{ color: '#f2f3f4', fontSize: isMobile ? '20px' : isTablet ? '22px' : '26px', fontWeight: '700', margin: 0, lineHeight: 1.2 }}>
              Welcome, {user?.name}
            </h2>
            {/* {(user?.Employeeid || user?.Userid) && (
              <p style={{ color: '#7EB8D4', fontSize: '13px', marginTop: '4px', fontWeight: '500', marginBottom: 0 }}>
                ID: {user.Employeeid || user.Userid}
              </p>
            )} */}
          </div>
          <AppButton variant="outline" onClick={handleLogout} style={{ width: isMobile ? '100%' : 'auto', minHeight: '44px' }}>
            Logout
          </AppButton>
        </div>

        {/* ── Files Card ── */}
        <div style={{ ...card, animation: 'kts-fadeUp 0.5s ease 0.12s both' }}>

          {/* Card header */}
          <div style={{
            padding: isMobile ? '14px 16px' : '16px 24px',
            borderBottom: '1px solid #E0EAF4',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <span style={{ fontSize: '18px' }}></span>
            <p style={{ fontSize: '15px', fontWeight: '600', color: '#1A1A2E', margin: 0 }}>My Documents</p>
            {!loading && files.length > 0 && (
              <span style={{ marginLeft: 'auto', background: '#EEF3F8', color: '#2196F3', fontSize: '12px', fontWeight: '600', padding: '3px 10px', borderRadius: '99px' }}>
                {files.length} {files.length === 1 ? 'file' : 'files'}
              </span>
            )}
          </div>

          {/* Loading */}
          {loading && (
            <div style={{ padding: '60px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <span style={{ width: 28, height: 28, border: '3px solid #E0EAF4', borderTopColor: '#2196F3', borderRadius: '50%', display: 'inline-block', animation: 'kts-spin 0.7s linear infinite' }} />
              <span style={{ fontSize: '14px', color: '#8FA3B1' }}>Loading your files…</span>
            </div>
          )}

          {/* Empty */}
          {!loading && files.length === 0 && (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: '#8FA3B1' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
              <p style={{ fontSize: '15px', fontWeight: '500', margin: '0 0 6px' }}>No documents yet</p>
              <p style={{ fontSize: '13px', margin: 0 }}>Your uploaded documents will appear here.</p>
            </div>
          )}

          {/* Mobile: card list */}
          {!loading && files.length > 0 && isMobile && (
            <div>
              {files.map((file, i) => <MobileFileCard key={file.id || i} file={file} index={i} />)}
            </div>
          )}

          {/* Tablet / Desktop: table */}
          {!loading && files.length > 0 && !isMobile && (
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '560px' }}>
                <thead>
                  <tr style={{ background: 'linear-gradient(90deg, #2196F3, #1976D2)' }}>
                    <th style={th}>File Name</th>
                    <th style={th}>Uploaded On</th>
                    <th style={{ ...th, textAlign: 'center' }}>Status</th>
                    <th style={{ ...th, textAlign: 'center' }}>View</th>
                    <th style={{ ...th, textAlign: 'center' }}>Download</th>
                  </tr>
                </thead>
                <tbody>
                  {files.map((file, i) => (
                    <tr key={file.id || i}
                      style={{ background: file.Islatest ? '#F0F8FF' : (i % 2 === 0 ? '#fff' : '#F7FAFD'), transition: 'background 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#EEF6FF')}
                      onMouseLeave={e => (e.currentTarget.style.background = file.Islatest ? '#F0F8FF' : (i % 2 === 0 ? '#fff' : '#F7FAFD'))}>

                      {/* File name */}
                      <td style={td}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '20px', flexShrink: 0 }}>📄</span>
                          <span style={{ fontWeight: '500', color: '#1A1A2E', wordBreak: 'break-word' }}>
                            {file.ActualfileName || file.FileName || '—'}
                          </span>
                        </span>
                      </td>

                      {/* Uploaded on */}
                      <td style={td}>
                        <span style={{ fontSize: '13px', color: '#555F6D' }}>{formatDt(file.CreatedDatetime)}</span>
                      </td>

                      {/* Latest badge */}
                      <td style={{ ...td, textAlign: 'center' }}>
                        {file.Islatest ? (
                          <span style={{ background: '#2196F3', color: '#fff', fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '99px' }}>
                            LATEST
                          </span>
                        ) : (
                          <span style={{ background: '#F5F5F5', color: '#9E9E9E', fontSize: '11px', fontWeight: '600', padding: '3px 10px', borderRadius: '99px' }}>
                            OLD
                          </span>
                        )}
                      </td>

                      {/* View */}
                      <td style={{ ...td, textAlign: 'center' }}>
                        <button
                          onClick={() => handleView(file)}
                          disabled={viewing === file.id}
                          style={{
                            background: viewing === file.id ? '#E3F2FD' : 'linear-gradient(135deg, #2196F3, #1565C0)',
                            color: viewing === file.id ? '#2196F3' : '#fff',
                            border: 'none', borderRadius: '8px',
                            padding: '7px 16px', fontSize: '12px', fontWeight: '600',
                            cursor: viewing === file.id ? 'not-allowed' : 'pointer',
                            display: 'inline-flex', alignItems: 'center', gap: '5px',
                            boxShadow: '0 2px 6px rgba(33,150,243,0.2)',
                            minHeight: '34px',
                          }}
                          onMouseEnter={e => { if (viewing !== file.id) e.currentTarget.style.opacity = '0.88'; }}
                          onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                        >
                          {viewing === file.id ? <><Spinner size={11} color="#2196F3" /> Viewing…</> : '👁 View'}
                        </button>
                      </td>

                      {/* Download */}
                      <td style={{ ...td, textAlign: 'center' }}>
                        <button
                          onClick={() => handleDownload(file)}
                          disabled={downloading === file.id}
                          style={{
                            background: downloading === file.id ? '#E8F5E9' : 'linear-gradient(135deg, #43A047, #2E7D32)',
                            color: downloading === file.id ? '#43A047' : '#fff',
                            border: 'none', borderRadius: '8px',
                            padding: '7px 16px', fontSize: '12px', fontWeight: '600',
                            cursor: downloading === file.id ? 'not-allowed' : 'pointer',
                            display: 'inline-flex', alignItems: 'center', gap: '5px',
                            boxShadow: '0 2px 6px rgba(67,160,71,0.2)',
                            minHeight: '34px',
                          }}
                          onMouseEnter={e => { if (downloading !== file.id) e.currentTarget.style.opacity = '0.88'; }}
                          onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                        >
                          {downloading === file.id ? <><Spinner size={11} color="#43A047" /> Downloading…</> : '⬇ Download'}
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
          position: 'fixed', bottom: 0, left: 0, right: 0,
          padding: '14px 16px', paddingBottom: 'max(14px, env(safe-area-inset-bottom))',
          color: '#B0C4D8', fontSize: isMobile ? '11px' : '13px', textAlign: 'center',
          background: 'rgba(13, 37, 53, 0.92)',
          backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', zIndex: 100,
        }}>
          © 2026 Koundinyasa Technology Services All Rights Reserved.
        </footer>
      </div>
    </>
  );
}