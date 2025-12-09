#!/bin/bash

# Script de Deploy Automatizado para Easypanel
# Este script faz pull do Git, rebuild da imagem e atualiza o serviço no Easypanel
# Autor: Deploy Automatizado
# Data: 2025-12-09

set -e  # Parar em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configurações
PROJECT_DIR="/root/phdstudio"
GIT_REPO="https://github.com/DonavanAlencar/phdstudio.git"
GIT_BRANCH="main"
SERVICE_NAME="phdstudio"
EASYPANEL_NETWORK="easypanel"
LOG_FILE="/var/log/phdstudio-deploy.log"

# Função para log
log() {
    local message="[$(date +'%Y-%m-%d %H:%M:%S')] $1"
    echo -e "${BLUE}${message}${NC}"
    echo "$message" >> "$LOG_FILE"
}

success() {
    echo -e "${GREEN}✓${NC} $1"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] ✓ $1" >> "$LOG_FILE"
}

error() {
    echo -e "${RED}✗${NC} $1"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] ✗ $1" >> "$LOG_FILE"
    exit 1
}

warning() {
    echo -e "${YELLOW}⚠${NC} $1"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] ⚠ $1" >> "$LOG_FILE"
}

# Verificar se está no diretório correto
check_directory() {
    if [ ! -d "$PROJECT_DIR" ]; then
        error "Diretório do projeto não encontrado: $PROJECT_DIR"
    fi
    cd "$PROJECT_DIR" || error "Não foi possível acessar o diretório: $PROJECT_DIR"
    log "Diretório do projeto: $PROJECT_DIR"
}

