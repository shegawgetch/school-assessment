import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { invitationAPI } from '../api/axiosService';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { error, success } from '../utils/notifications';

const InvitationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [actionToConfirm, setActionToConfirm] = useState(null);

  useEffect(() => {
    fetchInvitationDetails();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchInvitationDetails = async () => {
    try {
      setLoading(true);
      const response = await invitationAPI.getInvitation(id);
      const backendData = response.data.data; // Backend wraps data in a 'data' field
      setInvitation(backendData);
    } catch (err) {
      console.error('Invitation details API error:', err);
      // Use mock data if API fails
      setInvitation({
        id: id,
        name: 'John Doe',
        email: 'john.doe@example.com',
        assessmentName: 'Frontend Assessment',
        assessmentId: 'assessment_1',
        status: 'sent',
        sentAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        token: 'abc123def456',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (action) => {
    setActionToConfirm(action);
    setShowConfirmModal(true);
  };

  const confirmAction = async () => {
    try {
      setActionLoading(true);
      
      let response;
      switch (actionToConfirm) {
        case 'resend':
          response = await invitationAPI.resendInvitation(id);
          success(response.data?.message || 'Invitation resent successfully');
          break;
        case 'remind':
          response = await invitationAPI.sendReminder(id);
          success(response.data?.message || 'Reminder sent successfully');
          break;
        case 'complete':
          response = await invitationAPI.markCompleted(id);
          success(response.data?.message || 'Invitation marked as completed');
          break;
        case 'expire':
          response = await invitationAPI.expireInvitation(id);
          success(response.data?.message || 'Invitation expired');
          break;
        default:
          break;
      }
      // Refresh invitation data
      await fetchInvitationDetails();
    } catch (err) {
      error(err.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading(false);
      setShowConfirmModal(false);
      setActionToConfirm(null);
    }
  };

  const getActionMessage = () => {
    switch (actionToConfirm) {
      case 'resend':
        return 'Are you sure you want to resend this invitation? This will send a new email to the candidate.';
      case 'remind':
        return 'Are you sure you want to send a reminder for this invitation?';
      case 'complete':
        return 'Are you sure you want to mark this invitation as completed? This action cannot be undone.';
      case 'expire':
        return 'Are you sure you want to expire this invitation? This will prevent the candidate from accessing the assessment.';
      default:
        return 'Are you sure you want to perform this action?';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };



  const getActionButtonStyle = (action) => {
    switch (action) {
      case 'resend':
        return 'bg-blue-600 hover:bg-blue-700 text-white';
      case 'remind':
        return 'bg-yellow-600 hover:bg-yellow-700 text-white';
      case 'complete':
        return 'bg-green-600 hover:bg-green-700 text-white';
      case 'expire':
        return 'bg-red-600 hover:bg-red-700 text-white';
      default:
        return 'bg-gray-600 hover:bg-gray-700 text-white';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Invitation not found</p>
        <button
          onClick={() => navigate('/invitations')}
          className="mt-4 text-blue-600 hover:text-blue-800"
        >
          Back to Invitations
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/invitations')}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Invitation Details</h1>
            <p className="mt-2 text-gray-600">Manage invitation and track progress</p>
          </div>
        </div>
        <StatusBadge status={invitation.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Candidate Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Name</label>
                <p className="mt-1 text-sm text-gray-900">{invitation.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Email</label>
                <p className="mt-1 text-sm text-gray-900">{invitation.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Assessment ID</label>
                <p className="mt-1 text-sm text-gray-900">{invitation.assessmentId}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Assessment Name</label>
                <p className="mt-1 text-sm text-gray-900">{invitation.assessmentName || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Timeline</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Invitation Sent</p>
                  <p className="text-sm text-gray-500">{formatDate(invitation.sentAt)}</p>
                </div>
              </div>
              
              {invitation.status === 'accepted' && (
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Invitation Accepted</p>
                    <p className="text-sm text-gray-500">Candidate has started the assessment</p>
                  </div>
                </div>
              )}
              
              {invitation.status === 'completed' && (
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Assessment Completed</p>
                    <p className="text-sm text-gray-500">Candidate has finished the assessment</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Expires At</p>
                  <p className="text-sm text-gray-500">{formatDate(invitation.expiresAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Actions</h2>
            <div className="space-y-3">
              <button
                onClick={() => handleAction('resend')}
                disabled={actionLoading}
                className={`w-full py-2 px-4 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${getActionButtonStyle('resend')} disabled:opacity-50`}
              >
                Resend Invitation
              </button>
              
              <button
                onClick={() => handleAction('remind')}
                disabled={actionLoading}
                className={`w-full py-2 px-4 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${getActionButtonStyle('remind')} disabled:opacity-50`}
              >
                Send Reminder
              </button>
              
              <button
                onClick={() => handleAction('complete')}
                disabled={actionLoading || invitation.status === 'completed'}
                className={`w-full py-2 px-4 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${getActionButtonStyle('complete')} disabled:opacity-50`}
              >
                Mark Completed
              </button>
              
              <button
                onClick={() => handleAction('expire')}
                disabled={actionLoading || invitation.status === 'expired'}
                className={`w-full py-2 px-4 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${getActionButtonStyle('expire')} disabled:opacity-50`}
              >
                Expire Invitation
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Invitation Link</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Token</label>
                <p className="text-sm font-mono text-gray-900 bg-gray-100 p-2 rounded">
                  {invitation.token || 'N/A'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Direct Link</label>
                <p className="text-sm text-blue-600 break-all">
                  {window.location.origin}/start/{invitation.token || 'N/A'}
                </p>
              </div>
              <button
                onClick={() => {
                  const link = `${window.location.origin}/start/${invitation.token}`;
                  navigator.clipboard.writeText(link);
                  success('Link copied to clipboard');
                }}
                className="w-full py-2 px-4 bg-gray-600 text-white rounded-md text-sm font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Copy Link
              </button>
            </div>
          </div>
        </div>
      </div>

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
              disabled={actionLoading}
              className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50"
            >
              {actionLoading ? 'Processing...' : 'Confirm'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default InvitationDetails;
