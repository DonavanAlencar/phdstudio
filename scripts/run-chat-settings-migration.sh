#!/bin/bash

# Script para executar apenas a migration 007 (configurações globais do chat)
# Útil para aplicar após deploy sem precisar rodar todas as migrations

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
MIGRATION_FILE="${ROOT_DIR}/backend/db/migrations/007_global_chat_settings.sql"

echo -e "${BLUE}Executando migration 007: Configurações globais do chat${NC}"

# Verificar se o arquivo existe
if [ ! -f "$MIGRATION_FILE" ]; then
    echo -e "${RED}❌ Arquivo de migration não encontrado: $MIGRATION_FILE${NC}"
    exit 1
fi

# Carregar variáveis de ambiente do .env se existir
ENV_FILE="${ROOT_DIR}/backend/env"
if [ -f "$ENV_FILE" ]; then
    set -a
    source "$ENV_FILE"
    set +a
fi

# Variáveis do banco (com fallback)
DB_HOST="${CRM_DB_HOST:-phd-crm-db}"
DB_PORT="${CRM_DB_PORT:-5432}"
DB_USER="${CRM_DB_USER:-phd_crm_user}"
DB_NAME="${CRM_DB_NAME:-phd_crm}"
DB_PASSWORD="${CRM_DB_PASSWORD}"

# Detectar se está usando Docker
DB_CONTAINER=""
if docker ps --format '{{.Names}}' | grep -q "^phd-crm-db$"; then
    DB_CONTAINER="phd-crm-db"
    echo -e "${BLUE}Usando container Docker: ${DB_CONTAINER}${NC}"
elif docker ps --format '{{.Names}}' | grep -q "^phd-crm-db-local$"; then
    DB_CONTAINER="phd-crm-db-local"
    echo -e "${BLUE}Usando container Docker local: ${DB_CONTAINER}${NC}"
fi

if [ -z "$DB_PASSWORD" ]; then
    echo -e "${YELLOW}⚠️  CRM_DB_PASSWORD não encontrado no .env${NC}"
    if [ -n "$DB_CONTAINER" ]; then
        # Tentar obter do container
        DB_PASSWORD=$(docker exec "$DB_CONTAINER" printenv POSTGRES_PASSWORD 2>/dev/null || echo "")
    fi
    if [ -z "$DB_PASSWORD" ]; then
        echo -e "${BLUE}Digite a senha do banco de dados:${NC}"
        read -s DB_PASSWORD
    fi
fi

echo -e "${BLUE}Conectando ao banco: ${DB_USER}@${DB_HOST}:${DB_PORT}/${DB_NAME}${NC}"

# Executar migration
if [ -n "$DB_CONTAINER" ]; then
    # Executar dentro do container Docker
    echo -e "${BLUE}Executando migration dentro do container Docker...${NC}"
    if docker exec -i "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" < "$MIGRATION_FILE"; then
        echo -e "${GREEN}✅ Migration 007 executada com sucesso!${NC}"
        echo -e "${GREEN}✅ Tabela global_settings criada e configuração padrão do chat inserida${NC}"
    else
        echo -e "${RED}❌ Erro ao executar migration${NC}"
        exit 1
    fi
else
    # Executar localmente (se psql estiver instalado)
    if command -v psql &> /dev/null; then
        if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$MIGRATION_FILE"; then
            echo -e "${GREEN}✅ Migration 007 executada com sucesso!${NC}"
            echo -e "${GREEN}✅ Tabela global_settings criada e configuração padrão do chat inserida${NC}"
        else
            echo -e "${RED}❌ Erro ao executar migration${NC}"
            exit 1
        fi
    else
        echo -e "${RED}❌ psql não encontrado e nenhum container Docker detectado${NC}"
        echo -e "${YELLOW}   Instale o PostgreSQL client ou certifique-se de que o container está rodando${NC}"
        exit 1
    fi
fi
