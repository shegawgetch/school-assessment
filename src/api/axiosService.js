import axios from 'axios';

// API base URL - use proxy in development, full URL in production
const API_BASE = process.env.NODE_ENV === 'production' 
  ? (process.env.REACT_APP_API_BASE_URL || 'http://localhost:5282')
  : ''; // Use proxy in development

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const invitationAPI = {
  // Get all invitations with pagination and filters
  getInvitations: (params = {}) => {
    return apiClient.get('/invitations', { params });
  },

  // Get single invitation by ID
  getInvitation: (id) => {
    return apiClient.get(`/invitations/${id}`);
  },

  // Bulk create invitations (used for both single and multiple)
  createInvitations: (invitations) => {
    // Transform frontend data to match backend format
    const transformedInvitations = invitations.map(inv => ({
      name: inv.name || 'Unknown Candidate',
      email: inv.email,
      assessmentName: inv.assessmentName || 'Default Assessment',
      assessmentId: inv.assessmentId || 'default_assessment',
    expiresAt: inv.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19),
    }));
    
    return apiClient.post('/invitations/bulk', transformedInvitations);
  },

  // Resend invitation (single)
  resendInvitation: (id) => {
    return apiClient.post(`/invitations/${id}/resend`);
  },

  // Send reminder (single)
  sendReminder: (id) => {
    return apiClient.post(`/invitations/${id}/reminder`);
  },

  // Mark invitation as completed (single)
  markCompleted: (id) => {
    return apiClient.post(`/invitations/${id}/complete`);
  },

  // Expire invitation (single)
  expireInvitation: (id) => {
    return apiClient.post(`/invitations/${id}/expire`);
  },

  // Validate token
  validateToken: (token) => {
    return apiClient.get(`/invitations/token/${token}`);
  },

  // Accept invitation by token
  acceptInvitation: (token) => {
    return apiClient.post(`/invitations/token/${token}/accept`);
  },

  // Get dashboard analytics
  getDashboardData: () => {
    return apiClient.get('/invitations/dashboard');
  },
};

export default apiClient;
