# Tick'Help Project Instructions for GitHub Copilot

## 🎯 Project Overview

**Tick'Help** is a comprehensive ticket management system for handling bugs, feature requests, and tasks. This is an educational project for DEVE427 module following industry best practices.

## 🏗️ Technical Stack

- **Frontend**: React.js 18+ with Vite
- **Backend**: Node.js 18+ with Express.js
- **Database**: PostgreSQL 15+
- **Authentication**: JWT (JSON Web Tokens)
- **Testing**: Jest (Backend) + React Testing Library (Frontend)
- **Linting**: ESLint with Airbnb config
- **CI/CD**: GitHub Actions
- **Deployment**: Render/Railway/Netlify
- **Project Management**: Notion
- **Version Control**: Git with GitFlow

## 📁 Project Structure

```
TickHelp/
├── frontend/                     # React.js application
│   ├── public/                   # Static assets
│   ├── src/
│   │   ├── components/           # Reusable UI components
│   │   │   ├── common/           # Generic components (Header, Footer, etc.)
│   │   │   ├── forms/            # Form components
│   │   │   └── ui/               # UI library components
│   │   ├── pages/                # Page components
│   │   │   ├── auth/             # Authentication pages
│   │   │   ├── dashboard/        # Dashboard page
│   │   │   ├── tickets/          # Ticket management pages
│   │   │   └── users/            # User management pages
│   │   ├── hooks/                # Custom React hooks
│   │   ├── services/             # API calls and external services
│   │   ├── utils/                # Utility functions
│   │   ├── contexts/             # React contexts
│   │   ├── styles/               # CSS/SCSS files
│   │   ├── constants/            # Application constants
│   │   ├── types/                # TypeScript types (if using TS)
│   │   └── __tests__/            # Test files
│   ├── package.json
│   ├── vite.config.js
│   ├── .eslintrc.js
│   └── vitest.config.js
├── backend/                      # Node.js API
│   ├── src/
│   │   ├── controllers/          # Route handlers
│   │   ├── middleware/           # Express middleware
│   │   ├── models/               # Database models
│   │   ├── routes/               # API routes
│   │   ├── services/             # Business logic
│   │   ├── utils/                # Utility functions
│   │   ├── config/               # Configuration files
│   │   ├── database/             # Database connection and migrations
│   │   │   ├── migrations/       # SQL migration files
│   │   │   ├── seeds/            # Sample data
│   │   │   └── connection.js     # Database connection
│   │   └── __tests__/            # Test files
│   ├── package.json
│   ├── .eslintrc.js
│   └── jest.config.js
├── database/                     # Database schema and documentation
│   ├── schema.sql                # Complete database schema
│   ├── seed-data.sql             # Sample data for development
│   └── README.md                 # Database documentation
└── .github/                      # GitHub configuration
    ├── workflows/                # GitHub Actions
    ├── ISSUE_TEMPLATE/          # Issue templates
    ├── PULL_REQUEST_TEMPLATE.md # PR template
    └── copilot-instructions.md   # This file
```

## 🗄️ Database Schema

### Users Table

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user')),
    is_active BOOLEAN DEFAULT true,
    avatar_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);
