-- Migration: Configurações globais do chat
-- Adiciona tabela para armazenar configurações globais do sistema

-- Tabela: global_settings (configurações globais do sistema)
CREATE TABLE IF NOT EXISTS global_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(255) UNIQUE NOT NULL,
    setting_value JSONB NOT NULL DEFAULT '{}'::jsonb,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_global_settings_key ON global_settings(setting_key);

-- Inserir configuração padrão do chat (se não existir)
INSERT INTO global_settings (setting_key, setting_value, description)
VALUES ('chat_visibility', '{"enabled": true}'::jsonb, 'Configuração global de visibilidade do chat na home')
ON CONFLICT (setting_key) DO NOTHING;

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_global_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_global_settings_updated_at
    BEFORE UPDATE ON global_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_global_settings_updated_at();
