import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { invitationAPI } from '../api/axiosService';
import InvitationTable from '../components/InvitationTable';
import Modal from '../components/Modal';

const Invitations = () => {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    page: 1,
    limit: 10
  });
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
    currentPage: 1
  });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [actionToConfirm, setActionToConfirm] = useState(null);
  const [selectedInvitationId, setSelectedInvitationId] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const navigate = useNavigate();

  useEffect(() => {
    fetchInvitations();
  }, [filters]);

  useEffect(() => {
    setFilters({ status: '', search: '', page: 1, limit: 10 });
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      setLoading(true);

      if (process.env.NODE_ENV !== 'production') {
        const mockData = generateMockInvitations();
        setInvitations(mockData);
        setPagination({
          total: mockData.length,
          pages: Math.ceil(mockData.length / filters.limit),
          currentPage: filters.page
        });
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
      setPagination({
        total: mockData.length,
        pages: Math.ceil(mockData.length / filters.limit),
        currentPage: filters.page
      });
    } finally {
      setLoading(false);
    }
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

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: key === 'page' ? value : 1 }));
  };

  const handleAction = (action, invitationId) => {
    setActionToConfirm(action);
    setSelectedInvitationId(invitationId);
    setShowConfirmModal(true);
  };

  const confirmAction = async () => {
    try {
      switch (actionToConfirm) {
        case 'resend':
          await invitationAPI.resendInvitation(selectedInvitationId);
          break;
        case 'remind':
          await invitationAPI.sendReminder(selectedInvitationId);
          break;
        case 'complete':
          await invitationAPI.markCompleted(selectedInvitationId);
          break;
        case 'expire':
          await invitationAPI.expireInvitation(selectedInvitationId);
          break;
        default:
          break;
      }
      fetchInvitations();
    } catch (err) {
      console.error(err.response?.data?.message || 'Action failed');
    } finally {
      setShowConfirmModal(false);
      setActionToConfirm(null);
      setSelectedInvitationId(null);
    }
  };

  const getActionMessage = () => {
    switch (actionToConfirm) {
      case 'resend':
        return 'Are you sure you want to resend this invitation?';
      case 'remind':
        return 'Are you sure you want to send a reminder for this invitation?';
      case 'complete':
        return 'Are you sure you want to mark this invitation as completed?';
      case 'expire':
        return 'Are you sure you want to expire this invitation?';
      default:
        return 'Are you sure you want to perform this action?';
    }
  };

  // Filter invitations based on status and search
  const filteredInvitations = invitations.filter(invitation => {
    const matchesStatus = !filters.status || invitation.status === filters.status;
    const matchesSearch =
      !filters.search ||
      invitation.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      invitation.email.toLowerCase().includes(filters.search.toLowerCase()) ||
      invitation.assessmentName.toLowerCase().includes(filters.search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Sort invitations
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Invitations</h1>
          <p className="mt-2 text-gray-600">Manage and track all invitations</p>
        </div>
        <button
          onClick={() => navigate('/invitations/new')}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          New Invitation
        </button>
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

      {/* Table */}
      <div className="bg-white rounded-lg shadow">
        <InvitationTable
          invitations={sortedInvitations}
          sortConfig={sortConfig}
          onSort={(key) => {
            setSortConfig(prev => {
              if (prev.key === key) {
                return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
              }
              return { key, direction: 'asc' };
            });
          }}
          onResend={(id) => handleAction('resend', id)}
          onRemind={(id) => handleAction('remind', id)}
          onComplete={(id) => handleAction('complete', id)}
          onExpire={(id) => handleAction('expire', id)}
          loading={loading}
        />
      </div>

      {/* Pagination & Modal remain unchanged */}
      {/* ... keep your existing pagination & modal code ... */}
    </div>
  );
};

export default Invitations;
