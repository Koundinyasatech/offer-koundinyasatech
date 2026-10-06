// import { useState, useMemo } from 'react';
// import { FiEdit2 } from 'react-icons/fi';
// import { PAGE_SIZE_OPTIONS } from '../../constants/api';

// const th = {
//   padding: '12px 14px', color: '#fff', fontWeight: '600',
//   fontSize: '13px', textAlign: 'left', whiteSpace: 'nowrap',
// };
// const td = {
//   padding: '11px 14px', fontSize: '13px', color: '#1A1A2E',
//   borderBottom: '1px solid #E0EAF4', verticalAlign: 'middle',
// };

// const MONTHS = [
//   { value: '',   label: 'All Months'  },
//   { value: '01', label: 'January'     },
//   { value: '02', label: 'February'    },
//   { value: '03', label: 'March'       },
//   { value: '04', label: 'April'       },
//   { value: '05', label: 'May'         },
//   { value: '06', label: 'June'        },
//   { value: '07', label: 'July'        },
//   { value: '08', label: 'August'      },
//   { value: '09', label: 'September'   },
//   { value: '10', label: 'October'     },
//   { value: '11', label: 'November'    },
//   { value: '12', label: 'December'    },
// ];

// const MONTHS_SHORT = [
//   { value: '',   label: 'All'         },
//   { value: '01', label: 'January'     },
//   { value: '02', label: 'February'    },
//   { value: '03', label: 'March'       },
//   { value: '04', label: 'April'       },
//   { value: '05', label: 'May'         },
//   { value: '06', label: 'June'        },
//   { value: '07', label: 'July'        },
//   { value: '08', label: 'August'      },
//   { value: '09', label: 'September'   },
//   { value: '10', label: 'October'     },
//   { value: '11', label: 'November'    },
//   { value: '12', label: 'December'    },
// ];

// // ✅ Branch options
// const BRANCH_OPTIONS = [
//   { value: '',         label: 'All Branches' },
//   { value: 'Hyderabad',label: 'Hyderabad'   },
//   { value: 'Bangalore',label: 'Bangalore'   },
// ];

// const formatDate = (dateStr) => {
//   if (!dateStr) return '—';
//   let date;
//   if (dateStr.length === 10 && dateStr[4] === '-') {
//     date = new Date(dateStr + 'T00:00:00');
//   } else if (dateStr.length === 10 && dateStr[2] === '-') {
//     const [day, month, year] = dateStr.split('-');
//     date = new Date(`${year}-${month}-${day}T00:00:00`);
//   } else {
//     return dateStr;
//   }
//   const day   = String(date.getDate()).padStart(2, '0');
//   const month = date.toLocaleString('en-GB', { month: 'short' }).toUpperCase();
//   return `${day}-${month}-${date.getFullYear()}`;
// };

// /* ── Inline filter select inside table header ── */
// const HeaderFilter = ({ value, onChange }) => (
//   <div style={{ marginTop: '6px' }}>
//     <select
//       value={value}
//       onChange={e => onChange(e.target.value)}
//       onClick={e => e.stopPropagation()}
//       style={{
//         padding: '3px 6px',
//         borderRadius: '5px',
//         border: `1.5px solid ${value ? '#fff' : 'rgba(255,255,255,0.4)'}`,
//         background: value ? '#fff' : 'rgba(255,255,255,0.15)',
//         fontSize: '11px',
//         cursor: 'pointer',
//         color: value ? '#1565C0' : '#fff',
//         fontWeight: value ? '700' : '400',
//         outline: 'none',
//         width: '100%',
//         maxWidth: '110px',
//       }}
//     >
//       {MONTHS_SHORT.map(m => (
//         <option key={m.value} value={m.value} style={{ color: '#1A1A2E', background: '#fff' }}>
//           {m.label}
//         </option>
//       ))}
//     </select>
//   </div>
// );

// const EmployeeTable = ({ employees = [], loading = false, onEdit, onViewFiles }) => {
//   const [search,      setSearch]      = useState('');
//   const [pageSize,    setPageSize]    = useState(10);
//   const [page,        setPage]        = useState(1);
//   const [monthFilter, setMonthFilter] = useState('');
//   const [dojFilter,   setDojFilter]   = useState('');
//   const [doeFilter,   setDoeFilter]   = useState('');
//   const [branchFilter, setBranchFilter] = useState(''); // ✅ Branch filter state

