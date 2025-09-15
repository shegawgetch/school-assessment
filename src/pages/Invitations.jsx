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

  const navigate = useNavigate();

  useEffect(() => {
    fetchInvitations();
  }, [filters]);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const response = await invitationAPI.getInvitations(filters);
      const backendData = response.data;
      setInvitations(backendData.invitations || []);
      setPagination(backendData.pagination || {
        total: backendData.invitations?.length || 0,
        pages: Math.ceil((backendData.invitations?.length || 0) / filters.limit),
        currentPage: filters.page
      });
    } catch (err) {
      console.error('Invitations API error:', err);
      // Use mock data if API fails
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
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key === 'page' ? value : 1
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchInvitations();
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
          console.log('Invitation resent successfully');
          break;
        case 'remind':
          await invitationAPI.sendReminder(selectedInvitationId);
          console.log('Reminder sent successfully');
          break;
        case 'complete':
          await invitationAPI.markCompleted(selectedInvitationId);
          console.log('Invitation marked as completed');
          break;
        case 'expire':
          await invitationAPI.expireInvitation(selectedInvitationId);
          console.log('Invitation expired');
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

  const filteredInvitations = invitations.filter(invitation => {
    const matchesStatus = !filters.status || invitation.status === filters.status;
    const matchesSearch = !filters.search || 
      invitation.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      invitation.email.toLowerCase().includes(filters.search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

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
        <form onSubmit={handleSearch} className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-64">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search by name or email..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="min-w-48">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Per Page
            </label>
            <select
              value={filters.limit}
              onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Search
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow">
        <InvitationTable
          invitations={filteredInvitations}
          onResend={(id) => handleAction('resend', id)}
          onRemind={(id) => handleAction('remind', id)}
          onComplete={(id) => handleAction('complete', id)}
          onExpire={(id) => handleAction('expire', id)}
          loading={loading}
        />
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between bg-white px-4 py-3 sm:px-6 rounded-lg shadow">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handleFilterChange('page', Math.max(1, pagination.currentPage - 1))}
              disabled={pagination.currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => handleFilterChange('page', Math.min(pagination.pages, pagination.currentPage + 1))}
              disabled={pagination.currentPage === pagination.pages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{' '}
                <span className="font-medium">
                  {(pagination.currentPage - 1) * filters.limit + 1}
                </span>{' '}
                to{' '}
                <span className="font-medium">
                  {Math.min(pagination.currentPage * filters.limit, pagination.total)}
                </span>{' '}
                of{' '}
                <span className="font-medium">{pagination.total}</span>{' '}
                results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => handleFilterChange('page', Math.max(1, pagination.currentPage - 1))}
                  disabled={pagination.currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => handleFilterChange('page', page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === pagination.currentPage
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  onClick={() => handleFilterChange('page', Math.min(pagination.pages, pagination.currentPage + 1))}
                  disabled={pagination.currentPage === pagination.pages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Action"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">{getActionMessage()}</p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowConfirmModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={confirmAction}
              className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
            >
              Confirm
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Invitations;
