#!/bin/bash

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Implantando PHD Studio Localmente ===${NC}"

# Verificar se os arquivos de ambiente existem
if [ ! -f "env.dev" ]; then
    echo -e "${RED}Erro: Arquivo env.dev não encontrado!${NC}"
    exit 1
fi

if [ ! -f "api/env.dev" ]; then
    echo -e "${RED}Erro: Arquivo api/env.dev não encontrado!${NC}"
    exit 1
fi

echo -e "${GREEN}Arquivos de configuração encontrados.${NC}"

# Derrubar containers antigos se existirem
echo -e "${YELLOW}Parando containers antigos...${NC}"
docker compose -f docker-compose.local.yml down

# Subir novos containers
echo -e "${YELLOW}Subindo containers...${NC}"
docker compose -f docker-compose.local.yml up -d --build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}=== Implantação Concluída com Sucesso! ===${NC}"
    echo -e "Acesse:"
    echo -e "Frontend: ${GREEN}http://localhost:8080${NC}"
    echo -e "API Health: ${GREEN}http://localhost:3001/api/crm/v1/health${NC}"
    echo -e "Logs: docker compose -f docker-compose.local.yml logs -f"
else
    echo -e "${RED}Falha na implantação.${NC}"
fi
