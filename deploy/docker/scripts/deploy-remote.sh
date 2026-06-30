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

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/../../.." && pwd)"

# Configurações
PROJECT_DIR="${PROJECT_DIR_OVERRIDE:-$ROOT_DIR}"
GIT_BRANCH="main"
COMPOSE_FILE="${ROOT_DIR}/deploy/docker/config/docker-compose.yml"
ENV_FILE="${ROOT_DIR}/deploy/config/shared/.env"
CONTAINER_NAME="phdstudio-app"
HEALTH_CHECK_URL="${HEALTH_CHECK_URL:-https://phdstudio.com.br/}"
HEALTH_CHECK_RETRIES="${HEALTH_CHECK_RETRIES:-12}"
HEALTH_CHECK_INTERVAL="${HEALTH_CHECK_INTERVAL:-5}"

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
    ENV_EXAMPLE="${ROOT_DIR}/deploy/config/shared/.env.example"
    ENV_DIR="$(dirname "$ENV_FILE")"
    
    if [ ! -f "$ENV_FILE" ]; then
        warning "Arquivo $ENV_FILE não encontrado"
        
        # Tentar criar a partir do .env.example se existir
        if [ -f "$ENV_EXAMPLE" ]; then
            log "Criando arquivo .env a partir do .env.example..."
            
            # Garantir que o diretório existe
            mkdir -p "$ENV_DIR" || {
                warning "Não foi possível criar o diretório $ENV_DIR"
                warning "O deploy continuará, mas configure as variáveis de ambiente manualmente se necessário"
            }
            
            cp "$ENV_EXAMPLE" "$ENV_FILE" || {
                warning "Não foi possível criar $ENV_FILE a partir do exemplo"
                warning "O deploy continuará, mas configure as variáveis de ambiente manualmente se necessário"
            }
            
            if [ -f "$ENV_FILE" ]; then
                success "Arquivo $ENV_FILE criado a partir do exemplo"
                warning "⚠️ IMPORTANTE: Configure as variáveis de ambiente em $ENV_FILE antes de usar em produção"
            fi
        else
            warning "Arquivo exemplo $ENV_EXAMPLE também não encontrado"
            warning "O deploy continuará, mas configure as variáveis de ambiente manualmente se necessário"
        fi
    else
        success "Arquivo $ENV_FILE encontrado"
    fi
    
    # Carregar variáveis do .env se existir (agora ou após criação)
    if [ -f "$ENV_FILE" ]; then
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

# Espelha origin/main (ou origin/master) de forma determinística.
# Não utiliza git pull — suporta histórico reescrito (amend, rebase, force push).
sync_to_remote() {
    local BRANCH=""

    log "Buscando referências remotas..."
    git fetch origin || error "Falha ao fazer fetch do origin"

    if git show-ref --verify --quiet refs/remotes/origin/main; then
        BRANCH="main"
    elif git show-ref --verify --quiet refs/remotes/origin/master; then
        BRANCH="master"
    else
        error "Nenhum branch origin/main ou origin/master encontrado após fetch"
    fi

    GIT_BRANCH="$BRANCH"
    log "Branch alvo: $BRANCH (origin é fonte de verdade)"

    if git show-ref --verify --quiet "refs/heads/$BRANCH"; then
        git checkout "$BRANCH" || error "Falha ao fazer checkout de $BRANCH"
    else
        git checkout -B "$BRANCH" "origin/$BRANCH" || error "Falha ao criar branch local $BRANCH"
    fi

    log "Sincronizando HEAD com origin/$BRANCH (reset --hard)..."
    git reset --hard "origin/$BRANCH" || error "Falha ao resetar para origin/$BRANCH"

    log "Removendo artefatos locais não rastreados..."
    git clean -fd

    LOCAL=$(git rev-parse HEAD)
    REMOTE=$(git rev-parse "origin/$BRANCH")

    if [ "$LOCAL" != "$REMOTE" ]; then
        error "Sincronização falhou: HEAD ($LOCAL) != origin/$BRANCH ($REMOTE)"
    fi

    success "Repositório espelhado em origin/$BRANCH"
    log "Commit atual: $(git log -1 --oneline)"
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
    if PROJECT_ROOT="$ROOT_DIR" docker compose -f "$COMPOSE_FILE" build; then
        success "Imagem construída com sucesso"
    else
        error "Falha ao construir imagem"
    fi
}

deploy() {
    log "Iniciando deploy (docker compose up -d)..."
    if PROJECT_ROOT="$ROOT_DIR" docker compose -f "$COMPOSE_FILE" up -d; then
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

health_check_http() {
    log "Health check HTTP da Landing: $HEALTH_CHECK_URL"

    if ! command -v curl &> /dev/null; then
        error "curl não está instalado — necessário para health check HTTP"
    fi

    local attempt=1
    while [ "$attempt" -le "$HEALTH_CHECK_RETRIES" ]; do
        HTTP_CODE=$(curl -sS -o /tmp/phd-health-check-body.html -w "%{http_code}" \
            --max-time 20 \
            -L \
            "$HEALTH_CHECK_URL" 2>/dev/null || echo "000")

        if [ "$HTTP_CODE" = "200" ] && grep -qi "phd" /tmp/phd-health-check-body.html 2>/dev/null; then
            success "Landing respondeu HTTP 200 com conteúdo válido (tentativa $attempt/$HEALTH_CHECK_RETRIES)"
            rm -f /tmp/phd-health-check-body.html
            return 0
        fi

        warning "Tentativa $attempt/$HEALTH_CHECK_RETRIES: HTTP $HTTP_CODE — aguardando ${HEALTH_CHECK_INTERVAL}s..."
        sleep "$HEALTH_CHECK_INTERVAL"
        attempt=$((attempt + 1))
    done

    rm -f /tmp/phd-health-check-body.html
    error "Health check HTTP falhou após $HEALTH_CHECK_RETRIES tentativas em $HEALTH_CHECK_URL"
}

cleanup_images() {
    log "Limpando imagens antigas (docker image prune -f)..."
    docker image prune -f || warning "Falha ao limpar imagens antigas"
    success "Limpeza concluída"
}

block_vercel() {
    log "Verificando bloqueio de Vercel..."
    if [ -f "${ROOT_DIR}/scripts/block-vercel.sh" ]; then
        bash "${ROOT_DIR}/scripts/block-vercel.sh" || warning "Aviso: Verificação do Vercel falhou, mas continuando..."
    else
        warning "Script de bloqueio do Vercel não encontrado"
    fi
}

main() {
    echo ""
    echo "=========================================="
    echo "  PHD Studio - Deploy Remoto (sem Easypanel)"
    echo "=========================================="
    echo ""
    
    check_directory
    block_vercel
    check_docker
    check_env
    check_traefik
    
    log "Sincronizando código com origin (espelho determinístico)..."
    sync_to_remote || error "Falha ao sincronizar código do repositório"

    log "Código sincronizado. Iniciando processo de deploy..."

    stop_existing
    build_image
    deploy
    check_status
    health_check_http
    cleanup_images
    
    echo ""
    echo "=========================================="
    success "Deploy remoto concluído com sucesso!"
    echo "=========================================="
    echo ""
}

main "$@"