//   const filtered = useMemo(() => {
//     const q = search.toLowerCase();
//     return employees
//       .filter(e => {
//         const matchSearch =
//           String(e.empId).includes(q) ||
//           e.name?.toLowerCase().includes(q) ||
//           e.designation?.toLowerCase().includes(q) ||
//           e.email?.toLowerCase().includes(q) ||
//           e.code?.toLowerCase().includes(q) ||
//           e.branch?.toLowerCase().includes(q); // ✅ Add branch to search

//         /* common filter — filters by DOJ month */
//         const matchCommon = monthFilter ? e.DOJ?.slice(5, 7) === monthFilter : true;
//         /* inline column filters */
//         const matchDOJ = dojFilter ? e.DOJ?.slice(5, 7) === dojFilter : true;
//         const matchDOE = doeFilter ? e.DOE?.slice(5, 7) === doeFilter : true;
//         /* ✅ Branch filter */
//         const matchBranch = branchFilter ? e.branch === branchFilter : true;

//         return matchSearch && matchCommon && matchDOJ && matchDOE && matchBranch;
//       })
//       .sort((a, b) => {
//         /* When DOJ filter active — sort by DOJ descending */
//         if (monthFilter || dojFilter) {
//           const da = a.DOJ || '';
//           const db = b.DOJ || '';
//           if (da > db) return -1;
//           if (da < db) return 1;
//         }
//         /* When DOE filter active — sort by DOE descending */
//         if (doeFilter) {
//           const da = a.DOE || '';
//           const db = b.DOE || '';
//           if (da > db) return -1;
//           if (da < db) return 1;
//         }
//         /* Default — sort by empId descending */
//         return Number(b.empId) - Number(a.empId);
//       });
//   }, [employees, search, monthFilter, dojFilter, doeFilter, branchFilter]);

//   const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
//   const safePage   = Math.min(page, totalPages);
//   const paginated  = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

//   const handleSearch = (v) => { setSearch(v);           setPage(1); };
//   const handleSize   = (v) => { setPageSize(Number(v)); setPage(1); };
//   const handleMonth  = (v) => { setMonthFilter(v);      setPage(1); };
//   const handleDOJ    = (v) => { setDojFilter(v);        setPage(1); };
//   const handleDOE    = (v) => { setDoeFilter(v);        setPage(1); };
//   const handleBranch = (v) => { setBranchFilter(v);     setPage(1); }; // ✅ Branch handler
  
//   const selectedMonthLabel = MONTHS.find(m => m.value === monthFilter)?.label || 'All Months';
//   const dojLabel           = MONTHS.find(m => m.value === dojFilter)?.label   || '';
//   const doeLabel           = MONTHS.find(m => m.value === doeFilter)?.label   || '';
//   const branchLabel        = BRANCH_OPTIONS.find(b => b.value === branchFilter)?.label || '';

//   /* ── Export filtered data to Excel (.xlsx) using SheetJS ── */
//   const handleExport = async () => {
//     if (filtered.length === 0) { alert('No data to export'); return; }

//     if (!window.XLSX) {
//       await new Promise((resolve, reject) => {
//         const script  = document.createElement('script');
//         script.src    = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
//         script.onload = resolve;
//         script.onerror = reject;
//         document.head.appendChild(script);
//       });
//     }

//     const XLSX = window.XLSX;
//     const now  = new Date();
//     const ts   = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}`;

//     /* ── Build worksheet data ── */
//     const headers = ['Emp Id', 'Employee Name', 'Designation', 'Code', 'Mobile No', 'Email', 'Branch', 'DOJ', 'DOE', 'Status'];
//     const rows = filtered.map(emp => ({
//       'Emp Id':         emp.empId      || '',
//       'Employee Name':  emp.name       || '',
//       'Designation':    emp.designation|| '',
//       'Code':           emp.code       || '',
//       'Mobile No':      emp.mobile     || '',
//       'Email':          emp.email      || '',
//       'Branch':         emp.branch     || '', // ✅ Include branch in export
//       'DOJ':            emp.DOJ        || '',
//       'DOE':            emp.DOE        || '',
//       'Status':         emp.status     || '',
//     }));
//     const ws = XLSX.utils.json_to_sheet(rows, { header: headers });

