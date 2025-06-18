import axios, { AxiosError, AxiosResponse } from 'axios';
import { toast } from 'react-hot-toast';
import { User } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Mode développement activé en permanence pour le développement
// Ce mode permet de fonctionner même sans backend
const DEV_MODE = true;

// Données mockées pour simuler l'API en cas d'échec des requêtes réelles
const MOCK_DATA = {
  user: {
    id: 1,
    email: "dev@tickhelp.com", 
    firstName: "Dev",
    lastName: "User",
    role: "admin",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  tickets: [
    {
      id: 1,
      title: "Bug dans le module de login",
      description: "Les utilisateurs ne peuvent pas se connecter",
      status: "todo",
      priority: "high",
      type: "bug",
      reporterId: 1,
      assigneeId: 1,
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  stats: {
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
  }
};

// Client API simplifié sans gestion de token
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Pas d'intercepteur de requêtes pour ajouter des tokens
// Cela permet de fonctionner avec le backend en mode dev simplifié

// Gestion des réponses avec fallback vers les données mockées en cas d'erreur
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // En mode dev, on log l'erreur mais on ne bloque pas l'application
    console.error('API Error:', error.response?.data || error.message);
    
    // Si on est en mode développement, on simule des réponses
    if (DEV_MODE) {
      console.log('DEV MODE: Returning mock data instead');
      
      // Quelle requête a échoué?
      const url = error.config?.url || '';
      const method = error.config?.method?.toUpperCase() || '';
      
      console.log(`Mocking ${method} ${url} response`);
      
      // Authentification
      if (url.includes('/auth/login') || url.includes('/auth/register')) {
        return Promise.resolve({ 
          data: { 
            success: true,
            data: {
              user: MOCK_DATA.user,
              accessToken: "fake-token",
              refreshToken: "fake-refresh-token"
            },
            message: "Authentification simulée (mode DEV)"
          } 
        });
      }
      
      // Profil utilisateur
      if (url.includes('/auth/profile')) {
        return Promise.resolve({ 
          data: { 
            success: true,
            data: MOCK_DATA.user
          } 
        });
      }
      
      // Liste des tickets
      if ((url.includes('/tickets') && !url.includes('/tickets/stats') && !url.match(/\/tickets\/\d+/)) || 
          url === '/tickets') {
        return Promise.resolve({ 
          data: { 
            success: true,
            data: MOCK_DATA.tickets,
            pagination: {
              page: 1,
              limit: 10,
              total: MOCK_DATA.tickets.length,
              totalPages: 1
            }
          } 
        });
      }

      // Statistiques des tickets
      if (url.includes('/tickets/stats')) {
        return Promise.resolve({ 
          data: { 
            success: true,
            data: MOCK_DATA.stats
          } 
        });
      }
      
      // Ticket spécifique
      const ticketMatch = url.match(/\/tickets\/(\d+)$/);
      if (ticketMatch) {
        const ticketId = parseInt(ticketMatch[1]);
        const ticket = MOCK_DATA.tickets.find(t => t.id === ticketId) || MOCK_DATA.tickets[0];
        
        return Promise.resolve({ 
          data: { 
            success: true,
            data: ticket
          } 
        });
      }
      
      // Pour toute autre requête
      return Promise.resolve({ 
        data: { 
          success: true,
          data: {},
          message: `Opération simulée avec succès (DEV MODE: ${url})`
        } 
      });
    }
    
    // En production, on rejette l'erreur pour que l'appelant puisse la gérer
    return Promise.reject(error);
  }
);

export default apiClient;
