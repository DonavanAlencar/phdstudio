-- CRM extensions: custom fields, messages, lead events

-- Custom field definitions
CREATE TABLE IF NOT EXISTS custom_fields (
    id SERIAL PRIMARY KEY,
    field_key VARCHAR(100) UNIQUE NOT NULL,
    label VARCHAR(150) NOT NULL,
    field_type VARCHAR(50) NOT NULL CHECK (field_type IN ('text', 'number', 'date', 'select', 'boolean')),
    options JSONB DEFAULT '[]'::jsonb,
    applies_to VARCHAR(20) NOT NULL CHECK (applies_to IN ('lead', 'deal')),
    is_required BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_custom_fields_applies_to ON custom_fields(applies_to);
CREATE INDEX IF NOT EXISTS idx_custom_fields_is_active ON custom_fields(is_active);

CREATE TRIGGER update_custom_fields_updated_at BEFORE UPDATE ON custom_fields
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Attach definition to lead custom fields (optional)
ALTER TABLE lead_custom_fields ADD COLUMN IF NOT EXISTS field_id INTEGER REFERENCES custom_fields(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_lead_custom_fields_field_id ON lead_custom_fields(field_id);

-- Deal custom field values
CREATE TABLE IF NOT EXISTS deal_custom_fields (
    id SERIAL PRIMARY KEY,
    deal_id INTEGER NOT NULL,
    field_id INTEGER REFERENCES custom_fields(id) ON DELETE SET NULL,
    field_key VARCHAR(100) NOT NULL,
    field_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(deal_id, field_key)
);

CREATE INDEX IF NOT EXISTS idx_deal_custom_fields_deal_id ON deal_custom_fields(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_custom_fields_key ON deal_custom_fields(field_key);

CREATE TRIGGER update_deal_custom_fields_updated_at BEFORE UPDATE ON deal_custom_fields
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Lead events (timeline)
CREATE TABLE IF NOT EXISTS lead_events (
    id SERIAL PRIMARY KEY,
    lead_id INTEGER NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    deal_id INTEGER NULL,
    event_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_lead_events_lead_id ON lead_events(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_events_event_type ON lead_events(event_type);
CREATE INDEX IF NOT EXISTS idx_lead_events_created_at ON lead_events(created_at);

-- Messages history
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    lead_id INTEGER REFERENCES leads(id) ON DELETE SET NULL,
    deal_id INTEGER NULL,
    channel VARCHAR(20) NOT NULL CHECK (channel IN ('whatsapp', 'email', 'sms')),
    direction VARCHAR(10) NOT NULL CHECK (direction IN ('inbound', 'outbound')),
    subject VARCHAR(255),
    body TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'sent', 'failed')),
    metadata JSONB DEFAULT '{}'::jsonb,
    sent_at TIMESTAMP NULL,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_messages_lead_id ON messages(lead_id);
CREATE INDEX IF NOT EXISTS idx_messages_channel ON messages(channel);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