//     /* ── Column widths ── */
//     ws['!cols'] = [
//       { wch: 10 }, // Emp Id
//       { wch: 22 }, // Employee Name
//       { wch: 20 }, // Designation
//       { wch: 10 }, // Code
//       { wch: 14 }, // Mobile No
//       { wch: 28 }, // Email
//       { wch: 14 }, // Branch
//       { wch: 12 }, // DOJ
//       { wch: 12 }, // DOE
//       { wch: 10 }, // Status
//     ];

//     /* ── Header row styling ── */
//     const headerStyle = {
//       font:      { bold: true, color: { rgb: 'FFFFFF' }, name: 'Arial', sz: 11 },
//       fill:      { fgColor: { rgb: '1565C0' }, patternType: 'solid' },
//       alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
//       border: {
//         top:    { style: 'thin', color: { rgb: 'BBDEFB' } },
//         bottom: { style: 'thin', color: { rgb: 'BBDEFB' } },
//         left:   { style: 'thin', color: { rgb: 'BBDEFB' } },
//         right:  { style: 'thin', color: { rgb: 'BBDEFB' } },
//       },
//     };
//     headers.forEach((_, ci) => {
//       const cellAddr = XLSX.utils.encode_cell({ r: 0, c: ci });
//       if (ws[cellAddr]) ws[cellAddr].s = headerStyle;
//     });

//     /* ── Data row styling ── */
//     rows.forEach((_, ri) => {
//       const isEven = ri % 2 === 0;
//       const fillColor = isEven ? 'FFFFFF' : 'EEF3F8';
//       headers.forEach((h, ci) => {
//         const cellAddr = XLSX.utils.encode_cell({ r: ri + 1, c: ci });
//         if (!ws[cellAddr]) return;

//         const isStatusCol = ci === headers.indexOf('Status');
//         const cellVal     = ws[cellAddr].v;
//         const statusStyle = isStatusCol
//           ? {
//               font: {
//                 bold:  true,
//                 color: { rgb: cellVal === 'Active' ? '2E7D32' : '757575' },
//                 name:  'Arial', sz: 10,
//               },
//             }
//           : {};
//         ws[cellAddr].s = {
//           font:      { name: 'Arial', sz: 10, ...statusStyle.font },
//           fill:      { fgColor: { rgb: fillColor }, patternType: 'solid' },
//           alignment: { vertical: 'center', wrapText: false },
//           border: {
//             top:    { style: 'hair', color: { rgb: 'E0EAF4' } },
//             bottom: { style: 'hair', color: { rgb: 'E0EAF4' } },
//             left:   { style: 'hair', color: { rgb: 'E0EAF4' } },
//             right:  { style: 'hair', color: { rgb: 'E0EAF4' } },
//           },
//         };
//       });
//     });

//     ws['!freeze'] = { xSplit: 0, ySplit: 1, topLeftCell: 'A2', activePane: 'bottomLeft', state: 'frozen' };

//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, 'Employees');

//     const activeCount   = filtered.filter(e => e.status === 'Active').length;
//     const inactiveCount = filtered.filter(e => e.status !== 'Active').length;
//     const summaryData   = [
//       { 'Summary':  'Export Date',     'Value': new Date().toLocaleDateString('en-IN') },
//       { 'Summary':  'Total Employees', 'Value': filtered.length },
//       { 'Summary':  'Active',          'Value': activeCount },
//       { 'Summary':  'Inactive',        'Value': inactiveCount },
//     ];
//     const wsSummary = XLSX.utils.json_to_sheet(summaryData, { header: ['Summary', 'Value'] });
//     wsSummary['!cols'] = [{ wch: 20 }, { wch: 16 }];
//     XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');
//     XLSX.writeFile(wb, `KTS_Employees_${ts}.xlsx`);
//   };

//   const hasColumnFilter    = dojFilter || doeFilter;
//   const hasAnyFilter       = monthFilter || dojFilter || doeFilter || branchFilter;

//   return (
//     <div>
//       {/* ══════════════════════════════════════════
//           TOP CONTROLS
//       ══════════════════════════════════════════ */}
//       <div style={{
//         display: 'flex', justifyContent: 'space-between',
//         alignItems: 'center', marginBottom: '12px',
//         flexWrap: 'wrap', gap: '10px',
//       }}>

