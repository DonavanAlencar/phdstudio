#!/bin/bash
# Script de inicialização do banco de dados PostgreSQL
# Executa todas as migrations em ordem

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Carregar variáveis de ambiente
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Configurações do banco
DB_HOST=${CRM_DB_HOST:-localhost}
DB_PORT=${CRM_DB_PORT:-5432}
DB_USER=${CRM_DB_USER:-phd_crm_user}
DB_NAME=${CRM_DB_NAME:-phd_crm}
DB_PASSWORD=${CRM_DB_PASSWORD}

# Diretório das migrations
MIGRATIONS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/migrations" && pwd)"

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✓${NC} $1"
}

error() {
    echo -e "${RED}✗${NC} $1"
}

warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Verificar se psql está disponível
if ! command -v psql &> /dev/null; then
    error "psql não está instalado. Instale o PostgreSQL client."
    exit 1
fi

# Verificar conexão com o banco
log "Verificando conexão com o banco de dados..."
export PGPASSWORD="$DB_PASSWORD"
if ! psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" > /dev/null 2>&1; then
    error "Não foi possível conectar ao banco de dados"
    error "Host: $DB_HOST:$DB_PORT"
    error "User: $DB_USER"
    error "Database: $DB_NAME"
    exit 1
fi
success "Conexão com o banco de dados estabelecida"

# Executar migrations em ordem
log "Executando migrations do banco de dados..."

MIGRATIONS=(
    "001_init_schema.sql"
    "002_products.sql"
    "003_messaging_custom_fields_timeline.sql"
    "004_pipelines_deals_automation_integrations_files_profile.sql"
    "005_client_mobilechat_management.sql"
    "006_fix_sessions_token_length.sql"
    "007_global_chat_settings.sql"
)

for migration in "${MIGRATIONS[@]}"; do
    migration_file="$MIGRATIONS_DIR/$migration"
    if [ ! -f "$migration_file" ]; then
        error "Arquivo de migration não encontrado: $migration_file"
        exit 1
    fi
    
    log "Executando: $migration"
    if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$migration_file" > /dev/null 2>&1; then
        success "Migration $migration executada com sucesso"
    else
        error "Erro ao executar migration $migration"
        # Em caso de erro, mostrar o último erro do psql
        psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$migration_file" 2>&1 | tail -5
        exit 1
    fi
done

success "Todas as migrations foram executadas com sucesso!"
log "Banco de dados inicializado e pronto para uso"
