import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { PlusIcon, ArrowUpTrayIcon } from '@heroicons/react/24/solid';
import { GlobalStyles, Box } from '@mui/material';
import { MaterialReactTable, type MRT_ColumnDef, type MRT_RowSelectionState } from 'material-react-table';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import mockAPI from '../api/mockApi';
import {
  ArrowPathIcon,       // Resend
  BellAlertIcon,       // Remind
  CheckCircleIcon,     // Complete
  XCircleIcon          // Expire
} from '@heroicons/react/24/solid';
import { invitationAPI } from '../api/axiosService';
import Papa from 'papaparse';


interface Invitation {
  id: number;
  name: string;
  email: string;
  assessmentName: string;
  assessmentId: string;
  status: string;
  sentAt: string;
  expiresAt: string;
}

const Invitations = () => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', search: '', page: 1, limit: 10 });
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10, total: 0 });
  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [actionToConfirm, setActionToConfirm] = useState<string | null>(null);
  const [selectedInvitationId, setSelectedInvitationId] = useState<number | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);

  const navigate = useNavigate();

  // ---------------- Fetch Invitations ----------------
  const fetchInvitations = async () => {
    setLoading(true);
    try {
      const res = await mockAPI.getInvitations({ page: filters.page, limit: filters.limit, status: filters.status, search: filters.search });
      const data = res.data.invitations.map((inv: any) => ({ ...inv, id: inv.id }));
      setInvitations(data);
      setPagination(prev => ({ ...prev, total: res.data.pagination.total }));
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch invitations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, [filters]);

  // ---------------- Filtered Invitations ----------------
  const filteredInvitations = useMemo(() => {
    return invitations.filter(inv => {
      const matchesStatus = !filters.status || inv.status === filters.status;
      const matchesSearch = !filters.search ||
        inv.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        inv.email.toLowerCase().includes(filters.search.toLowerCase()) ||
        inv.assessmentName.toLowerCase().includes(filters.search.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [invitations, filters]);

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: key === 'page' ? value : 1 }));
  };

  // ---------------- Actions ----------------
  const handleAction = (action: string, invitationId: number) => {
    setActionToConfirm(action);
    setSelectedInvitationId(invitationId);
    setShowConfirmModal(true);
  };

  const confirmAction = async () => {
    if (!selectedInvitationId || !actionToConfirm) return;
    try {
      switch (actionToConfirm) {
        case 'resend': await mockAPI.resendInvitation(selectedInvitationId); break;
        case 'remind': await mockAPI.sendReminder(selectedInvitationId); break;
        case 'complete': await mockAPI.markCompleted(selectedInvitationId); break;
        case 'expire': await mockAPI.expireInvitation(selectedInvitationId); break;
      }
      fetchInvitations();
      toast.success('Action performed successfully');
    } catch (err) {
      console.error(err);
      toast.error('Action failed');
    } finally {
      setShowConfirmModal(false);
      setSelectedInvitationId(null);
      setActionToConfirm(null);
    }
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

  const columns = useMemo<MRT_ColumnDef<Invitation>[]>(() => [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'assessmentName', header: 'Assessment' },
    { accessorKey: 'status', header: 'Status', Cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { accessorKey: 'sentAt', header: 'Sent At', Cell: ({ row }) => new Date(row.original.sentAt).toLocaleString() },
    { accessorKey: 'expiresAt', header: 'Expires At', Cell: ({ row }) => new Date(row.original.expiresAt).toLocaleString() },
    {
      accessorKey: 'actions',
      header: 'Actions',
      Cell: ({ row }) => (
        <div className="flex gap-2">
          {/* Resend */}
          <button
            onClick={() => handleAction('resend', row.original.id)}
            className="text-blue-600 hover:text-blue-900 p-1 rounded-md transition"
            title="Resend Invitation"
          >
            <ArrowPathIcon className="h-5 w-5" />
          </button>

          {/* Remind */}
          <button
            onClick={() => handleAction('remind', row.original.id)}
            className="text-yellow-600 hover:text-yellow-900 p-1 rounded-md transition"
            title="Send Reminder"
          >
            <BellAlertIcon className="h-5 w-5" />
          </button>

          {/* Complete */}
          <button
            onClick={() => handleAction('complete', row.original.id)}
            className="text-green-600 hover:text-green-900 p-1 rounded-md transition"
            title="Mark as Completed"
          >
            <CheckCircleIcon className="h-5 w-5" />
          </button>

          {/* Expire */}
          <button
            onClick={() => handleAction('expire', row.original.id)}
            className="text-red-600 hover:text-red-900 p-1 rounded-md transition"
            title="Expire Invitation"
          >
            <XCircleIcon className="h-5 w-5" />
          </button>
        </div>
      )
    }
  ], []);
  const headerRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const [tableMaxHeight, setTableMaxHeight] = useState('calc(100vh - 200px)'); // fallback

  const [tableOffsetTop, setTableOffsetTop] = useState(0);

  useEffect(() => {
    const calculateMaxHeight = () => {
      const headerHeight = headerRef.current?.offsetHeight || 0;
      const filterHeight = filterRef.current?.offsetHeight || 0;
      const margin = 16;

      setTableMaxHeight(`calc(100vh - ${headerHeight + filterHeight + margin}px)`);
      setTableOffsetTop(headerHeight + filterHeight); // 👈 for sticky offset
    };

    calculateMaxHeight();
    window.addEventListener('resize', calculateMaxHeight);
    return () => window.removeEventListener('resize', calculateMaxHeight);
  }, []);
  //const [showImportModal, setShowImportModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [parsedColumns, setParsedColumns] = useState<string[]>([]);
  const [columnsVisible, setColumnsVisible] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const errorRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const totalPages = Math.ceil(parsedData.length / rowsPerPage);
  const displayedRows = parsedData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // --- CSV Parsing and Validation ---
  const handleParseCSV = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results: any) => {
        const data = results.data.map((row: any) => ({
          name: row['Candidate Name']?.trim() || '',
          email: row['Email']?.trim() || '',
          fieldOfStudy: row['Field of Study']?.trim() || '',
          cgpa: row['CGPA']?.trim() || '',
          skills: row['Skills']?.trim() || '',
          jobMatch: row['Job Description Match (%)']?.trim() || '',
          experience: row['Experience']?.trim() || '',
          errors: {},
        }));

        const validated = data.map((row: any) => {
          const errors: any = {};
          if (!row.name || !/^[A-Za-z\s.]+$/.test(row.name)) errors.name = 'Invalid name';
          if (!row.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email))
            errors.email = 'Invalid email';
          return { ...row, errors };
        });

        setParsedData(validated);
        const cols = ['name', 'email', 'fieldOfStudy', 'cgpa', 'skills', 'jobMatch', 'experience'];
        setParsedColumns(cols);
        setColumnsVisible(cols);
        setCurrentPage(1);
      },
    });
  };

  const handleCellChange = (rowIndex: number, key: string, value: string) => {
    setParsedData((prev) => {
      const newData = [...prev];
      newData[rowIndex][key] = value;
      if (key === 'name')
        newData[rowIndex].errors.name = !value || !/^[A-Za-z\s.]+$/.test(value) ? 'Invalid name' : '';
      if (key === 'email')
        newData[rowIndex].errors.email = !value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
          ? 'Invalid email'
          : '';
      return newData;
    });
  };

  const handleSendInvitations = async () => {
    // Find first row with errors
    const firstErrorIndex = parsedData.findIndex(
      (r) => Object.values(r.errors).some((err) => err)
    );

    if (firstErrorIndex !== -1) {
      const firstErrorCol = parsedColumns.find(
        (col) => parsedData[firstErrorIndex].errors[col]
      );

      if (firstErrorCol) {
        // Calculate which page that row belongs to
        const errorPage = Math.floor(firstErrorIndex / rowsPerPage) + 1;

        // Jump to that page if different
        if (errorPage !== currentPage) {
          setCurrentPage(errorPage);

          // Delay focusing until after page renders
          setTimeout(() => {
            const cellRef = errorRefs.current[`${firstErrorIndex}-${firstErrorCol}`];
            if (cellRef) {
              cellRef.scrollIntoView({ behavior: "smooth", block: "center" });
              cellRef.focus();
            }
          }, 200); // wait for re-render
        } else {
          // Same page → directly focus
          const cellRef = errorRefs.current[`${firstErrorIndex}-${firstErrorCol}`];
          if (cellRef) {
            cellRef.scrollIntoView({ behavior: "smooth", block: "center" });
            cellRef.focus();
          }
        }
      }

      toast.error("Please fix errors before sending.");
      return;
    }

    // ✅ No errors → send invitations
    const validRows = parsedData.map((r) => ({
      name: r.name,
      email: r.email,
      fieldOfStudy: r.fieldOfStudy,
      cgpa: r.cgpa,
      skills: r.skills,
      jobMatch: r.jobMatch,
      experience: r.experience,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 19),
    }));

    try {
      await invitationAPI.createInvitations(validRows);
      toast.success("Invitations sent successfully!");
      setShowImportModal(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to send invitations.");
    }
  };
  //single invitation
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    fieldOfStudy: '',
    cgpa: '',
    skills: '',
    jobMatch: '',
    strength: '',
    experience: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  //const errorRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const handleChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: '' })); // clear error on change
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    // Name: letters, space, dot, comma only
    if (!formData.name.trim() || !/^[a-zA-Z.,\s]+$/.test(formData.name)) {
      newErrors.name = 'Name should be letters only';
    }

    // Email: proper format
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please fill a valid email';
    }

    setErrors(newErrors);
    return newErrors;
  };

  const handleSubmit = async () => {
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      const firstErrorKey = Object.keys(validationErrors)[0];
      const ref = errorRefs.current[firstErrorKey];
      if (ref) {
        ref.scrollIntoView({ behavior: 'smooth', block: 'center' });
        ref.focus();
      }
      toast.error('Please fix the errors before sending.');
      return;
    }

    try {
      await invitationAPI.createInvitations([{
        ...formData,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .slice(0, 19)
      }]);
      toast.success('Invitation sent successfully!');
      setShowModal(false);
      setFormData({
        name: '',
        email: '',
        fieldOfStudy: '',
        cgpa: '',
        skills: '',
        jobMatch: '',
        strength: '',
        experience: ''
      });
      setErrors({});
    } catch (err) {
      console.error(err);
      toast.error('Failed to send invitation.');
    }
  }
