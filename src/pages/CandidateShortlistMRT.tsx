import { useEffect, useMemo, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMediaQuery, Box, Button, Typography, useTheme } from '@mui/material';
import Grid from "@mui/material/Grid";
import {
  MaterialReactTable,
  type MRT_ColumnDef,
  type MRT_RowSelectionState,
  type MRT_PaginationState,
} from 'material-react-table';
import candidates from '../api/candidates.json';
import CandidateFilter from '../components/CandidateFilter';
import CandidateModal from '../components/CandidateModal';
import useCandidateStore from '../store/candidateStore';
import { exportToCsv } from '../utils/exportCsv';
import { invitationAPI } from '../api/axiosService';
import { ArrowUpTrayIcon, ArrowDownTrayIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import { GlobalStyles } from "@mui/material";



export default function CandidateShortlistMRT() {
  const isDesktop = useMediaQuery('(min-width:1200px)');
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    filters,
    sorting,
    selectedCandidate,
    setFilters,
    setSorting,
    setSelectedCandidate,
  } = useCandidateStore();

  const [filteredCandidates, setFilteredCandidates] = useState<any[]>([]);
  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({});
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // --- Initialize state from URL params ---
  useEffect(() => {
    const search = searchParams.get('search') || '';
    const field = searchParams.get('field')?.split(',').filter(Boolean) || [];
    const minCgpa = parseFloat(searchParams.get('minCgpa') || '0');
    const jobMin = parseFloat(searchParams.get('jobMin') || '0');
    const jobMax = parseFloat(searchParams.get('jobMax') || '100');
    const experience = searchParams.get('experience') || '';
    const page = parseInt(searchParams.get('page') || '0');
    const rows = parseInt(searchParams.get('rows') || '10');
    const sort = searchParams.get('sort') || '';
    const selected = searchParams.get('selected')?.split(',').map(Number) || [];

    setFilters({
      search,
      field,
      minCgpa,
      jobMatchRange: [jobMin, jobMax],
      experience,
    });

    setPagination({ pageIndex: page, pageSize: rows });
    setSorting(sort);

    const selection: MRT_RowSelectionState = {};
    selected.forEach((idx) => (selection[idx] = true));
    setRowSelection(selection);
  }, []);

  // --- Sync state back to URL params ---
  useEffect(() => {
    const params: Record<string, string> = {};
    if (filters.search) params.search = filters.search;
    if (filters.field.length) params.field = filters.field.join(',');
    if (filters.minCgpa) params.minCgpa = filters.minCgpa.toString();
    if (filters.jobMatchRange[0] !== 0) params.jobMin = filters.jobMatchRange[0].toString();
    if (filters.jobMatchRange[1] !== 100) params.jobMax = filters.jobMatchRange[1].toString();
    if (filters.experience) params.experience = filters.experience;
    if (sorting) params.sort = sorting;

    params.page = pagination.pageIndex.toString();
    params.rows = pagination.pageSize.toString();

    const selectedRows = Object.keys(rowSelection).filter((k) => rowSelection[k]);
    if (selectedRows.length) params.selected = selectedRows.join(',');

    setSearchParams(params);
  }, [filters, sorting, pagination, rowSelection]);

  // --- Filter & Sort Candidates ---
  useEffect(() => {
    let result = candidates.filter((c) => {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch =
        c['Candidate Name'].toLowerCase().includes(searchLower) ||
        c.Email.toLowerCase().includes(searchLower) ||
        (Array.isArray(c.Skills) &&
          c.Skills.some((s) => s.toLowerCase().includes(searchLower)));
      if (!matchesSearch) return false;

      if (filters.field.length && !filters.field.includes(c['Field of Study'])) return false;
      if (c.CGPA < filters.minCgpa) return false;

      const jobMatch = parseFloat(c['Job Description Match (%)']) || 0;
      if (jobMatch < filters.jobMatchRange[0] || jobMatch > filters.jobMatchRange[1]) return false;

      const exp = parseInt(c.Experience) || 0;
      if (filters.experience === '0' && exp !== 0) return false;
      if (filters.experience === '1-3' && (exp < 1 || exp > 3)) return false;
      if (filters.experience === '>5' && exp <= 5) return false;

      return true;
    });

    if (sorting) {
      const [key, dir] = sorting.split('_');
      result.sort((a: any, b: any) => {
        let valA = a[key] ?? '';
        let valB = b[key] ?? '';
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();
        if (valA > valB) return dir === 'asc' ? 1 : -1;
        if (valA < valB) return dir === 'asc' ? -1 : 1;
        return 0;
      });
    }

    setFilteredCandidates(result);
  }, [filters, sorting]);

  // --- Columns ---
  const columns = useMemo<MRT_ColumnDef<any>[]>(() => [
    { accessorKey: 'Candidate Name', header: 'Candidate Name' },
    { accessorKey: 'Email', header: 'Email' },
    { accessorKey: 'Field of Study', header: 'Field of Study' },
    { accessorKey: 'CGPA', header: 'CGPA' },
    {
      accessorKey: 'Skills',
      header: 'Skills',
      Cell: ({ cell }: any) => (Array.isArray(cell.getValue()) ? cell.getValue().join(', ') : '-'),
    },
    { accessorKey: 'Job Description Match (%)', header: 'Job Match (%)' },
    { accessorKey: 'Strength', header: 'Strength' },
    { accessorKey: 'Experience', header: 'Experience (Years)' },
  ], []);

  // --- Export Selected Rows ---
  const handleExportSelected = () => {
    // Get selected rows from current rowSelection state
    const selectedRows = candidatesWithId.filter((c) => rowSelection[c.id]);

    if (!selectedRows.length) {
      toast.error('Please select at least one candidate to export.');

      return;
    }

    const exportData = selectedRows.map((c) => ({
      'Candidate Name': c['Candidate Name'] || '-',
      Email: c.Email || '-',
      'Field of Study': c['Field of Study'] || '-',
      CGPA: c.CGPA ?? '-',
      Skills: Array.isArray(c.Skills) ? c.Skills.join(', ') : '-',
      'Job Description Match (%)': c['Job Description Match (%)'] ?? '-',
      Strength: c.Strength || '-',
      Experience: c.Experience || '-',
    }));

    exportToCsv(exportData, 'shortlisted_candidates.csv');
  };


  const candidatesWithId = useMemo(
    () => filteredCandidates.map((c, idx) => ({ ...c, id: idx })),
    [filteredCandidates]
  );
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // true if screen < sm
  //for loading state spinner
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetch delay
    setTimeout(() => {
      setLoading(false);
    }, 1500);
  }, []);

  return (
    <Box sx={{
      // height: '100vh', // full viewport minus header
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Top right download button */}
      <Box ref={headerRef} className="w-full px-2 sm:px-4 md:px-6">
        {/* Header Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center mb-2 mt-0">
          {/* Page Title */}
          <p className="font-semibold text-gray-700 text-base sm:text-sm md:text-md lg:text-xl">
            Candidate Shortlisting Page
          </p>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:flex md:justify-end gap-2 sm:gap-3 md:gap-4">
            {/* Send Invitation */}
            <Button
              variant="outlined"
              color="secondary"
              className="w-full md:w-auto flex items-center justify-center gap-2 rounded-xl normal-case px-4 sm:px-3 py-1 sm:py-.5 font-semibold transition-all duration-200 shadow-sm hover:shadow-lg hover:bg-gray-50"
              sx={{ textTransform: 'none' }}
              startIcon={<ArrowUpTrayIcon className="h-4 sm:h-5 w-4 sm:w-5 text-secondary-600" />}
              onClick={async () => {
                const selectedRows = candidatesWithId.filter((c) => rowSelection[c.id]);
                if (!selectedRows.length) {
                  toast.error("Please select at least one candidate.");
                  return;
                }

                const payload = selectedRows.map((c) => ({
                  name: c["Candidate Name"] || "Unknown Candidate",
                  email: c.Email || "",
                  phone: c.Phone || "",
                  fieldOfStudy: c["Field of Study"] || "",
                  cgpa: c.CGPA ?? null,
                  skills: Array.isArray(c.Skills) ? c.Skills : [],
                  experience: c.Experience || "",
                  jobMatch: c["Job Description Match (%)"] ?? 0,
                  strength: c.Strength || "",
                }));

                const toastId = toast.loading("Submitting candidates...");
                try {
                  await invitationAPI.createInvitations(payload);
                  toast.success("Selected candidates submitted successfully!", { id: toastId });
                } catch (err) {
                  console.error(err);
                  toast.error("Error submitting candidates.", { id: toastId });
                }
              }}
            >
              Send Invitation
            </Button>

            {/* Download Selected */}
            <Button
              variant="contained"
              color="primary"
              className="w-full md:w-auto flex items-center justify-center gap-2 rounded-xl normal-case px-4 sm:px-3 py-1 sm:py-.5 font-semibold transition-all duration-200 shadow-md hover:shadow-lg hover:bg-blue-600"
              sx={{ textTransform: 'none' }}
              startIcon={<ArrowDownTrayIcon className="h-4 sm:h-5 w-4 sm:w-5 text-white" />}
              onClick={handleExportSelected}
            >
              Download
            </Button>
          </div>
        </div>
      </Box>

      {/* Filter */}
      <Box ref={filterRef} className="w-full mb-0 m-0  px-2 sm:px-0 p:0"
      >

        <CandidateFilter filters={filters} setFilters={setFilters} candidates={candidates} />
      </Box>

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
        data={candidatesWithId}
        enableRowSelection               // enable selection
        enableMultiRowSelection          // allow multiple selection
        enableColumnFilters={false}
        enableGlobalFilter={false}
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
          //isLoading: loading, // ✅ built-in spinner
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
        muiTableBodyRowProps={({ row }) => ({
          onClick: (e) => {
            // prevent modal if user clicks checkbox
            if ((e.target as HTMLElement).closest('input[type="checkbox"]')) return;
            setSelectedCandidate(row.original); // open modal with row data
          },
          sx: { cursor: 'pointer', wordBreak: 'break-word' },
        })}
        onPaginationChange={setPagination} // built-in pagination
        onRowSelectionChange={setRowSelection}
        getRowId={(row) => row.id.toString()}
        onRowClick={(row) => setSelectedCandidate(filteredCandidates[row.index])}
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

      {selectedCandidate && (
        <CandidateModal candidate={selectedCandidate} onClose={() => setSelectedCandidate(null)} />
      )}
    </Box>
  );
}
