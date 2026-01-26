#!/bin/bash

# Script para redefinir senha do usuário admin
# Uso: ./reset-admin-password.sh [nova_senha]

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Nova senha (padrão: admin123)
NEW_PASSWORD=${1:-admin123}

echo -e "${YELLOW}Redefinindo senha do usuário admin...${NC}"

# Gerar hash da senha usando bcrypt no container da API
echo -e "${YELLOW}Gerando hash da senha...${NC}"
HASH=$(docker exec phd-api node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('${NEW_PASSWORD}', 10));" 2>&1 | tail -1)

if [ -z "$HASH" ] || [[ "$HASH" == *"Error"* ]]; then
    echo -e "${RED}Erro ao gerar hash da senha${NC}"
    exit 1
fi

echo -e "${GREEN}Hash gerado com sucesso${NC}"

# Atualizar senha no banco de dados
echo -e "${YELLOW}Atualizando senha no banco de dados...${NC}"
docker exec phd-crm-db psql -U phd_crm_user -d phd_crm -c "UPDATE users SET password_hash = '${HASH}' WHERE email = 'admin@phdstudio.com.br';" > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Senha redefinida com sucesso!${NC}"
    echo ""
    echo -e "Email: ${YELLOW}admin@phdstudio.com.br${NC}"
    echo -e "Nova senha: ${YELLOW}${NEW_PASSWORD}${NC}"
    echo ""
    echo -e "${GREEN}Você pode fazer login agora!${NC}"
else
    echo -e "${RED}Erro ao atualizar senha no banco de dados${NC}"
    exit 1
fi