//         {/* Page size */}
//         <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//           <select value={pageSize} onChange={e => handleSize(e.target.value)}
//             style={{ padding: '6px 10px', borderRadius: '7px', border: '1px solid #E0EAF4', background: '#fff', fontSize: '13px', cursor: 'pointer', color: '#1A1A2E' }}>
//             {PAGE_SIZE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
//           </select>
//           <span style={{ color: '#555F6D', fontSize: '13px' }}>entries per page</span>
//         </div>

//         {/* ── Branch filter dropdown ── */}
//         <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//           <span style={{ color: '#555F6D', fontSize: '13px', fontWeight: '500' }}>
//             Branch:
//           </span>
//           <div style={{ position: 'relative' }}>
//             <select value={branchFilter} onChange={e => handleBranch(e.target.value)}
//               style={{
//                 padding: '6px 32px 6px 12px', borderRadius: '7px',
//                 border: `1.5px solid ${branchFilter ? '#2196F3' : '#E0EAF4'}`,
//                 background: branchFilter ? '#EEF6FF' : '#f7f8fa',
//                 fontSize: '13px', cursor: 'pointer',
//                 color: branchFilter ? '#1565C0' : '#1A1A2E',
//                 fontWeight: branchFilter ? '600' : '400',
//                 outline: 'none', appearance: 'none',
//                 WebkitAppearance: 'none', minWidth: '130px',
//               }}>
//               {BRANCH_OPTIONS.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
//             </select>
//             <span style={{
//               position: 'absolute', right: '10px', top: '50%',
//               transform: 'translateY(-50%)',
//               pointerEvents: 'none', fontSize: '11px', color: '#8FA3B1',
//             }}>▼</span>
//           </div>
//           {branchFilter && (
//             <button onClick={() => handleBranch('')}
//               style={{
//                 background: '#2196F3', color: '#fff', border: 'none',
//                 borderRadius: '99px', padding: '3px 10px',
//                 fontSize: '12px', fontWeight: '600', cursor: 'pointer',
//                 display: 'flex', alignItems: 'center', gap: '4px',
//               }}>
//               {branchLabel} ✕
//             </button>
//           )}
//         </div>

//         {/* ── Original common month filter ── */}
//         <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//           <span style={{ color: '#555F6D', fontSize: '13px', fontWeight: '500' }}>
//             Filter by Month:
//           </span>
//           <div style={{ position: 'relative' }}>
//             <select value={monthFilter} onChange={e => handleMonth(e.target.value)}
//               style={{
//                 padding: '6px 32px 6px 12px', borderRadius: '7px',
//                 border: `1.5px solid ${monthFilter ? '#2196F3' : '#E0EAF4'}`,
//                 background: monthFilter ? '#EEF6FF' : '#f7f8fa',
//                 fontSize: '13px', cursor: 'pointer',
//                 color: monthFilter ? '#1565C0' : '#1A1A2E',
//                 fontWeight: monthFilter ? '600' : '400',
//                 outline: 'none', appearance: 'none',
//                 WebkitAppearance: 'none', minWidth: '130px',
//               }}>
//               {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
//             </select>
//             <span style={{
//               position: 'absolute', right: '10px', top: '50%',
//               transform: 'translateY(-50%)',
//               pointerEvents: 'none', fontSize: '11px', color: '#8FA3B1',
//             }}>▼</span>
//           </div>
//           {monthFilter && (
//             <button onClick={() => handleMonth('')}
//               style={{
//                 background: '#2196F3', color: '#fff', border: 'none',
//                 borderRadius: '99px', padding: '3px 10px',
//                 fontSize: '12px', fontWeight: '600', cursor: 'pointer',
//                 display: 'flex', alignItems: 'center', gap: '4px',
//               }}>
//               {selectedMonthLabel} ✕
//             </button>
//           )}
//         </div>
//         <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//           <span style={{ color: '#555F6D', fontSize: '13px' }}>Search:</span>
//           <input value={search} onChange={e => handleSearch(e.target.value)} placeholder=""
//             style={{ padding: '6px 12px', borderRadius: '7px', border: '1px solid #E0EAF4', background: '#EEF3F8', fontSize: '13px', outline: 'none', width: '180px', color: '#1A1A2E' }} />
//           <button
//             onClick={handleExport}
//             title="Export to Excel"
//             style={{
//               background: 'linear-gradient(135deg, #1D6F42, #155734)',
//               color: '#fff', border: 'none', borderRadius: '7px',
//               padding: '6px 14px', fontSize: '13px', fontWeight: '600',
//               cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
//               whiteSpace: 'nowrap', boxShadow: '0 2px 6px rgba(21,87,52,0.3)',
//             }}
//           >
//             ⬇ Export
//           </button>
//         </div>
//       </div>

