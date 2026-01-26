-- Fix: Aumentar tamanho dos campos token e refresh_token na tabela sessions
-- Tokens JWT podem ter mais de 255 caracteres

ALTER TABLE sessions ALTER COLUMN token TYPE TEXT;
ALTER TABLE sessions ALTER COLUMN refresh_token TYPE TEXT;
