#!/bin/bash

# Script de Configuração do Deploy Automatizado
# Configura webhook e serviços necessários para deploy automático
# Autor: Setup Script
# Data: 2025-12-09

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_DIR="/root/phdstudio"
WEBHOOK_PORT="${WEBHOOK_PORT:-9000}"
WEBHOOK_SCRIPT="$PROJECT_DIR/webhook-handler.sh"
DEPLOY_SCRIPT="$PROJECT_DIR/deploy-easypanel.sh"

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

# Verificar dependências
check_dependencies() {
    log "Verificando dependências..."
    
    if ! command -v docker &> /dev/null; then
        error "Docker não está instalado"
    fi
    success "Docker encontrado"
    
    if ! command -v git &> /dev/null; then
        error "Git não está instalado"
    fi
    success "Git encontrado"
    
    if ! command -v curl &> /dev/null; then
        warning "curl não encontrado. Instalando..."
        apt-get update && apt-get install -y curl || error "Falha ao instalar curl"
    fi
    success "curl encontrado"
}

# Tornar scripts executáveis
make_executable() {
    log "Tornando scripts executáveis..."
    chmod +x "$DEPLOY_SCRIPT" || error "Falha ao tornar deploy-easypanel.sh executável"
    chmod +x "$WEBHOOK_SCRIPT" || error "Falha ao tornar webhook-handler.sh executável"
    success "Scripts tornados executáveis"
}

# Criar diretório de logs
create_log_dir() {
    log "Criando diretório de logs..."
    mkdir -p /var/log
    touch /var/log/phdstudio-deploy.log
    touch /var/log/phdstudio-webhook.log
    chmod 666 /var/log/phdstudio-*.log
    success "Diretório de logs criado"
}

# Configurar webhook server (opcional - usando netcat ou Python)
setup_webhook_server() {
    log "Configurando servidor de webhook..."
    
    # Verificar se Python está disponível
    if command -v python3 &> /dev/null; then
        log "Python3 encontrado. Criando servidor de webhook simples..."
        
        cat > /tmp/webhook-server.py << 'EOF'
#!/usr/bin/env python3
import http.server
import socketserver
import subprocess
import json
import sys

PORT = 9000

class WebhookHandler(http.server.BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        
        try:
            payload = json.loads(post_data.decode('utf-8'))
            ref = payload.get('ref', '')
            
            if 'main' in ref or 'master' in ref:
                self.send_response(200)
                self.send_header('Content-type', 'text/plain')
                self.end_headers()
                self.wfile.write(b'Deploy iniciado')
                
                # Executar deploy
                subprocess.Popen(['/bin/bash', '/root/phdstudio/deploy-easypanel.sh'])
            else:
                self.send_response(200)
                self.send_header('Content-type', 'text/plain')
                self.end_headers()
                self.wfile.write(b'Branch ignorada')
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'text/plain')
            self.end_headers()
            self.wfile.write(str(e).encode())
    
    def log_message(self, format, *args):
        pass

with socketserver.TCPServer(("", PORT), WebhookHandler) as httpd:
    print(f"Webhook server rodando na porta {PORT}")
    httpd.serve_forever()
EOF
        
        chmod +x /tmp/webhook-server.py
        success "Servidor de webhook criado (Python)"
        warning "Para iniciar o servidor de webhook, execute: python3 /tmp/webhook-server.py &"
    else
        warning "Python3 não encontrado. Webhook server não será configurado automaticamente."
        warning "Você pode usar nginx ou outro servidor web para configurar o webhook manualmente."
    fi
}

# Criar systemd service para webhook (opcional)
create_systemd_service() {
    log "Criando serviço systemd para webhook..."
    
    cat > /etc/systemd/system/phdstudio-webhook.service << EOF
[Unit]
Description=PHD Studio Webhook Handler
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$PROJECT_DIR
ExecStart=/usr/bin/python3 /tmp/webhook-server.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
    
    success "Serviço systemd criado"
    warning "Para ativar o serviço, execute:"
    warning "  systemctl daemon-reload"
    warning "  systemctl enable phdstudio-webhook"
    warning "  systemctl start phdstudio-webhook"
}

# Criar cron job para verificar atualizações (alternativa ao webhook)
setup_cron_job() {
    log "Configurando cron job para verificar atualizações..."
    
    # Adicionar entrada no crontab para verificar a cada 5 minutos
    (crontab -l 2>/dev/null | grep -v "deploy-easypanel.sh"; echo "*/5 * * * * cd $PROJECT_DIR && bash deploy-easypanel.sh >> /var/log/phdstudio-deploy.log 2>&1") | crontab -
    
    success "Cron job configurado (verifica a cada 5 minutos)"
}

# Mostrar informações de configuração
show_configuration() {
    echo ""
    echo "=========================================="
    success "Configuração concluída!"
    echo "=========================================="
    echo ""
    echo "Opções de deploy automatizado:"
    echo ""
    echo "1. WEBHOOK (Recomendado):"
    echo "   - Configure webhook no GitHub/GitLab apontando para:"
    echo "     http://seu-servidor:$WEBHOOK_PORT/webhook"
    echo "   - Ou use o servidor Python: python3 /tmp/webhook-server.py &"
    echo ""
    echo "2. CRON JOB:"
    echo "   - Já configurado para verificar a cada 5 minutos"
    echo "   - Execute manualmente: cd $PROJECT_DIR && bash deploy-easypanel.sh"
    echo ""
    echo "3. GITHUB ACTIONS:"
    echo "   - Configure secrets no GitHub:"
    echo "     - SSH_PRIVATE_KEY: Sua chave SSH privada"
    echo "     - SERVER_HOST: IP ou hostname do servidor"
    echo ""
    echo "4. MANUAL:"
    echo "   - Execute: cd $PROJECT_DIR && bash deploy-easypanel.sh"
    echo ""
    echo "Logs:"
    echo "   - Deploy: /var/log/phdstudio-deploy.log"
    echo "   - Webhook: /var/log/phdstudio-webhook.log"
    echo ""
}

# Função principal
main() {
    echo ""
    echo "=========================================="
    echo "  Configuração de Deploy Automatizado"
    echo "=========================================="
    echo ""
    
    check_dependencies
    make_executable
    create_log_dir
    setup_webhook_server
    create_systemd_service
    setup_cron_job
    show_configuration
}

# Executar
main "$@"

