import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { useEmployees } from '../../hooks/useEmployees';
import { fileService } from '../../services/fileService';
import AppButton from '../../components/common/AppButton';
import EmployeeTable from '../../components/tables/EmployeeTable';
import { useWindowWidth } from '../../hooks/useWindowWidth';

const fadeUpStyle = `
  @keyframes kts-fadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes kts-spin {
    to { transform: rotate(360deg); }
  }
  @keyframes kts-modalIn {
    from { opacity: 0; transform: scale(0.95) translateY(10px); }
    to   { opacity: 1; transform: scale(1)    translateY(0); }
  }
`;

/* ── Small spinner ── */
const Spinner = ({ size = 16, color = '#2196F3' }) => (
  <span style={{
    width: size, height: size,
    border: `2px solid ${color}30`,
    borderTopColor: color,
    borderRadius: '50%',
    display: 'inline-block',
    flexShrink: 0,
    animation: 'kts-spin 0.7s linear infinite',
  }} />
);

/* ══════════════════════════════════════════════════════
   FILE LIST MODAL
══════════════════════════════════════════════════════ */
const FileListModal = ({ employee, onClose, isMobile }) => {
  const [files, setFiles] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [viewing, setViewing] = useState(null);
  const [downloading, setDownloading] = useState(null);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    if (!employee) return;
    setLoadingList(true);
    fileService
      .getFilesList(employee.empId)
      .then(data => setFiles(Array.isArray(data) ? data : []))
      .catch(() => toast.error('Failed to load files'))
      .finally(() => setLoadingList(false));
  }, [employee]);

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
  const handleDelete = async (file) => {
    if (!window.confirm(`Delete "${file.ActualfileName}"? This cannot be undone.`)) return;
    setDeleting(file.id);
    try {
      await fileService.deleteFile(file.id);
      toast.success('File deleted');
      setFiles(prev => prev.filter(f => f.id !== file.id)); // remove from UI instantly
    } catch {
      toast.error('Failed to delete file');
    } finally {
      setDeleting(null);
    }
  };

  const formatDt = (dt) => {
    if (!dt) return '—';
    try { return new Date(dt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
    catch { return dt; }
  };

  return (
    /* ── Backdrop ── */
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(3px)',
        zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: isMobile ? '12px' : '24px',
      }}
    >
      {/* ── Modal box ── */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: isMobile ? '14px' : '20px',
          width: '100%',
          maxWidth: '640px',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          animation: 'kts-modalIn 0.25s ease both',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          padding: isMobile ? '16px 20px' : '20px 28px',
          borderBottom: '1px solid #E0EAF4',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
          background: 'linear-gradient(90deg, #2196F3, #1565C0)',
        }}>
          <div>
            <p style={{ color: '#fff', fontWeight: '700', fontSize: isMobile ? '15px' : '17px', margin: 0 }}>
              📁 Files — {employee?.name}
            </p>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '12px', margin: '3px 0 0' }}>
              Employee ID: {employee?.empId}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.2)', border: 'none',
              borderRadius: '50%', width: '34px', height: '34px',
              cursor: 'pointer', color: '#fff', fontSize: '18px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '16px' : '20px 28px' }}>

          {/* Loading */}
          {loadingList && (
            <div style={{ textAlign: 'center', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <Spinner size={28} />
              <span style={{ color: '#8FA3B1', fontSize: '14px' }}>Loading files…</span>
            </div>
          )}

          {/* Empty */}
          {!loadingList && files.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#8FA3B1' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
              <p style={{ fontWeight: '500', fontSize: '15px', margin: '0 0 6px' }}>No files uploaded yet</p>
              <p style={{ fontSize: '13px', margin: 0 }}>Upload a PDF from the dashboard to see it here.</p>
            </div>
          )}

          {/* File list */}
          {!loadingList && files.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {files.map((file, i) => (
                <div key={file.id || i} style={{
                  border: `1.5px solid ${file.Islatest ? '#BBDEFB' : '#E0EAF4'}`,
                  borderRadius: '12px',
                  padding: isMobile ? '12px 14px' : '14px 18px',
                  background: file.Islatest ? '#F0F8FF' : '#FAFBFC',
                  display: 'flex',
                  alignItems: isMobile ? 'flex-start' : 'center',
                  flexDirection: isMobile ? 'column' : 'row',
                  gap: '12px',
                }}>
                  {/* Icon + info */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: '28px', flexShrink: 0, lineHeight: 1 }}>📄</span>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <p style={{
                          fontWeight: '600', fontSize: '13px', color: '#1A1A2E',
                          margin: 0, wordBreak: 'break-word',
                        }}>
                          {file.ActualfileName || file.FileName || 'document.pdf'}
                        </p>
                        {file.Islatest && (
                          <span style={{
                            background: '#2196F3', color: '#fff',
                            fontSize: '10px', fontWeight: '700',
                            padding: '2px 8px', borderRadius: '99px', letterSpacing: '0.04em',
                          }}>
                            LATEST
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: '12px', color: '#8FA3B1', margin: '4px 0 0' }}>
                        Uploaded: {formatDt(file.CreatedDatetime)}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '8px', flexShrink: 0, width: isMobile ? '100%' : 'auto' }}>
                    {/* View */}
                    <button
                      onClick={() => handleView(file)}
                      disabled={viewing === file.id}
                      style={{
                        flex: isMobile ? 1 : 'none',
                        background: viewing === file.id ? '#E3F2FD' : 'linear-gradient(135deg, #2196F3, #1565C0)',
                        color: viewing === file.id ? '#2196F3' : '#fff',
                        border: 'none', borderRadius: '8px',
                        padding: '8px 16px', fontSize: '12px', fontWeight: '600',
                        cursor: viewing === file.id ? 'not-allowed' : 'pointer',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                        minHeight: '36px', whiteSpace: 'nowrap',
                      }}
                    >
                      {viewing === file.id ? <><Spinner size={12} color="#2196F3" /> Viewing…</> : '👁 View'}
                    </button>
                    <button
                      onClick={() => handleDelete(file)}
                      disabled={deleting === file.id}
                      style={{
                        flex: isMobile ? 1 : 'none',
                        background: deleting === file.id ? '#FFEBEE' : 'linear-gradient(135deg, #EF5350, #C62828)',
                        color: deleting === file.id ? '#C62828' : '#fff',
                        border: 'none', borderRadius: '8px',
                        padding: '8px 16px', fontSize: '12px', fontWeight: '600',
                        cursor: deleting === file.id ? 'not-allowed' : 'pointer',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                        minHeight: '36px', whiteSpace: 'nowrap',
                      }}
                    >
                      {deleting === file.id ? <><Spinner size={12} color="#C62828" /> Deleting…</> : '🗑 Delete'}
                    </button>

                    {/* Download */}
                    <button
                      onClick={() => handleDownload(file)}
                      disabled={downloading === file.id}
                      style={{
                        flex: isMobile ? 1 : 'none',
                        background: downloading === file.id ? '#E8F5E9' : 'linear-gradient(135deg, #43A047, #2E7D32)',
                        color: downloading === file.id ? '#43A047' : '#fff',
                        border: 'none', borderRadius: '8px',
                        padding: '8px 16px', fontSize: '12px', fontWeight: '600',
                        cursor: downloading === file.id ? 'not-allowed' : 'pointer',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                        minHeight: '36px', whiteSpace: 'nowrap',
                      }}
                    >
                      {downloading === file.id ? <><Spinner size={12} color="#43A047" /> Downloading…</> : '⬇ Download'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: isMobile ? '12px 20px' : '14px 28px',
          borderTop: '1px solid #E0EAF4',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: '#FAFBFC',
        }}>
          <span style={{ fontSize: '13px', color: '#8FA3B1' }}>
            {files.length} {files.length === 1 ? 'file' : 'files'} total
          </span>
          <button
            onClick={onClose}
            style={{
              background: '#EEF3F8', border: 'none', borderRadius: '8px',
              padding: '8px 20px', fontSize: '13px', fontWeight: '600',
              cursor: 'pointer', color: '#1A1A2E',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════
   ADMIN DASHBOARD PAGE
══════════════════════════════════════════════════════ */
export default function AdminDashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { employees, loading, fetchEmployees } = useEmployees();
  const w = useWindowWidth();
  const isMobile = w < 480;
  const isTablet = w < 768;

  /* Upload form state */
  const [empId, setEmpId] = useState('');
  const [empName, setEmpName] = useState('');
  const [designation, setDesignation] = useState('');
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef();

  /* File modal state */
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [showFileModal, setShowFileModal] = useState(false);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  const handleEmpSelect = (id) => {
    setEmpId(id);
    const emp = employees.find(e => String(e.empId) === id);
    if (emp) { setEmpName(emp.name); setDesignation(emp.designation); }
    else { setEmpName(''); setDesignation(''); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!empId) { toast.error('Please select an Employee ID'); return; }
    if (!file) { toast.error('Please choose a PDF file'); return; }
    if (file.type !== 'application/pdf') { toast.error('Only PDF files allowed'); return; }
    setSubmitting(true);
    try {
      await fileService.upload(empId, file);
      toast.success('File uploaded successfully');
      setEmpId(''); setEmpName(''); setDesignation(''); setFile(null);
      if (fileRef.current) fileRef.current.value = '';
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Upload failed');
    } finally { setSubmitting(false); }
  };

  const handleLogout = () => { logout(); navigate('/login', { replace: true }); };
  const handleEdit = (emp) => navigate(`/admin/employee/edit/${emp.empId}`, { state: { employee: emp } });

  /* Open file modal */
  const handleViewFiles = (emp) => {
    setSelectedEmp(emp);
    setShowFileModal(true);
  };

  const empOptions = [
    { label: 'Select', value: '' },
    ...employees.map(e => ({ label: String(e.empId), value: String(e.empId) })),
  ];

  /* ── Styles ── */
  const pagePad = isMobile ? '14px 12px 80px' : isTablet ? '18px 16px 80px' : '24px 24px 80px';

  const card = {
    background: '#fff',
    borderRadius: isMobile ? '12px' : '16px',
    padding: isMobile ? '16px' : isTablet ? '18px 20px' : '20px 24px',
    boxShadow: '0 2px 14px rgba(0,0,0,0.10)',
    marginBottom: '16px',
    boxSizing: 'border-box',
  };

  const labelStyle = {
    display: 'block', marginBottom: '6px',
    fontSize: '14px', fontWeight: '500', color: '#1A1A2E',
  };

  const fieldStyle = {
    width: '100%',
    padding: isMobile ? '13px 14px' : '11px 14px',
    fontSize: '16px',
    background: '#EEF3F8', border: '1.5px solid transparent',
    borderRadius: '10px', outline: 'none', color: '#1A1A2E',
    fontFamily: 'inherit', boxSizing: 'border-box',
    transition: 'border-color 0.18s', minHeight: '48px',
  };

  return (
    <>
      <style>{fadeUpStyle}</style>

      {/* File list modal */}
      {showFileModal && selectedEmp && (
        <FileListModal
          employee={selectedEmp}
          onClose={() => { setShowFileModal(false); setSelectedEmp(null); }}
          isMobile={isMobile}
        />
      )}

      <div style={{
        minHeight: '100vh', minHeight: '100dvh',
        background: 'linear-gradient(135deg, #1e4a5f 0%, #153347 50%, #0d2535 100%)',
        padding: pagePad, boxSizing: 'border-box',
      }}>

        {/* ── Header ── */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: isMobile ? 'stretch' : 'flex-start',
          flexDirection: isMobile ? 'column' : 'row',
          marginBottom: isMobile ? '16px' : '20px',
          gap: '12px', animation: 'kts-fadeUp 0.4s ease both',
        }}>
          <div>
            <h2 style={{ color: '#f3f5f8', fontSize: isMobile ? '20px' : isTablet ? '22px' : '26px', fontWeight: '700', marginBottom: '10px', lineHeight: 1.2 }}>
              Welcome, {user?.name}
            </h2>
            <AppButton variant="primary" onClick={() => navigate('/admin/employee/add')} style={{ width: isMobile ? '100%' : 'auto' }}>
              + Add New Employee
            </AppButton>
          </div>
          <AppButton variant="outline" onClick={handleLogout} style={{ width: isMobile ? '100%' : 'auto', alignSelf: isMobile ? 'stretch' : 'flex-start' }}>
            Logout
          </AppButton>
        </div>

        {/* ── Upload Form Card ── */}
        <div style={{ ...card, animation: 'kts-fadeUp 0.45s ease 0.07s both' }}>
          <form onSubmit={handleSubmit} noValidate>
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
              gap: '12px', alignItems: 'end',
            }}>
              {/* Employee ID */}
              <div>
                <label style={labelStyle}>Employee Id</label>
                <select value={empId} onChange={e => handleEmpSelect(e.target.value)}
                  style={{ ...fieldStyle, cursor: 'pointer' }}
                  onFocus={e => (e.target.style.borderColor = '#2196F3')}
                  onBlur={e => (e.target.style.borderColor = 'transparent')}>
                  {empOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>

              {/* Name */}
              <div>
                <label style={labelStyle}>Employee Name</label>
                <input value={empName} onChange={e => setEmpName(e.target.value)} style={fieldStyle}
                  onFocus={e => (e.target.style.borderColor = '#2196F3')}
                  onBlur={e => (e.target.style.borderColor = 'transparent')} />
              </div>

              {/* Designation */}
              <div>
                <label style={labelStyle}>Designation</label>
                <input value={designation} onChange={e => setDesignation(e.target.value)} style={fieldStyle}
                  onFocus={e => (e.target.style.borderColor = '#2196F3')}
                  onBlur={e => (e.target.style.borderColor = 'transparent')} />
              </div>

              {/* File + Submit */}
              <div style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: isMobile ? 'stretch' : 'flex-end',
                gap: '10px',
              }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Upload file</label>
                  {/* Custom styled file button */}
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: isMobile ? '13px 14px' : '11px 14px',
                    background: '#EEF3F8',
                    borderRadius: '10px',
                    border: '1.5px solid transparent',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: file ? '#1A1A2E' : '#8FA3B1',
                    boxSizing: 'border-box',
                    minHeight: '48px',
                    overflow: 'hidden',
                  }}>
                    {/* <span style={{ fontSize: '16px' }}>📎</span> */}
                    <span style={{
                      flex: 1,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      fontSize: '13px',
                    }}>

                    </span>
                    <input ref={fileRef} type="file" accept="application/pdf"
                      onChange={e => setFile(e.target.files[0] || null)}
                      style={{ fontSize: '13px', color: '#1A1A2E' }} />
                  </label>
                </div>
                <AppButton type="submit" variant="success" loading={submitting}
                  style={{ padding: isMobile ? '13px 20px' : '11px 24px', whiteSpace: 'nowrap', width: isMobile ? '100%' : 'auto', minHeight: '48px', flexShrink: 0 }}>
                  Submit
                </AppButton>
              </div>
            </div>
          </form>
        </div>

        {/* ── Employee Table Card ── */}
        <div style={{ ...card, animation: 'kts-fadeUp 0.5s ease 0.14s both' }}>
          <p style={{ fontSize: isMobile ? '13px' : '14px', fontWeight: '600', color: '#1A1A2E', marginBottom: '14px', letterSpacing: '0.01em' }}>
            All Employees
          </p>
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', margin: '0 -4px', scrollbarWidth: 'thin', scrollbarColor: '#B0C4D8 #f0f4f8' }}>
            <EmployeeTable
              employees={employees}
              loading={loading}
              onEdit={handleEdit}
              onViewFiles={handleViewFiles}
            />
          </div>
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