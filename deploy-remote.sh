#!/bin/bash

# Deploy remoto automático (sem Easypanel)
# - Atualiza o código via Git
# - Faz build da imagem Docker
# - Sobe o serviço com docker compose

set -e  # Parar em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configurações
PROJECT_DIR="/root/phdstudio"
GIT_BRANCH="main"
COMPOSE_FILE="docker-compose.yml"
ENV_FILE=".env"
CONTAINER_NAME="phdstudio-app"

# Funções de log
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✓${NC} $1"
}

error() {
    echo -e "${RED}✗${NC} $1"
    exit 1
}

warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

check_directory() {
    if [ ! -d "$PROJECT_DIR" ]; then
        error "Diretório do projeto não encontrado: $PROJECT_DIR"
    fi
    cd "$PROJECT_DIR" || error "Não foi possível acessar o diretório: $PROJECT_DIR"
    log "Diretório do projeto: $PROJECT_DIR"
}

check_docker() {
    log "Verificando instalação do Docker..."
    if ! command -v docker &> /dev/null; then
        error "Docker não está instalado. Por favor, instale o Docker primeiro."
    fi
    success "Docker encontrado: $(docker --version)"
    
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        error "Docker Compose não está instalado."
    fi
    success "Docker Compose encontrado"
}

check_env() {
    if [ ! -f "$ENV_FILE" ]; then
        warning "Arquivo $ENV_FILE não encontrado. Continuando sem carregar variáveis adicionais."
    else
        success "Arquivo $ENV_FILE encontrado"
        # Carregar variáveis do .env
        set -a
        # shellcheck source=/dev/null
        source "$ENV_FILE"
        set +a
    fi
}

check_traefik() {
    if docker ps --format '{{.Names}}' | grep -q "traefik"; then
        log "Traefik detectado - usando configuração padrão do docker-compose.yml"
        success "Traefik OK (proxy reverso ativo)"
    else
        warning "Traefik não encontrado. Certifique-se de que o proxy reverso/porta esteja configurado corretamente."
    fi
}

git_pull() {
    log "Atualizando repositório Git..."
    
    git fetch origin "$GIT_BRANCH" || error "Falha ao fazer fetch do Git"
    
    LOCAL=$(git rev-parse @)
    REMOTE=$(git rev-parse "origin/$GIT_BRANCH")
    BASE=$(git merge-base @ "origin/$GIT_BRANCH")
    
    if [ "$LOCAL" = "$REMOTE" ]; then
        warning "Repositório já está atualizado. Nenhuma mudança detectada."
        return 1
    elif [ "$LOCAL" = "$BASE" ]; then
        log "Atualizações encontradas. Fazendo pull..."
        git pull origin "$GIT_BRANCH" || error "Falha ao fazer pull do Git"
        success "Pull do Git concluído com sucesso"
        return 0
    else
        warning "Repositório local tem commits não enviados. Fazendo pull com merge..."
        git pull origin "$GIT_BRANCH" || error "Falha ao fazer pull do Git"
        success "Pull do Git concluído com sucesso"
        return 0
    fi
}

stop_existing() {
    log "Verificando containers existentes..."
    if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        warning "Container ${CONTAINER_NAME} encontrado. Parando e removendo..."
        docker stop "${CONTAINER_NAME}" 2>/dev/null || true
        docker rm "${CONTAINER_NAME}" 2>/dev/null || true
        success "Container antigo removido"
    else
        success "Nenhum container existente encontrado"
    fi
}

build_image() {
    log "Construindo imagem Docker (docker compose build)..."
    if docker compose -f "$COMPOSE_FILE" build; then
        success "Imagem construída com sucesso"
    else
        error "Falha ao construir imagem"
    fi
}

deploy() {
    log "Iniciando deploy (docker compose up -d)..."
    if docker compose -f "$COMPOSE_FILE" up -d; then
        success "Deploy concluído com sucesso"
    else
        error "Falha no deploy"
    fi
}

check_status() {
    log "Verificando status do container..."
    sleep 3
    if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        success "Container ${CONTAINER_NAME} está rodando"
    else
        warning "Container ${CONTAINER_NAME} não está rodando. Verifique os logs:"
        docker ps -a
        docker logs "${CONTAINER_NAME}" || true
        exit 1
    fi
}

cleanup_images() {
    log "Limpando imagens antigas (docker image prune -f)..."
    docker image prune -f || warning "Falha ao limpar imagens antigas"
    success "Limpeza concluída"
}

main() {
    echo ""
    echo "=========================================="
    echo "  PHD Studio - Deploy Remoto (sem Easypanel)"
    echo "=========================================="
    echo ""
    
    check_directory
    check_docker
    check_env
    check_traefik
    
    if git_pull; then
        log "Mudanças detectadas. Iniciando processo de deploy..."
    else
        log "Nenhuma mudança detectada. Nada para implantar."
        exit 0
    fi
    
    stop_existing
    build_image
    deploy
    check_status
    cleanup_images
    
    echo ""
    echo "=========================================="
    success "Deploy remoto concluído com sucesso!"
    echo "=========================================="
    echo ""
}

main "$@"


