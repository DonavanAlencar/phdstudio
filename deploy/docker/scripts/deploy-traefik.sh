#!/bin/bash

# Script de Deploy Automático para PHD Studio
# Autor: Deploy Script
# Data: $(date +%Y-%m-%d)

set -e  # Parar em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/../.." && pwd)"

# Configurações
IMAGE_NAME="phdstudio"
CONTAINER_NAME="phdstudio-app"
PORT_HTTP="80"
PORT_HTTPS="443"
COMPOSE_FILE="${ROOT_DIR}/deploy/docker/config/docker-compose.yml"
ENV_FILE="${ROOT_DIR}/deploy/config/shared/.env"

# Verificar se Traefik está rodando
check_traefik() {
    if docker ps --format '{{.Names}}' | grep -q "traefik"; then
        log "Traefik detectado - configurando para phdstudio.com.br"
        success "Configuração: phdstudio.com.br via Traefik (portas 80/443)"
    else
        error "Traefik não encontrado! A aplicação requer Traefik para funcionar."
        exit 1
    fi
}

# Verificar arquivo .env
check_env() {
    if [ ! -f "$ENV_FILE" ]; then
        warning "Arquivo $ENV_FILE não encontrado"
        warning "Crie a partir do template: cp deploy/config/shared/.env.example deploy/config/shared/.env"
        exit 1
    else
        success "Arquivo .env encontrado"
    fi
}

# Função para log
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

# Verificar se Docker está instalado
check_docker() {
    log "Verificando instalação do Docker..."
    if ! command -v docker &> /dev/null; then
        error "Docker não está instalado. Por favor, instale o Docker primeiro."
        exit 1
    fi
    success "Docker encontrado: $(docker --version)"
    
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        error "Docker Compose não está instalado."
        exit 1
    fi
    success "Docker Compose encontrado"
}

# Parar e remover container existente
stop_existing() {
    log "Verificando containers existentes..."
    if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        warning "Container ${CONTAINER_NAME} encontrado. Parando e removendo..."
        docker stop ${CONTAINER_NAME} 2>/dev/null || true
        docker rm ${CONTAINER_NAME} 2>/dev/null || true
        success "Container antigo removido"
    else
        success "Nenhum container existente encontrado"
    fi
}

# Remover imagens antigas (opcional)
cleanup_images() {
    log "Limpando imagens antigas..."
    docker image prune -f
    success "Limpeza concluída"
}

# Build da imagem
build_image() {
    log "Construindo imagem Docker..."
    if docker compose -f "$COMPOSE_FILE" build --no-cache; then
        success "Imagem construída com sucesso"
    else
        error "Falha ao construir imagem"
        exit 1
    fi
}

# Deploy com docker-compose
deploy() {
    log "Iniciando deploy..."
    if docker compose -f "$COMPOSE_FILE" up -d; then
        success "Deploy concluído com sucesso"
    else
        error "Falha no deploy"
        exit 1
    fi
}

# Verificar status
check_status() {
    log "Verificando status do container..."
    sleep 3
    if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        success "Container está rodando"
        log "Aplicação disponível em:"
        log "  - HTTPS: https://phdstudio.com.br"
        log "  - HTTP:  http://phdstudio.com.br (redireciona para HTTPS)"
        success "SSL automático via Traefik"
        
        # Verificar saúde
        log "Aplicação configurada via Traefik"
        log "Acesse após configurar DNS: https://phdstudio.com.br"
    else
        error "Container não está rodando"
        docker logs ${CONTAINER_NAME}
        exit 1
    fi
}

# Mostrar logs
show_logs() {
    log "Últimas linhas do log:"
    docker logs --tail 50 ${CONTAINER_NAME}
}

# Menu principal
main() {
    echo ""
    echo "=========================================="
    echo "  PHD Studio - Deploy Automático"
    echo "=========================================="
    echo ""
    
    check_docker
    check_env
    check_traefik
    stop_existing
    
    # Perguntar se deseja limpar imagens
    read -p "Deseja limpar imagens antigas? (s/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        cleanup_images
    fi
    
    build_image
    deploy
    check_status
    
    echo ""
    echo "=========================================="
    success "Deploy concluído com sucesso!"
    echo "=========================================="
    echo ""
    echo "Comandos úteis:"
    echo "  Ver logs:        docker logs -f ${CONTAINER_NAME}"
    echo "  Parar:           docker stop ${CONTAINER_NAME}"
    echo "  Iniciar:         docker start ${CONTAINER_NAME}"
    echo "  Reiniciar:       docker restart ${CONTAINER_NAME}"
    echo "  Remover:         docker compose down"
    echo ""
    echo "Configurar SSL:"
    echo "  ./ssl-setup.sh seu-dominio.com seu-email@exemplo.com"
    echo ""
    
    read -p "Deseja ver os logs agora? (s/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        show_logs
    fi
}

# Executar
main
