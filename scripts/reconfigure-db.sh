#!/bin/bash

# Script rápido de reconfiguração do PostgreSQL
# Usa sudo quando necessário

set -e

echo "🔧 Reconfigurando PostgreSQL para PHD Studio CRM..."

DB_HOST=${1:-localhost}
DB_PORT=${2:-5432}
DB_USER=${3:-phd_crm_user}
DB_PASSWORD=${4:-PhdCrm@2024!Strong#Pass}
DB_NAME=${5:-phd_crm}

echo "📋 Configurações:"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  User: $DB_USER"
echo "  Database: $DB_NAME"
echo ""

# Função auxiliar
run_sql() {
    sudo -u postgres psql -c "$1" 2>/dev/null || {
        echo "⚠️  Execute manualmente como postgres:"
        echo "   $1"
    }
}

# 1. Criar/atualizar usuário
echo "1️⃣  Configurando usuário $DB_USER..."
run_sql "DROP USER IF EXISTS $DB_USER;"
run_sql "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"
echo "   ✅ Usuário configurado"

# 2. Criar banco de dados
echo "2️⃣  Configurando banco $DB_NAME..."
run_sql "DROP DATABASE IF EXISTS $DB_NAME;"
run_sql "CREATE DATABASE $DB_NAME OWNER $DB_USER;"
run_sql "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
echo "   ✅ Banco configurado"

# 3. Executar migrações
echo "3️⃣  Executando migrações..."
export PGPASSWORD="$DB_PASSWORD"
cd "$(dirname "$0")/.."

MIGRATIONS=(
    "backend/db/migrations/001_init_schema.sql"
    "backend/db/migrations/002_products.sql"
    "backend/db/migrations/003_messaging_custom_fields_timeline.sql"
    "backend/db/migrations/004_pipelines_deals_automation_integrations_files_profile.sql"
    "backend/db/migrations/005_client_mobilechat_management.sql"
)

for migration in "${MIGRATIONS[@]}"; do
    if [ -f "$migration" ]; then
        echo "   Executando $(basename $migration)..."
        psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$migration" > /dev/null 2>&1 || true
    fi
done

# 4. Atualizar .env
echo "4️⃣  Atualizando arquivos .env..."
# Atualizar backend/.env
sed -i "s/^CRM_DB_PORT=.*/CRM_DB_PORT=$DB_PORT/" backend/.env
sed -i "s/^CRM_DB_PASSWORD=.*/CRM_DB_PASSWORD=\"$DB_PASSWORD\"/" backend/.env
# Atualizar api/.env
sed -i "s/^CRM_DB_PORT=.*/CRM_DB_PORT=$DB_PORT/" api/.env
sed -i "s/^CRM_DB_PASSWORD=.*/CRM_DB_PASSWORD=\"$DB_PASSWORD\"/" api/.env

# 5. Testar conexão
echo "5️⃣  Testando conexão..."
if psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT 1;" > /dev/null 2>&1; then
    echo "   ✅ Conexão bem-sucedida!"
else
    echo "   ❌ Erro na conexão"
    exit 1
fi

echo ""
echo "✅ Reconfiguração completa!"
echo ""
echo "📝 Próximos passos:"
echo "  1. Reinicie a API: cd backend && npm start"
echo "  2. Teste: curl http://localhost:3001/health"
echo ""