/*
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
*/
  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-2 md:gap-0 mb-2">
        {/* Left: Header */}
        <div>
          <p className="text-gray-700 font-semibold text-base md:text-lg">
            Manage and track all invitations
          </p>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-wrap gap-2">
         {/* <button
            onClick={() => navigate('/invitations/new')}
            className="bg-blue-600 text-white px-3 py-.5 md:px-4 md:py-1 rounded-lg hover:bg-blue-700 shadow-sm flex items-center gap-1 transition duration-200"
          >
            <PlusIcon className="h-4 w-4 md:h-5 md:w-5" /> New Invitation
          </button> */}
          <button
            onClick={() => setShowModal(true)}
            className="bg-gray-100 text-gray border px-3 py-.5 md:px-4 md:py-1 rounded-lg hover:bg-gray-400 shadow-sm flex items-center gap-1 transition duration-200"
          >  <PlusIcon className="h-4 w-4 md:h-5 md:w-5" />
            Send Invitation
          </button>


          <button
            onClick={() => setShowImportModal(true)}
            className="bg-blue-600 text-white px-3 py-.5 md:px-4 md:py-1 rounded-lg hover:bg-green-700 shadow-sm flex items-center gap-1 transition duration-200"
          >
            <ArrowUpTrayIcon className="h-4 w-4 md:h-5 md:w-5" /> Import CSV
          </button>
        </div>
      </div>


      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 pt-2 pb-2 mt-1 mb-1 flex gap-4 flex-wrap justify-end">
        {/*<div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            placeholder="Search by name, email or assessment..."
            className="w-64 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>*/}
        <div>
          <label className="text-md pr-2 font-medium text-gray-700 mb-2">Status</label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-48 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="sent">Sent</option>
            <option value="accepted">Accepted</option>
            <option value="completed">Completed</option>
            <option value="expired">Expired</option>
          </select>
        </div>
        {/*
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Per Page</label>
          <select
            value={filters.limit}
            onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
            className="w-32 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        */}
      </div>

      {/* Table */}
      <GlobalStyles
        styles={{
          "thead.MuiTableHead-root": {
            position: "sticky",
            top: 0, // height of custom toolbar in px
            zIndex: 2,
            backgroundColor: "white",
          },
        }}
      />
      <MaterialReactTable
        columns={columns}
        data={filteredInvitations}
        //enableRowSelection               // enable selection
        // enableMultiRowSelection          // allow multiple selection
        enableColumnFilters={true}
        enableGlobalFilter={true}
        enableSelectAll={false} // removes header checkbox
        // enableRowSelectionOnClick
        positionActionsColumn="first"
        rowNumberDisplayMode="static"
        enablePagination
        enableTopToolbar
        enableBottomToolbar={true}
        state={{
          rowSelection,
          pagination,
        }}
        muiTablePaperProps={{
          component: Box, // 👈 turns MRT’s root Paper into a Box
          className: "shadow-md rounded-lg border border-gray-200", // Tailwind styles
          sx: {
            display: "flex",
            flexDirection: "column",
            height: "100%",
          },
        }}
        muiTableContainerProps={{
          sx: {
            maxHeight: tableMaxHeight,
            overflowY: "auto",
            overflowX: "auto",
            position: "relative", // important for sticky children


          },

        }}
        muiTableProps={{
          stickyHeader: true, // <- this helps MUI Table
          sx: {
            tableLayout: "auto",
            minWidth: "700px",
          },
        }}
        muiTableHeadCellProps={{
          sx: {
            position: "sticky",
            top: 0, // same as thead.MuiTableHead-root
            zIndex: 3,
            backgroundColor: "white",
          },
        }}
        /* muiTableBodyRowProps={({ row }) => ({
           onClick: (e) => {
             // prevent modal if user clicks checkbox
             if ((e.target as HTMLElement).closest('input[type="checkbox"]')) return;
             setSelectedCandidate(row.original); // open modal with row data
           },
           sx: { cursor: 'pointer', wordBreak: 'break-word' },
         })}*/
        onPaginationChange={setPagination} // built-in pagination
        onRowSelectionChange={setRowSelection}
        getRowId={(row) => row.id.toString()}
        // onRowClick={(row) => setSelectedCandidate(filteredCandidates[row.index])}
        renderTopToolbarCustomActions={({ table }) => (
          <div
            className="sticky top-0 z-20 p-1 
               flex flex-col md:flex-row md:items-center md:justify-between gap-4"
          >
            {/* Left group: Select All + Rows per page */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              {/* Select All / Deselect All */}
              <button
                onClick={() => table.toggleAllRowsSelected()}
                className={`px-4 py-1 rounded-lg font-medium transition
          ${table.getIsAllRowsSelected()
                    ? "bg-red-500 hover:bg-red-600 text-white shadow-sm"
                    : "bg-blue-500 hover:bg-blue-600 text-white shadow-sm"}`}
              >
                {table.getIsAllRowsSelected() ? "Deselect All" : "Select All"}
              </button>

              {/* Rows per page */}
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600">Rows per page:</span>
                <select
                  value={table.getState().pagination.pageSize}
                  onChange={(e) => table.setPageSize(Number(e.target.value))}
                  className="px-3 py-1 rounded-lg border border-gray-300 
                     bg-gray-50 hover:bg-gray-100 text-sm 
                     focus:ring-2 focus:ring-blue-400 outline-none transition"
                >
                  {[5, 10, 20, 50].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Right group: Pagination */}
            <div className="flex items-center gap-4 justify-center md:justify-end text-sm w-full md:w-auto">
              {/* Prev Button */}
              <button
                onClick={() =>
                  table.setPageIndex(Math.max(table.getState().pagination.pageIndex - 1, 0))
                }
                disabled={table.getState().pagination.pageIndex === 0}
                className={`px-2 py-1 rounded-lg font-medium transition
          ${table.getState().pagination.pageIndex === 0
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-orange-500 text-white hover:bg-orange-600 shadow-sm"}`}
              >
                Prev
              </button>

              {/* Page Info */}
              <span className="text-gray-700">
                Page <span className="font-medium">{table.getState().pagination.pageIndex + 1}</span>
                of <span className="font-medium">{table.getPageCount()}</span>
              </span>

              {/* Next Button */}
              <button
                onClick={() =>
                  table.setPageIndex(
                    Math.min(
                      table.getState().pagination.pageIndex + 1,
                      table.getPageCount() - 1
                    )
                  )
                }
                disabled={table.getState().pagination.pageIndex === table.getPageCount() - 1}
                className={`px-2 py-1 rounded-lg font-medium transition
          ${table.getState().pagination.pageIndex === table.getPageCount() - 1
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-green-500 text-white hover:bg-green-600 shadow-sm"}`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      />
      {/* Confirm Modal */}
      <Modal isOpen={showConfirmModal} onClose={() => setShowConfirmModal(false)} title="Confirm Action">
        <p>{getActionMessage()}</p>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={() => setShowConfirmModal(false)} className="px-4 py-2 border rounded">Cancel</button>
          <button onClick={confirmAction} className="px-4 py-2 bg-blue-600 text-white rounded">Confirm</button>
        </div>
      </Modal>

      {/* CSV Import Modal */}
      <Modal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        title="Import Shortlisted Candidates"
        size="xl"
      >
        <div className="space-y-4">
          {/* File Input */}
          <div className="block items-center gap-2">
            <input
              type="file"
              accept=".csv"
              id="csvFileInput"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="hidden"
            />
            <label
              htmlFor="csvFileInput"
              className=" w-lg items-center gap-1 bg-blue-600 text-white text-md px-2 py-1 rounded-md cursor-pointer hover:bg-blue-700"
            >
              Choose File
            </label>
            <span className="text-gray-700 text-sm mb-2">
              {selectedFile ? selectedFile.name : 'No file chosen'}
            </span>

            {/* CSV Instructions */}
            <div className="bg-blue-50 border-l-4 border-blue-300 p-3 mt-2 mb-2 rounded-md">
              <h3 className="font-semibold text-blue-800 text-sm mb-2">
                CSV file should contain columns for:
              </h3>
              <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                <li>Full Name</li>
                <li>Email Address</li>
                <li>Phone Number</li>
                <li>Position Applied</li>
                <li>Experience (Years)</li>
              </ul>
            </div>
            <button
              disabled={!selectedFile}
              onClick={() => selectedFile && handleParseCSV(selectedFile)}
              className="bl ml-auto bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              Parse CSV
            </button>

          </div>

          {/* Column Toggle */}
          {parsedData.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {parsedColumns.map((col) => (
                <label
                  key={col}
                  className="flex items-center gap-2 px-3 py-0.5 rounded-lg cursor-pointer 
                   border transition-all duration-200
                   hover:bg-blue-50 hover:border-blue-400
                   focus-within:ring-2 focus-within:ring-blue-400"
                >
                  <input
                    type="checkbox"
                    checked={columnsVisible.includes(col)}
                    onChange={() =>
                      setColumnsVisible((prev) =>
                        prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
                      )
                    }
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700 font-medium">{col}</span>
                </label>
              ))}
            </div>
          )}


          {/* Pagination + Actions */}
          {parsedData.length > 0 && (
            <div className="flex flex-col md:flex-row justify-between items-center mt-0 p-0 rounded-lg gap-3 md:gap-0">

              {/* Left: Rows per page */}
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600 font-medium">Rows per page:</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => setRowsPerPage(parseInt(e.target.value))}
                  className="px-3 py-1 rounded-lg border border-gray-300 
                   bg-gray-50 hover:bg-gray-100 text-sm 
                   focus:ring-2 focus:ring-blue-400 outline-none transition"
                >
                  {[5, 10, 20].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>

              {/* Right: Pagination buttons */}
              <div className="flex items-center gap-4 justify-center md:justify-end text-sm w-full md:w-auto">
                {/* Prev */}
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage <= 1}
                  className={`px-3 py-1.5 rounded-lg font-medium transition
          ${currentPage <= 1
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-orange-500 text-white hover:bg-orange-600 shadow-sm"
                    }`}
                >
                  Prev
                </button>

                {/* Page Info */}
                <span className="text-gray-700">
                  Page <span className="font-semibold text-blue-600">{currentPage}</span> of <span className="font-semibold text-gray-800">{totalPages}</span>
                </span>

                {/* Next */}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage >= totalPages}
                  className={`px-3 py-1.5 rounded-lg font-medium transition
          ${currentPage >= totalPages
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-green-500 text-white hover:bg-green-600 shadow-sm"
                    }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}



          {/* Editable Table */}
          {parsedData.length > 0 && (
            <div className="overflow-x-auto max-h-[400px] border border-gray-300 rounded-lg">
              <table className="min-w-full border-separate border-spacing-0 text-sm">
                <thead className="bg-gray-100 sticky top-0 z-10">
                  <tr>
                    {columnsVisible.map((col) => (
                      <th
                        key={col}
                        className="border-b border-gray-300 px-3 py-2 text-left font-medium text-gray-700 text-xs tracking-wide uppercase bg-gray-100"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {displayedRows.map((row, rowIndex) => {
                    const globalRowIndex = (currentPage - 1) * rowsPerPage + rowIndex;
                    return (
                      <tr
                        key={globalRowIndex}
                        className={`hover:bg-gray-50 transition-colors duration-150 ${Object.values(row.errors).some(Boolean)
                          ? 'bg-red-50'
                          : rowIndex % 2 === 0
                            ? 'bg-white'
                            : 'bg-gray-50'
                          }`}
                      >
                        {columnsVisible.map((col) => (
                          <td key={col} className="border-b border-r border-gray-200 last:border-r-0">
                            <input
                              type="text"
                              ref={(el: any) => (errorRefs.current[`${rowIndex}-${col}`] = el)}
                              // tabIndex={-1} // 👈 makes it programmatically focusable                            
                              value={row[col]}
                              onChange={(e) => handleCellChange(globalRowIndex, col, e.target.value)}
                              className="w-full h-full bg-transparent text-sm px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 border-none"
                            />
                            {row.errors[col] && (
                              <p className="text-xs text-red-600 mt-0.5 px-1">{row.errors[col]}</p>
                            )}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Modal Footer */}
          {parsedData.length > 0 && (
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={handleSendInvitations}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
              >
                Send Invitations
              </button>
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition"
              >
                Cancel
              </button>
            </div>
          )}


        </div>
      </Modal>
      {/* modal for single invitation */}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Send Invitation">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: 'Candidate Name*', key: 'name' },
            { label: 'Email*', key: 'email' },
            { label: 'Field of Study', key: 'fieldOfStudy' },
            { label: 'CGPA', key: 'cgpa' },
            { label: 'Skills', key: 'skills' },
            { label: 'Job Description Match (%)', key: 'jobMatch' },
            { label: 'Strength', key: 'strength' },
            { label: 'Experience', key: 'experience' },
          ].map(field => (
            <div key={field.key} className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">{field.label}</label>
              <input
                type="text"
                value={formData[field.key as keyof typeof formData]}
                ref={(el:any) => (errorRefs.current[field.key] = el)}
                onChange={e => handleChange(field.key, e.target.value)}
                className={`border rounded-md px-2 py-1 focus:outline-none focus:ring-1
                  ${errors[field.key] ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'}`}
              />
              {errors[field.key] && (
                <span className="text-red-500 text-xs mt-1">{errors[field.key]}</span>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
          >
            Send
          </button>
          <button
            onClick={() => setShowModal(false)}
            className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition"
          >
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Invitations;
