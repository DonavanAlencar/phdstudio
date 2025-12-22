#!/bin/bash

# Script para atualizar automaticamente a URL do webhook n8n no projeto
# Autor: PHD Studio
# Uso: ./scripts/update-ngrok-webhook.sh

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

WEBHOOK_ID="32f58b69-ef50-467f-b884-50e72a5eefa2"
ENV_FILE="/root/phdstudio/.env"

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

# Obter URL atual do ngrok n8n
get_ngrok_url() {
    log "Obtendo URL atual do túnel ngrok n8n..."
    
    NGROK_URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | \
        python3 -c "import sys, json; \
        data=json.load(sys.stdin); \
        tunnels=data.get('tunnels', []); \
        n8n_tunnel=[t for t in tunnels if t.get('name') == 'n8n']; \
        print(n8n_tunnel[0]['public_url'] if n8n_tunnel else '')" 2>/dev/null)
    
    if [ -z "$NGROK_URL" ]; then
        error "Não foi possível obter a URL do túnel ngrok n8n"
        echo ""
        echo "Verifique se:"
        echo "  1. O serviço ngrok-all está rodando: systemctl status ngrok-all"
        echo "  2. O túnel n8n está configurado no arquivo ~/.config/ngrok/ngrok.yml"
        exit 1
    fi
    
    success "URL do ngrok n8n: ${NGROK_URL}"
    echo "$NGROK_URL"
}

# Atualizar arquivo .env
update_env_file() {
    local webhook_url="$1"
    
    log "Atualizando arquivo .env..."
    
    # Criar arquivo .env se não existir
    if [ ! -f "$ENV_FILE" ]; then
        touch "$ENV_FILE"
        log "Arquivo .env criado"
    fi
    
    # Remover linha antiga se existir (incluindo duplicatas)
    if grep -q "^VITE_CHAT_WEBHOOK_URL=" "$ENV_FILE" 2>/dev/null; then
        sed -i '/^VITE_CHAT_WEBHOOK_URL=/d' "$ENV_FILE"
        log "Linha antiga removida"
    fi
    
    # Remover comentário duplicado se existir
    sed -i '/^# Webhook n8n via ngrok$/d' "$ENV_FILE"
    
    # Adicionar nova linha (sem caracteres de escape)
    echo "VITE_CHAT_WEBHOOK_URL=${webhook_url}" >> "$ENV_FILE"
    success "URL do webhook atualizada no .env"
    
    # Mostrar conteúdo atualizado
    echo ""
    log "Conteúdo do .env (últimas 5 linhas):"
    tail -5 "$ENV_FILE"
}

# Reconstruir container
rebuild_container() {
    log "Reconstruindo container phdstudio..."
    
    cd /root/phdstudio
    docker compose up -d --build phdstudio 2>&1 | tail -5
    
    if [ $? -eq 0 ]; then
        success "Container reconstruído com sucesso"
    else
        error "Falha ao reconstruir container"
        exit 1
    fi
}

# Testar webhook
test_webhook() {
    local webhook_url="$1"
    
    log "Testando webhook..."
    
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${webhook_url}" \
        -H "Content-Type: application/json" \
        -d '{"test": true, "message": "Teste de atualização automática"}' 2>&1)
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    if [ "$HTTP_CODE" == "200" ] || [ "$HTTP_CODE" == "201" ] || [ "$HTTP_CODE" == "404" ]; then
        success "Webhook respondeu (HTTP $HTTP_CODE)"
        echo "$BODY" | head -3
    else
        warning "Webhook retornou HTTP $HTTP_CODE (pode ser normal se o webhook requer parâmetros específicos)"
        echo "$BODY" | head -3
    fi
}

# Menu principal
main() {
    echo ""
    echo "=========================================="
    echo "  Atualização de Webhook n8n (ngrok)"
    echo "=========================================="
    echo ""
    
    # Obter URL do ngrok
    NGROK_URL=$(get_ngrok_url)
    FULL_WEBHOOK_URL="${NGROK_URL}/webhook/${WEBHOOK_ID}"
    
    echo ""
    success "URL completa do webhook: ${FULL_WEBHOOK_URL}"
    echo ""
    
    # Atualizar .env
    update_env_file "$FULL_WEBHOOK_URL"
    
    echo ""
    read -p "Deseja reconstruir o container agora? (s/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        rebuild_container
        echo ""
        test_webhook "$FULL_WEBHOOK_URL"
    else
        echo ""
        warning "Container não foi reconstruído. Execute manualmente:"
        echo "  cd /root/phdstudio && docker compose up -d --build phdstudio"
    fi
    
    echo ""
    success "Atualização concluída!"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  ✅ URL do Webhook: ${FULL_WEBHOOK_URL}"
    echo "  📝 Arquivo .env atualizado"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
}

main