# Fazer pull do Git
git_pull() {
    log "Fazendo pull do repositório Git..."
    
    # Verificar se há mudanças remotas
    git fetch origin "$GIT_BRANCH" || error "Falha ao fazer fetch do Git"
    
    LOCAL=$(git rev-parse @)
    REMOTE=$(git rev-parse @{u})
    BASE=$(git merge-base @ @{u})
    
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

# Verificar arquivo .env
check_env() {
    if [ ! -f ".env" ]; then
        warning "Arquivo .env não encontrado. Usando variáveis de ambiente do sistema."
    else
        success "Arquivo .env encontrado"
        # Carregar variáveis do .env
        set -a
        source .env
        set +a
    fi
}

# Encontrar container do Easypanel
find_easypanel_container() {
    log "Procurando container do serviço no Easypanel..."
    
    # Procurar container do serviço phdstudio no Easypanel
    CONTAINER_NAME=$(docker ps --format "{{.Names}}" | grep -E "phdstudio.*phdstudio" | head -1)
    
    if [ -z "$CONTAINER_NAME" ]; then
        error "Container do serviço phdstudio não encontrado no Easypanel"
    fi
    
    success "Container encontrado: $CONTAINER_NAME"
    echo "$CONTAINER_NAME"
}

# Rebuild da imagem via Easypanel
rebuild_image() {
    log "Fazendo rebuild da imagem Docker..."
    
    # O Easypanel gerencia as imagens, então precisamos fazer o build manualmente
    # e depois o Easypanel vai detectar e atualizar
    
    # Carregar variáveis de ambiente
    export GEMINI_API_KEY=${GEMINI_API_KEY:-}
    export VITE_EMAILJS_SERVICE_ID=${VITE_EMAILJS_SERVICE_ID:-}
    export VITE_EMAILJS_TEMPLATE_ID=${VITE_EMAILJS_TEMPLATE_ID:-}
    export VITE_EMAILJS_PUBLIC_KEY=${VITE_EMAILJS_PUBLIC_KEY:-}
    export VITE_RECIPIENT_EMAIL=${VITE_RECIPIENT_EMAIL:-}
    
    # Fazer build da imagem
    if docker build \
        --build-arg GEMINI_API_KEY="$GEMINI_API_KEY" \
        --build-arg VITE_EMAILJS_SERVICE_ID="$VITE_EMAILJS_SERVICE_ID" \
        --build-arg VITE_EMAILJS_TEMPLATE_ID="$VITE_EMAILJS_TEMPLATE_ID" \
        --build-arg VITE_EMAILJS_PUBLIC_KEY="$VITE_EMAILJS_PUBLIC_KEY" \
        --build-arg VITE_RECIPIENT_EMAIL="$VITE_RECIPIENT_EMAIL" \
        -t "easypanel/${SERVICE_NAME}/${SERVICE_NAME}:latest" \
        .; then
        success "Imagem Docker construída com sucesso"
    else
        error "Falha ao construir imagem Docker"
    fi
}

# Atualizar serviço no Easypanel
update_service() {
    log "Atualizando serviço no Easypanel..."
    
    CONTAINER_NAME=$(find_easypanel_container)
    
    # O Easypanel gerencia os serviços via Docker Swarm
    # Precisamos fazer o redeploy do serviço
    
    # Obter informações do serviço
    SERVICE_ID=$(docker inspect "$CONTAINER_NAME" --format '{{index .Config.Labels "com.docker.swarm.service.id"}}' 2>/dev/null || echo "")
    
    if [ -z "$SERVICE_ID" ]; then
        warning "Não foi possível obter ID do serviço. Tentando atualizar via restart do container..."
        docker restart "$CONTAINER_NAME" || error "Falha ao reiniciar container"
        success "Container reiniciado com sucesso"
        return 0
    fi
    
    # Atualizar serviço do Docker Swarm
    SERVICE_NAME_SWARM=$(docker inspect "$CONTAINER_NAME" --format '{{index .Config.Labels "com.docker.swarm.service.name"}}' 2>/dev/null || echo "")
    
    if [ -n "$SERVICE_NAME_SWARM" ]; then
        log "Atualizando serviço Docker Swarm: $SERVICE_NAME_SWARM"
        docker service update --image "easypanel/${SERVICE_NAME}/${SERVICE_NAME}:latest" "$SERVICE_NAME_SWARM" || warning "Falha ao atualizar serviço. Tentando restart..."
        docker restart "$CONTAINER_NAME" || error "Falha ao reiniciar container"
        success "Serviço atualizado com sucesso"
    else
        warning "Serviço não é gerenciado pelo Swarm. Reiniciando container..."
        docker restart "$CONTAINER_NAME" || error "Falha ao reiniciar container"
        success "Container reiniciado com sucesso"
    fi
}

# Verificar status
check_status() {
    log "Verificando status do serviço..."
    sleep 5
    
    CONTAINER_NAME=$(find_easypanel_container)
    
    if docker ps --format "{{.Names}}" | grep -q "$CONTAINER_NAME"; then
        success "Container está rodando"
        
        # Testar se a aplicação está respondendo
        log "Testando aplicação..."
        sleep 3
        if docker exec "$CONTAINER_NAME" curl -s http://localhost > /dev/null 2>&1; then
            success "Aplicação está respondendo corretamente"
        else
            warning "Aplicação pode não estar respondendo ainda. Aguarde alguns segundos."
        fi
    else
        error "Container não está rodando"
    fi
}

# Limpar imagens antigas
cleanup_old_images() {
    log "Limpando imagens antigas..."
    docker image prune -f || warning "Falha ao limpar imagens antigas"
    success "Limpeza concluída"
}

# Função principal
main() {
    echo ""
    echo "=========================================="
    echo "  PHD Studio - Deploy Automatizado Easypanel"
    echo "=========================================="
    echo ""
    
    check_directory
    check_env
    
    # Tentar fazer pull do Git
    if git_pull; then
        log "Mudanças detectadas. Iniciando deploy..."
        rebuild_image
        update_service
        check_status
        cleanup_old_images
        
        echo ""
        echo "=========================================="
        success "Deploy automatizado concluído com sucesso!"
        echo "=========================================="
        echo ""
        log "Aplicação disponível em:"
        log "  - Easypanel: https://phdstudio-phdstudio.topuph.easypanel.host/"
        log "  - Domínio: https://phdstudio.com.br"
        echo ""
    else
        log "Nenhuma mudança detectada. Deploy não necessário."
    fi
}

# Executar
main "$@"

