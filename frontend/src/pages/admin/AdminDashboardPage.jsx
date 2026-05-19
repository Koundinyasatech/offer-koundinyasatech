import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { useEmployees } from '../../hooks/useEmployees';
import { fileService } from '../../services/fileService';
import { useDesignations } from '../../hooks/useDesignations';
import PageBackground from '../../components/layout/PageBackground';
import AppButton from '../../components/common/AppButton';
import EmployeeTable from '../../components/tables/EmployeeTable';

const card = {
  background: '#fff', borderRadius: '16px', padding: '20px 24px',
  boxShadow: '0 2px 12px rgba(0,0,0,0.1)', marginBottom: '16px',
};

export default function AdminDashboardPage() {
  const { user, logout }   = useNavigate ? useAuth() : {};
  const navigate           = useNavigate();
  const { employees, loading, fetchEmployees } = useEmployees();

  // Upload form state
  const [empId,       setEmpId]       = useState('');
  const [empName,     setEmpName]     = useState('');
  const [designation, setDesignation] = useState();
  const [file,        setFile]        = useState(null);
  const [submitting,  setSubmitting]  = useState(false);
  const fileRef = useRef();

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  // Auto-fill name + designation when empId selected
  const handleEmpSelect = (id) => {
    setEmpId(id);
    const emp = employees.find(e => String(e.empId) === id);
    if (emp) { setEmpName(emp.name); setDesignation(emp.designation); }
    else     { setEmpName(''); setDesignation(''); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!empId)  { toast.error('Please select an Employee ID'); return; }
    if (!file)   { toast.error('Please choose a PDF file');     return; }
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
  const handleEdit   = (emp) => navigate(`/admin/employee/edit/${emp.empId}`, { state: { employee: emp } });

  const handleViewPdf = async (empId) => {
    try {
      await fileService.viewPdf(empId);
    } catch (err) {
      toast.error(err?.message || 'Failed to open PDF');
    }
  };

  const empOptions = [
    { label: 'Select', value: '' },
    ...employees.map(e => ({ label: String(e.empId), value: String(e.empId) })),
  ];

  return (
    <PageBackground>
      <div style={{
      background: 'linear-gradient(135deg, #1e4a5f 0%, #153347 50%, #0d2535 100%)',
      padding: '20px 20px 0',
    }}>

        {/* style={{ padding: '20px 20px 0' }} */}
        {/* ── Header ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ color: '#f3f5f8', fontSize: '26px', fontWeight: '700', marginBottom: '10px' }}>
              Welcome, {user?.name}
            </h2>
            <AppButton variant="primary" onClick={() => navigate('/admin/employee/add')}>
              + Add New Employee
            </AppButton>
          </div>
          <AppButton variant="outline" onClick={handleLogout}>Logout</AppButton>
        </div>

        {/* ── Upload Form Card ── */}
        <div style={card}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', alignItems: 'end' }}>

              {/* Employee ID dropdown */}
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#1A1A2E' }}>Employee Id</label>
                <select value={empId} onChange={e => handleEmpSelect(e.target.value)}
                  style={{ width: '100%', padding: '11px 14px', fontSize: '14px', background: '#EEF3F8', border: '1.5px solid transparent', borderRadius: '10px', outline: 'none', color: '#1A1A2E', fontFamily: 'inherit', cursor: 'pointer' }}>
                  {empOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>

              {/* Employee Name */}
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#1A1A2E' }}>Employee Name</label>
                <input value={empName} onChange={e => setEmpName(e.target.value)} placeholder=""
                  style={{ width: '100%', padding: '11px 14px', fontSize: '14px', background: '#EEF3F8', border: '1.5px solid transparent', borderRadius: '10px', outline: 'none', color: '#1A1A2E', fontFamily: 'inherit', boxSizing: 'border-box' }} />
              </div>

              {/* Designation */}
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#1A1A2E' }}>Designation</label>
                <input value={designation} onChange={e => setDesignation(e.target.value)} placeholder=""
                  style={{ width: '100%', padding: '11px 14px', fontSize: '14px', background: '#EEF3F8', border: '1.5px solid transparent', borderRadius: '10px', outline: 'none', color: '#1A1A2E', fontFamily: 'inherit', boxSizing: 'border-box' }} />
              </div>

              {/* File upload + Submit */}
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#1A1A2E' }}>Upload file</label>
                  <input ref={fileRef} type="file" accept="application/pdf"
                    onChange={e => setFile(e.target.files[0] || null)}
                    style={{ fontSize: '13px', color: '#1A1A2E' }} />
                </div>
                <AppButton type="submit" variant="success" loading={submitting} style={{ padding: '11px 28px', whiteSpace: 'nowrap' }}>
                  Submit
                </AppButton>
              </div>

            </div>
          </form>
        </div>

        {/* ── Employee Table Card ── */}
        <div style={card}>
          <EmployeeTable employees={employees} loading={loading} onEdit={handleEdit} onViewPdf={handleViewPdf}/>
        </div>

      </div>
    </PageBackground>
  );
}