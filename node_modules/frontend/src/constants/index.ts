export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const TICKET_STATUSES = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
} as const;

export const TICKET_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;

export const TICKET_TYPES = {
  BUG: 'bug',
  FEATURE: 'feature',
  TASK: 'task',
  IMPROVEMENT: 'improvement',
} as const;

export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  USER: 'user',
} as const;

export const STATUS_COLORS = {
  [TICKET_STATUSES.TODO]: '#6b7280',
  [TICKET_STATUSES.IN_PROGRESS]: '#3b82f6',
  [TICKET_STATUSES.RESOLVED]: '#10b981',
  [TICKET_STATUSES.CLOSED]: '#6b7280',
};

export const PRIORITY_COLORS = {
  [TICKET_PRIORITIES.LOW]: '#10b981',
  [TICKET_PRIORITIES.MEDIUM]: '#f59e0b',
  [TICKET_PRIORITIES.HIGH]: '#f97316',
  [TICKET_PRIORITIES.URGENT]: '#ef4444',
};

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  TICKETS: '/tickets',
  TICKETS_NEW: '/tickets/new',
  TICKET_DETAIL: '/tickets/:id',
  PROFILE: '/profile',
  USERS: '/users',
} as const;