import apiClient from './apiClient';

export const ticketService = {
  // Get all tickets with filters
  getTickets: async (filters = {}) => {
    const params = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params.append(key, filters[key]);
      }
    });
    
    const response = await apiClient.get(`/tickets?${params}`);
    return response.data;
  },

  // Get ticket by ID
  getTicketById: async (id) => {
    const response = await apiClient.get(`/tickets/${id}`);
    return response.data;
  },

  // Create new ticket
  createTicket: async (ticketData) => {
    const response = await apiClient.post('/tickets', ticketData);
    return response.data;
  },

  // Update ticket
  updateTicket: async (id, ticketData) => {
    const response = await apiClient.put(`/tickets/${id}`, ticketData);
    return response.data;
  },

  // Delete ticket
  deleteTicket: async (id) => {
    const response = await apiClient.delete(`/tickets/${id}`);
    return response.data;
  },

  // Get ticket statistics
  getTicketStats: async () => {
    const response = await apiClient.get('/tickets/stats');
    return response.data;
  },

  // Get ticket comments
  getTicketComments: async (ticketId) => {
    const response = await apiClient.get(`/tickets/${ticketId}/comments`);
    return response.data;
  },

  // Add comment to ticket
  addComment: async (ticketId, commentData) => {
    const response = await apiClient.post(`/tickets/${ticketId}/comments`, commentData);
    return response.data;
  },
};