//       {/* ── Column filter active badges ── */}
//       {hasColumnFilter && (
//         <div style={{
//           display: 'flex', alignItems: 'center', gap: '8px',
//           marginBottom: '10px', flexWrap: 'wrap',
//         }}>
//           <span style={{ fontSize: '12px', color: '#555F6D', fontWeight: '500' }}>Column filters:</span>
//           {dojFilter && (
//             <span style={{
//               background: '#2196F3', color: '#fff', fontSize: '11px', fontWeight: '700',
//               padding: '3px 10px', borderRadius: '99px',
//               display: 'flex', alignItems: 'center', gap: '4px',
//             }}>
//               DOJ: {dojLabel}
//               <button onClick={() => handleDOJ('')}
//                 style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '12px', padding: 0, lineHeight: 1 }}>✕</button>
//             </span>
//           )}
//           {doeFilter && (
//             <span style={{
//               background: '#E65100', color: '#fff', fontSize: '11px', fontWeight: '700',
//               padding: '3px 10px', borderRadius: '99px',
//               display: 'flex', alignItems: 'center', gap: '4px',
//             }}>
//               DOE: {doeLabel}
//               <button onClick={() => handleDOE('')}
//                 style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '12px', padding: 0, lineHeight: 1 }}>✕</button>
//             </span>
//           )}
//           <button
//             onClick={() => { handleDOJ(''); handleDOE(''); }}
//             style={{
//               background: '#f3f5f7', border: '1px solid #E0EAF4',
//               borderRadius: '6px', padding: '3px 8px',
//               fontSize: '11px', color: '#8FA3B1', cursor: 'pointer', fontWeight: '600',
//             }}>
//             Clear column filters
//           </button>
//         </div>
//       )}

//       {/* ── Info bar — shows whenever any filter is active ── */}
//       {hasAnyFilter && (
//         <div style={{
//           background: '#EEF6FF', border: '1px solid #BBDEFB',
//           borderRadius: '8px', padding: '8px 14px', marginBottom: '12px',
//           fontSize: '13px', color: '#1565C0', fontWeight: '500',
//           display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap',
//         }}>
//           <span>📅</span>
//           <span>
//             {monthFilter && <span>Common filter: <strong>{selectedMonthLabel}</strong> (DOJ){'  '}</span>}
//             {dojFilter    && <span>DOJ column: <strong>{dojLabel}</strong>{'  '}</span>}
//             {doeFilter    && <span>DOE column: <strong>{doeLabel}</strong>{'  '}</span>}
//             {branchFilter && <span>Branch: <strong>{branchLabel}</strong>{'  '}</span>}
//           </span>
//           <span style={{
//             marginLeft: '4px', background: '#2196F3', color: '#fff',
//             fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '99px',
//           }}>
//             {filtered.length} {filtered.length === 1 ? 'result' : 'results'}
//           </span>
//         </div>
//       )}
//       <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
//         <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
//           <thead>
//             <tr style={{ background: 'linear-gradient(90deg, #2196F3, #1976D2)' }}>
//               {['Emp Id', 'Employee Name', 'Designation', 'Code', 'Mobile No', 'Email'].map(h => (
//                 <th key={h} style={th}>{h}</th>
//               ))}

//               {/* ✅ Branch column */}
//               <th style={th}>Branch</th>

//               {/* DOJ header with inline filter */}
//               <th style={{ ...th, verticalAlign: 'top', minWidth: '130px' }}>
//                 <div>
//                   DOJ
//                   {(monthFilter || dojFilter) && (
//                     <span style={{ fontSize: '10px', opacity: 0.85, marginLeft: '4px' }}>↓</span>
//                   )}
//                 </div>
//                 <HeaderFilter value={dojFilter} onChange={handleDOJ} />
//               </th>

