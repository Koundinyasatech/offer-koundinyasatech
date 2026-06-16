// import React, { useEffect, useState, useRef } from 'react';
// import { useNavigate, useLocation, useParams } from 'react-router-dom';
// import { toast } from 'react-toastify';
// import { useAuth } from '../../context/AuthContext';
// import { useEmployees } from '../../hooks/useEmployees';
// import { employeeService } from '../../services/employeeService';
// import { fileService } from '../../services/fileService';
// import { validateEmployee, hasErrors } from '../../validations/employeeValidation';
// import { useDesignations } from '../../hooks/useDesignations';
// import AppButton from '../../components/common/AppButton';
// import AppInput from '../../components/common/AppInput';
// import AppSelect from '../../components/common/AppSelect';
// import EmployeeTable from '../../components/tables/EmployeeTable';
// import { useWindowWidth } from '../../hooks/useWindowWidth';

// /* ── Keyframes ── */
// const fadeUpStyle = `
//   @keyframes kts-fadeUp {
//     from { opacity: 0; transform: translateY(14px); }
//     to   { opacity: 1; transform: translateY(0); }
//   }
// `;

// export default function AddEditEmployeePage({ mode = 'add' }) {
//   const { logout, user } = useAuth();
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { id } = useParams();
//   const { employees, loading: listLoading, fetchEmployees } = useEmployees();
//   const { designations, loading: desigLoading } = useDesignations();

//   const isEdit = mode === 'edit';
//   const existing = location.state?.employee || null;

//   const w = useWindowWidth();
//   const isMobile = w < 480;
//   const isTablet = w < 768;

//   const [form, setForm] = useState({
//     empId: '', name: '', designation: '', code: '',
//     mobile: '', email: '', DOJ: '', DOE: '', isActive: true,
//   });
//   const [errors, setErrors] = useState({});
//   const [loading, setLoading] = useState(false);
//   const [genLoading, setGenLoading] = useState(false);
//   const [file, setFile] = useState(null);
//   const [submitting, setSubmitting] = useState(false);
//   const fileRef = useRef();


//   /* Populate form on edit */
//   useEffect(() => {
//     if (isEdit && existing) {
//       setForm({
//         empId: String(existing.empId),
//         name: existing.name,
//         designation: existing.designation,
//         code: existing.code,
//         mobile: String(existing.mobile),
//         email: existing.email,
//         DOJ: existing.DOJ,
//         DOE: existing.DOE,
//         isActive: existing.status === 'Active',
//       });
//     }
//   }, [isEdit, existing]);

//   useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

//   const set = (field, value) => {
//     setForm(p => ({ ...p, [field]: value }));
//     if (errors[field]) setErrors(p => { const n = { ...p }; delete n[field]; return n; });
//   };

//   const handleGenerate = async () => {
//     setGenLoading(true);
//     try { set('code', await employeeService.generateCode()); }
//     catch { toast.error('Failed to generate code'); }
//     finally { setGenLoading(false); }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     const errs = validateEmployee(form);
//     setErrors(errs);
//     console.log(form)
//     if (hasErrors(errs)) return;
//     if (!isEdit) {
//       if (!file) { toast.error('Please choose a PDF file'); return; }
//       if (file.type !== 'application/pdf') { toast.error('Only PDF files allowed'); return; }
//     }
//     setLoading(true); setSubmitting(true);
//     try {
//       const payload = { ...form, status: form.isActive ? 'Active' : 'Inactive' };
//       if (isEdit) {
//         await employeeService.update(form.empId, payload);
//         toast.success('Employee updated successfully');
//       } else {
//         await employeeService.add(payload);
//         toast.success('Employee added successfully');
//         try {
//           await fileService.upload(form.empId, file);
//           toast.success('File uploaded successfully');
//         } catch (uploadErr) {
//           toast.warn(uploadErr?.response?.data?.message || 'Employee saved, but file upload failed');
//         }
//       }
//       setFile(null);
//       if (fileRef.current) fileRef.current.value = '';
//       navigate('/admin/dashboard');
//     } catch (err) {
//       toast.error(err?.response?.data?.message || 'Operation failed');
//     } finally { setLoading(false); setSubmitting(false); }
//   };

