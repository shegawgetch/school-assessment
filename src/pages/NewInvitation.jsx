import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { invitationAPI } from '../api/axiosService';
import BulkUploader from '../components/BulkUploader';
import { error, success } from '../utils/notifications';

const NewInvitation = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    assessmentName: 'Default Assessment',
    assessmentId: 'default_assessment',
    expiresAt: ''
  });
  const [loading, setLoading] = useState(false);
  const [showBulkUploader, setShowBulkUploader] = useState(false);

  const navigate = useNavigate();
  

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.name.trim()) {
      errors.push('Name is required');
    }
    
    if (!formData.email.trim()) {
      errors.push('Email is required');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.push('Email is invalid');
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      error(validationErrors.join(', '));
      return;
    }

    setLoading(true);
    
    try {
      // Always use bulk endpoint - wrap single invite into array
      const invitationData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        assessmentName: formData.assessmentName,
        assessmentId: formData.assessmentId,
        expiresAt: formData.expiresAt || undefined
      };

      const response = await invitationAPI.createInvitations([invitationData]);
      success(response.data?.message || 'Invitation created successfully');
      navigate('/invitations');
    } catch (err) {
      error(err.response?.data?.message || 'Failed to create invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkUploadSuccess = () => {
    setShowBulkUploader(false);
    navigate('/invitations');
  };

  const handleReset = () => {
    setFormData({
      name: '',
      email: '',
      assessmentName: 'Default Assessment',
      assessmentId: 'default_assessment',
      expiresAt: ''
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">New Invitation</h1>
          <p className="mt-2 text-gray-600">Create a new invitation or upload multiple invitations</p>
        </div>
        <button
          onClick={() => setShowBulkUploader(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          Bulk Upload
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Single Invitation Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Single Invitation</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter candidate name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter candidate email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expires At
              </label>
              <input
                type="datetime-local"
                name="expiresAt"
                value={formData.expiresAt}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Invitation'}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Reset
              </button>
            </div>
          </form>
        </div>

        {/* Bulk Upload Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Bulk Upload</h2>
          <div className="space-y-4">
            <p className="text-gray-600">
              Upload multiple invitations at once using a CSV file. This is more efficient for creating many invitations.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h3 className="text-sm font-medium text-blue-800 mb-2">CSV Format Requirements:</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• <strong>email</strong> (required) - Candidate email</li>
                <li>• <strong>expiresAt</strong> (optional) - Expiration date (ISO format)</li>
              </ul>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <h3 className="text-sm font-medium text-yellow-800 mb-2">Important Note:</h3>
              <p className="text-sm text-yellow-700">
                The frontend always uses the bulk endpoint for both single and multiple invitations. 
                Single invitations are wrapped in an array before sending to the backend.
              </p>
            </div>

            <button
              onClick={() => setShowBulkUploader(true)}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Open Bulk Upload
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Uploader Modal */}
      <BulkUploader
        isOpen={showBulkUploader}
        onClose={() => setShowBulkUploader(false)}
        onSuccess={handleBulkUploadSuccess}
      />
    </div>
  );
};

export default NewInvitation;
