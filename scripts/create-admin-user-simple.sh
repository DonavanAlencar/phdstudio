#!/bin/bash

# Script simplificado para criar usuário admin
# Requer hash bcrypt gerado previamente
# Uso: ./scripts/create-admin-user-simple.sh email@exemplo.com "hash_bcrypt"

set -e

EMAIL=${1:-admin@phdstudio.com.br}
HASH=${2:-}

if [ -z "$EMAIL" ] || [ -z "$HASH" ]; then
    echo "Uso: $0 <email> <hash_bcrypt>"
    echo ""
    echo "Exemplo:"
    echo "  $0 admin@phdstudio.com.br '\$2a\$10\$abc123...'"
    echo ""
    echo "Para gerar hash, use:"
    echo "  ./scripts/generate-hash.sh"
    echo "  ou visite: https://bcrypt-generator.com/"
    exit 1
fi

FIRST_NAME="Admin"
LAST_NAME="PHD Studio"

echo "Criando usuário administrador..."
echo "Email: $EMAIL"
echo ""

SQL="INSERT INTO users (email, password_hash, first_name, last_name, role, created_at) VALUES ('$EMAIL', '$HASH', '$FIRST_NAME', '$LAST_NAME', 'admin', NOW()) ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = 'admin', updated_at = NOW();"

if docker exec -i phd-crm-db psql -U phd_crm_user -d phd_crm -c "$SQL" > /dev/null 2>&1; then
    echo "✅ Usuário criado/atualizado com sucesso!"
    echo ""
    echo "Você pode fazer login em: https://phdstudio.com.br/admin"
else
    echo "❌ Erro ao criar usuário."
    echo ""
    echo "Tente executar manualmente:"
    echo "docker exec -it phd-crm-db psql -U phd_crm_user -d phd_crm"
    echo ""
    echo "E execute:"
    echo "$SQL"
    exit 1
fi

