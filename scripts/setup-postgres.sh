#!/bin/bash

# Script de Setup do PostgreSQL para PHD Studio CRM
# Este script configura o banco de dados do zero

set -e

echo "🔧 Configurando PostgreSQL para PHD Studio CRM..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configurações padrão (podem ser sobrescritas por variáveis de ambiente)
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_USER=${DB_USER:-phd_crm_user}
DB_PASSWORD=${DB_PASSWORD:-PhdCrm@2024!Strong#Pass}
DB_NAME=${DB_NAME:-phd_crm}
POSTGRES_USER=${POSTGRES_USER:-postgres}

# Função para executar comandos como postgres
run_as_postgres() {
    sudo -u postgres psql -c "$1" 2>/dev/null || psql -U $POSTGRES_USER -c "$1" 2>/dev/null || {
        echo -e "${RED}❌ Erro ao executar como postgres. Tente executar manualmente:${NC}"
        echo "psql -U postgres -c \"$1\""
        return 1
    }
}

# Função para executar comandos como usuário específico
run_as_user() {
    local user=$1
    local cmd=$2
    sudo -u postgres psql -c "$cmd" 2>/dev/null || psql -U postgres -c "$cmd" 2>/dev/null || {
        echo -e "${YELLOW}⚠️  Não foi possível executar como postgres, tentando conexão direta...${NC}"
        PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "$cmd" 2>/dev/null || true
    }
}

echo -e "${YELLOW}📋 Configurações:${NC}"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  User: $DB_USER"
echo "  Database: $DB_NAME"
echo ""

# Passo 1: Criar usuário se não existir
echo -e "${YELLOW}1️⃣  Verificando/criando usuário $DB_USER...${NC}"
USER_EXISTS=$(run_as_postgres "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER';" 2>/dev/null | grep -c "1" || echo "0")
if [ "$USER_EXISTS" -eq "0" ]; then
    echo "   Criando usuário $DB_USER..."
    run_as_postgres "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';" || {
        echo -e "${RED}❌ Erro ao criar usuário. Execute manualmente:${NC}"
        echo "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"
        exit 1
    }
    echo -e "${GREEN}   ✅ Usuário criado${NC}"
else
    echo -e "${GREEN}   ✅ Usuário já existe${NC}"
    # Atualizar senha
    echo "   Atualizando senha..."
    run_as_postgres "ALTER USER $DB_USER WITH PASSWORD '$DB_PASSWORD';" 2>/dev/null || true
fi

# Passo 2: Criar banco de dados se não existir
echo -e "${YELLOW}2️⃣  Verificando/criando banco de dados $DB_NAME...${NC}"
DB_EXISTS=$(run_as_postgres "SELECT 1 FROM pg_database WHERE datname='$DB_NAME';" 2>/dev/null | grep -c "1" || echo "0")
if [ "$DB_EXISTS" -eq "0" ]; then
    echo "   Criando banco de dados $DB_NAME..."
    run_as_postgres "CREATE DATABASE $DB_NAME OWNER $DB_USER;" || {
        echo -e "${RED}❌ Erro ao criar banco. Execute manualmente:${NC}"
        echo "CREATE DATABASE $DB_NAME OWNER $DB_USER;"
        exit 1
    }
    echo -e "${GREEN}   ✅ Banco criado${NC}"
else
    echo -e "${GREEN}   ✅ Banco já existe${NC}"
fi

# Passo 3: Dar permissões ao usuário
echo -e "${YELLOW}3️⃣  Configurando permissões...${NC}"
run_as_postgres "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;" 2>/dev/null || true
run_as_postgres "ALTER DATABASE $DB_NAME OWNER TO $DB_USER;" 2>/dev/null || true
echo -e "${GREEN}   ✅ Permissões configuradas${NC}"

# Passo 4: Executar migrações
echo -e "${YELLOW}4️⃣  Executando migrações do banco de dados...${NC}"
MIGRATIONS_DIR="backend/db/migrations"

if [ ! -d "$MIGRATIONS_DIR" ]; then
    echo -e "${RED}❌ Diretório de migrações não encontrado: $MIGRATIONS_DIR${NC}"
    exit 1
fi

# Listar arquivos de migração em ordem
MIGRATION_FILES=(
    "001_init_schema.sql"
    "002_products.sql"
    "003_messaging_custom_fields_timeline.sql"
    "004_pipelines_deals_automation_integrations_files_profile.sql"
    "005_client_mobilechat_management.sql"
)

for migration in "${MIGRATION_FILES[@]}"; do
    if [ -f "$MIGRATIONS_DIR/$migration" ]; then
        echo "   Executando $migration..."
        PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$MIGRATIONS_DIR/$migration" 2>&1 | grep -v "already exists" | grep -v "does not exist" || true
        echo -e "${GREEN}   ✅ $migration concluída${NC}"
    else
        echo -e "${YELLOW}   ⚠️  Arquivo não encontrado: $MIGRATIONS_DIR/$migration${NC}"
    fi
done

# Passo 5: Atualizar arquivo .env
echo -e "${YELLOW}5️⃣  Atualizando arquivo .env...${NC}"
ENV_FILE="api/.env"

if [ -f "$ENV_FILE" ]; then
    # Backup do arquivo original
    cp "$ENV_FILE" "$ENV_FILE.backup.$(date +%Y%m%d_%H%M%S)"
    
    # Atualizar variáveis do PostgreSQL
    sed -i "s/^CRM_DB_HOST=.*/CRM_DB_HOST=$DB_HOST/" "$ENV_FILE"
    sed -i "s/^CRM_DB_PORT=.*/CRM_DB_PORT=$DB_PORT/" "$ENV_FILE"
    sed -i "s/^CRM_DB_USER=.*/CRM_DB_USER=$DB_USER/" "$ENV_FILE"
    sed -i "s/^CRM_DB_PASSWORD=.*/CRM_DB_PASSWORD=$DB_PASSWORD/" "$ENV_FILE"
    sed -i "s/^CRM_DB_NAME=.*/CRM_DB_NAME=$DB_NAME/" "$ENV_FILE"
    
    echo -e "${GREEN}   ✅ Arquivo .env atualizado${NC}"
    echo -e "${YELLOW}   📝 Backup salvo como: $ENV_FILE.backup.*${NC}"
else
    echo -e "${YELLOW}   ⚠️  Arquivo .env não encontrado em $ENV_FILE${NC}"
fi

# Passo 6: Testar conexão
echo -e "${YELLOW}6️⃣  Testando conexão...${NC}"
TEST_RESULT=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT 1;" 2>&1)
if [ $? -eq 0 ]; then
    echo -e "${GREEN}   ✅ Conexão bem-sucedida!${NC}"
else
    echo -e "${RED}   ❌ Erro na conexão:${NC}"
    echo "$TEST_RESULT"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Setup completo!${NC}"
echo ""
echo -e "${YELLOW}📝 Próximos passos:${NC}"
echo "  1. Verifique o arquivo api/.env"
echo "  2. Reinicie a API: npm start (no diretório backend)"
echo "  3. Teste a conexão: curl http://localhost:3001/health"
echo ""
