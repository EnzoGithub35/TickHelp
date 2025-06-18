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
├── docs/                         # Project documentation
│   ├── api/                      # API documentation
│   ├── deployment/               # Deployment guides
│   ├── development/              # Development setup guides
│   └── maintenance/              # TMA documentation
├── .github/                      # GitHub configuration
│   ├── workflows/                # GitHub Actions
│   ├── ISSUE_TEMPLATE/          # Issue templates
│   ├── PULL_REQUEST_TEMPLATE.md # PR template
│   └── copilot-instructions.md   # This file
├── .gitignore
├── docker-compose.yml            # Local development environment
├── README.md                     # Main project documentation
└── package.json                  # Root package.json for workspace
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

## 🔐 Backend Authentication Implementation Guidelines

### 1. Registration (`POST /api/auth/register`)
- **Input**: `email`, `password`, `firstName`, `lastName` (optionally `role`)
- **Validation**: 
  - Email must be unique and valid.
  - Password must be at least 8 characters, contain uppercase, lowercase, and a number.
  - First and last names: 2–50 characters.
  - Role: only `user`, `manager`, or `admin` (default: `user`).
- **Process**:
  - Hash password with bcrypt before storing.
  - Insert user in the `users` table with `is_active = true`.
  - Never return the password or its hash in any response.
  - On success, return user info (without password) and a JWT token.

### 2. Login (`POST /api/auth/login`)
- **Input**: `email`, `password`
- **Validation**: 
  - Email must exist and be active.
  - Password must match the stored hash.
- **Process**:
  - On success, return user info (without password) and a JWT token.
  - On failure, return a clear error (`INVALID_CREDENTIALS`, `ACCOUNT_DEACTIVATED`, etc.).

### 3. JWT Token
- **Payload structure**:
  ```json
  {
    "sub": "user_id",
    "email": "user@example.com",
    "role": "user|manager|admin",
    "iat": "issued_at_timestamp",
    "exp": "expiration_timestamp"
  }
  ```
- **Secret**: Use `JWT_SECRET` from environment variables.
- **Expiration**: Use `JWT_EXPIRES_IN` from environment variables (e.g., `24h`).

### 4. Security & Best Practices
- Always validate and sanitize all inputs.
- Never expose password hashes.
- Use HTTPS in production.
- Use rate limiting on auth routes.
- Log authentication events for audit.

### 5. Example Response
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 6. Error Codes
- `EMAIL_ALREADY_USED`
- `INVALID_CREDENTIALS`
- `ACCOUNT_DEACTIVATED`
- `TOKEN_EXPIRED`
- `TOKEN_INVALID`
- `USER_NOT_FOUND`

---

**Follow these guidelines for all authentication-related backend code.**

### Role Permissions
- **Admin**: Full access to all resources
- **Manager**: Can manage tickets, users in their team
- **User**: Can create tickets, edit own tickets, comment

## 📋 MVP Features Requirements

### 1. Authentication System
- [x] User registration with email verification
- [x] User login with email/password
- [x] JWT token-based authentication
- [x] Password reset functionality
- [x] Role-based access control

### 2. Dashboard
- [x] Overview statistics (total tickets, by status, by priority)
- [x] Recent activity feed
- [x] Quick actions (create ticket, search)
- [x] Assigned tickets summary

### 3. Ticket Management (CRUD)
- [x] Create new ticket with all fields
- [x] View ticket details with full information
- [x] Edit ticket (title, description, status, priority, assignee)
- [x] Delete ticket (with confirmation)
- [x] Bulk operations (status update, assignment)

### 4. Ticket List & Filtering
- [x] Paginated ticket list
- [x] Filter by status, priority, type, assignee
- [x] Sort by created date, updated date, priority, due date
- [x] Search by title and description
- [x] Advanced search with multiple criteria

### 5. User Management
- [x] User profile management
- [x] User list for assignments
- [x] Role management (admin only)

### 6. History & Audit Trail
- [x] Track all ticket changes
- [x] Show modification history
- [x] User activity logs
- [x] Export audit reports

## 🧪 Testing Strategy

### Backend Testing
- **Unit Tests**: Models, services, utilities
- **Integration Tests**: API endpoints, database operations
- **E2E Tests**: Complete user workflows
- **Coverage Target**: 80%+