//   const handleLogout = () => { logout(); navigate('/login', { replace: true }); };
//   const handleEditFromTable = (emp) => navigate(`/admin/employee/edit/${emp.empId}`, { state: { employee: emp } });
//   const handleViewPdf = async (empId) => {
//     try { await fileService.viewPdf(empId); }
//     catch (err) { toast.error(err?.message || 'Failed to open PDF'); }
//   };

//   /* ── Shared styles ── */
//   const pagePad = isMobile ? '14px 12px 80px' : isTablet ? '18px 16px 80px' : '24px 24px 80px';

//   const card = {
//     background: '#fff',
//     borderRadius: isMobile ? '12px' : '16px',
//     padding: isMobile ? '16px' : isTablet ? '18px 20px' : '24px',
//     boxShadow: '0 2px 14px rgba(0,0,0,0.10)',
//     marginBottom: '16px',
//     boxSizing: 'border-box',
//   };

//   const labelStyle = {
//     display: 'block',
//     marginBottom: '6px',
//     fontSize: '14px',
//     fontWeight: '500',
//     color: '#1A1A2E',
//   };

//   const readonlyInputStyle = {
//     flex: 1,
//     padding: isMobile ? '13px 14px' : '11px 14px',
//     fontSize: '16px',
//     background: '#EEF3F8',
//     border: '1.5px solid transparent',
//     borderRadius: '10px',
//     outline: 'none',
//     color: '#1A1A2E',
//     fontFamily: 'inherit',
//     boxSizing: 'border-box',
//     minHeight: '48px',
//   };

//   /* Grid: 1 col mobile → 2 col tablet → 4 col desktop */
//   const formGrid = {
//     display: 'grid',
//     gridTemplateColumns: isMobile
//       ? '1fr'
//       : isTablet
//         ? 'repeat(2, 1fr)'
//         : 'repeat(4, 1fr)',
//     gap: '12px',
//     marginBottom: '4px',
//   };

//   return (
//     <>
//       <style>{fadeUpStyle}</style>

//       <div style={{
//         minHeight: '100vh',
//         minHeight: '100dvh',
//         background: 'linear-gradient(135deg, #1e4a5f 0%, #153347 50%, #0d2535 100%)',
//         padding: pagePad,
//         boxSizing: 'border-box',
//       }}>

//         {/* ── Header ── */}
//         <div style={{
//           display: 'flex',
//           justifyContent: 'space-between',
//           alignItems: 'center',
//           marginBottom: '16px',
//           gap: '10px',
//           animation: 'kts-fadeUp 0.4s ease both',
//         }}>
//           <AppButton
//             variant="outline"
//             onClick={() => navigate('/admin/dashboard')}
//             style={{ display: 'flex', alignItems: 'center', gap: '6px', minHeight: '44px' }}
//           >
//             ← Back
//           </AppButton>


//           <AppButton
//             variant="outline"
//             onClick={handleLogout}
//             style={{ minHeight: '44px' }}
//           >
//             Logout
//           </AppButton>
//         </div>

//         {/* ── Form Card ── */}
//         <div style={{ ...card, animation: 'kts-fadeUp 0.45s ease 0.07s both' }}>

//           {/* Section label */}
//           {/* <p style={{
//             fontSize: '13px',
//             fontWeight: '600',
//             color: '#8FA3B1',
//             textTransform: 'uppercase',
//             letterSpacing: '0.06em',
//             marginBottom: '16px',
//           }}>
//             {isEdit ? 'Employee Details' : 'New Employee'}
//           </p> */}

//           <form onSubmit={handleSubmit} noValidate>

//             {/* ── Row 1: EmpId · Name · Designation · Code ── */}
//             <div style={formGrid}>

//               <AppInput
//                 label="Employee Id"
//                 value={form.empId}
//                 onChange={e => set('empId', e.target.value)}
//                 error={errors.empId}
//                 disabled={isEdit}
//                 placeholder=""
//               />

//               <AppInput
//                 label="Employee Name"
//                 value={form.name}
//                 onChange={e => set('name', e.target.value)}
//                 error={errors.name}
//                 placeholder=""
//               />

//               <AppSelect
//                 label="Designation"
//                 value={form.designation}
//                 onChange={e => set('designation', e.target.value)}
//                 options={designations}
//                 disabled={desigLoading}
//               />

