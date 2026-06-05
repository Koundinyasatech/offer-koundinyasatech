import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { useEmployees } from '../../hooks/useEmployees';
import { fileService } from '../../services/fileService';
import AppButton from '../../components/common/AppButton';
import EmployeeTable from '../../components/tables/EmployeeTable';
import { useWindowWidth } from '../../hooks/useWindowWidth';

/* ── Keyframes ── */
const fadeUpStyle = `
  @keyframes kts-fadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;


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
  const handleViewPdf = async (empId) => {
    try { await fileService.viewPdf(empId); }
    catch (err) { toast.error(err?.message || 'Failed to open PDF'); }
  };

  const empOptions = [
    { label: 'Select', value: '' },
    ...employees.map(e => ({ label: String(e.empId), value: String(e.empId) })),
  ];

  /* ── Shared styles ── */
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
    display: 'block',
    marginBottom: '6px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#1A1A2E',
  };

  const fieldStyle = {
    width: '100%',
    padding: isMobile ? '13px 14px' : '11px 14px',
    fontSize: '16px',          /* 16px prevents iOS zoom */
    background: '#EEF3F8',
    border: '1.5px solid transparent',
    borderRadius: '10px',
    outline: 'none',
    color: '#1A1A2E',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    transition: 'border-color 0.18s',
    minHeight: '48px',         /* touch target */
  };

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

        {/* ── Header ── */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'stretch' : 'flex-start',
          flexDirection: isMobile ? 'column' : 'row',
          marginBottom: isMobile ? '16px' : '20px',
          gap: '12px',
          animation: 'kts-fadeUp 0.4s ease both',
        }}>
          {/* Left: greeting + add button */}
          <div>
            <h2 style={{
              color: '#f3f5f8',
              fontSize: isMobile ? '20px' : isTablet ? '22px' : '26px',
              fontWeight: '700',
              marginBottom: '10px',
              lineHeight: 1.2,
            }}>
              Welcome, {user?.name}
            </h2>
            <AppButton
              variant="primary"
              onClick={() => navigate('/admin/employee/add')}
              style={{ width: isMobile ? '100%' : 'auto' }}
            >
              + Add New Employee
            </AppButton>
          </div>

          {/* Right: logout */}
          <AppButton
            variant="outline"
            onClick={handleLogout}
            style={{ width: isMobile ? '100%' : 'auto', alignSelf: isMobile ? 'stretch' : 'flex-start' }}
          >
            Logout
          </AppButton>
        </div>

        {/* ── Upload Form Card ── */}
        <div style={{ ...card, animation: 'kts-fadeUp 0.45s ease 0.07s both' }}>
          <form onSubmit={handleSubmit} noValidate>
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile
                ? '1fr'
                : isTablet
                  ? 'repeat(2, 1fr)'
                  : 'repeat(4, 1fr)',
              gap: '12px',
              alignItems: 'end',
            }}>

              {/* Employee ID */}
              <div>
                <label style={labelStyle}>Employee Id</label>
                <select
                  value={empId}
                  onChange={e => handleEmpSelect(e.target.value)}
                  style={{ ...fieldStyle, cursor: 'pointer' }}
                  onFocus={e => (e.target.style.borderColor = '#2196F3')}
                  onBlur={e => (e.target.style.borderColor = 'transparent')}
                >
                  {empOptions.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              {/* Employee Name */}
              <div>
                <label style={labelStyle}>Employee Name</label>
                <input
                  value={empName}
                  onChange={e => setEmpName(e.target.value)}
                  placeholder=""
                  style={fieldStyle}
                  onFocus={e => (e.target.style.borderColor = '#2196F3')}
                  onBlur={e => (e.target.style.borderColor = 'transparent')}
                />
              </div>

              {/* Designation */}
              <div>
                <label style={labelStyle}>Designation</label>
                <input
                  value={designation}
                  onChange={e => setDesignation(e.target.value)}
                  placeholder=""
                  style={fieldStyle}
                  onFocus={e => (e.target.style.borderColor = '#2196F3')}
                  onBlur={e => (e.target.style.borderColor = 'transparent')}
                />
              </div>

              {/* File upload + Submit */}
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

                <AppButton
                  type="submit"
                  variant="success"
                  loading={submitting}
                  style={{
                    padding: isMobile ? '13px 20px' : '11px 24px',
                    whiteSpace: 'nowrap',
                    width: isMobile ? '100%' : 'auto',
                    minHeight: '48px',
                    flexShrink: 0,
                  }}
                >
                  Submit
                </AppButton>
              </div>

            </div>
          </form>
        </div>

        {/* ── Employee Table Card ── */}
        <div style={{ ...card, animation: 'kts-fadeUp 0.5s ease 0.14s both' }}>
          <p style={{
            fontSize: isMobile ? '13px' : '14px',
            fontWeight: '600',
            color: '#1A1A2E',
            marginBottom: '14px',
            letterSpacing: '0.01em',
          }}>
            All Employees
          </p>
          {/* Horizontal scroll wrapper for table on mobile */}
          <div
            className="table-scroll-wrapper"
            style={{
              overflowX: 'auto',
              WebkitOverflowScrolling: 'touch',
              margin: '0 -4px ',
              scrollbarWidth: 'thin',
              scrollbarColor: '#0e0e0e #f0f4f8'
            }}
          >
            <EmployeeTable
              employees={employees}
              loading={loading}
              onEdit={handleEdit}
              onViewPdf={handleViewPdf}
            />
          </div>
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