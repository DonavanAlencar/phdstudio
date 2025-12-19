#!/bin/bash

# Script para configurar ngrok tunnel para o webhook do chat
# Autor: PHD Studio
# Uso: ./scripts/setup-ngrok-tunnel.sh

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

WEBHOOK_PORT=5679
WEBHOOK_HOST=148.230.79.105
SERVICE_NAME="ngrok-webhook"

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

# Verificar se ngrok está instalado
check_ngrok() {
    if ! command -v ngrok &> /dev/null; then
        error "ngrok não está instalado"
        echo ""
        echo "Instale ngrok:"
        echo "  wget https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz"
        echo "  tar -xzf ngrok-v3-stable-linux-amd64.tgz"
        echo "  sudo mv ngrok /usr/local/bin/"
        echo ""
        echo "Ou via snap:"
        echo "  sudo snap install ngrok"
        exit 1
    fi
    success "ngrok encontrado: $(ngrok version 2>&1 | head -1)"
}

# Verificar autenticação
check_auth() {
    if ! ngrok config check &> /dev/null; then
        warning "ngrok não está autenticado"
        echo ""
        echo "1. Crie uma conta em: https://dashboard.ngrok.com/signup"
        echo "2. Obtenha seu authtoken em: https://dashboard.ngrok.com/get-started/your-authtoken"
        echo "3. Execute: ngrok config add-authtoken <SEU_TOKEN>"
        exit 1
    fi
    success "ngrok autenticado"
}

# Verificar se o servidor está acessível
check_server() {
    log "Verificando se o servidor está acessível..."
    if curl -s --connect-timeout 5 "http://${WEBHOOK_HOST}:${WEBHOOK_PORT}" > /dev/null 2>&1; then
        success "Servidor acessível em http://${WEBHOOK_HOST}:${WEBHOOK_PORT}"
    else
        warning "Não foi possível conectar ao servidor (pode estar normal se o endpoint requer POST)"
        echo "   Tentando com POST..."
        if curl -s --connect-timeout 5 -X POST "http://${WEBHOOK_HOST}:${WEBHOOK_PORT}/webhook/test" > /dev/null 2>&1; then
            success "Servidor responde a requisições POST"
        else
            error "Servidor não está acessível. Verifique se está rodando."
            exit 1
        fi
    fi
}

# Criar serviço systemd
create_service() {
    log "Criando serviço systemd..."
    
    cat > /etc/systemd/system/${SERVICE_NAME}.service <<EOF
[Unit]
Description=ngrok tunnel for PHD Studio webhook
After=network.target

[Service]
Type=simple
User=root
ExecStart=/usr/local/bin/ngrok http ${WEBHOOK_HOST}:${WEBHOOK_PORT} --log=stdout
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

    success "Serviço criado: /etc/systemd/system/${SERVICE_NAME}.service"
}

# Iniciar serviço
start_service() {
    log "Recarregando systemd..."
    systemctl daemon-reload
    
    log "Iniciando serviço..."
    systemctl enable ${SERVICE_NAME}
    systemctl start ${SERVICE_NAME}
    
    sleep 3
    
    if systemctl is-active --quiet ${SERVICE_NAME}; then
        success "Serviço iniciado com sucesso"
    else
        error "Falha ao iniciar serviço"
        systemctl status ${SERVICE_NAME}
        exit 1
    fi
}

# Obter URL do tunnel
get_tunnel_url() {
    log "Aguardando tunnel estabelecer conexão..."
    sleep 5
    
    # Tentar obter URL via API do ngrok
    TUNNEL_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"https://[^"]*' | head -1 | cut -d'"' -f4)
    
    if [ -z "$TUNNEL_URL" ]; then
        warning "Não foi possível obter URL automaticamente"
        echo ""
        echo "Execute manualmente:"
        echo "  curl http://localhost:4040/api/tunnels"
        echo ""
        echo "Ou verifique os logs:"
        echo "  journalctl -u ${SERVICE_NAME} -f"
        return
    fi
    
    success "Tunnel URL: ${TUNNEL_URL}"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  URL do Tunnel: ${TUNNEL_URL}"
    echo "  URL completa do webhook: ${TUNNEL_URL}/webhook/32f58b69-ef50-467f-b884-50e72a5eefa2"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Atualize o arquivo .env:"
    echo "  VITE_CHAT_WEBHOOK_URL=${TUNNEL_URL}/webhook/32f58b69-ef50-467f-b884-50e72a5eefa2"
    echo ""
}

# Menu principal
main() {
    echo ""
    echo "=========================================="
    echo "  Configuração ngrok Tunnel para Webhook"
    echo "=========================================="
    echo ""
    
    check_ngrok
    check_auth
    check_server
    echo ""
    
    read -p "Deseja criar um serviço systemd para manter o tunnel rodando? (s/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        create_service
        start_service
        get_tunnel_url
    else
        echo ""
        echo "Para iniciar o tunnel manualmente:"
        echo "  ngrok http ${WEBHOOK_HOST}:${WEBHOOK_PORT}"
        echo ""
        echo "Ou use screen/tmux para manter rodando em background:"
        echo "  screen -S ngrok"
        echo "  ngrok http ${WEBHOOK_HOST}:${WEBHOOK_PORT}"
        echo "  (Pressione Ctrl+A depois D para desanexar)"
    fi
    
    echo ""
    success "Configuração concluída!"
    echo ""
}

main

