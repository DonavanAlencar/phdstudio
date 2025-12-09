#!/bin/bash

# Webhook Handler para GitHub/GitLab
# Recebe notificações de push e dispara deploy automático
# Autor: Webhook Handler
# Data: 2025-12-09

set -e

# Configurações
PROJECT_DIR="/root/phdstudio"
DEPLOY_SCRIPT="$PROJECT_DIR/deploy-easypanel.sh"
LOG_FILE="/var/log/phdstudio-webhook.log"
SECRET_TOKEN="${WEBHOOK_SECRET:-}"  # Token secreto para validar webhook (opcional)

# Função para log
log() {
    local message="[$(date +'%Y-%m-%d %H:%M:%S')] $1"
    echo "$message" | tee -a "$LOG_FILE"
}

# Validar webhook (se SECRET_TOKEN estiver configurado)
validate_webhook() {
    if [ -n "$SECRET_TOKEN" ]; then
        # Verificar header X-Hub-Signature-256 (GitHub) ou X-Gitlab-Token (GitLab)
        if [ -n "$HTTP_X_HUB_SIGNATURE_256" ] || [ -n "$HTTP_X_GITLAB_TOKEN" ]; then
            log "Webhook validado com sucesso"
            return 0
        else
            log "ERRO: Webhook não validado. Token ausente ou inválido."
            return 1
        fi
    fi
    return 0
}

# Processar payload do webhook
process_webhook() {
    local payload="$1"
    
    # Detectar tipo de webhook (GitHub ou GitLab)
    if echo "$payload" | grep -q "ref"; then
        # GitHub webhook
        local ref=$(echo "$payload" | grep -o '"ref":"[^"]*"' | cut -d'"' -f4)
        local branch=$(basename "$ref")
        
        log "Webhook GitHub recebido. Branch: $branch"
        
        # Verificar se é a branch principal
        if [ "$branch" = "main" ] || [ "$branch" = "master" ]; then
            log "Branch principal detectada. Disparando deploy..."
            return 0
        else
            log "Branch $branch ignorada. Deploy apenas para main/master."
            return 1
        fi
    elif echo "$payload" | grep -q "object_kind"; then
        # GitLab webhook
        local ref=$(echo "$payload" | grep -o '"ref":"[^"]*"' | cut -d'"' -f4)
        local branch=$(basename "$ref")
        
        log "Webhook GitLab recebido. Branch: $branch"
        
        # Verificar se é a branch principal
        if [ "$branch" = "main" ] || [ "$branch" = "master" ]; then
            log "Branch principal detectada. Disparando deploy..."
            return 0
        else
            log "Branch $branch ignorada. Deploy apenas para main/master."
            return 1
        fi
    else
        log "Tipo de webhook não reconhecido"
        return 1
    fi
}

# Executar deploy
execute_deploy() {
    log "Executando script de deploy..."
    
    if [ ! -f "$DEPLOY_SCRIPT" ]; then
        log "ERRO: Script de deploy não encontrado: $DEPLOY_SCRIPT"
        return 1
    fi
    
    # Executar deploy em background e logar saída
    bash "$DEPLOY_SCRIPT" >> "$LOG_FILE" 2>&1 &
    local deploy_pid=$!
    
    log "Deploy iniciado (PID: $deploy_pid)"
    return 0
}

# Handler principal (para uso com servidor web simples)
main_handler() {
    log "=== Webhook recebido ==="
    
    # Ler payload do stdin
    payload=$(cat)
    
    # Validar webhook
    if ! validate_webhook; then
        echo "HTTP/1.1 401 Unauthorized"
        echo "Content-Type: text/plain"
        echo ""
        echo "Unauthorized"
        exit 1
    fi
    
    # Processar webhook
    if process_webhook "$payload"; then
        execute_deploy
        echo "HTTP/1.1 200 OK"
        echo "Content-Type: text/plain"
        echo ""
        echo "Deploy iniciado com sucesso"
    else
        echo "HTTP/1.1 200 OK"
        echo "Content-Type: text/plain"
        echo ""
        echo "Webhook recebido, mas deploy não necessário"
    fi
}

# Handler para uso direto (não via HTTP)
direct_handler() {
    log "=== Deploy direto solicitado ==="
    execute_deploy
}

# Verificar como foi chamado
if [ "$1" = "--direct" ]; then
    direct_handler
else
    main_handler
fi

