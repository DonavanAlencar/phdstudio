#!/bin/bash
# Script de verificação de prontidão para deploy
# Verifica se todos os componentes estão prontos

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

log() {
    echo -e "${BLUE}[CHECK]${NC} $1"
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

ERRORS=0

log "Verificando prontidão para deploy..."

# 1. Verificar Dockerfiles
log "Verificando Dockerfiles..."
if [ -f "$ROOT_DIR/deploy/docker/config/Dockerfile" ]; then
    success "Dockerfile do frontend encontrado"
else
    error "Dockerfile do frontend não encontrado"
    ERRORS=$((ERRORS + 1))
fi

if [ -f "$ROOT_DIR/deploy/docker/config/api.Dockerfile" ]; then
    success "Dockerfile da API encontrado"
else
    error "Dockerfile da API não encontrado"
    ERRORS=$((ERRORS + 1))
fi

# 2. Verificar docker-compose
log "Verificando docker-compose.yml..."
if [ -f "$ROOT_DIR/docker-compose.yml" ]; then
    success "docker-compose.yml encontrado"
else
    error "docker-compose.yml não encontrado"
    ERRORS=$((ERRORS + 1))
fi

# 3. Verificar migrations
log "Verificando migrations do banco de dados..."
MIGRATIONS_DIR="$ROOT_DIR/backend/db/migrations"
REQUIRED_MIGRATIONS=(
    "001_init_schema.sql"
    "002_products.sql"
    "003_messaging_custom_fields_timeline.sql"
    "004_pipelines_deals_automation_integrations_files_profile.sql"
    "005_client_mobilechat_management.sql"
    "006_fix_sessions_token_length.sql"
)

for migration in "${REQUIRED_MIGRATIONS[@]}"; do
    if [ -f "$MIGRATIONS_DIR/$migration" ]; then
        success "Migration $migration encontrada"
    else
        error "Migration $migration não encontrada"
        ERRORS=$((ERRORS + 1))
    fi
done

# 4. Verificar script de inicialização do banco
log "Verificando script de inicialização do banco..."
if [ -f "$ROOT_DIR/backend/db/init-db.sh" ]; then
    if [ -x "$ROOT_DIR/backend/db/init-db.sh" ]; then
        success "Script init-db.sh encontrado e executável"
    else
        warning "Script init-db.sh encontrado mas não é executável"
        log "Execute: chmod +x $ROOT_DIR/backend/db/init-db.sh"
    fi
else
    error "Script init-db.sh não encontrado"
    ERRORS=$((ERRORS + 1))
fi

# 5. Verificar package.json
log "Verificando package.json..."
if [ -f "$ROOT_DIR/package.json" ]; then
    success "package.json do frontend encontrado"
else
    error "package.json do frontend não encontrado"
    ERRORS=$((ERRORS + 1))
fi

if [ -f "$ROOT_DIR/backend/package.json" ]; then
    success "package.json do backend encontrado"
else
    error "package.json do backend não encontrado"
    ERRORS=$((ERRORS + 1))
fi

# 6. Verificar arquivos de ambiente
log "Verificando arquivos .env.example..."
if [ -f "$ROOT_DIR/.env.example" ]; then
    success ".env.example encontrado"
else
    warning ".env.example não encontrado"
fi

if [ -f "$ROOT_DIR/deploy/config/shared/.env.example" ]; then
    success "deploy/config/shared/.env.example encontrado"
else
    warning "deploy/config/shared/.env.example não encontrado"
fi

# 7. Verificar estrutura de diretórios
log "Verificando estrutura de diretórios..."
REQUIRED_DIRS=(
    "$ROOT_DIR/src"
    "$ROOT_DIR/backend"
    "$ROOT_DIR/backend/routes"
    "$ROOT_DIR/backend/utils"
    "$ROOT_DIR/backend/db/migrations"
    "$ROOT_DIR/deploy/docker/config"
)

for dir in "${REQUIRED_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        success "Diretório $(basename $dir) encontrado"
    else
        error "Diretório $dir não encontrado"
        ERRORS=$((ERRORS + 1))
    fi
done

# 8. Verificar arquivos críticos do backend
log "Verificando arquivos críticos do backend..."
if [ -f "$ROOT_DIR/backend/server.js" ]; then
    success "server.js encontrado"
else
    error "server.js não encontrado"
    ERRORS=$((ERRORS + 1))
fi

if [ -f "$ROOT_DIR/backend/utils/db.js" ]; then
    success "utils/db.js encontrado"
else
    error "utils/db.js não encontrado"
    ERRORS=$((ERRORS + 1))
fi

# 9. Verificar nginx config
log "Verificando configuração do nginx..."
if [ -f "$ROOT_DIR/deploy/docker/config/nginx-init.conf" ]; then
    success "nginx-init.conf encontrado"
else
    warning "nginx-init.conf não encontrado"
fi

# Resumo
echo ""
if [ $ERRORS -eq 0 ]; then
    success "Todos os componentes estão prontos para deploy!"
    log "Você pode prosseguir com o deploy"
    exit 0
else
    error "Encontrados $ERRORS erro(s). Corrija antes de fazer deploy."
    exit 1
fi