//               {/* DOE header with inline filter */}
//               <th style={{ ...th, verticalAlign: 'top', minWidth: '130px' }}>
//                 <div>
//                   DOE
//                   {doeFilter && (
//                     <span style={{ fontSize: '10px', opacity: 0.85, marginLeft: '4px' }}>↓</span>
//                   )}
//                 </div>
//                 <HeaderFilter value={doeFilter} onChange={handleDOE} />
//               </th>
//               {['Status', 'Edit', 'Files'].map(h => (
//                 <th key={h} style={th}>{h}</th>
//               ))}
//             </tr>
//           </thead>

//           <tbody>
//             {loading ? (
//               <tr><td colSpan={12} style={{ ...td, textAlign: 'center', padding: '40px', color: '#8FA3B1' }}>
//                 <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
//                   <span style={{ width: 20, height: 20, border: '3px solid #E0EAF4', borderTopColor: '#2196F3', borderRadius: '50%', display: 'inline-block', animation: 'kts-spin 0.7s linear infinite' }} />
//                   Loading employees…
//                 </div>
//               </td></tr>
//             ) : paginated.length === 0 ? (
//               <tr><td colSpan={12} style={{ ...td, textAlign: 'center', padding: '40px', color: '#8FA3B1' }}>
//                 <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔍</div>
//                 <div style={{ fontSize: '14px' }}>
//                   {hasAnyFilter ? 'No employees match the selected filters' : 'No employees found'}
//                 </div>
//               </td></tr>
//             ) : paginated.map((emp, i) => (
//               <tr key={emp.empId}
//                 style={{ background: i % 2 === 0 ? '#fff' : '#F7FAFD', transition: 'background 0.15s' }}
//                 onMouseEnter={e => (e.currentTarget.style.background = '#EEF6FF')}
//                 onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? '#fff' : '#F7FAFD')}>
//                 <td style={td}>{emp.empId}</td>
//                 <td style={td}>{emp.name}</td>
//                 <td style={td}>{emp.designation}</td>
//                 <td style={td}>
//                   <span style={{ background: '#f3f5f7', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontFamily: 'monospace', color: '#1A1A2E' }}>
//                     {emp.code}
//                   </span>
//                 </td>
//                 <td style={td}>{emp.mobile}</td>
//                 <td style={td}>{emp.email}</td>

//                 {/* ✅ Branch column */}
//                 <td style={td}>
//                   <span style={{
//                     background: branchFilter && emp.branch === branchFilter ? '#E3F2FD' : 'transparent',
//                     padding: branchFilter && emp.branch === branchFilter ? '2px 8px' : '0',
//                     borderRadius: '6px',
//                     color: branchFilter && emp.branch === branchFilter ? '#1565C0' : '#1A1A2E',
//                     fontWeight: branchFilter && emp.branch === branchFilter ? '600' : '400',
//                   }}>
//                     {emp.branch || '—'}
//                   </span>
//                 </td>

//                 <td style={{ ...td, whiteSpace: 'nowrap' }}>
//                   <span style={{
//                     background: (monthFilter && emp.DOJ?.slice(5, 7) === monthFilter) ||
//                                 (dojFilter   && emp.DOJ?.slice(5, 7) === dojFilter)
//                       ? '#E3F2FD' : 'transparent',
//                     padding: (monthFilter && emp.DOJ?.slice(5, 7) === monthFilter) ||
//                              (dojFilter   && emp.DOJ?.slice(5, 7) === dojFilter)
//                       ? '2px 8px' : '0',
//                     borderRadius: '6px',
//                     color: (monthFilter && emp.DOJ?.slice(5, 7) === monthFilter) ||
//                            (dojFilter   && emp.DOJ?.slice(5, 7) === dojFilter)
//                       ? '#1565C0' : '#1A1A2E',
//                     fontWeight: (monthFilter && emp.DOJ?.slice(5, 7) === monthFilter) ||
//                                 (dojFilter   && emp.DOJ?.slice(5, 7) === dojFilter)
//                       ? '600' : '400',
//                   }}>
//                     {formatDate(emp.DOJ)}
//                   </span>
//                 </td>

