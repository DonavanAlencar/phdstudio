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

git_pull() {
    log "Atualizando repositório Git..."
    
    # Sempre fazer fetch primeiro para garantir que temos as últimas referências
    git fetch origin "$GIT_BRANCH" || error "Falha ao fazer fetch do Git"
    
    # Verificar se estamos no branch correto
    CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
    if [ "$CURRENT_BRANCH" != "$GIT_BRANCH" ]; then
        log "Mudando para o branch $GIT_BRANCH..."
        git checkout "$GIT_BRANCH" || error "Falha ao mudar para o branch $GIT_BRANCH"
    fi
    
    # Obter commits locais e remotos
    LOCAL=$(git rev-parse @ 2>/dev/null || echo "")
    REMOTE=$(git rev-parse "origin/$GIT_BRANCH" 2>/dev/null || echo "")
    
    if [ -z "$LOCAL" ] || [ -z "$REMOTE" ]; then
        error "Não foi possível obter referências do Git. Verifique a conexão e o branch."
    fi
    
    # Se já está atualizado, ainda assim garantir que está sincronizado
    if [ "$LOCAL" = "$REMOTE" ]; then
        log "Repositório já está atualizado (local e remoto no mesmo commit)"
        log "Commit atual: $LOCAL"
        # Mesmo atualizado, garantir que não há mudanças locais não commitadas
        if [ -n "$(git status --porcelain)" ]; then
            warning "Há mudanças locais não commitadas. Fazendo stash..."
            git stash || warning "Falha ao fazer stash, continuando..."
        fi
        return 0
    fi
    
    # Verificar se há commits locais não enviados
    BASE=$(git merge-base @ "origin/$GIT_BRANCH" 2>/dev/null || echo "")
    if [ -z "$BASE" ]; then
        error "Não foi possível encontrar base comum entre local e remoto"
    fi
    
    if [ "$LOCAL" = "$BASE" ]; then
        # Local está atrás, fazer pull simples
        log "Atualizações encontradas. Fazendo pull..."
        git pull origin "$GIT_BRANCH" || error "Falha ao fazer pull do Git"
        success "Pull do Git concluído com sucesso"
    elif [ "$REMOTE" = "$BASE" ]; then
        # Local está à frente (commits não enviados)
        warning "Repositório local tem commits não enviados. Fazendo pull com merge..."
        git pull origin "$GIT_BRANCH" --no-rebase || error "Falha ao fazer pull do Git"
        success "Pull do Git concluído com sucesso"
    else
        # Divergência (ambos têm commits diferentes)
        warning "Repositório local e remoto divergiram. Fazendo pull com merge..."
        git pull origin "$GIT_BRANCH" --no-rebase || error "Falha ao fazer pull do Git (divergência)"
        success "Pull do Git concluído com sucesso (merge realizado)"
    fi
    
    # Validar que agora está sincronizado
    LOCAL_AFTER=$(git rev-parse @)
    REMOTE_AFTER=$(git rev-parse "origin/$GIT_BRANCH")
    
    if [ "$LOCAL_AFTER" != "$REMOTE_AFTER" ]; then
        warning "Aviso: Após pull, local e remoto ainda diferem"
        warning "Local: $LOCAL_AFTER"
        warning "Remoto: $REMOTE_AFTER"
        warning "Continuando com deploy, mas pode haver inconsistências"
    else
        success "Repositório sincronizado com sucesso (commit: $LOCAL_AFTER)"
    fi
    
    return 0
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
    
    # SEMPRE fazer git pull antes do deploy para garantir sincronização
    log "Sincronizando código com repositório remoto..."
    git_pull || error "Falha ao sincronizar código do repositório"
    
    log "Código sincronizado. Iniciando processo de deploy..."
    
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

