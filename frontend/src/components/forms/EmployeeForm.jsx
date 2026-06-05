import React, { useState } from 'react';
import AppInput from '../common/AppInput';
import AppSelect from '../common/AppSelect';
import AppButton from '../common/AppButton';
import { DESIGNATIONS } from '../../constants/api';
import { employeeService } from '../../services/employeeService';
import { validateEmployee, hasErrors } from '../../validations/employeeValidation';
import { toast } from 'react-toastify';

const EmployeeForm = ({ initial = null, onSuccess }) => {
  const isEdit = !!initial;

  const [form, setForm] = useState({
    empId: initial?.empId || '',
    name: initial?.name || '',
    designation: initial?.designation || '',
    code: initial?.code || '',
    mobile: initial?.mobile || '',
    email: initial?.email || '',
    DOJ: initial?.DOJ || '',
    DOE: initial?.DOE || '',
    isActive: initial ? initial.status === 'Active' : true,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [genLoading, setGenLoading] = useState(false);

  const set = (field, value) => {
    setForm(p => ({ ...p, [field]: value }));
    if (errors[field]) setErrors(p => { const n = { ...p }; delete n[field]; return n; });
  };

  const handleGenerate = async () => {
    setGenLoading(true);
    try {
      const code = await employeeService.generateCode();
      set('code', code);
    } catch { toast.error('Failed to generate code'); }
    finally { setGenLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateEmployee(form);
    setErrors(errs);
    if (hasErrors(errs)) return;

    setLoading(true);
    try {
      const payload = { ...form, status: form.isActive ? 'Active' : 'Inactive' };
      if (isEdit) {
        await employeeService.update(form.empId, payload);
        toast.success('Employee updated successfully');
      } else {
        await employeeService.add(payload);
        toast.success('Employee added successfully');
      }
      onSuccess?.();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const row = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' };

  return (
    <form onSubmit={handleSubmit}>
      {/* Row 1: ID, Name, Designation, Code+Generate */}
      <div style={row}>
        <AppInput label="Employee Id" value={form.empId} onChange={e => set('empId', e.target.value)}
          error={errors.empId} disabled={isEdit} placeholder="" />
        <AppInput label="Employee Name" value={form.name} onChange={e => set('name', e.target.value)}
          error={errors.name} placeholder="" />
        <AppSelect label="Designation" value={form.designation} onChange={e => set('designation', e.target.value)}
          options={DESIGNATIONS} error={errors.designation} />
        {/* Code + Generate button */}
        <div style={{ marginBottom: '14px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#1A1A2E' }}>Code</label>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <AppButton type="button" variant="success" loading={genLoading} onClick={handleGenerate} style={{ whiteSpace: 'nowrap', padding: '10px 14px' }}>
              Generate
            </AppButton>
            <input value={form.code} onChange={e => set('code', e.target.value)} readOnly placeholder=""
              style={{ flex: 1, padding: '11px 14px', fontSize: '15px', background: '#EEF3F8', border: '1.5px solid transparent', borderRadius: '10px', outline: 'none', color: '#1A1A2E', fontFamily: 'inherit' }} />
          </div>
        </div>
      </div>

      {/* Row 2: Mobile, Email, Active, Submit */}
      <div style={{ ...row, alignItems: 'end' }}>
        <AppInput label="Mobile Number" value={form.mobile} onChange={e => set('mobile', e.target.value)}
          error={errors.mobile} placeholder="" type="tel" />
        <AppInput label="Email" value={form.email} onChange={e => set('email', e.target.value)}
          error={errors.email} placeholder="" type="email" />
        <AppInput
          label="DOJ"
          value={form.DOJ}
          onChange={e => set('DOJ', e.target.value)}
          type="date"
        />
        <AppInput
          label="DOE"
          value={form.DOE}
          onChange={e => set('DOE', e.target.value)}
          type="date"
        />
        {/* Active checkbox */}
        <div style={{ marginBottom: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '14px', fontWeight: '500', color: '#1A1A2E' }}>Active</label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input type="checkbox" checked={form.isActive} onChange={e => set('isActive', e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: '#2196F3', cursor: 'pointer' }} />
            <span style={{ fontSize: '14px', color: form.isActive ? '#2E7D32' : '#757575' }}>{form.isActive ? 'Active' : 'Inactive'}</span>
          </label>
        </div>
        {/* Submit */}
        <div style={{ marginBottom: '14px' }}>
          <AppButton type="submit" variant="success" loading={loading} style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
            {isEdit ? 'Update' : 'Add Employee'}
          </AppButton>
        </div>
      </div>
    </form>
  );
};

export default EmployeeForm;