//               {/* Code + Generate */}
//               <div style={{ marginBottom: '4px' }}>
//                 <label style={labelStyle}>Code</label>
//                 <div style={{
//                   display: 'flex',
//                   gap: '8px',
//                   alignItems: 'center',
//                   flexWrap: isMobile ? 'wrap' : 'nowrap',
//                 }}>
//                   <AppButton
//                     type="button"
//                     variant="success"
//                     loading={genLoading}
//                     onClick={handleGenerate}
//                     style={{
//                       padding: '10px 14px',
//                       whiteSpace: 'nowrap',
//                       minHeight: '48px',
//                       flexShrink: 0,
//                       width: isMobile ? '100%' : 'auto',
//                     }}
//                   >
//                     Generate
//                   </AppButton>
//                   <input
//                     value={form.code}
//                     readOnly
//                     placeholder=""
//                     style={{
//                       ...readonlyInputStyle,
//                       width: isMobile ? '100%' : undefined,
//                     }}
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* ── Divider ── */}
//             <div style={{ borderTop: '1px solid #E0EAF4', margin: '8px 0 16px' }} />

//             {/* ── Row 2: Mobile · Email · Active · File · Submit ── */}
//             <div style={{
//               ...formGrid,
//               alignItems: 'end',
//             }}>

//               <AppInput
//                 label="Mobile Number"
//                 value={form.mobile}
//                 onChange={e => set('mobile', e.target.value)}
//                 error={errors.mobile}
//                 placeholder=""
//                 type="tel"
//               />

//               <AppInput
//                 label="Email"
//                 value={form.email}
//                 onChange={e => set('email', e.target.value)}
//                 error={errors.email}
//                 placeholder="Enter a vaild email address"
//                 type="email"
//               />


//               <AppInput
//                 label="DOJ"
//                 value={form.DOJ}
//                 onChange={e => set('DOJ', e.target.value)}
//                 error={errors.DOJ}
//                 placeholder="YYYY-MM-DD"
//                 type="date"
//                 style={{
//                   colorScheme: 'light'
//                 }}
//                 className="date-input-responsive"
//               />

//               <AppInput
//                 label="DOE"
//                 value={form.DOE}
//                 onChange={e => set('DOE', e.target.value)}
//                 error={errors.DOE}
//                 placeholder="YYYY-MM-DD"
//                 type="date"
//                 style={{
//                   colorScheme: 'light'
//                 }}
//               />

//               {/* Active toggle */}
//               <div style={{ marginBottom: '4px' }}>
//                 <label style={labelStyle}>Status</label>
//                 <label style={{
//                   display: 'flex',
//                   alignItems: 'center',
//                   gap: '10px',
//                   cursor: 'pointer',
//                   padding: isMobile ? '13px 14px' : '11px 14px',
//                   background: '#EEF3F8',
//                   borderRadius: '10px',
//                   minHeight: '48px',
//                   boxSizing: 'border-box',
//                   userSelect: 'none',
//                 }}>
//                   <input
//                     type="checkbox"
//                     checked={form.isActive}
//                     onChange={e => set('isActive', e.target.checked)}
//                     style={{ width: '18px', height: '18px', accentColor: '#2196F3', cursor: 'pointer', flexShrink: 0 }}
//                   />
//                   <span style={{
//                     fontSize: '14px',
//                     fontWeight: '500',
//                     color: form.isActive ? '#2E7D32' : '#757575',
//                     transition: 'color 0.2s',
//                   }}>
//                     {form.isActive ? '● Active' : '○ Inactive'}
//                   </span>
//                 </label>
//               </div>

