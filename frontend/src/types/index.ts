// Types pour l'authentification
export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'manager' | 'user';
  isActive: boolean;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

// Types pour les tickets
export interface Ticket {
  id: number;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  type: 'bug' | 'feature' | 'task' | 'improvement';
  reporterId: number;
  assigneeId?: number;
  dueDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  reporter?: User;
  assignee?: User;
}

// Types pour les statistiques de tickets
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

export interface Comment {
  id: number;
  ticketId: number;
  userId: number;
  content: string;
  isInternal: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
}

// Types pour les réponses API
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  code?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Types pour les filtres de tickets
export interface TicketFilters {
  page?: number;
  limit?: number;
  status?: string;
  priority?: string;
  type?: string;
  reporterId?: number;
  assigneeId?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  startDate?: string;
  endDate?: string;
}