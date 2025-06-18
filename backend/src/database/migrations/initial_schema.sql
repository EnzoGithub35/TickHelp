-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (
        role IN ('admin', 'manager', 'user')
    ),
    is_active BOOLEAN DEFAULT true,
    avatar_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tickets table
CREATE TABLE IF NOT EXISTS tickets (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'todo' CHECK (
        status IN (
            'todo',
            'in_progress',
            'resolved',
            'closed'
        )
    ),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (
        priority IN (
            'low',
            'medium',
            'high',
            'urgent'
        )
    ),
    type VARCHAR(20) DEFAULT 'task' CHECK (
        type IN (
            'bug',
            'feature',
            'task',
            'improvement'
        )
    ),
    reporter_id INTEGER REFERENCES users (id) ON DELETE SET NULL,
    assignee_id INTEGER REFERENCES users (id) ON DELETE SET NULL,
    due_date TIMESTAMP WITH TIME ZONE,
    estimated_hours INTEGER,
    actual_hours INTEGER,
    tags TEXT [], -- PostgreSQL array for tags
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Ticket History table
CREATE TABLE IF NOT EXISTS ticket_history (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER REFERENCES tickets (id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users (id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL, -- 'created', 'updated', 'status_changed', 'assigned', etc.
    field_name VARCHAR(100), -- Field that was changed
    old_value TEXT, -- Previous value
    new_value TEXT, -- New value
    comment TEXT, -- Optional comment
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER REFERENCES tickets (id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users (id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false, -- For internal notes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Attachments table
CREATE TABLE IF NOT EXISTS attachments (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER REFERENCES tickets (id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users (id) ON DELETE SET NULL,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);

CREATE INDEX IF NOT EXISTS idx_users_is_active ON users (is_active);

CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets (status);

CREATE INDEX IF NOT EXISTS idx_tickets_priority ON tickets (priority);

CREATE INDEX IF NOT EXISTS idx_tickets_type ON tickets(type);

CREATE INDEX IF NOT EXISTS idx_tickets_reporter_id ON tickets (reporter_id);

CREATE INDEX IF NOT EXISTS idx_tickets_assignee_id ON tickets (assignee_id);

CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets (created_at);

CREATE INDEX IF NOT EXISTS idx_tickets_due_date ON tickets (due_date);

CREATE INDEX IF NOT EXISTS idx_tickets_tags ON tickets USING GIN (tags);

CREATE INDEX IF NOT EXISTS idx_ticket_history_ticket_id ON ticket_history (ticket_id);

CREATE INDEX IF NOT EXISTS idx_ticket_history_user_id ON ticket_history (user_id);

CREATE INDEX IF NOT EXISTS idx_ticket_history_created_at ON ticket_history (created_at);

CREATE INDEX IF NOT EXISTS idx_comments_ticket_id ON comments (ticket_id);

CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments (user_id);

CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments (created_at);

CREATE INDEX IF NOT EXISTS idx_attachments_ticket_id ON attachments (ticket_id);

CREATE INDEX IF NOT EXISTS idx_attachments_user_id ON attachments (user_id);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;

DROP TRIGGER IF EXISTS update_tickets_updated_at ON tickets;

DROP TRIGGER IF EXISTS update_comments_updated_at ON comments;

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tickets_updated_at 
    BEFORE UPDATE ON tickets 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at 
    BEFORE UPDATE ON comments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();