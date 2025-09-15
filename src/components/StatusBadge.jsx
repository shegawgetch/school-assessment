import React from 'react';

const StatusBadge = ({ status }) => {
  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case 'sent':
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-800',
          label: 'Sent'
        };
      case 'accepted':
        return {
          bg: 'bg-green-100',
          text: 'text-green-800',
          label: 'Accepted'
        };
      case 'completed':
        return {
          bg: 'bg-purple-100',
          text: 'text-purple-800',
          label: 'Completed'
        };
      case 'expired':
        return {
          bg: 'bg-red-100',
          text: 'text-red-800',
          label: 'Expired'
        };
      case 'pending':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-800',
          label: 'Pending'
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          label: status || 'Unknown'
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
};

export default StatusBadge;
