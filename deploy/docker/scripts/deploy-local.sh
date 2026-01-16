#!/bin/bash

set -euo pipefail

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/../.." && pwd)"
COMPOSE_FILE="${ROOT_DIR}/deploy/docker/config/docker-compose.local.yml"
ENV_FILE="${ROOT_DIR}/deploy/config/shared/.env"

echo -e "${YELLOW}=== Implantando PHD Studio Localmente ===${NC}"

# Garantir arquivo de env compartilhado
if [ ! -f "$ENV_FILE" ]; then
    if [ -f "${ENV_FILE}.example" ]; then
        cp "${ENV_FILE}.example" "$ENV_FILE"
        echo -e "${YELLOW}Arquivo $ENV_FILE criado a partir do template. Atualize os valores sensíveis.${NC}"
    else
        echo -e "${RED}Erro: Template de env não encontrado em ${ENV_FILE}.example${NC}"
        exit 1
    fi
fi

# Verificar se os arquivos de ambiente existem
if [ ! -f "${ROOT_DIR}/env.dev" ]; then
    echo -e "${RED}Erro: Arquivo env.dev não encontrado!${NC}"
    exit 1
fi

if [ ! -f "${ROOT_DIR}/api/env.dev" ]; then
    echo -e "${RED}Erro: Arquivo api/env.dev não encontrado!${NC}"
    exit 1
fi

echo -e "${GREEN}Arquivos de configuração encontrados.${NC}"

# Derrubar containers antigos se existirem
echo -e "${YELLOW}Parando containers antigos...${NC}"
docker compose -f "$COMPOSE_FILE" down

# Subir novos containers
echo -e "${YELLOW}Subindo containers...${NC}"
docker compose -f "$COMPOSE_FILE" up -d --build

echo -e "${GREEN}=== Implantação Concluída com Sucesso! ===${NC}"
echo -e "Acesse:"
echo -e "Frontend: ${GREEN}http://localhost:8080${NC}"
echo -e "API Health: ${GREEN}http://localhost:3001/api/crm/v1/health${NC}"
echo -e "Logs: docker compose -f ${COMPOSE_FILE} logs -f"
