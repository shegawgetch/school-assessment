// Mock API service for development and testing
// This file provides mock responses when the real API is not available

const MOCK_DELAY = 1000; // Simulate network delay

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock data
const mockInvitations = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    assessmentName: 'Frontend Assessment',
    assessmentId: 'assessment_1',
    status: 'sent',
    sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    token: 'abc123def456',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    assessmentName: 'Backend Assessment',
    assessmentId: 'assessment_2',
    status: 'accepted',
    sentAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
    token: 'def456ghi789',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 3,
    name: 'Bob Johnson',
    email: 'bob.johnson@example.com',
    assessmentName: 'Full Stack Assessment',
    assessmentId: 'assessment_3',
    status: 'completed',
    sentAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    token: 'ghi789jkl012',
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 4,
    name: 'Alice Brown',
    email: 'alice.brown@example.com',
    assessmentName: 'Frontend Assessment',
    assessmentId: 'assessment_1',
    status: 'expired',
    sentAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    token: 'jkl012mno345',
    createdAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const mockDashboardData = {
  totalSent: 150,
  totalAccepted: 120,
  totalCompleted: 95,
  totalExpired: 15,
  statusDistribution: [
    { name: 'Sent', value: 150 },
    { name: 'Accepted', value: 120 },
    { name: 'Completed', value: 95 },
    { name: 'Expired', value: 15 }
  ],
  monthlyTrends: [
    { name: 'Jan', value: 45 },
    { name: 'Feb', value: 52 },
    { name: 'Mar', value: 38 },
    { name: 'Apr', value: 67 },
    { name: 'May', value: 73 },
    { name: 'Jun', value: 89 }
  ]
};

// Mock API functions
export const mockAPI = {
  // Get all invitations with pagination and filters
  getInvitations: async (params = {}) => {
    await delay(MOCK_DELAY);
    
    let filteredInvitations = [...mockInvitations];
    
    // Apply filters
    if (params.status) {
      filteredInvitations = filteredInvitations.filter(inv => inv.status === params.status);
    }
    
    if (params.search) {
      const searchLower = params.search.toLowerCase();
      filteredInvitations = filteredInvitations.filter(inv => 
        inv.name.toLowerCase().includes(searchLower) || 
        inv.email.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply pagination
    const page = params.page || 1;
    const limit = params.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedInvitations = filteredInvitations.slice(startIndex, endIndex);
    
    return {
      data: {
        invitations: paginatedInvitations,
        pagination: {
          total: filteredInvitations.length,
          pages: Math.ceil(filteredInvitations.length / limit),
          currentPage: page
        }
      }
    };
  },

  // Get single invitation by ID
  getInvitation: async (id) => {
    await delay(MOCK_DELAY);
    
    const invitation = mockInvitations.find(inv => inv.id === parseInt(id));
    if (!invitation) {
      throw new Error('Invitation not found');
    }
    
    return { data: invitation };
  },

  // Bulk create invitations
  createInvitations: async (invitations) => {
    await delay(MOCK_DELAY);
    
    // Simulate validation
    const errors = [];
    invitations.forEach((inv, index) => {
      if (!inv.name) errors.push(`Row ${index + 1}: Name is required`);
      if (!inv.email) errors.push(`Row ${index + 1}: Email is required`);
      if (!inv.assessmentId) errors.push(`Row ${index + 1}: Assessment ID is required`);
    });
    
    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }
    
    // Simulate successful creation
    const createdInvitations = invitations.map((inv, index) => ({
      id: mockInvitations.length + index + 1,
      ...inv,
      status: 'sent',
      sentAt: new Date().toISOString(),
      expiresAt: inv.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      token: `token_${Date.now()}_${index}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
    
    mockInvitations.push(...createdInvitations);
    
    return {
      data: {
        success: true,
        created: createdInvitations.length,
        invitations: createdInvitations
      }
    };
  },

  // Resend invitation
  resendInvitation: async (id) => {
    await delay(MOCK_DELAY);
    
    const invitation = mockInvitations.find(inv => inv.id === parseInt(id));
    if (!invitation) {
      throw new Error('Invitation not found');
    }
    
    // Update sent time
    invitation.sentAt = new Date().toISOString();
    invitation.updatedAt = new Date().toISOString();
    
    return { data: { success: true, message: 'Invitation resent successfully' } };
  },

  // Send reminder
  sendReminder: async (id) => {
    await delay(MOCK_DELAY);
    
    const invitation = mockInvitations.find(inv => inv.id === parseInt(id));
    if (!invitation) {
      throw new Error('Invitation not found');
    }
    
    return { data: { success: true, message: 'Reminder sent successfully' } };
  },

  // Mark invitation as completed
  markCompleted: async (id) => {
    await delay(MOCK_DELAY);
    
    const invitation = mockInvitations.find(inv => inv.id === parseInt(id));
    if (!invitation) {
      throw new Error('Invitation not found');
    }
    
    invitation.status = 'completed';
    invitation.updatedAt = new Date().toISOString();
    
    return { data: { success: true, message: 'Invitation marked as completed' } };
  },

  // Expire invitation
  expireInvitation: async (id) => {
    await delay(MOCK_DELAY);
    
    const invitation = mockInvitations.find(inv => inv.id === parseInt(id));
    if (!invitation) {
      throw new Error('Invitation not found');
    }
    
    invitation.status = 'expired';
    invitation.updatedAt = new Date().toISOString();
    
    return { data: { success: true, message: 'Invitation expired' } };
  },

  // Validate token
  validateToken: async (token) => {
    await delay(MOCK_DELAY);
    
    const invitation = mockInvitations.find(inv => inv.token === token);
    if (!invitation) {
      throw new Error('Invalid token');
    }
    
    // Check if expired
    const now = new Date();
    const expiresAt = new Date(invitation.expiresAt);
    if (now > expiresAt) {
      throw new Error('Invitation has expired');
    }
    
    return { data: invitation };
  },

  // Get dashboard analytics
  getDashboardData: async () => {
    await delay(MOCK_DELAY);
    
    return { data: mockDashboardData };
  }
};

export default mockAPI;
