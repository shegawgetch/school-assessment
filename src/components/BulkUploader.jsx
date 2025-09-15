import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import { invitationAPI } from '../api/axiosService';
import { error, success } from '../utils/notifications';

const BulkUploader = ({ isOpen, onClose, onSuccess }) => {
  const [file, setFile] = useState(null); // eslint-disable-line no-unused-vars
  const [parsedData, setParsedData] = useState([]);
  const [columnMapping, setColumnMapping] = useState({});
  const [uploading, setUploading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const fileInputRef = useRef(null);
  

  const requiredFields = ['name', 'email']; // Required fields for your backend
  const availableFields = ['name', 'email', 'assessmentName', 'assessmentId', 'expiresAt']; // Available fields for your backend

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseCSV(selectedFile);
    }
  };

  const parseCSV = (file) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          error('Error parsing CSV: ' + results.errors[0].message);
          return;
        }
        
        setParsedData(results.data);
        setPreviewMode(true);
        
        // Auto-map columns based on header names
        const autoMapping = {};
        const headers = results.meta.fields || [];
        headers.forEach(header => {
          const lowerHeader = header.toLowerCase().trim();
          if (availableFields.includes(lowerHeader)) {
            autoMapping[lowerHeader] = header;
          }
        });
        setColumnMapping(autoMapping);
      }
    });
  };

  const handleColumnMapping = (field, csvColumn) => {
    setColumnMapping(prev => ({
      ...prev,
      [field]: csvColumn
    }));
  };

  const validateData = () => {
    const errors = [];
    
    // Check if all required fields are mapped
    requiredFields.forEach(field => {
      if (!columnMapping[field]) {
        errors.push(`Required field '${field}' is not mapped`);
      }
    });

    // Check if mapped data is valid
    parsedData.forEach((row, index) => {
      requiredFields.forEach(field => {
        const csvColumn = columnMapping[field];
        if (csvColumn && !row[csvColumn]) {
          errors.push(`Row ${index + 1}: Missing value for required field '${field}'`);
        }
      });
      
      // Validate email format
      const emailColumn = columnMapping['email'];
      if (emailColumn && row[emailColumn] && !/\S+@\S+\.\S+/.test(row[emailColumn])) {
        errors.push(`Row ${index + 1}: Invalid email format`);
      }
    });

    return errors;
  };

  const handleUpload = async () => {
    const validationErrors = validateData();
    if (validationErrors.length > 0) {
      error('Validation errors: ' + validationErrors.join(', '));
      return;
    }

    setUploading(true);
    
    try {
      // Transform data according to column mapping
      const transformedData = parsedData.map(row => {
        const invitation = {};
        Object.keys(columnMapping).forEach(field => {
          const csvColumn = columnMapping[field];
          if (csvColumn && row[csvColumn]) {
            if (field === 'expiresAt') {
              // Convert to ISO string if it's a date
              const date = new Date(row[csvColumn].trim());
              invitation[field] = isNaN(date.getTime()) ? row[csvColumn].trim() : date.toISOString().slice(0, 19);
            } else {
              invitation[field] = row[csvColumn].trim();
            }
          }
        });
        
        // Set default values for missing optional fields
        if (!invitation.assessmentName) {
          invitation.assessmentName = 'Default Assessment';
        }
        if (!invitation.assessmentId) {
          invitation.assessmentId = 'default_assessment';
        }
        
        return invitation;
      });

      // Always use bulk endpoint - wrap single invite into array
      const response = await invitationAPI.createInvitations(transformedData);
      
      success(response.data?.message);
      onSuccess && onSuccess(response.data);
      handleClose();
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Upload failed';
      error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setParsedData([]);
    setColumnMapping({});
    setPreviewMode(false);
    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  const getAvailableColumns = () => {
    if (parsedData.length === 0) return [];
    return Object.keys(parsedData[0]);
  };

  return (
    <div className={`fixed inset-0 z-50 overflow-y-auto ${isOpen ? 'block' : 'hidden'}`}>
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleClose}></div>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Bulk Upload Invitations</h3>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {!previewMode ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select CSV File
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
                <div className="text-sm text-gray-600">
                  <p>CSV file should contain columns for:</p>
                  <ul className="list-disc list-inside mt-1">
                    <li>name (required)</li>
                    <li>email (required)</li>
                    <li>assessmentName (optional)</li>
                    <li>assessmentId (optional)</li>
                    <li>expiresAt (optional)</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Column Mapping</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {requiredFields.map(field => (
                      <div key={field} className="flex items-center space-x-2">
                        <label className="text-sm font-medium text-gray-700 w-32">
                          {field} *
                        </label>
                        <select
                          value={columnMapping[field] || ''}
                          onChange={(e) => handleColumnMapping(field, e.target.value)}
                          className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
                        >
                          <option value="">Select column...</option>
                          {getAvailableColumns().map(column => (
                            <option key={column} value={column}>{column}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                    {availableFields.filter(field => !requiredFields.includes(field)).map(field => (
                      <div key={field} className="flex items-center space-x-2">
                        <label className="text-sm font-medium text-gray-700 w-32">
                          {field}
                        </label>
                        <select
                          value={columnMapping[field] || ''}
                          onChange={(e) => handleColumnMapping(field, e.target.value)}
                          className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
                        >
                          <option value="">Select column...</option>
                          {getAvailableColumns().map(column => (
                            <option key={column} value={column}>{column}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Preview ({parsedData.length} rows)</h4>
                  <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-md">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          {Object.keys(columnMapping).map(field => (
                            <th key={field} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              {field}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {parsedData.slice(0, 10).map((row, index) => (
                          <tr key={index}>
                            {Object.keys(columnMapping).map(field => (
                              <td key={field} className="px-3 py-2 text-sm text-gray-900">
                                {row[columnMapping[field]] || '-'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {parsedData.length > 10 && (
                      <div className="px-3 py-2 text-sm text-gray-500 bg-gray-50">
                        ... and {parsedData.length - 10} more rows
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={handleClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              {previewMode && (
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Uploading...' : 'Upload Invitations'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkUploader;
