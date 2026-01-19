-- PHD Studio CRM - Schema Inicial
-- PostgreSQL 16

-- Extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela: users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user')),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);

-- Tabela: leads
CREATE TABLE leads (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'lost')),
    source VARCHAR(100),
    stage VARCHAR(50) DEFAULT 'Curioso' CHECK (stage IN ('Curioso', 'Avaliando', 'Pronto para agir')),
    pain_point TEXT,
    assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_stage ON leads(stage);
CREATE INDEX idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX idx_leads_created_at ON leads(created_at);
CREATE INDEX idx_leads_deleted_at ON leads(deleted_at) WHERE deleted_at IS NULL;

-- Tabela: lead_custom_fields
CREATE TABLE lead_custom_fields (
    id SERIAL PRIMARY KEY,
    lead_id INTEGER NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    field_key VARCHAR(100) NOT NULL,
    field_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(lead_id, field_key)
);

CREATE INDEX idx_lead_custom_fields_lead_id ON lead_custom_fields(lead_id);
CREATE INDEX idx_lead_custom_fields_key ON lead_custom_fields(field_key);

-- Tabela: tags
CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    color VARCHAR(7) DEFAULT '#3B82F6',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

CREATE INDEX idx_tags_name ON tags(name);
CREATE INDEX idx_tags_deleted_at ON tags(deleted_at) WHERE deleted_at IS NULL;

-- Tabela: lead_tags
CREATE TABLE lead_tags (
    id SERIAL PRIMARY KEY,
    lead_id INTEGER NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(lead_id, tag_id)
);

CREATE INDEX idx_lead_tags_lead_id ON lead_tags(lead_id);
CREATE INDEX idx_lead_tags_tag_id ON lead_tags(tag_id);

-- Tabela: activities
CREATE TABLE activities (
    id SERIAL PRIMARY KEY,
    lead_id INTEGER NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('call', 'email', 'meeting', 'note', 'task')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_activities_lead_id ON activities(lead_id);
CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_type ON activities(type);
CREATE INDEX idx_activities_due_date ON activities(due_date);
CREATE INDEX idx_activities_completed_at ON activities(completed_at) WHERE completed_at IS NULL;

-- Tabela: kanban_boards
CREATE TABLE kanban_boards (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_kanban_boards_user_id ON kanban_boards(user_id);
CREATE INDEX idx_kanban_boards_is_default ON kanban_boards(is_default);

-- Tabela: kanban_columns
CREATE TABLE kanban_columns (
    id SERIAL PRIMARY KEY,
    board_id INTEGER NOT NULL REFERENCES kanban_boards(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    position INTEGER NOT NULL,
    color VARCHAR(7) DEFAULT '#3B82F6',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_kanban_columns_board_id ON kanban_columns(board_id);
CREATE INDEX idx_kanban_columns_position ON kanban_columns(board_id, position);

-- Tabela: kanban_cards
CREATE TABLE kanban_cards (
    id SERIAL PRIMARY KEY,
    column_id INTEGER NOT NULL REFERENCES kanban_columns(id) ON DELETE CASCADE,
    lead_id INTEGER REFERENCES leads(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    position INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_kanban_cards_column_id ON kanban_cards(column_id);
CREATE INDEX idx_kanban_cards_lead_id ON kanban_cards(lead_id);
CREATE INDEX idx_kanban_cards_position ON kanban_cards(column_id, position);

-- Tabela: sessions
CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    refresh_token VARCHAR(255) UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    refresh_expires_at TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_refresh_token ON sessions(refresh_token);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lead_custom_fields_updated_at BEFORE UPDATE ON lead_custom_fields
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tags_updated_at BEFORE UPDATE ON tags
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON activities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kanban_boards_updated_at BEFORE UPDATE ON kanban_boards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kanban_columns_updated_at BEFORE UPDATE ON kanban_columns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kanban_cards_updated_at BEFORE UPDATE ON kanban_cards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed: Usuário admin padrão (senha: admin123 - DEVE SER ALTERADA!)
-- Hash bcrypt para "admin123"
INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES
('admin@phdstudio.com.br', '$2a$10$bKiT8v07uz62qO4.8BRD0OrsI0e5EkbhXKBBnGejJShyK8tTH72SS', 'Admin', 'PHD Studio', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Seed: Tags padrão
INSERT INTO tags (name, color, description) VALUES
('Hot Lead', '#EF4444', 'Lead com alta prioridade'),
('Follow Up', '#F59E0B', 'Necessita acompanhamento'),
('Qualificado', '#10B981', 'Lead qualificado'),
('Interessado', '#3B82F6', 'Lead interessado no produto')
ON CONFLICT (name) DO NOTHING;

-- Seed: Board Kanban padrão
INSERT INTO kanban_boards (name, description, is_default) VALUES
('Pipeline de Vendas', 'Board padrão para gerenciamento de leads', true)
ON CONFLICT DO NOTHING;

-- Colunas padrão do Kanban
DO $$
DECLARE
    board_id_var INTEGER;
BEGIN
    SELECT id INTO board_id_var FROM kanban_boards WHERE is_default = true LIMIT 1;
    
    IF board_id_var IS NOT NULL THEN
        INSERT INTO kanban_columns (board_id, name, position, color) VALUES
        (board_id_var, 'Novos Leads', 0, '#3B82F6'),
        (board_id_var, 'Em Contato', 1, '#F59E0B'),
        (board_id_var, 'Qualificados', 2, '#10B981'),
        (board_id_var, 'Convertidos', 3, '#8B5CF6')
        ON CONFLICT DO NOTHING;
    END IF;
END $$;