### Frontend Testing
- **Unit Tests**: Components, hooks, utilities
- **Integration Tests**: Component interactions
- **E2E Tests**: User journeys with Cypress/Playwright
- **Coverage Target**: 80%+

## 🔧 Code Quality Standards

### ESLint Configuration
- Airbnb style guide
- React hooks rules
- Import/export rules
- Accessibility rules

### Naming Conventions
- **Variables/Functions**: camelCase
- **Constants**: UPPER_SNAKE_CASE
- **Components**: PascalCase
- **Files**: kebab-case for components, camelCase for utilities
- **Database**: snake_case for tables and columns

### Git Conventions
- **Branches**: feature/ticket-123-description, bugfix/issue-description, hotfix/critical-fix
- **Commits**: type(scope): description (Conventional Commits)
- **Types**: feat, fix, docs, style, refactor, test, chore

## 🚀 Deployment Configuration

### Environment Variables
```bash
# Backend
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://...
JWT_SECRET=...
JWT_EXPIRES_IN=24h
CORS_ORIGIN=https://your-frontend-domain.com

# Frontend
VITE_API_URL=https://your-backend-api.com
VITE_APP_NAME=Tick'Help
```

### Docker Configuration
- Multi-stage builds for production
- Separate containers for frontend, backend, database
- Docker Compose for local development
- Health checks for all services

## 📊 Performance Requirements
- **API Response Time**: < 200ms for most endpoints
- **Page Load Time**: < 2 seconds
- **Database Queries**: Optimized with proper indexes
- **Caching**: Implement Redis for session management

## 🔒 Security Measures
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF protection
- Rate limiting
- Helmet.js for security headers
- Password hashing with bcrypt

## 📈 Monitoring & Logging
- Winston for structured logging
- Error tracking and reporting
- Performance monitoring
- Database query logging
- User activity tracking

## 🌐 API Endpoints Structure

### Authentication Routes
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout
- POST /api/auth/refresh
- POST /api/auth/forgot-password
- POST /api/auth/reset-password

### User Routes
- GET /api/users (admin/manager)
- GET /api/users/:id
- PUT /api/users/:id
- DELETE /api/users/:id (admin)
- GET /api/users/profile
- PUT /api/users/profile

### Ticket Routes
- GET /api/tickets
- GET /api/tickets/:id
- POST /api/tickets
- PUT /api/tickets/:id
- DELETE /api/tickets/:id
- GET /api/tickets/:id/history
- POST /api/tickets/:id/comments
- GET /api/tickets/:id/comments

## 🎨 UI/UX Guidelines
- Clean, modern design
- Responsive layout (mobile-first)
- Consistent color scheme
- Accessible components (WCAG 2.1)
- Loading states and error handling
- Toast notifications for feedback

## 📝 Development Workflow
1. Create feature branch from develop
2. Implement feature with tests
3. Run linting and tests locally
4. Create pull request
5. Code review process
6. Merge to develop after approval
7. Deploy to staging for testing
8. Merge to main for production

## 🎯 Success Metrics
- Code coverage > 80%
- Zero ESLint errors
- All tests passing
- Documentation complete
- Deployment successful
- Performance benchmarks met

This instruction file provides comprehensive guidance for developing the Tick'Help application following industry best practices and project requirements.


## 🛠️ Workspace Setup Commands

### Quick Start
```bash
# Clone and setup
git clone <repository-url>
cd TickHelp
cp .env.example .env
npm run setup
npm run dev
```

### Development Commands
```bash
# Start development servers
npm run dev

# Run tests
npm run test

# Lint code
npm run lint

# Database operations
npm run db:migrate
npm run db:seed

# Docker operations
npm run docker:up
npm run docker:down
```

### Project Structure Created
- ✅ React frontend with Vite
- ✅ Express backend with ES modules
- ✅ PostgreSQL database with Docker
- ✅ ESLint configuration (Airbnb)
- ✅ Jest testing setup
- ✅ Git repository with GitFlow
- ✅ Environment configuration
- ✅ Workspace npm scripts

### URLs After Setup
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Database: localhost:5432
- API Health Check: http://localhost:3001/api/health