//               {/* File upload — only on Add */}
//               {!isEdit && (
//                 <div style={{ marginBottom: '4px' }}>
//                   <label style={labelStyle}>Upload PDF</label>
//                   <label style={{
//                     display: 'flex',
//                     alignItems: 'center',
//                     gap: '8px',
//                     padding: isMobile ? '13px 14px' : '11px 14px',
//                     background: '#EEF3F8',
//                     borderRadius: '10px',
//                     cursor: 'pointer',
//                     minHeight: '48px',
//                     boxSizing: 'border-box',
//                     overflow: 'hidden',
//                     border: '1.5px dashed #B0C4D8',
//                   }}>
//                     <span style={{
//                       flex: 1,
//                       fontSize: '13px',
//                       color: file ? '#1A1A2E' : '#8FA3B1',
//                       whiteSpace: 'nowrap',
//                       overflow: 'hidden',
//                       textOverflow: 'ellipsis',
//                     }}>
//                     </span>
//                     <input ref={fileRef} type="file" accept="application/pdf"
//                       onChange={e => setFile(e.target.files[0] || null)}
//                       style={{ fontSize: '13px', color: '#1A1A2E' }} />
//                   </label>
//                 </div>
//               )}

//               {/* Submit */}
//               <div style={{ marginBottom: '4px' }}>
//                 <AppButton
//                   type="submit"
//                   variant="success"
//                   loading={loading}
//                   style={{
//                     width: '100%',
//                     justifyContent: 'center',
//                     padding: isMobile ? '14px' : '12px',
//                     minHeight: '48px',
//                     fontSize: '15px',
//                     fontWeight: '700',
//                   }}
//                 >
//                   {isEdit ? 'Update Employee' : 'Add Employee'}
//                 </AppButton>
//               </div>

//             </div>
//           </form>
//         </div>

//         {/* ── Employee Table Card ── */}
//         <div style={{ ...card, animation: 'kts-fadeUp 0.5s ease 0.14s both' }}>
//           <p style={{
//             fontSize: isMobile ? '13px' : '14px',
//             fontWeight: '600',
//             color: '#1A1A2E',
//             marginBottom: '14px',
//             letterSpacing: '0.01em',
//           }}>
//             All Employees
//           </p>
//           <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', margin: '0 -4px' }}>
//             <EmployeeTable
//               employees={employees}
//               loading={listLoading}
//               onEdit={handleEditFromTable}
//               onViewPdf={handleViewPdf}
//             />
//           </div>
//         </div>

//         {/* ── Footer ── */}
//         <footer style={{
//           position: 'fixed',
//           bottom: 0,
//           left: 0,
//           right: 0,
//           padding: '14px 16px',
//           paddingBottom: 'max(14px, env(safe-area-inset-bottom))',
//           color: '#B0C4D8',
//           fontSize: isMobile ? '11px' : '13px',
//           textAlign: 'center',
//           background: 'rgba(13, 37, 53, 0.92)',
//           backdropFilter: 'blur(8px)',
//           WebkitBackdropFilter: 'blur(8px)',
//           zIndex: 100,
//         }}>
//           © 2026 Koundinyasa Technology Services All Rights Reserved.
//         </footer>

//       </div>
//     </>
//   );
// }

import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { useEmployees } from '../../hooks/useEmployees';
import { employeeService } from '../../services/employeeService';
import { fileService } from '../../services/fileService';
import { validateEmployee, hasErrors } from '../../validations/employeeValidation';
import { useDesignations } from '../../hooks/useDesignations';
import AppButton from '../../components/common/AppButton';
import AppInput from '../../components/common/AppInput';
import AppSelect from '../../components/common/AppSelect';
import EmployeeTable from '../../components/tables/EmployeeTable';
import { useWindowWidth } from '../../hooks/useWindowWidth';

