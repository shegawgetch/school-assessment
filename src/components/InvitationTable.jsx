import React, { useState } from 'react';
import StatusBadge from './StatusBadge';

const InvitationTable = ({ 
  invitations, 
  onResend, 
  onRemind, 
  onComplete, 
  onExpire, 
  loading = false 
}) => {
  const [sortField, setSortField] = useState('sentAt');
  const [sortDirection, setSortDirection] = useState('desc');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return '↕️';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const getStatusFromBackend = (status) => {
    // Map backend status to frontend status
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return 'sent';
      case 'ACCEPTED':
        return 'accepted';
      case 'COMPLETED':
        return 'completed';
      case 'EXPIRED':
        return 'expired';
      default:
        return status?.toLowerCase() || 'unknown';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!invitations || invitations.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No invitations found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('name')}
            >
              Name {getSortIcon('name')}
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('email')}
            >
              Email {getSortIcon('email')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Assessment
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('status')}
            >
              Status {getSortIcon('status')}
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('sentAt')}
            >
              Sent At {getSortIcon('sentAt')}
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('expiresAt')}
            >
              Expires At {getSortIcon('expiresAt')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {invitations.map((invitation) => (
            <tr key={invitation.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {invitation.name || 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {invitation.email}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {invitation.assessmentName || invitation.assessmentId || 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <StatusBadge status={getStatusFromBackend(invitation.status)} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(invitation.sentAt || invitation.createdAt)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(invitation.expiresAt)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-2">
                  <button
                    onClick={() => onResend(invitation.id)}
                    className="text-blue-600 hover:text-blue-900"
                    title="Resend"
                  >
                    Resend
                  </button>
                  <button
                    onClick={() => onRemind(invitation.id)}
                    className="text-yellow-600 hover:text-yellow-900"
                    title="Send Reminder"
                  >
                    Remind
                  </button>
                  <button
                    onClick={() => onComplete(invitation.id)}
                    className="text-green-600 hover:text-green-900"
                    title="Mark Completed"
                  >
                    Complete
                  </button>
                  <button
                    onClick={() => onExpire(invitation.id)}
                    className="text-red-600 hover:text-red-900"
                    title="Expire"
                  >
                    Expire
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InvitationTable;
