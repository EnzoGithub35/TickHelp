import apiClient from './apiClient.ts';

export const ticketService = {
  // Get all tickets with filters
  getTickets: async (
    filters: TicketFilters = {},
    pagination: PaginationOptions = { page: 1, limit: 10, sortBy: "created_at", sortOrder: "desc" }
  ): Promise<PaginatedResponse<Ticket>> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, String(value));
    });
    params.append("page", String(pagination.page));
    params.append("limit", String(pagination.limit));
    params.append("sortBy", pagination.sortBy);
    params.append("sortOrder", pagination.sortOrder);
    const response = await apiClient.get(`/tickets?${params}`);
    return response.data;
  },

  // Search tickets
  searchTickets: async (q: string): Promise<Ticket[]> => {
    const response = await apiClient.get(`/tickets/search?q=${encodeURIComponent(q)}`);
    return response.data;
  },

  // Get ticket by ID
  getTicketById: async (id: string | number) => {
    const response = await apiClient.get(`/tickets/${id}`);
    return response.data;
  },

  // Create new ticket
  createTicket: async (ticketData: Record<string, any>) => {
    const response = await apiClient.post('/tickets', ticketData);
    return response.data;
  },

  // Update ticket
  updateTicket: async (id: string | number, ticketData: Record<string, any>) => {
    const response = await apiClient.put(`/tickets/${id}`, ticketData);
    return response.data;
  },

  // Delete ticket
  deleteTicket: async (id: string | number) => {
    const response = await apiClient.delete(`/tickets/${id}`);
    return response.data;
  },

  // Get ticket statistics
  getTicketStats: async () => {
    const response = await apiClient.get('/tickets/stats');
    return response.data;
  },

  // Get ticket comments
  getTicketComments: async (ticketId: string | number) => {
    const response = await apiClient.get(`/tickets/${ticketId}/comments`);
    return response.data;
  },

  // Add comment to ticket
  addComment: async (ticketId: string | number, commentData: Record<string, any>) => {
    const response = await apiClient.post(`/tickets/${ticketId}/comments`, commentData);
    return response.data;
  },
};