//                 <td style={{ ...td, whiteSpace: 'nowrap' }}>
//                   <span style={{
//                     background: doeFilter && emp.DOE?.slice(5, 7) === doeFilter ? '#FFF3E0' : 'transparent',
//                     padding:    doeFilter && emp.DOE?.slice(5, 7) === doeFilter ? '2px 8px' : '0',
//                     borderRadius: '6px',
//                     color:      doeFilter && emp.DOE?.slice(5, 7) === doeFilter ? '#E65100' : '#1A1A2E',
//                     fontWeight: doeFilter && emp.DOE?.slice(5, 7) === doeFilter ? '600' : '400',
//                   }}>
//                     {formatDate(emp.DOE)}
//                   </span>
//                 </td>

//                 <td style={td}>
//                   <span style={{
//                     padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
//                     background: emp.status === 'Active' ? '#E8F5E9' : '#F5F5F5',
//                     color:      emp.status === 'Active' ? '#2E7D32' : '#757575',
//                   }}>
//                     {emp.status}
//                   </span>
//                 </td>

//                 <td style={td}>
//                   <button onClick={() => onEdit?.(emp)} title="Edit"
//                     style={{ background: 'linear-gradient(135deg,#2196F3,#1565C0)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
//                     <FiEdit2 size={14} />
//                   </button>
//                 </td>
//                 <td style={td}>
//                   <button
//                     onClick={() => onViewFiles?.(emp)}
//                     style={{
//                       background: 'linear-gradient(135deg, #43A047, #2E7D32)',
//                       color: '#fff', border: 'none', borderRadius: '8px',
//                       padding: '5px 12px', fontSize: '12px', fontWeight: '600',
//                       cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px',
//                       whiteSpace: 'nowrap',
//                     }}>
//                     📁 Files
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {/* ── Pagination ── */}
//       {totalPages > 1 && (
//         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
//           <span style={{ fontSize: '13px', color: '#555F6D' }}>
//             Showing {filtered.length === 0 ? 0 : (safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, filtered.length)} of {filtered.length}
//           </span>
//           <div style={{ display: 'flex', gap: '6px' }}>
//             <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1}
//               style={{ padding: '5px 12px', borderRadius: '6px', border: '1px solid #E0EAF4', background: safePage === 1 ? '#F5F5F5' : '#fff', cursor: safePage === 1 ? 'not-allowed' : 'pointer', fontSize: '13px', color: '#1A1A2E' }}>
//               ‹ Prev
//             </button>
//             {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(n => (
//               <button key={n} onClick={() => setPage(n)}
//                 style={{ padding: '5px 10px', borderRadius: '6px', border: '1px solid #E0EAF4', background: n === safePage ? '#2196F3' : '#fff', color: n === safePage ? '#fff' : '#1A1A2E', cursor: 'pointer', fontSize: '13px', fontWeight: n === safePage ? '600' : '400' }}>
//                 {n}
//               </button>
//             ))}
//             <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}
//               style={{ padding: '5px 12px', borderRadius: '6px', border: '1px solid #E0EAF4', background: safePage === totalPages ? '#F5F5F5' : '#fff', cursor: safePage === totalPages ? 'not-allowed' : 'pointer', fontSize: '13px', color: '#1A1A2E' }}>
//               Next ›
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default EmployeeTable;


import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { fileService } from '../../services/fileService';
import AppButton from '../../components/common/AppButton';
import LogoutAllButton from '../../components/common/LogoutAllButton';
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
            {/* ✅ Display branch if available */}
            {user?.branch && (
              <p style={{ color: '#B0C4D8', fontSize: '13px', margin: '4px 0 0', fontWeight: '500' }}>
                📍 {user.branch}
              </p>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '8px' }}>
            <LogoutAllButton style={{ width: isMobile ? '100%' : 'auto', minHeight: '44px' }} />
            <AppButton variant="outline" onClick={handleLogout} style={{ width: isMobile ? '100%' : 'auto', minHeight: '44px' }}>
              Logout
            </AppButton>
          </div>
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
                          <span style={{ fontWeight: '500', color: '#1A1A2E', wordBreak: 'break-word' }}>
                            {file.ActualfileName || file.FileName || '—'}
                          </span>
                        </span>
                      </td>

                      {/* Uploaded on */}
                      <td style={td}>
                        <span style={{ fontSize: '13px', color: '#555F6D' }}>{formatDt(file.CreatedDatetime)}</span>
                      </td>
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
