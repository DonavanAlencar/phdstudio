#!/bin/bash

# Script auxiliar para gerar hash bcrypt
# Uso: ./scripts/generate-hash.sh "minha senha"

set -e

PASSWORD=${1:-}

if [ -z "$PASSWORD" ]; then
    read -sp "Digite a senha: " PASSWORD
    echo ""
fi

echo "Gerando hash bcrypt para a senha..."
echo ""

# Tentar usar Node.js local
if command -v node &> /dev/null; then
    # Verificar se bcryptjs está instalado
    if node -e "require('bcryptjs')" 2>/dev/null; then
        HASH=$(node -e "
            const bcrypt = require('bcryptjs');
            bcrypt.hash('$PASSWORD', 10).then(hash => {
                console.log(hash);
            });
        ")
        echo "✅ Hash gerado:"
        echo "$HASH"
    else
        echo "⚠️  bcryptjs não está instalado."
        echo ""
        echo "Instale com: npm install -g bcryptjs"
        echo ""
        echo "Ou gere online em: https://bcrypt-generator.com/"
        exit 1
    fi
else
    echo "⚠️  Node.js não encontrado."
    echo ""
    echo "Opções:"
    echo "1. Instalar Node.js e bcryptjs"
    echo "2. Gerar online em: https://bcrypt-generator.com/"
    echo "   - Níveis: 10 rounds"
    echo "   - Senha: $PASSWORD"
    exit 1
fi

