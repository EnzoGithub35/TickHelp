export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'manager' | 'user';
  isActive: boolean;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Ticket {
  id: number;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  type: 'bug' | 'feature' | 'task' | 'improvement';
  reporterId?: number;
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

export interface TicketHistory {
  id: number;
  ticketId: number;
  userId?: number;
  action: string;
  fieldName?: string;
  oldValue?: string;
  newValue?: string;
  comment?: string;
  createdAt: string;
  user?: User;
}

export interface Comment {
  id: number;
  ticketId: number;
  userId?: number;
  content: string;
  isInternal: boolean;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
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

export interface CreateTicketData {
  title: string;
  description?: string;
  priority: Ticket['priority'];
  type: Ticket['type'];
  assigneeId?: number;
  dueDate?: string;
  estimatedHours?: number;
  tags?: string[];
}

export interface UpdateTicketData extends Partial<CreateTicketData> {
  status?: Ticket['status'];
  actualHours?: number;
}

export interface TicketFilters {
  status?: string[];
  priority?: string[];
  type?: string[];
  assigneeId?: number;
  reporterId?: number;
  search?: string;
  dueDate?: {
    from?: string;
    to?: string;
  };
}

export interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}