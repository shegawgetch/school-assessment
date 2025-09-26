import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMediaQuery, Box, Button, Typography } from '@mui/material';
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
      result.sort((a, b) => {
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
      Cell: ({ cell }) => (Array.isArray(cell.getValue()) ? cell.getValue().join(', ') : '-'),
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

  return (
    <Box className="container mx-auto p-1 m-0 pt-0">
      {/* Top right download button */}
      <Box className="flex justify-between items-center mb-2">
        <Typography variant="h5">Candidate ShortListing Page</Typography>

        <div className="flex gap-2">
          {/* Submit Selected */}
          <Button
            variant="outlined"
            color="secondary" sx={{ textTransform: 'none' }}
            startIcon={<ArrowUpTrayIcon className="h-5 w-5" />}
            onClick={async () => {
              const selectedRows = candidatesWithId.filter((c) => rowSelection[c.id]);
              if (!selectedRows.length) {
                toast.error('Please select at least one candidate.');
                return;
              }

              // Transform row data using only existing table columns
              const payload = selectedRows.map((c) => ({
                name: c['Candidate Name'] || 'Unknown Candidate',
                email: c.Email || '',
                phone: c.Phone || '',
                fieldOfStudy: c['Field of Study'] || '',
                cgpa: c.CGPA ?? null,
                skills: Array.isArray(c.Skills) ? c.Skills : [],
                experience: c.Experience || '',
                jobMatch: c['Job Description Match (%)'] ?? 0,
                strength: c.Strength || '',
              }));

              const toastId = toast.loading('Submitting candidates...');

              try {
                await invitationAPI.createInvitations(payload);
                toast.success('Selected candidates submitted successfully!', { id: toastId });
              } catch (err) {
                console.error(err);
                toast.error('Error submitting candidates.', { id: toastId });
              }
            }}
          >
            Send Invitation
          </Button>

          {/* Download Selected */}
          <Button
            variant="contained"
            color="primary" sx={{ textTransform: 'none' }}
            startIcon={<ArrowDownTrayIcon className="h-5 w-5" />}
            onClick={handleExportSelected}
          >
            Download
          </Button>
        </div>
      </Box>

      {/* Filter */}
      <CandidateFilter filters={filters} setFilters={setFilters} candidates={candidates} />

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
        enableBottomToolbar={false}
        state={{
          rowSelection,
          pagination,
        }}
        muiTableBodyRowProps={({ row }) => ({
          onClick: (e) => {
            // prevent modal if user clicks checkbox
            if ((e.target as HTMLElement).closest('input[type="checkbox"]')) return;
            setSelectedCandidate(row.original); // open modal with row data
          },
          sx: { cursor: 'pointer' }, // make row look clickable
        })}
        onPaginationChange={setPagination} // built-in pagination
        onRowSelectionChange={setRowSelection}
        getRowId={(row) => row.id.toString()}
        onRowClick={(row) => setSelectedCandidate(filteredCandidates[row.index])}
        renderTopToolbarCustomActions={({ table }) => (
          <div className="flex items-center gap-4">
            {/* Select All / Deselect All */}
            <button
              onClick={() => table.toggleAllRowsSelected()}
              className="px-3 py-1 rounded border bg-gray-100 hover:bg-gray-200"
            >
              {table.getIsAllRowsSelected() ? 'Deselect All' : 'Select All'}
            </button>

            {/* Rows per page */}
            <div>
              <label>
                Rows per page:
                <select
                  value={table.getState().pagination.pageSize}
                  onChange={(e) => table.setPageSize(Number(e.target.value))}
                  className="ml-2 border rounded px-1 py-0.5"
                >
                  {[5, 10, 20, 50].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {/* Page navigation */}
            <div className="ml-auto flex items-center gap-1">
              <button
                onClick={() =>
                  table.setPageIndex(Math.max(table.getState().pagination.pageIndex - 1, 0))
                }
                disabled={table.getState().pagination.pageIndex === 0}
                className="px-2 py-1 border rounded bg-gray-100 hover:bg-gray-200"
              >
                Prev
              </button>
              <span>
                Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
              </span>
              <button
                onClick={() =>
                  table.setPageIndex(
                    Math.min(
                      table.getState().pagination.pageIndex + 1,
                      table.getPageCount() - 1
                    )
                  )
                }
                disabled={
                  table.getState().pagination.pageIndex === table.getPageCount() - 1
                }
                className="px-2 py-1 border rounded bg-gray-100 hover:bg-gray-200"
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
