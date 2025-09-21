import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { invitationAPI } from '../api/axiosService';
import InvitationTable from '../components/InvitationTable';
import Modal from '../components/Modal';
import Papa from 'papaparse';
import { ArrowDownIcon,ArrowUpTrayIcon , ArrowUpIcon,ArrowUpOnSquareIcon , PlusIcon, DocumentArrowUpIcon } from '@heroicons/react/24/solid';

const Invitations = () => {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', search: '', page: 1, limit: 10 });
  const [pagination, setPagination] = useState({ total: 0, pages: 0, currentPage: 1 });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [actionToConfirm, setActionToConfirm] = useState(null);
  const [selectedInvitationId, setSelectedInvitationId] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // --- Import CSV modal state ---
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [parsedColumns, setParsedColumns] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const errorRefs = useRef({}); // refs for cells with errors
  const [columnsVisible, setColumnsVisible] = useState(['name','email','fieldOfStudy','cgpa','skills','jobMatch','experience']);

  const navigate = useNavigate();

  useEffect(() => { fetchInvitations(); }, [filters]);
  useEffect(() => { setFilters({ status: '', search: '', page: 1, limit: 10 }); fetchInvitations(); }, []);

  // --- Fetch Invitations (mock + API) ---
  const fetchInvitations = async () => {
    try {
      setLoading(true);
      if (process.env.NODE_ENV !== 'production') {
        const mockData = generateMockInvitations();
        setInvitations(mockData);
        setPagination({ total: mockData.length, pages: Math.ceil(mockData.length / filters.limit), currentPage: filters.page });
        return;
      }
      const response = await invitationAPI.getInvitations(filters);
      const backendData = response.data;
      setInvitations(backendData.invitations || []);
      setPagination(
        backendData.pagination || {
          total: backendData.invitations?.length || 0,
          pages: Math.ceil((backendData.invitations?.length || 0) / filters.limit),
          currentPage: filters.page
        }
      );
    } catch (err) {
      console.error('Invitations API error:', err);
      const mockData = generateMockInvitations();
      setInvitations(mockData);
      setPagination({ total: mockData.length, pages: Math.ceil(mockData.length / filters.limit), currentPage: filters.page });
    } finally { setLoading(false); }
  };

  const generateMockInvitations = () => {
    const statuses = ['sent', 'accepted', 'completed', 'expired'];
    const assessments = ['Frontend Assessment', 'Backend Assessment', 'Full Stack Assessment'];
    return Array.from({ length: 25 }, (_, i) => ({
      id: i + 1,
      name: `Candidate ${i + 1}`,
      email: `candidate${i + 1}@example.com`,
      assessmentName: assessments[i % assessments.length],
      assessmentId: `assessment_${i % 3 + 1}`,
      status: statuses[i % statuses.length],
      sentAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      expiresAt: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
    }));
  };

  const handleFilterChange = (key, value) => { setFilters(prev => ({ ...prev, [key]: value, page: key === 'page' ? value : 1 })); };
  const handleAction = (action, invitationId) => { setActionToConfirm(action); setSelectedInvitationId(invitationId); setShowConfirmModal(true); };

  const confirmAction = async () => {
    try {
      switch (actionToConfirm) {
        case 'resend': await invitationAPI.resendInvitation(selectedInvitationId); break;
        case 'remind': await invitationAPI.sendReminder(selectedInvitationId); break;
        case 'complete': await invitationAPI.markCompleted(selectedInvitationId); break;
        case 'expire': await invitationAPI.expireInvitation(selectedInvitationId); break;
        default: break;
      }
      fetchInvitations();
    } catch (err) { console.error(err.response?.data?.message || 'Action failed'); }
    finally { setShowConfirmModal(false); setActionToConfirm(null); setSelectedInvitationId(null); }
  };

  const getActionMessage = () => {
    switch (actionToConfirm) {
      case 'resend': return 'Are you sure you want to resend this invitation?';
      case 'remind': return 'Are you sure you want to send a reminder for this invitation?';
      case 'complete': return 'Are you sure you want to mark this invitation as completed?';
      case 'expire': return 'Are you sure you want to expire this invitation?';
      default: return 'Are you sure you want to perform this action?';
    }
  };

  // --- Filter + Sort Invitations ---
  const filteredInvitations = invitations.filter(invitation => {
    const matchesStatus = !filters.status || invitation.status === filters.status;
    const matchesSearch = !filters.search || invitation.name.toLowerCase().includes(filters.search.toLowerCase()) || invitation.email.toLowerCase().includes(filters.search.toLowerCase()) || invitation.assessmentName.toLowerCase().includes(filters.search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const sortedInvitations = React.useMemo(() => {
    let sortable = [...filteredInvitations];
    if (sortConfig.key) {
      sortable.sort((a, b) => {
        const aVal = String(a[sortConfig.key] ?? '').toLowerCase();
        const bVal = String(b[sortConfig.key] ?? '').toLowerCase();
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortable;
  }, [filteredInvitations, sortConfig]);

  // ================= CSV PARSE & VALIDATION =================
  const handleParseAndValidateCSV = (file) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data.map(row => ({
          name: row['Candidate Name']?.trim() || '',
          email: row['Email']?.trim() || '',
          fieldOfStudy: row['Field of Study']?.trim() || '',
          cgpa: row['CGPA']?.trim() || '',
          skills: row['Skills']?.trim() || '',
          jobMatch: row['Job Description Match (%)']?.trim() || '',
          experience: row['Experience']?.trim() || '',
          errors: {}
        }));

        const validated = data.map((row) => {
          const errors = {};
          if (!row.name || !/^[A-Za-z\s]+$/.test(row.name)) errors.name = 'Invalid name';
          if (!row.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) errors.email = 'Invalid email';
          return { ...row, errors };
        });

        setParsedData(validated);
        setParsedColumns(['name','email','fieldOfStudy','cgpa','skills','jobMatch','experience']);
        setColumnsVisible(['name','email','fieldOfStudy','cgpa','skills','jobMatch','experience']);
        setCurrentPage(1);
      }
    });
  };

  const handleCellChange = (rowIndex, key, value) => {
    setParsedData(prev => {
      const newData = [...prev];
      newData[rowIndex][key] = value;
      if (key === 'name') newData[rowIndex].errors.name = !value || !/^[A-Za-z\s]+$/.test(value) ? 'Invalid name' : '';
      if (key === 'email') newData[rowIndex].errors.email = !value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'Invalid email' : '';
      return newData;
    });
  };

  const handleSaveParsedData = async () => {
    const firstErrorIndex = parsedData.findIndex(r => r.errors.name || r.errors.email);
    if (firstErrorIndex !== -1) {
      const firstErrorCol = parsedColumns.find(col => parsedData[firstErrorIndex].errors[col]);
      if (firstErrorCol) {
        const cellRef = errorRefs.current[`${firstErrorIndex}-${firstErrorCol}`];
        if (cellRef && cellRef.scrollIntoView) {
          cellRef.scrollIntoView({ behavior: 'smooth', block: 'center' });
          cellRef.focus();
        }
      }
      return; // prevent saving if errors
    }

    const validRows = parsedData.filter(r => !r.errors.name && !r.errors.email);
    try {
      await invitationAPI.importCandidates(validRows);
      setShowImportModal(false);
      fetchInvitations();
    } catch(err) {
      console.error('Import failed', err);
    }
  };

  const displayedRows = parsedData.slice((currentPage-1)*rowsPerPage, currentPage*rowsPerPage);
  const totalPages = Math.ceil(parsedData.length / rowsPerPage);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Invitations</h1>
          <p className="mt-2 text-gray-600">Manage and track all invitations</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/invitations/new')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-1"
          >
            <PlusIcon className="h-5 w-5" />
            New Invitation
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center gap-1"
          >
  <ArrowUpTrayIcon className="h-5 w-5" />
            Import CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-64">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search by name, email or assessment..."
              className="w-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="min-w-48">
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="sent">Sent</option>
              <option value="accepted">Accepted</option>
              <option value="completed">Completed</option>
              <option value="expired">Expired</option>
            </select>
          </div>
          <div className="min-w-32">
            <label className="block text-sm font-medium text-gray-700 mb-2">Per Page</label>
            <select
              value={filters.limit}
              onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>

      {/* Invitations Table */}
      <div className="bg-white rounded-lg shadow">
        <InvitationTable
          invitations={sortedInvitations}
          sortConfig={sortConfig}
          onSort={(key) => setSortConfig(prev => prev.key === key ? { key, direction: prev.direction==='asc'?'desc':'asc'} : { key, direction: 'asc' })}
          onResend={(id) => handleAction('resend', id)}
          onRemind={(id) => handleAction('remind', id)}
          onComplete={(id) => handleAction('complete', id)}
          onExpire={(id) => handleAction('expire', id)}
          loading={loading}
        />
      </div>

      {/* Import CSV Modal */}
      <Modal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        title="Import Shortlisted Candidates"
        size="xl"
      >
        <div className="space-y-4">
     <label className="block text-sm font-medium text-gray-700 mb-1">Select CSV File</label>

<div className="flex items-center gap-2">
  <input
    type="file"
    accept=".csv"
    id="csvFileInput"
    onChange={(e) => setSelectedFile(e.target.files[0])}
    className="hidden"
  />

  <label
    htmlFor="csvFileInput"
    className="flex items-center gap-1 bg-blue-600 text-white text-md px-2 py-1 rounded-md cursor-pointer hover:bg-blue-700"
  >
    Choose File
  </label>

  <span className="text-gray-700 text-sm">
    {selectedFile ? selectedFile.name : 'No file chosen'}
  </span>
</div>
          <p className="text-gray-600">CSV file should contain columns for:</p>
          <ul className="list-disc list-inside text-gray-600">
            <li><strong>Candidate Name</strong> (required)</li>
            <li><strong>Email</strong> (required)</li>
            <li><strong>Field of Study</strong> (optional)</li>
            <li><strong>CGPA</strong> (optional)</li>
            <li><strong>Skills</strong> (optional)</li>
            <li><strong>Job Description Match (%)</strong> (optional)</li>
            <li><strong>Experience</strong> (optional)</li>
          </ul>
          <button
            disabled={!selectedFile}
            onClick={() => handleParseAndValidateCSV(selectedFile)}
            className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"
          >
             Parse CSV
          </button>

          {parsedData.length > 0 && (
            <div className="mt-4 space-y-2">
              {/* Column toggle */}
              <div className="flex gap-2 flex-wrap">
                {parsedColumns.map(col => (
                  <label key={col} className="flex items-center gap-1 text-sm border px-2 py-1 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={columnsVisible.includes(col)}
                      onChange={() => {
                        setColumnsVisible(prev =>
                          prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]
                        );
                      }}
                    />
                    {col}
                  </label>
                ))}
              </div>

              {/* Pagination controls */}
              <div className="flex justify-between items-center">
                <select
                  value={rowsPerPage}
                  onChange={e => setRowsPerPage(parseInt(e.target.value))}
                  className="border rounded px-2 py-1"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </select>
                <div>
                  Page {currentPage} of {totalPages}
                  <button disabled={currentPage<=1} onClick={()=>setCurrentPage(prev=>prev-1)} className="ml-2 px-2 py-1 border rounded">Prev</button>
                  <button disabled={currentPage>=totalPages} onClick={()=>setCurrentPage(prev=>prev+1)} className="ml-2 px-2 py-1 border rounded">Next</button>
                </div>
              </div>

              {/* Editable Table */}
              <table className="w-full border text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    {columnsVisible.map(col => <th key={col} className="border px-2 py-1 text-left">{col}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {displayedRows.map((row, rowIndex) => (
                    <tr key={rowIndex} className={row.errors.name || row.errors.email ? 'bg-red-100' : ''}>
                      {columnsVisible.map(col => (
                        <td key={col} className="border px-2 py-1">
                          <input
                            type="text"
                            ref={row.errors[col] ? el => errorRefs.current[`${(currentPage-1)*rowsPerPage+rowIndex}-${col}`] = el : null}
                            value={row[col]}
                            onChange={e => handleCellChange((currentPage-1)*rowsPerPage+rowIndex, col, e.target.value)}
                            className="w-full border rounded px-1 py-1"
                          />
                          {row.errors[col] && <p className="text-xs text-red-600">{row.errors[col]}</p>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
   <div className="mt-4 flex justify-between items-center">
  {/* Close button on the left */}
  {/* Save button on the right */}
  <button
    onClick={handleSaveParsedData}
    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition flex items-center gap-1"
  >
    Save
   
  </button>
    <button
    onClick={() => setShowImportModal(false)}
    className="px-4 py-2 rounded-md bg-gray-700 text-white hover:bg-gray-600 transition flex items-center gap-1"
  >
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
    Close
  </button>
</div>

            </div>
          )}
        </div>
      </Modal>

      {/* Confirm modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={()=>setShowConfirmModal(false)}
        title="Confirm Action"
      >
        <p>{getActionMessage()}</p>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={()=>setShowConfirmModal(false)} className="px-4 py-2 border rounded">Cancel</button>
          <button onClick={confirmAction} className="px-4 py-2 bg-blue-600 text-white rounded">Confirm</button>
        </div>
      </Modal>
    </div>
  );
};

export default Invitations;
