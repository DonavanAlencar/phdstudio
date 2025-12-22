#!/bin/bash

# Script para criar usuário administrador no CRM
# Uso: ./scripts/create-admin-user.sh email@exemplo.com senha123

set -e

EMAIL=${1:-admin@phdstudio.com.br}
PASSWORD=${2:-admin123}

if [ -z "$EMAIL" ] || [ -z "$PASSWORD" ]; then
    echo "Uso: $0 <email> <senha>"
    echo "Exemplo: $0 admin@phdstudio.com.br minhaSenhaSegura123"
    exit 1
fi

echo "Criando usuário administrador..."
echo "Email: $EMAIL"
echo ""

# Verificar se o container da API está rodando
if ! docker ps --format '{{.Names}}' | grep -q "^phd-api$"; then
    echo "❌ Container phd-api não está rodando!"
    echo "Inicie o container primeiro: docker compose up -d"
    exit 1
fi

# Gerar hash usando bcryptjs do container da API
echo "Gerando hash da senha usando bcryptjs do container..."
HASH=$(docker exec phd-api node -e "
    const bcrypt = require('bcryptjs');
    bcrypt.hash('$PASSWORD', 10)
        .then(hash => {
            console.log(hash);
        })
        .catch(err => {
            console.error('Erro:', err.message);
            process.exit(1);
        });
" 2>&1)

# Verificar se houve erro
if echo "$HASH" | grep -q "Error\|MODULE_NOT_FOUND\|Cannot find module"; then
    echo "❌ Erro ao gerar hash:"
    echo "$HASH"
    echo ""
    echo "Alternativas:"
    echo ""
    echo "1. Gerar hash online em: https://bcrypt-generator.com/"
    echo "   - Níveis: 10 rounds"
    echo "   - Senha: $PASSWORD"
    echo "   Depois use: ./scripts/create-admin-user-simple.sh $EMAIL \"HASH_GERADO\""
    echo ""
    echo "2. Usar script Python: python3 scripts/create-admin-user.py $EMAIL \"$PASSWORD\""
    exit 1
fi

# Remover linhas de erro e pegar apenas o hash
HASH=$(echo "$HASH" | grep -v "Error\|MODULE_NOT_FOUND\|Cannot find module" | tail -1 | tr -d '\r\n ')

if [ -z "$HASH" ] || [ ${#HASH} -lt 20 ]; then
    echo "❌ Hash inválido gerado: $HASH"
    exit 1
fi

echo "✅ Hash gerado com sucesso!"
echo ""

# Inserir usuário no banco
FIRST_NAME="Admin"
LAST_NAME="PHD Studio"

echo "Inserindo usuário no banco de dados..."

SQL="INSERT INTO users (email, password_hash, first_name, last_name, role, created_at) VALUES ('$EMAIL', '$HASH', '$FIRST_NAME', '$LAST_NAME', 'admin', NOW()) ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = 'admin', updated_at = NOW();"

if docker exec -i phd-crm-db psql -U phd_crm_user -d phd_crm -c "$SQL" > /dev/null 2>&1; then
    echo "✅ Usuário criado/atualizado com sucesso!"
    echo ""
    echo "Credenciais:"
    echo "  Email: $EMAIL"
    echo "  Senha: $PASSWORD"
    echo ""
    echo "Você pode fazer login em: https://phdstudio.com.br/admin"
else
    echo "❌ Erro ao inserir usuário no banco."
    echo ""
    echo "Tente executar manualmente:"
    echo ""
    echo "docker exec -it phd-crm-db psql -U phd_crm_user -d phd_crm"
    echo ""
    echo "E execute:"
    echo "$SQL"
    exit 1
fi
