import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { fileService } from '../../services/fileService';   // ✅ use fileService, not apiClient directly
import PageBackground from '../../components/layout/PageBackground';
import AppButton from '../../components/common/AppButton';

const th = {
  padding: '14px 20px', color: '#fff',
  fontWeight: '600', fontSize: '14px', textAlign: 'left',
};
const td = {
  padding: '13px 20px', fontSize: '14px', color: '#1A1A2E',
  borderBottom: '1px solid #E0EAF4', verticalAlign: 'middle',
};

export default function EmployeeDashboardPage() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();

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

  return (
      <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e4a5f 0%, #153347 50%, #0d2535 100%)',
      padding: '20px 20px 0',
    }}>

        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: '24px',
          flexWrap: 'wrap', gap: '12px',
        }}>
          <h2 style={{ color: '#f2f3f4', fontSize: '26px', fontWeight: '700', margin: 0 }}>
            Welcome, {user?.name}
          </h2>
          <AppButton variant="outline" onClick={handleLogout}>Logout</AppButton>
        </div>

        {/* Files Table */}
        <div style={{
          background: '#fff', borderRadius: '16px',
          overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(90deg, #2196F3, #1976D2)' }}>
                <th style={th}>Employee ID</th>
                <th style={th}>Offer Letter</th>
                <th style={{ ...th, textAlign: 'center' }}>Download Offer Letter</th>
              </tr>
            </thead>
            <tbody>

              {/* Loading */}
              {loading && (
                <tr>
                  <td colSpan={3} style={{ ...td, textAlign: 'center', padding: '50px', color: '#8FA3B1' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                      <span style={{
                        width: 22, height: 22,
                        border: '3px solid #E0EAF4', borderTopColor: '#2196F3',
                        borderRadius: '50%', display: 'inline-block',
                        animation: 'spin 0.7s linear infinite',
                      }} />
                      Loading files...
                    </div>
                  </td>
                </tr>
              )}

              {/* Empty */}
              {!loading && files.length === 0 && (
                <tr>
                  <td colSpan={3} style={{ ...td, textAlign: 'center', padding: '60px', color: '#8FA3B1', fontSize: '15px' }}>
                    <div style={{ fontSize: '40px', marginBottom: '10px' }}>📄</div>
                    No files uploaded yet
                  </td>
                </tr>
              )}

              {/* Rows — field names match backend: Empid, ActualfileName, Id */}
              {!loading && files.map((file, i) => (
                <tr
                  key={file.Id || i}
                  style={{ background: i % 2 === 0 ? '#fff' : '#F7FAFD', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#EEF6FF'}
                  onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? '#fff' : '#F7FAFD'}
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
                      <span style={{ fontSize: '20px' }}>📄</span>
                      <span style={{ fontWeight: '500', color: '#1A1A2E' }}>
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
                        boxShadow: '0 2px 6px rgba(33,150,243,0.3)',
                        transition: 'opacity 0.2s',
                      }}
                    >
                      {downloading === file.Id ? (
                        <>
                          <span style={{
                            width: 12, height: 12,
                            border: '2px solid #fff', borderTopColor: 'transparent',
                            borderRadius: '50%', display: 'inline-block',
                            animation: 'spin 0.7s linear infinite',
                          }} />
                          Downloading...
                        </>
                      ) : '⬇ Download'}
                    </button>
                  </td>
                </tr>
              ))}

            </tbody>
          </table>
        </div>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
  );
}