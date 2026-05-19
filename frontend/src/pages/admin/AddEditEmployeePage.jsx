import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { useEmployees } from '../../hooks/useEmployees';
import { employeeService } from '../../services/employeeService';
import { fileService } from '../../services/fileService';
import { validateEmployee, hasErrors } from '../../validations/employeeValidation';
import { useDesignations } from '../../hooks/useDesignations';
import PageBackground from '../../components/layout/PageBackground';
import AppButton from '../../components/common/AppButton';
import AppInput from '../../components/common/AppInput';
import AppSelect from '../../components/common/AppSelect';
import EmployeeTable from '../../components/tables/EmployeeTable';

const card = {
  background: '#fff', borderRadius: '16px', padding: '24px',
  boxShadow: '0 2px 12px rgba(0,0,0,0.1)', marginBottom: '16px',
};

export default function AddEditEmployeePage({ mode = 'add' }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { employees, loading: listLoading, fetchEmployees } = useEmployees();
  const { designations, loading: desigLoading } = useDesignations();

  const isEdit = mode === 'edit';
  const existing = location.state?.employee || null;

  const [form, setForm] = useState({
    empId: '', name: '', designation: '', code: '', mobile: '', email: '', isActive: true,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [genLoading, setGenLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef();
  const [designation, SetDesignation] = useState();

  // Populate form on edit
  useEffect(() => {
    if (isEdit && existing) {
      setForm({ empId: String(existing.empId), name: existing.name, designation: existing.designation, code: existing.code, mobile: String(existing.mobile), email: existing.email, isActive: existing.status === 'Active' });
    }
  }, [isEdit, existing]);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  const set = (field, value) => {
    setForm(p => ({ ...p, [field]: value }));
    if (errors[field]) setErrors(p => { const n = { ...p }; delete n[field]; return n; });
  };

  const handleGenerate = async () => {
    setGenLoading(true);
    try { set('code', await employeeService.generateCode()); }
    catch { toast.error('Failed to generate code'); }
    finally { setGenLoading(false); }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    const errs = validateEmployee(form);
    setErrors(errs);
    if (hasErrors(errs)) return;

    // ── Only validate file when adding ──
    if (!isEdit) {
      if (!file) { toast.error('Please choose a PDF file'); return; }
      if (file.type !== 'application/pdf') { toast.error('Only PDF files allowed'); return; }
    }

    setLoading(true);
    setSubmitting(true);

    try {
      const payload = { ...form, status: form.isActive ? 'Active' : 'Inactive' };
      if (isEdit) {
        await employeeService.update(form.empId, payload);
        toast.success('Employee updated successfully');
      } else {
        await employeeService.add(payload);
        toast.success('Employee added successfully');

        // ── Only upload file when adding ──
        try {
          await fileService.upload(form.empId, file);
          toast.success('File uploaded successfully');
        } catch (uploadErr) {
          toast.warn(uploadErr?.response?.data?.message || 'Employee saved, but file upload failed');
        }
      }

      setFile(null);
      if (fileRef.current) fileRef.current.value = '';
      navigate('/admin/dashboard');

    } catch (err) {
      toast.error(err?.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };




  const handleLogout = () => { logout(); navigate('/login', { replace: true }); };

  const handleEditFromTable = (emp) => {
    navigate(`/admin/employee/edit/${emp.empId}`, { state: { employee: emp } });
  };


  const handleViewPdf = async (empId) => {
    try {
      await fileService.viewPdf(empId);
    } catch (err) {
      toast.error(err?.message || 'Failed to open PDF');
    }
  };

  const gridRow = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '12px', marginBottom: '4px' };

  return (
    <PageBackground>
      <div style={{
        background: 'linear-gradient(135deg, #1e4a5f 0%, #153347 50%, #0d2535 100%)',
        padding: '20px 20px 0',
      }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <AppButton variant="outline" onClick={() => navigate('/admin/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            ← Back
          </AppButton>
          <AppButton variant="outline" onClick={handleLogout}>Logout</AppButton>
        </div>

        {/* ── Form Card ── */}
        <div style={card}>
          <form onSubmit={handleSubmit} noValidate>
            {/* Row 1: EmpId, Name, Designation, Code+Generate */}
            <div style={gridRow}>
              <AppInput label="Employee Id" value={form.empId} onChange={e => set('empId', e.target.value)}
                error={errors.empId} disabled={isEdit} placeholder="" />
              <AppInput label="Employee Name" value={form.name} onChange={e => set('name', e.target.value)}
                error={errors.name} placeholder="" />
              <AppSelect label="Designation" value={form.designation} onChange={e => set('designation', e.target.value)} options={designations} disabled={desigLoading} />
              {/* Code + Generate */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#1A1A2E' }}>Code</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <AppButton type="button" variant="success" loading={genLoading} onClick={handleGenerate} style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                    Generate
                  </AppButton>
                  <input value={form.code} readOnly placeholder=""
                    style={{ flex: 1, padding: '11px 14px', fontSize: '14px', background: '#EEF3F8', border: '1.5px solid transparent', borderRadius: '10px', outline: 'none', color: '#1A1A2E', fontFamily: 'inherit' }} />
                </div>
              </div>
            </div>

            {/* Row 2: Mobile, Email, Active, Update */}
            <div style={{ ...gridRow, alignItems: 'end' }}>
              <AppInput label="Mobile Number" value={form.mobile} onChange={e => set('mobile', e.target.value)}
                error={errors.mobile} placeholder="" type="tel" />
              <AppInput label="Email" value={form.email} onChange={e => set('email', e.target.value)}
                error={errors.email} placeholder="" type="email" />
              {/* Active checkbox */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#1A1A2E' }}>Active</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.isActive} onChange={e => set('isActive', e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: '#2196F3', cursor: 'pointer' }} />
                  <span style={{ fontSize: '14px', color: form.isActive ? '#2E7D32' : '#757575' }}>
                    {form.isActive ? 'Active' : 'Inactive'}
                  </span>
                </label>
              </div>
              {!isEdit && (
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#1A1A2E' }}>Upload file</label>
                    <input ref={fileRef} type="file" accept="application/pdf"
                      onChange={e => setFile(e.target.files[0] || null)}
                      style={{ fontSize: '13px', color: '#1A1A2E' }} />
                  </div>
                </div>
              )}

              {/* Submit */}
              <div style={{ marginBottom: '14px' }}>
                <AppButton type="submit" variant="success" loading={loading} style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
                  {isEdit ? 'Update' : 'Add Employee'}
                </AppButton>
              </div>
            </div>
          </form>
        </div>

        {/* ── Employee Table Card ── */}
        <div style={card}>
          <EmployeeTable employees={employees} loading={listLoading} onEdit={handleEditFromTable} onViewPdf={handleViewPdf} />
        </div>

      </div>
    </PageBackground>
  );
}