/* ── Keyframes ── */
const fadeUpStyle = `
  @keyframes kts-fadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

export default function AddEditEmployeePage({ mode = 'add' }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { employees, loading: listLoading, fetchEmployees } = useEmployees();
  const { designations, loading: desigLoading } = useDesignations();

  const isEdit = mode === 'edit';
  const existing = location.state?.employee || null;

  const w = useWindowWidth();
  const isMobile = w < 480;
  const isTablet = w < 768;

  const [form, setForm] = useState({
    empId: '', name: '', designation: '', code: '',
    mobile: '', email: '', DOJ: '', DOE: '', isActive: true,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [genLoading, setGenLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef();

  /* File list modal state */
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [showFileModal, setShowFileModal] = useState(false);

  /* Populate form on edit */
  useEffect(() => {
    if (isEdit && existing) {
      setForm({
        empId: String(existing.empId),
        name: existing.name,
        designation: existing.designation,
        code: existing.code,
        mobile: String(existing.mobile),
        email: existing.email,
        DOJ: existing.DOJ,
        DOE: existing.DOE,
        isActive: existing.status === 'Active',
      });
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
    e.stopPropagation();
    const errs = validateEmployee(form);
    setErrors(errs);
    if (hasErrors(errs)) return;
    if (!isEdit) {
      if (!file) { toast.error('Please choose a PDF file'); return; }
      if (file.type !== 'application/pdf') { toast.error('Only PDF files allowed'); return; }
    }
    setLoading(true); setSubmitting(true);
    try {
      const payload = { ...form, status: form.isActive ? 'Active' : 'Inactive' };
      if (isEdit) {
        await employeeService.update(form.empId, payload);
        toast.success('Employee updated successfully');
      } else {
        await employeeService.add(payload);
        toast.success('Employee added successfully');
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
    } finally { setLoading(false); setSubmitting(false); }
  };

  const handleLogout = () => { logout(); navigate('/login', { replace: true }); };
  const handleEditFromTable = (emp) => navigate(`/admin/employee/edit/${emp.empId}`, { state: { employee: emp } });

  const handleViewFiles = (emp) => {
    setSelectedEmp(emp);
    setShowFileModal(true);
  };

  /* ── Shared styles ── */
  const pagePad = isMobile ? '14px 12px 80px' : isTablet ? '18px 16px 80px' : '24px 24px 80px';

  const card = {
    background: '#fff',
    borderRadius: isMobile ? '12px' : '16px',
    padding: isMobile ? '16px' : isTablet ? '18px 20px' : '24px',
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

  const readonlyInputStyle = {
    flex: 1,
    padding: isMobile ? '13px 14px' : '11px 14px',
    fontSize: '16px',
    background: '#EEF3F8',
    border: '1.5px solid transparent',
    borderRadius: '10px',
    outline: 'none',
    color: '#1A1A2E',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    minHeight: '48px',
    width: '100%',
  };

  /* Grid: 1 col mobile → 2 col tablet → 4 col desktop */
  const formGrid = {
    display: 'grid',
    gridTemplateColumns: isMobile
      ? '1fr'
      : isTablet
        ? 'repeat(2, 1fr)'
        : 'repeat(4, 1fr)',
    gap: '12px',
    marginBottom: '4px',
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
          alignItems: 'center',
          marginBottom: '16px',
          gap: '10px',
          flexWrap: 'wrap',
          animation: 'kts-fadeUp 0.4s ease both',
        }}>
          <AppButton
            variant="outline"
            onClick={() => navigate('/admin/dashboard')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', minHeight: '44px' }}
          >
            ← Back
          </AppButton>

          {!isMobile && (
            <h2 style={{
              color: '#f3f5f8',
              fontSize: isTablet ? '18px' : '20px',
              fontWeight: '700',
              margin: 0,
              flex: 1,
              textAlign: 'center',
            }}>
              {isEdit ? 'Edit Employee' : 'Add Employee'}
            </h2>
          )}

          <AppButton
            variant="outline"
            onClick={handleLogout}
            style={{ minHeight: '44px' }}
          >
            Logout
          </AppButton>
        </div>

        {/* ── Mobile-only title ── */}
        {isMobile && (
          <h2 style={{
            color: '#f3f5f8',
            fontSize: '17px',
            fontWeight: '700',
            margin: '0 0 12px',
            textAlign: 'center',
          }}>
            {isEdit ? 'Edit Employee' : 'Add Employee'}
          </h2>
        )}

        {/* ── Form Card ── */}
        <div style={{ ...card, animation: 'kts-fadeUp 0.45s ease 0.07s both' }}>

          <form onSubmit={handleSubmit} noValidate>

            {/* ── Row 1: EmpId · Name · Designation · Code ── */}
            <div style={formGrid}>

              <AppInput
                label="Employee Id"
                value={form.empId}
                onChange={e => set('empId', e.target.value)}
                error={errors.empId}
                disabled={isEdit}
                placeholder=""
              />

              <AppInput
                label="Employee Name"
                value={form.name}
                onChange={e => set('name', e.target.value)}
                error={errors.name}
                placeholder=""
              />

              <AppSelect
                label="Designation"
                value={form.designation}
                onChange={e => set('designation', e.target.value)}
                options={designations}
                disabled={desigLoading}
              />

              {/* Code + Generate */}
              <div style={{ marginBottom: '4px' }}>
                <label style={labelStyle}>Code</label>
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'center',
                  flexWrap: isMobile ? 'wrap' : 'nowrap',
                }}>
                  <AppButton
                    type="button"
                    variant="success"
                    loading={genLoading}
                    onClick={handleGenerate}
                    style={{
                      padding: '10px 14px',
                      whiteSpace: 'nowrap',
                      minHeight: '48px',
                      flexShrink: 0,
                      width: isMobile ? '100%' : 'auto',
                    }}
                  >
                    Generate
                  </AppButton>
                  <input
                    value={form.code}
                    readOnly
                    placeholder=""
                    style={{
                      ...readonlyInputStyle,
                      width: isMobile ? '100%' : undefined,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* ── Divider ── */}
            <div style={{ borderTop: '1px solid #E0EAF4', margin: '8px 0 16px' }} />

            {/* ── Row 2: Mobile · Email · DOJ · DOE · Status · File · Submit ── */}
            <div style={{
              ...formGrid,
              alignItems: 'end',
            }}>

              <AppInput
                label="Mobile Number"
                value={form.mobile}
                onChange={e => set('mobile', e.target.value)}
                error={errors.mobile}
                placeholder=""
                type="tel"
              />

              <AppInput
                label="Email"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                error={errors.email}
                placeholder="Enter a valid email address"
                type="email"
              />

              <AppInput
                label="DOJ"
                value={form.DOJ}
                onChange={e => set('DOJ', e.target.value)}
                error={errors.DOJ}
                placeholder="YYYY-MM-DD"
                type="date"
                style={{ colorScheme: 'light', width: '100%' }}
              />

              <AppInput
                label="DOE"
                value={form.DOE}
                onChange={e => set('DOE', e.target.value)}
                error={errors.DOE}
                placeholder="YYYY-MM-DD"
                type="date"
                style={{ colorScheme: 'light', width: '100%' }}
              />

              {/* Active toggle */}
              <div style={{ marginBottom: '4px' }}>
                <label style={labelStyle}>Status</label>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  padding: isMobile ? '13px 14px' : '11px 14px',
                  background: '#EEF3F8',
                  borderRadius: '10px',
                  minHeight: '48px',
                  boxSizing: 'border-box',
                  userSelect: 'none',
                }}>
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={e => set('isActive', e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: '#2196F3', cursor: 'pointer', flexShrink: 0 }}
                  />
                  <span style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: form.isActive ? '#2E7D32' : '#757575',
                    transition: 'color 0.2s',
                  }}>
                    {form.isActive ? '● Active' : '○ Inactive'}
                  </span>
                </label>
              </div>

              {/* File upload — only on Add */}
              {!isEdit && (
                <div style={{ marginBottom: '4px' }}>
                  <label style={labelStyle}>Upload PDF</label>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: isMobile ? '13px 14px' : '11px 14px',
                    background: '#EEF3F8',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    minHeight: '48px',
                    boxSizing: 'border-box',
                    overflow: 'hidden',
                    border: '1.5px dashed #B0C4D8',
                  }}>
                    <span style={{ fontSize: '16px', flexShrink: 0 }}>📎</span>
                    <span style={{
                      flex: 1,
                      fontSize: '13px',
                      color: file ? '#1A1A2E' : '#8FA3B1',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {file ? file.name : 'Choose PDF…'}
                    </span>
                    <input ref={fileRef} type="file" accept="application/pdf"
                      onChange={e => setFile(e.target.files[0] || null)}
                      style={{ display: 'none' }} />
                  </label>
                </div>
              )}

              {/* Submit */}
              <div style={{ marginBottom: '4px' }}>
                <AppButton
                  type="submit"
                  variant="success"
                  loading={loading}
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    padding: isMobile ? '14px' : '12px',
                    minHeight: '48px',
                    fontSize: '15px',
                    fontWeight: '700',
                  }}
                >
                  {isEdit ? 'Update Employee' : 'Add Employee'}
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
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', margin: '0 -4px' }}>
            <EmployeeTable
              employees={employees}
              loading={listLoading}
              onEdit={handleEditFromTable}
              onViewFiles={handleViewFiles}
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