```

### Tickets Table

```sql
CREATE TABLE tickets (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'resolved', 'closed')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    type VARCHAR(20) DEFAULT 'task' CHECK (type IN ('bug', 'feature', 'task', 'improvement')),
    reporter_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    assignee_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    due_date TIMESTAMP WITH TIME ZONE,
    estimated_hours INTEGER,
    actual_hours INTEGER,
    tags TEXT[], -- PostgreSQL array for tags
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_priority ON tickets(priority);
CREATE INDEX idx_tickets_type ON tickets(type);
CREATE INDEX idx_tickets_reporter_id ON tickets(reporter_id);
CREATE INDEX idx_tickets_assignee_id ON tickets(assignee_id);
CREATE INDEX idx_tickets_created_at ON tickets(created_at);
CREATE INDEX idx_tickets_due_date ON tickets(due_date);
CREATE INDEX idx_tickets_tags ON tickets USING GIN(tags);
```

### Ticket History Table

```sql
CREATE TABLE ticket_history (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER REFERENCES tickets(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL, -- 'created', 'updated', 'status_changed', 'assigned', etc.
    field_name VARCHAR(100), -- Field that was changed
    old_value TEXT, -- Previous value
    new_value TEXT, -- New value
    comment TEXT, -- Optional comment
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_ticket_history_ticket_id ON ticket_history(ticket_id);
CREATE INDEX idx_ticket_history_user_id ON ticket_history(user_id);
CREATE INDEX idx_ticket_history_created_at ON ticket_history(created_at);
```

### Comments Table

```sql
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER REFERENCES tickets(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false, -- For internal notes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_comments_ticket_id ON comments(ticket_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_created_at ON comments(created_at);
```

### Attachments Table

```sql
CREATE TABLE attachments (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER REFERENCES tickets(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_attachments_ticket_id ON attachments(ticket_id);
CREATE INDEX idx_attachments_user_id ON attachments(user_id);
```

### Database Triggers for Updated_at

```sql
-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## 🔐 Authentication & Authorization

### JWT Token Structure

```javascript
{
  "sub": "user_id",
  "email": "user@example.com",
  "role": "user|manager|admin",
  "iat": "issued_at_timestamp",
  "exp": "expiration_timestamp"
}
```

### Role Permissions

- **Admin**: Full access to all resources, user management, system configuration
- **Manager**: Can manage tickets, assign users, view team statistics, manage users in their team
- **User**: Can create tickets, edit own tickets, comment on tickets, view assigned tickets

### Authentication Flow

1. User registers with email/password
2. System creates user account with default 'user' role
3. User logs in with credentials
4. System validates credentials and returns JWT token
5. Client includes token in Authorization header for protected routes
6. Server validates token on each request and extracts user info

## 📋 Backend Architecture

### Model Layer (src/models/)

- **User.js**: User management, authentication, profile operations
- **Ticket.js**: Ticket CRUD operations, filtering, sorting, statistics
- **Comment.js**: Comment management for tickets
- **TicketHistory.js**: Audit trail for ticket changes
- **Attachment.js**: File upload and management

### Controller Layer (src/controllers/)

- **authController.js**: Registration, login, profile management
- **ticketController.js**: Ticket CRUD, filtering, statistics
- **userController.js**: User management (admin/manager)
- **commentController.js**: Comment operations
- **uploadController.js**: File upload handling

### Service Layer (src/services/)

- **authService.js**: Authentication business logic
- **ticketService.js**: Ticket business logic and validation
- **emailService.js**: Email notifications
- **validationService.js**: Data validation helpers

### Middleware (src/middleware/)

- **auth.js**: JWT token validation and role-based access
- **validation.js**: Request validation using express-validator
- **errorHandler.js**: Global error handling and logging
- **rateLimit.js**: API rate limiting configuration
- **upload.js**: File upload configuration with multer

### API Routes Structure

```javascript
// Authentication routes
POST /api/auth/register      // User registration
POST /api/auth/login         // User login
GET  /api/auth/profile       // Get user profile
PUT  /api/auth/profile       // Update user profile
POST /api/auth/logout        // User logout
POST /api/auth/refresh       // Refresh JWT token

// Ticket routes
GET    /api/tickets          // Get all tickets (with filters)
GET    /api/tickets/:id      // Get ticket by ID
POST   /api/tickets          // Create new ticket
PUT    /api/tickets/:id      // Update ticket
DELETE /api/tickets/:id      // Delete ticket (admin/manager)
GET    /api/tickets/stats    // Get ticket statistics

// Comment routes
GET    /api/tickets/:id/comments     // Get ticket comments
POST   /api/tickets/:id/comments     // Add comment to ticket
PUT    /api/comments/:id             // Update comment
DELETE /api/comments/:id             // Delete comment

// User management routes (admin/manager)
GET    /api/users            // Get all users
GET    /api/users/:id        // Get user by ID
PUT    /api/users/:id        // Update user
DELETE /api/users/:id        // Delete user (admin only)
GET    /api/users/stats      // Get user statistics

// File upload routes
POST   /api/tickets/:id/attachments  // Upload file to ticket
GET    /api/attachments/:id          // Download attachment
DELETE /api/attachments/:id          // Delete attachment
```

## 🎯 Frontend Architecture

### Component Structure

```javascript
// Layout Components
Header; // Navigation, user menu
Sidebar; // Navigation menu
Footer; // Application footer
Layout; // Main layout wrapper

// Authentication Components
LoginForm; // User login
RegisterForm; // User registration
ProfileForm; // User profile editing
ProtectedRoute; // Route protection HOC

// Ticket Components
TicketList; // Paginated ticket list with filters
TicketCard; // Individual ticket display
TicketForm; // Create/edit ticket form
TicketDetails; // Full ticket view with comments
TicketFilters; // Filtering and search controls
TicketStats; // Statistics dashboard

// UI Components
Button; // Styled button component
Input; // Form input component
Select; // Dropdown select component
Modal; // Modal dialog component
Toast; // Notification component
LoadingSpinner; // Loading indicator
Pagination; // Pagination controls
```

### State Management

```javascript
// Context providers
AuthContext; // User authentication state
TicketContext; // Ticket management state
NotificationContext; // Toast notifications
ThemeContext; // UI theme management

// Custom hooks
useAuth; // Authentication operations
useTickets; // Ticket CRUD operations
useUsers; // User management
useApi; // API call wrapper
useLocalStorage; // Local storage management
useDebounce; // Debounced input handling
```

### API Service Layer

```javascript
// services/api.js
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3001/api";

// HTTP client configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("authToken");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
```

## 🧪 Testing Strategy

### Backend Testing

```javascript
// Unit Tests (Jest)
describe("User Model", () => {
  test("should create user with valid data", async () => {
    const userData = {
      email: "test@example.com",
      password: "Password123",
      firstName: "Test",
      lastName: "User",
    };
    const user = await User.create(userData);
    expect(user.email).toBe(userData.email);
    expect(user.password_hash).toBeDefined();
  });
});

// Integration Tests (Supertest)
describe("Auth Routes", () => {
  test("POST /api/auth/register should create new user", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        email: "test@example.com",
        password: "Password123",
        firstName: "Test",
        lastName: "User",
      })
      .expect(201);

    expect(response.body.token).toBeDefined();
  });
});
```

### Frontend Testing

```javascript
// Component Tests (React Testing Library)
describe("LoginForm", () => {
  test("should submit form with valid credentials", async () => {
    const mockLogin = jest.fn();
    render(<LoginForm onLogin={mockLogin} />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
    });
  });
});
```

## 🔧 Code Quality Standards

### ESLint Configuration

```javascript
// .eslintrc.js
module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true,
  },
  extends: ["eslint:recommended", "airbnb-base"],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "error" : "warn",
    "import/extensions": ["error", "ignorePackages", { js: "never" }],
    "max-len": ["error", { code: 100 }],
    "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
  },
};
```

### Naming Conventions

- **Variables/Functions**: camelCase (getUserById, isLoggedIn)
- **Constants**: UPPER_SNAKE_CASE (API_BASE_URL, MAX_FILE_SIZE)
- **Components**: PascalCase (TicketList, UserProfile)
- **Files**: kebab-case for components (ticket-list.jsx), camelCase for utilities (apiClient.js)
- **Database**: snake_case for tables and columns (users, created_at)
- **API Endpoints**: kebab-case (/api/auth/forgot-password)

### Git Conventions

```bash
# Branch naming
feature/ticket-123-user-authentication
bugfix/ticket-456-login-validation
hotfix/critical-security-patch

# Commit messages (Conventional Commits)
feat(auth): add user registration endpoint
fix(tickets): resolve status update bug
docs(api): update authentication documentation
test(users): add user model unit tests
refactor(db): optimize ticket query performance
```

## 🚀 Deployment Configuration

### Environment Variables

```bash
# Backend (.env)
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=your-super-secure-jwt-secret
JWT_EXPIRES_IN=24h
CORS_ORIGIN=https://your-frontend-domain.com
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
LOG_LEVEL=info
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Frontend (.env)
VITE_API_URL=https://your-backend-api.com
VITE_APP_NAME=Tick'Help
VITE_APP_VERSION=1.0.0
VITE_MAX_FILE_SIZE=10485760
```

### Docker Configuration

```dockerfile
# Backend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]

# Frontend Dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 🔒 Security Measures

### Backend Security

```javascript
// Helmet.js configuration
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP",
});

// Input validation
const validateInput = [
  body("email").isEmail().normalizeEmail(),
  body("password")
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
```

### Frontend Security

```javascript
// XSS protection
const sanitizeInput = (input) => {
  return DOMPurify.sanitize(input);
};

// CSRF protection
const csrfToken = document.querySelector('meta[name="csrf-token"]').content;

// Secure token storage
const tokenStorage = {
  set: (token) => {
    localStorage.setItem("authToken", token);
    // Set httpOnly cookie for additional security
    document.cookie = `authToken=${token}; Secure; SameSite=Strict`;
  },
  get: () => localStorage.getItem("authToken"),
  remove: () => {
    localStorage.removeItem("authToken");
    document.cookie =
      "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  },
};
```

## 📊 Performance Optimization

### Backend Performance

```javascript
// Database query optimization
const getTicketsOptimized = async (filters) => {
  const query = `
    SELECT t.*, u1.first_name as reporter_name, u2.first_name as assignee_name
    FROM tickets t
    LEFT JOIN users u1 ON t.reporter_id = u1.id
    LEFT JOIN users u2 ON t.assignee_id = u2.id
    WHERE ($1::text IS NULL OR t.status = $1)
    ORDER BY t.created_at DESC
    LIMIT $2 OFFSET $3
  `;
  return pool.query(query, [filters.status, filters.limit, filters.offset]);
};

// Caching strategy
const redis = require("redis");
const client = redis.createClient();

const cacheMiddleware = (duration = 300) => {
  return async (req, res, next) => {
    const key = req.originalUrl;
    const cached = await client.get(key);

    if (cached) {
      return res.json(JSON.parse(cached));
    }

    res.sendResponse = res.json;
    res.json = (body) => {
      client.setex(key, duration, JSON.stringify(body));
      res.sendResponse(body);
    };

    next();
  };
};
```

### Frontend Performance

```javascript
// Code splitting with React.lazy
const TicketList = lazy(() => import("./components/TicketList"));
const UserProfile = lazy(() => import("./components/UserProfile"));

// Memoization for expensive computations
const TicketStats = memo(({ tickets }) => {
  const stats = useMemo(() => {
    return {
      total: tickets.length,
      open: tickets.filter((t) => t.status !== "closed").length,
      urgent: tickets.filter((t) => t.priority === "urgent").length,
    };
  }, [tickets]);

  return <div>{/* render stats */}</div>;
});

// Virtual scrolling for large lists
import { FixedSizeList as List } from "react-window";

const VirtualizedTicketList = ({ tickets }) => (
  <List
    height={600}
    itemCount={tickets.length}
    itemSize={80}
    itemData={tickets}
  >
    {TicketItem}
  </List>
);
```

## 📈 Monitoring & Logging

### Backend Logging

```javascript
// Winston logger configuration
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    new winston.transports.File({ filename: "logs/combined.log" }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`, {
    ip: req.ip,
    userAgent: req.get("User-Agent"),
    userId: req.user?.id,
  });
  next();
});
```

### Error Tracking

```javascript
// Global error handler
process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", error);
  // Send to error tracking service (Sentry, Bugsnag, etc.)
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", reason);
  // Send to error tracking service
});
```

## 🛠️ Development Workflow

### Local Development Setup

```bash
# 1. Clone repository
git clone https://github.com/your-repo/tickhelp.git
cd tickhelp

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env
# Edit .env with your configuration

# 4. Setup database
npm run db:setup
npm run db:migrate
npm run db:seed

# 5. Start development servers
npm run dev

# 6. Run tests
npm run test

# 7. Lint code
npm run lint:fix
```

### Continuous Integration

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run tests
        run: npm run test:coverage
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## 🎯 MVP Success Criteria

### Functional Requirements ✅

- [x] User authentication (register, login, logout)
- [x] Role-based access control (admin, manager, user)
- [x] Ticket CRUD operations
- [x] Ticket filtering and search
- [x] Comment system
- [x] File attachments
- [x] Audit trail and history
- [x] Dashboard with statistics
- [x] User profile management

### Technical Requirements ✅

- [x] RESTful API design
- [x] JWT authentication
- [x] PostgreSQL database with proper relationships
- [x] Input validation and sanitization
- [x] Error handling and logging
- [x] API rate limiting
- [x] File upload handling
- [x] Responsive frontend design
- [x] Code quality (ESLint, tests)
- [x] Documentation

### Performance Requirements

- API response times < 200ms
- Frontend page load < 2 seconds
- Database query optimization
- Efficient pagination
- Image optimization
- Code splitting and lazy loading

### Security Requirements

- Password hashing (bcrypt)
- SQL injection prevention
- XSS protection
- CSRF protection
- Secure headers (Helmet.js)
- Input validation
- File upload security
- Rate limiting

This comprehensive instruction guide ensures consistent development practices and maintainable code throughout the Tick'Help project development lifecycle.

## 🛠️ Configuration du Projet Frontend

### Résolution des problèmes de TypeScript

```typescript
// Solution pour les conflits de types dans vite.config.ts
export default defineConfig({
  plugins: [react() as any], // Utiliser le cast pour éviter les conflits de types
})
```

### Structure des répertoires du frontend

```
frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── common/          # Layout, Header, Footer, Sidebar, etc.
│   │   ├── forms/           # LoginForm, RegisterForm, TicketForm, etc.
│   │   └── ui/              # Button, Input, Modal, etc.
│   ├── pages/
│   │   ├── auth/            # Login, Register, ForgotPassword
│   │   ├── dashboard/       # Dashboard principal
│   │   ├── tickets/         # Liste, Détails, Création de tickets
│   │   └── users/           # Gestion des utilisateurs (admin)
│   ├── contexts/            # AuthContext, NotificationContext
│   ├── hooks/               # useAuth, useTickets, useApi
│   ├── services/            # apiClient, ticketService, authService
│   ├── utils/               # Fonctions utilitaires
│   └── types/               # Types TypeScript
```

### Types communs pour TypeScript

```typescript
// Types globaux pour Tick'Help
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

export interface Comment {
  id: number;
  ticketId: number;
  userId: number;
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
```

### Configuration de Vite pour le développement

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react() as any],
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
```

### Environnement de développement

```bash
# Frontend (en cas de conflit de versions)
cd frontend
rm -rf node_modules package-lock.json
npm install

# Si les problèmes de types persistent
npm install --legacy-peer-deps
```

### Optimisation des performances du frontend

- Utiliser React.lazy pour le chargement différé des composants
- Implémenter la virtualisation avec react-window pour les grandes listes
- Optimiser les images et utiliser des formats modernes (WebP)
- Mettre en place la mémoisation avec useMemo et useCallback
- Implémenter le code splitting par route
- Utiliser des stratégies de cache pour les requêtes API
