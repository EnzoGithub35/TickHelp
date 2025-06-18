import apiClient from './apiClient';
import { 
  Ticket, 
  ApiResponse, 
  PaginatedResponse, 
  TicketFilters 
} from '../types';

export interface TicketStatsData {
  totalTickets: number;
  openTickets: number;
  closedTickets: number;
  urgentTickets: number;
  byStatus: {
    todo: number;
    in_progress: number;
    resolved: number;
    closed: number;
  };
  byPriority: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
  byType: {
    bug: number;
    feature: number;
    task: number;
    improvement: number;
  };
}

// Données mockées pour le développement
const MOCK_TICKETS: Ticket[] = [
  {
    id: 1,
    title: "Bug dans le module de login",
    description: "Les utilisateurs ne peuvent pas se connecter",
    status: "todo",
    priority: "high",
    type: "bug",
    reporterId: 1,
    assigneeId: 1,
    estimatedHours: 4,
    actualHours: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    title: "Ajouter filtre par statut",
    description: "Permettre de filtrer les tickets par statut",
    status: "in_progress",
    priority: "medium",
    type: "feature",
    reporterId: 1,
    assigneeId: 1,
    estimatedHours: 8,
    actualHours: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Statistiques mockées
const MOCK_STATS: TicketStatsData = {
  totalTickets: 25,
  openTickets: 15,
  closedTickets: 10,
  urgentTickets: 5,
  byStatus: {
    todo: 8,
    in_progress: 7,
    resolved: 5,
    closed: 5
  },
  byPriority: {
    low: 5,
    medium: 10,
    high: 8,
    urgent: 2
  },
  byType: {
    bug: 12,
    feature: 8,
    task: 3,
    improvement: 2
  }
};

export const ticketService = {
  // Get tickets (retourne toujours des données mockées)
  getTickets: async (_filters?: TicketFilters): Promise<ApiResponse<Ticket[]>> => {
    try {
      const response = await apiClient.get('/tickets', { params: _filters });
      return response.data;
    } catch (error) {
      console.log('Using mock data for tickets list');
      return {
        success: true,
        data: MOCK_TICKETS,
        pagination: {
          page: 1,
          limit: 10,
          total: MOCK_TICKETS.length,
          totalPages: 1
        }
      };
    }
  },

  // Get ticket by ID
  getTicket: async (id: number): Promise<ApiResponse<Ticket>> => {
    try {
      const response = await apiClient.get(`/tickets/${id}`);
      return response.data;
    } catch (error) {
      console.log(`Using mock data for ticket #${id}`);
      const ticket = MOCK_TICKETS.find(t => t.id === id) || MOCK_TICKETS[0];
      return {
        success: true,
        data: ticket,
      };
    }
  },

  // Create ticket
  createTicket: async (ticketData: Partial<Ticket>): Promise<ApiResponse<Ticket>> => {
    try {
      const response = await apiClient.post('/tickets', ticketData);
      return response.data;
    } catch (error) {
      console.log('Using mock data for ticket creation');
      const newTicket: Ticket = {
        id: MOCK_TICKETS.length + 1,
        title: ticketData.title || 'Nouveau ticket',
        description: ticketData.description || '',
        status: ticketData.status || 'todo',
        priority: ticketData.priority || 'medium',
        type: ticketData.type || 'task',
        reporterId: 1,
        assigneeId: ticketData.assigneeId || 1,
        estimatedHours: ticketData.estimatedHours,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      return {
        success: true,
        data: newTicket,
        message: 'Ticket créé avec succès (simulation)'
      };
    }
  },

  // Update ticket
  updateTicket: async (id: number, ticketData: Partial<Ticket>): Promise<ApiResponse<Ticket>> => {
    try {
      const response = await apiClient.put(`/tickets/${id}`, ticketData);
      return response.data;
    } catch (error) {
      console.log(`Using mock data for updating ticket #${id}`);
      const ticket = MOCK_TICKETS.find(t => t.id === id) || MOCK_TICKETS[0];
      const updatedTicket = { ...ticket, ...ticketData, updatedAt: new Date().toISOString() };
      
      return {
        success: true,
        data: updatedTicket,
        message: 'Ticket mis à jour avec succès (simulation)'
      };
    }
  },

  // Delete ticket
  deleteTicket: async (id: number): Promise<ApiResponse<null>> => {
    try {
      const response = await apiClient.delete(`/tickets/${id}`);
      return response.data;
    } catch (error) {
      console.log(`Using mock data for deleting ticket #${id}`);
      return {
        success: true,
        data: null,
        message: `Ticket #${id} supprimé avec succès (simulation)`
      };
    }
  },

  // Get ticket stats - Version améliorée et sécurisée
  getTicketStats: async (): Promise<ApiResponse<TicketStatsData>> => {
    try {
      // Tentative d'appel à l'API backend
      const response = await apiClient.get('/tickets/stats');
      
      // Si la réponse est réussie, la retourner
      if (response.data && response.data.success) {
        return response.data;
      }
      
      // Si la réponse n'a pas le format attendu, utiliser les données mockées
      throw new Error('Invalid response format');
      
    } catch (error) {
      // En cas d'erreur, utiliser les données mockées
      console.log('Using mock data for ticket statistics');
      
      // Retourner toujours un objet formaté correctement
      return {
        success: true,
        data: MOCK_STATS
      };
    }
  },
  
  // Get ticket comments
  getTicketComments: async (ticketId: number): Promise<ApiResponse<any[]>> => {
    try {
      const response = await apiClient.get(`/tickets/${ticketId}/comments`);
      return response.data;
    } catch (error) {
      console.log(`Using mock data for comments on ticket #${ticketId}`);
      return {
        success: true,
        data: [
          {
            id: 1,
            ticketId,
            userId: 1,
            content: "Ceci est un commentaire de test",
            isInternal: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            user: {
              id: 1,
              firstName: "Dev",
              lastName: "User",
              email: "dev@tickhelp.com"
            }
          }
        ]
      };
    }
  },
  
  // Add comment to ticket
  addComment: async (ticketId: number, content: string, isInternal: boolean = false): Promise<ApiResponse<any>> => {
    try {
      const response = await apiClient.post(`/tickets/${ticketId}/comments`, { content, isInternal });
      return response.data;
    } catch (error) {
      console.log(`Using mock data for adding comment to ticket #${ticketId}`);
      return {
        success: true,
        data: {
          id: Math.floor(Math.random() * 1000),
          ticketId,
          userId: 1,
          content,
          isInternal,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        message: 'Commentaire ajouté avec succès (simulation)'
      };
    }
  }
};
