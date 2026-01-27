#!/bin/bash

# Script para testar a API de configurações do chat
# Verifica se a migration foi executada e se a API está funcionando

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=== Teste da API de Configurações do Chat ===${NC}\n"

# Carregar variáveis de ambiente
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
ENV_FILE="${ROOT_DIR}/backend/env"

if [ -f "$ENV_FILE" ]; then
    set -a
    source "$ENV_FILE"
    set +a
fi

DB_HOST="${CRM_DB_HOST:-phd-crm-db}"
DB_PORT="${CRM_DB_PORT:-5432}"
DB_USER="${CRM_DB_USER:-phd_crm_user}"
DB_NAME="${CRM_DB_NAME:-phd_crm}"
DB_PASSWORD="${CRM_DB_PASSWORD}"

# Detectar container Docker
DB_CONTAINER=""
if docker ps --format '{{.Names}}' | grep -q "^phd-crm-db$"; then
    DB_CONTAINER="phd-crm-db"
elif docker ps --format '{{.Names}}' | grep -q "^phd-crm-db-local$"; then
    DB_CONTAINER="phd-crm-db-local"
fi

# 1. Verificar se a tabela existe
echo -e "${BLUE}1. Verificando se a tabela global_settings existe...${NC}"
if [ -n "$DB_CONTAINER" ]; then
    if docker exec "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -c "\d global_settings" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Tabela global_settings existe${NC}"
    else
        echo -e "${RED}❌ Tabela global_settings NÃO existe${NC}"
        echo -e "${YELLOW}   Execute: ./scripts/run-chat-settings-migration.sh${NC}"
        exit 1
    fi
else
    if command -v psql &> /dev/null && PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "\d global_settings" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Tabela global_settings existe${NC}"
    else
        echo -e "${RED}❌ Tabela global_settings NÃO existe${NC}"
        echo -e "${YELLOW}   Execute: ./scripts/run-chat-settings-migration.sh${NC}"
        exit 1
    fi
fi

# 2. Verificar se a configuração existe
echo -e "${BLUE}2. Verificando se a configuração chat_visibility existe...${NC}"
if [ -n "$DB_CONTAINER" ]; then
    RESULT=$(docker exec "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM global_settings WHERE setting_key = 'chat_visibility';" 2>/dev/null | xargs)
    if [ "$RESULT" = "1" ]; then
        echo -e "${GREEN}✅ Configuração chat_visibility existe${NC}"
        VALUE=$(docker exec "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT setting_value->>'enabled' FROM global_settings WHERE setting_key = 'chat_visibility';" 2>/dev/null | xargs)
        echo -e "${BLUE}   Valor atual: enabled = ${VALUE}${NC}"
    else
        echo -e "${YELLOW}⚠️  Configuração chat_visibility não existe${NC}"
        echo -e "${YELLOW}   Execute: ./scripts/run-chat-settings-migration.sh${NC}"
        exit 1
    fi
else
    if command -v psql &> /dev/null; then
        RESULT=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM global_settings WHERE setting_key = 'chat_visibility';" 2>/dev/null | xargs)
        if [ "$RESULT" = "1" ]; then
            echo -e "${GREEN}✅ Configuração chat_visibility existe${NC}"
            VALUE=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT setting_value->>'enabled' FROM global_settings WHERE setting_key = 'chat_visibility';" 2>/dev/null | xargs)
            echo -e "${BLUE}   Valor atual: enabled = ${VALUE}${NC}"
        else
            echo -e "${YELLOW}⚠️  Configuração chat_visibility não existe${NC}"
            echo -e "${YELLOW}   Execute: ./scripts/run-chat-settings-migration.sh${NC}"
            exit 1
        fi
    else
        echo -e "${YELLOW}⚠️  psql não encontrado e nenhum container Docker detectado${NC}"
        exit 1
    fi
fi

# 3. Testar endpoint GET (se API estiver rodando)
echo -e "\n${BLUE}3. Testando endpoint GET /api/crm/v1/chat-settings...${NC}"
API_URL="${VITE_API_URL:-https://phdstudio.com.br/api}"
if [ -z "$API_URL" ]; then
    API_URL="http://localhost:3001"
fi

# Tentar fazer requisição
if command -v curl &> /dev/null; then
    RESPONSE=$(curl -s "${API_URL}/crm/v1/chat-settings" || echo "ERROR")
    if [ "$RESPONSE" != "ERROR" ] && echo "$RESPONSE" | grep -q "success"; then
        echo -e "${GREEN}✅ Endpoint GET funcionando${NC}"
        echo -e "${BLUE}   Resposta: ${RESPONSE}${NC}"
    else
        echo -e "${YELLOW}⚠️  Endpoint GET não respondeu corretamente${NC}"
        echo -e "${YELLOW}   Verifique se a API está rodando${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  curl não encontrado, pulando teste de API${NC}"
fi

echo -e "\n${GREEN}=== Diagnóstico concluído ===${NC}"
