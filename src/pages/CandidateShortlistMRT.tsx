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
    {
      accessorKey: 'CGPA', header: 'CGPA', size: 25,
      Cell: ({ cell }: any) => (
        <div className="text-center">
          {cell.getValue()}
        </div>
      ),
    },
    {
      accessorKey: 'Skills',
      header: 'Skills',
      Cell: ({ cell }: any) => (Array.isArray(cell.getValue()) ? cell.getValue().join(', ') : '-'),
    },
    {
      accessorKey: 'Job Description Match (%)', header: 'Job Match (%)', size: 20,
      Cell: ({ cell }: any) => (
        <div className="text-center">
          {cell.getValue()}%
        </div>
      ),
    },
    {
      accessorKey: 'Strength', header: 'Strength', size: 20, // preferred width in pixels
      minSize: 20,
      maxSize: 50,
    },
    {
      accessorKey: 'Experience', header: 'Experience (Years)', size: 20, // preferred width in pixels
      minSize: 20,
      maxSize: 50,
    },
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
    }} className="space-y-2 min-h-screen flex flex-col p-0 
   p-0 bg-[var(--secondary)] dark:bg-[var(--background)]
    text-[var(--color-text-primary)] dark:text-[var(--color-text-inverted)]
    transition-colors duration-300 mb-0 pb-0
  "
    >
      {/* Top right download button */}
      <Box ref={headerRef} className="w-full px-2 sm:px-4 md:px-6  mb-0">
        {/* Header Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center mb-2 mt-0">
          {/* Page Title */}
          <p className="text-[var(--foreground)] dark:text-[var(--foreground)] leading-tight font-semibold text-base md:text-lg">
            Candidate Shortlisting Page
          </p>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:flex md:justify-end gap-2 sm:gap-3 md:gap-4">
            {/* Send Invitation */}
            <Button
              variant="contained"
              className="
    bg-[var(--primary)] 
    dark:bg-[var(--primary)] 
    text-[var(--primary-foreground)] 
    dark:text-[var(--primary-foreground)] 
    px-4 py-2 rounded-lg 
    shadow-md 
    font-semibold 
    flex items-center gap-2 
    transition-all duration-300 ease-in-out
    hover:bg-[oklch(0.25 0.05 0)] 
    dark:hover:bg-[oklch(0.35 0.05 0)] 
    hover:scale-105 
    focus:outline-none focus:ring-2 
    focus:ring-[var(--primary)] focus:ring-opacity-50
  "
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
              // color="primary"
              className="
    bg-[var(--secondary)] 
    dark:bg-[var(--secondary)] 
    text-[var(--secondary-foreground)] 
    dark:text-[var(--secondary-foreground)] 
    px-4 py-2 rounded-lg 
    shadow-md 
    font-semibold 
    flex items-center gap-2 
    transition-all duration-300 ease-in-out
    hover:bg-[oklch(0.85 0.05 0)] 
    dark:hover:bg-[oklch(0.3 0.05 0)] 
    hover:scale-105 
    focus:outline-none focus:ring-2 
    focus:ring-[var(--secondary)] focus:ring-opacity-50
  "
              sx={{ textTransform: 'none', backgroundColor: '#10B981' }}
              startIcon={<ArrowDownTrayIcon className="h-4 sm:h-5 w-4 sm:w-5 text-white" />}
              onClick={handleExportSelected}
            >
              Download
            </Button>
          </div>
        </div>
      </Box>

      {/* Filter */}
      <Box ref={filterRef} className="w-full mb-0flex flex-wrap justify-end items-center gap-4
      bg-[var(--card)] dark:bg-[var(--card)]
      border border-[var(--color-border-light)] dark:border-[var(--color-border-dark)]
      rounded-lg shadow-sm px-4 py-2
      transition-colors duration-300 mb-1
    "
      >

        <CandidateFilter filters={filters} setFilters={setFilters} candidates={candidates} />
      </Box>

      <GlobalStyles
        styles={{
          "& .MuiTableHead-root": {
            position: "sticky",
            top: 0,
            zIndex: 1000,
            backgroundColor: "var(--color-surface-light)",
            color: "var(--color-text-primary)",
          },
        }}
      />
      <div
        className="p-0 min-h-screen transition-colors duration-300 rounded-xl mb-0
    "
      >
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
          //enableTopToolbar
          enableBottomToolbar={true}
          state={{
            rowSelection,
            pagination,
            //isLoading: loading, // ✅ built-in spinner
          }}
          muiTablePaperProps={{
            sx: {
              bgcolor: 'var(--card)',
              color: 'var(--card-foreground)',
              border: '2px solid var(--border)',
              borderRadius: '12px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
              transition: 'all 0.3s ease-in-out',
            },
          }}
          muiTableContainerProps={{
            sx: {
              bgcolor: 'var(--card)',
              color: 'var(--card-foreground)',
              maxHeight: tableMaxHeight,
              overflowY: 'auto',
              overflowX: 'auto',
              transition: 'all 0.3s ease-in-out',
            },
          }}
          // Table
          muiTableProps={{
            stickyHeader: true,
            sx: {
              tableLayout: 'auto',
              minWidth: '700px',
              bgcolor: 'var(--card)',
              color: 'var(--card-foreground)',
              borderCollapse: 'separate', // ensures row borders visible
              borderSpacing: '0 4px', // spacing between rows
              transition: 'all 0.3s ease-in-out',
            },
          }}
          muiTableBodyCellProps={{
            sx: {
              padding: 0,
              pl: 1,
              bgcolor: 'var(--card)',
              color: 'var(--card-foreground)',
              borderBottom: '1px solid var(--border)',
              '& .MuiCheckbox-root': {
                color: 'var(--primary) !important', // unchecked checkbox color
              },
              '& .Mui-checked': {
                color: 'var(--destructive) !important', // checked color (attractive red)
              },
            },
          }}
          muiTableHeadCellProps={{
            sx: {
              position:'sticky',
              padding: 0,
              pl: 1,
              bgcolor: 'var(--secondary)',
              color: 'var(--secondary-foreground)',
              fontWeight: 600,
              borderBottom: '2px solid var(--border)',
              transition: 'all 0.3s ease-in-out',
              '& .MuiSvgIcon-root': {
                color: 'var(--secondary-foreground) !important', // fixes sort icon color
              },
              '& .MuiTableSortLabel-root': {
                color: 'var(--secondary-foreground) !important',
                '&:hover': {
                  color: 'var(--primary)',
                },
                '& .MuiTableSortLabel-icon': {
                  color: 'var(--secondary-foreground) !important', // ensures sort icon visible
                },
              },
              '& .MuiMenuItem-root, & .MuiMenuItem-icon': {
                color: 'var(--card-foreground) !important', // fixes three-dot menu icon
              },
            },
          }}


          // Table body rows
          muiTableBodyRowProps={{
            sx: {
              border: '1px solid var(--border)',
              borderRadius: '8px',
              overflow: 'hidden',
              transition: 'background-color 0.3s ease-in-out',
              '&:hover': {
                bgcolor: 'var(--muted)',
              },
            },
          }}
          // Top Toolbar dark/light mode
          /*  muiTopToolbarProps={{
              sx: {
                bgcolor: 'var(--card)',
                color: 'var(--card-foreground)',
                borderBottom: '2px solid var(--border)',
                transition: 'all 0.3s ease-in-out',
                '& .MuiButton-root, & .MuiInputBase-root': {
                  color: 'var(--card-foreground)',
                },
              },
            }}*/

          // Bottom Pagination Toolbar dark/light mod
          // ✅ Top toolbar (search/filter)
          muiTopToolbarProps={{
            sx: {
              bgcolor: 'var(--card)',
              color: 'var(--card-foreground)',
              borderBottom: '1.5px solid var(--border)',
              transition: 'all 0.3s ease-in-out',
              padding: '0px',
              paddingX: '10px',
              '& .MuiButton-root, & .MuiInputBase-root, & .MuiIconButton-root': {
                color: 'var(--card-foreground)',
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'var(--border)',
              },
              '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'var(--ring)',
              },
              '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: 'var(--ring)',
              },
            },
          }}
          muiToolbarAlertBannerProps={{
            sx: {
              my: 0,             // remove vertical margin
              py: 0,           // reduce top & bottom padding
              minHeight: '28px', // compact height
              maxHeight: '45px', // compact height

              fontSize: '0.8rem',// smaller “1 of 50 row(s) selected” text
              bgcolor: 'var(--card)',
              color: 'var(--card-foreground)',
              borderBottom: '1px solid var(--border)',
            },
          }}


          // ✅ Bottom toolbar (pagination)
          muiBottomToolbarProps={{
            sx: {
              bgcolor: 'var(--se)',
              color: 'var(--card-foreground)',
              borderTop: '1.5px solid var(--border)',
              transition: 'all 0.3s ease-in-out',
              paddingY: '6px',
              '& .MuiButtonBase-root, & .MuiSvgIcon-root, & .MuiTypography-root': {
                color: 'var(--card-foreground)',
              },
              '& .Mui-disabled': {
                color: 'var(--muted-foreground)',
              },
            },
          }}

          // ✅ Pagination select & icons
          muiTablePaginationProps={{
            SelectProps: {
              sx: {
                bgcolor: 'var(--card)',
                color: 'var(--card-foreground)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                fontSize: '0.85rem',
                '&:hover': {
                  borderColor: 'var(--ring)',
                },
              },
            },
            IconButtonProps: {
              sx: {
                color: 'var(--card-foreground)',
                '&:hover': {
                  color: 'var(--primary)',
                },
              },
            },
          }}

          onPaginationChange={setPagination} // built-in pagination
          onRowSelectionChange={setRowSelection}
          getRowId={(row) => row.id.toString()}
          //onRowClick={(row:any) => setSelectedCandidate(filteredCandidates[row.index])}
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
                      ? "bg-[var(--color-error-light)] dark:bg-[var(--color-error-dark)] hover:brightness-110 text-[var(--color-text-inverted)]"
                      : "bg-[var(--color-primary-blue-light)] dark:bg-[var(--color-primary-blue-dark)] hover:brightness-110 text-[var(--color-text-inverted)]"}`}
                >
                  {table.getIsAllRowsSelected() ? "Deselect All" : "Select All"}
                </button>

                {/* Rows per page */}
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-[var(--foreground)] dark:text-[var(--foreground)] font-medium">Rows per page:</span>
                  <select
                    value={table.getState().pagination.pageSize}
                    onChange={(e) => table.setPageSize(Number(e.target.value))}
                    className="
            px-3 py-1 rounded-lg border 
            border-[var(--color-border-light)] dark:border-[var(--color-border-dark)] 
            bg-[var(--color-surface-light)] dark:bg-[var(--color-surface-dark)]
            text-[var(--color-text-primary)] dark:text-[var(--color-text-inverted)]
            focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue-light)] dark:focus:ring-[var(--color-primary-blue-dark)]
            transition-all duration-300
          "
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
                      ? "bg-[var(--color-gray)] text-[var(--color-text-secondary)] cursor-not-allowed"
                      : "bg-[var(--color-accent-teal-light)] dark:bg-[var(--color-accent-teal-dark)] hover:brightness-110 text-[var(--color-text-inverted)]"}`}
                >
                  Prev
                </button>

                {/* Page Info */}
                <span className="text-[var(--foreground)] dark:text-[var(--foreground)] font-medium">
                  Page <span className="font-semibold">{table.getState().pagination.pageIndex + 1}</span>
                  {' '}of <span className="font-medium">{table.getPageCount()}</span>
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
                      ? "bg-[var(--color-gray)] text-[var(--color-text-secondary)] cursor-not-allowed"
                      : "bg-[var(--color-primary-blue-light)] dark:bg-[var(--color-primary-blue-dark)] hover:brightness-110 text-[var(--color-text-inverted)]"}`}
                >
                  Next
                </button>
              </div>
            </div>
          )}


        />
      </div>

      {selectedCandidate && (
        <CandidateModal candidate={selectedCandidate} onClose={() => setSelectedCandidate(null)} />
      )}
    </Box>
  );
}
