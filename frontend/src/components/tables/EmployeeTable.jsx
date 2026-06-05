import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEdit2 } from 'react-icons/fi';
import { PAGE_SIZE_OPTIONS } from '../../constants/api';

const th = {
  padding: '12px 14px', color: '#fff', fontWeight: '600',
  fontSize: '13px', textAlign: 'left', whiteSpace: 'nowrap',
};
const td = {
  padding: '11px 14px', fontSize: '13px', color: '#1A1A2E',
  borderBottom: '1px solid #E0EAF4', verticalAlign: 'middle',
};


const MONTHS = [
  { value: '', label: 'All Months' },
  { value: '01', label: 'January' },
  { value: '02', label: 'February' },
  { value: '03', label: 'March' },
  { value: '04', label: 'April' },
  { value: '05', label: 'May' },
  { value: '06', label: 'June' },
  { value: '07', label: 'July' },
  { value: '08', label: 'August' },
  { value: '09', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];

const formatDate = (dateStr) => {
  if (!dateStr) return '';

  let date;

  if (dateStr.includes('-') && dateStr.length === 10 && dateStr[4] === '-') {
    date = new Date(dateStr + 'T00:00:00');
  }
  else if (dateStr.length === 10 && dateStr[2] === '-' && dateStr[5] === '-') {
    const [day, month, year] = dateStr.split('-');
    date = new Date(`${year}-${month}-${day}T00:00:00`);
  }
  else {
    return dateStr;
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = date.toLocaleString('en-GB', { month: 'short' }).toUpperCase();
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
};


// ✅ Added onViewPdf to props
const EmployeeTable = ({ employees = [], loading = false, onEdit, onViewPdf }) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [monthFilter, setMonthFilter] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return employees.filter(e => {
      const matchSearch =
        String(e.empId).includes(q) ||
        e.name?.toLowerCase().includes(q) ||
        e.designation?.toLowerCase().includes(q) ||
        e.email?.toLowerCase().includes(q) ||
        e.code?.toLowerCase().includes(q);

      const matchMonth = monthFilter
        ? e.DOJ?.slice(5, 7) === monthFilter
        : true;

      return matchSearch && matchMonth;

    })
      .sort((a, b) => {
        // ✅ Sort by empId in descending order (2, 1, 0)
        const aId = Number(a.empId);
        const bId = Number(b.empId);
        return bId - aId;
      });
  }, [employees, search, monthFilter]);



  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const handleSearch = (v) => { setSearch(v); setPage(1); };
  const handleSize = (v) => { setPageSize(Number(v)); setPage(1); };
  const handleMonth = (v) => { setMonthFilter(v); setPage(1); };

  const selectedMonthLabel = MONTHS.find(m => m.value === monthFilter)?.label || 'All Months';
  return (
    <div>
      {/* Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <select value={pageSize} onChange={e => handleSize(e.target.value)}
            style={{ padding: '6px 10px', borderRadius: '7px', border: '1px solid #ffffff', background: '#ffffff', fontSize: '13px', cursor: 'pointer', color: "#0f0e0e" }}>
            {PAGE_SIZE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          <span style={{ color: '#555F6D', fontSize: '13px' }}>entries per page</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#555F6D', fontSize: '13px', fontWeight: '500' }}>
            Filter by Month:
          </span>
          <div style={{ position: 'relative' }}>
            <select
              value={monthFilter}
              onChange={e => handleMonth(e.target.value)}
              style={{
                padding: '6px 32px 6px 12px',
                borderRadius: '7px',
                border: `1.5px solid ${monthFilter ? '#2196F3' : '#E0EAF4'}`,
                background: monthFilter ? '#EEF6FF' : '#f7f8fa',
                fontSize: '13px',
                cursor: 'pointer',
                color: monthFilter ? '#1565C0' : '#1A1A2E',
                fontWeight: monthFilter ? '600' : '400',
                outline: 'none',
                appearance: 'none',
                WebkitAppearance: 'none',
                minWidth: '130px',
              }}
            >
              {MONTHS.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
            {/* Chevron icon */}
            <span style={{
              position: 'absolute', right: '10px', top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none', fontSize: '11px', color: '#8FA3B1',
            }}>▼</span>
          </div>

          {/* Clear filter badge */}
          {monthFilter && (
            <button
              onClick={() => handleMonth('')}
              style={{
                background: '#2196F3', color: '#fff', border: 'none',
                borderRadius: '99px', padding: '3px 10px',
                fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '4px',
              }}
            >
              {selectedMonthLabel} ✕
            </button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#555F6D', fontSize: '13px' }}>Search:</span>
          <input value={search} onChange={e => handleSearch(e.target.value)} placeholder=""
            style={{ padding: '6px 12px', borderRadius: '7px', border: '1px solid #E0EAF4', background: '#ffffff', fontSize: '13px', outline: 'none', width: '180px', color: "#0f0e0e" }} />
        </div>
      </div>

      {/* Table */}
      <div className="table-responsive">
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
          <thead>
            <tr style={{ background: 'linear-gradient(90deg, #2196F3, #1976D2)' }}>
              {['Emp Id', 'Employee Name', 'Designation', 'Code', 'Mobileno', 'Email', 'DOE', 'DOJ', 'Employee Status', 'Action', 'View'].map(h => (
                <th key={h} style={th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={11} style={{ ...td, textAlign: 'center', padding: '30px', color: '#8FA3B1' }}>Loading...</td></tr>
            ) : paginated.length === 0 ? (
              <tr><td colSpan={11} style={{ ...td, textAlign: 'center', padding: '30px', color: '#8FA3B1' }}>No employees found</td></tr>
            ) : paginated.map((emp, i) => (
              <tr key={emp.empId} style={{ background: i % 2 === 0 ? '#fff' : '#F7FAFD' }}
                onMouseEnter={e => e.currentTarget.style.background = '#EEF6FF'}
                onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? '#fff' : '#F7FAFD'}>
                <td style={td}>{emp.empId}</td>
                <td style={td}>{emp.name}</td>
                <td style={td}>{emp.designation}</td>
                <td style={td}>
                  <span style={{ background: '#fffdfd', padding: '2px 6px', borderRadius: '4px', fontSize: '12px', fontFamily: 'monospace' }}>
                    {emp.code}
                  </span>
                </td>
                <td style={td}>{emp.mobile}</td>
                <td style={td}>{emp.email}</td>
                <td style={{...td, whiteSpace:'nowrap'}}>{formatDate(emp.DOE)}</td>
                <td style={{...td, whiteSpace:'nowrap'}}>{formatDate(emp.DOJ)}</td>
                <td style={td}>
                  <span style={{
                    padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
                    background: emp.status === 'Active' ? '#E8F5E9' : '#F5F5F5',
                    color: emp.status === 'Active' ? '#2E7D32' : '#757575',
                  }}>
                    {emp.status}
                  </span>
                </td>

                {/* Action — Edit button */}
                <td style={td}>
                  <button
                    onClick={() => onEdit?.(emp)}
                    title="Edit"
                    style={{ background: 'linear-gradient(135deg,#2196F3,#1565C0)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                    <FiEdit2 size={14} />
                  </button>
                </td>

                {/* ✅ FIX: was `onEdit(emp)` — now calls `onViewPdf(emp.empId)` to open PDF in new tab */}
                <td style={td}>
                  <button
                    onClick={() => onViewPdf?.(emp.empId)}
                    style={{ background: 'none', border: 'none', color: '#2196F3', cursor: 'pointer', fontSize: '13px', fontWeight: '600', textDecoration: 'underline', padding: 0 }}>
                    View
                  </button>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>

      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', marginBottom:'14px',flexWrap: 'wrap', gap: '8px' }}>
          <span style={{ fontSize: '13px', color: '#555F6D' }}>
            Showing {filtered.length === 0 ? 0 : (safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, filtered.length)} of {filtered.length}
          </span>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1}
              style={{ padding: '5px 12px', borderRadius: '6px', border: '1px solid #E0EAF4', background: safePage === 1 ? '#F5F5F5' : '#fff', cursor: safePage === 1 ? 'not-allowed' : 'pointer', fontSize: '13px', color: '#0f0e0e' }}>
              ‹ Prev
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(n => (
              <button key={n} onClick={() => setPage(n)}
                style={{ padding: '5px 10px', borderRadius: '6px', border: '1px solid #E0EAF4', background: n === safePage ? '#2196F3' : '#fff', color: n === safePage ? '#fff' : '#1A1A2E', cursor: 'pointer', fontSize: '13px', fontWeight: n === safePage ? '600' : '400' }}>
                {n}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}
              style={{ padding: '5px 12px', borderRadius: '6px', border: '1px solid #E0EAF4', background: safePage === totalPages ? '#F5F5F5' : '#fff', cursor: safePage === totalPages ? 'not-allowed' : 'pointer', fontSize: '13px', color: '#0f0e0e' }}>
              Next ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeTable;