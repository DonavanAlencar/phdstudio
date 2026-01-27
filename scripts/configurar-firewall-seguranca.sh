#!/bin/bash
# Script de Configuração de Firewall e Segurança
# Use com cuidado! Leia a documentação antes de executar.

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Configuração de Firewall e Segurança ===${NC}\n"

# Verificar se é root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Por favor, execute como root (sudo)${NC}"
    exit 1
fi

# Função para confirmar ação
confirm() {
    read -p "$1 (s/N): " -n 1 -r
    echo
    [[ $REPLY =~ ^[Ss]$ ]]
}

# 1. Instalar UFW
echo -e "${YELLOW}[1/5] Verificando UFW...${NC}"
if ! command -v ufw &> /dev/null; then
    echo "Instalando UFW..."
    apt update
    apt install -y ufw
else
    echo "UFW já está instalado."
fi

# 2. Configurar SSH (CRÍTICO - fazer primeiro!)
echo -e "\n${YELLOW}[2/5] Configurando regras SSH...${NC}"
echo -e "${RED}⚠️  ATENÇÃO: Certifique-se de que tem acesso alternativo ao servidor!${NC}"
if confirm "Permitir SSH na porta 22?"; then
    ufw allow 22/tcp comment "SSH"
    echo "Regra SSH adicionada."
else
    echo "Pulando configuração SSH. Configure manualmente antes de ativar UFW!"
fi

# 3. Baixar IPs do Cloudflare
echo -e "\n${YELLOW}[3/5] Baixando lista de IPs do Cloudflare...${NC}"
TMP_DIR=$(mktemp -d)
curl -s https://www.cloudflare.com/ips-v4 > "$TMP_DIR/cloudflare-ips-v4.txt" || {
    echo -e "${RED}Erro ao baixar IPs IPv4 do Cloudflare${NC}"
    exit 1
}
curl -s https://www.cloudflare.com/ips-v6 > "$TMP_DIR/cloudflare-ips-v6.txt" || {
    echo -e "${YELLOW}AVISO: Não foi possível baixar IPs IPv6 (pode não ter IPv6)${NC}"
    touch "$TMP_DIR/cloudflare-ips-v6.txt"
}

# 4. Permitir apenas IPs do Cloudflare
echo -e "\n${YELLOW}[4/5] Configurando regras para IPs do Cloudflare...${NC}"
if confirm "Permitir apenas IPs do Cloudflare nas portas 80/443? (Recomendado se usar Cloudflare Proxy)"; then
    echo "Adicionando regras IPv4..."
    while read -r ip; do
        if [ -n "$ip" ]; then
            ufw allow from "$ip" to any port 80 proto tcp comment "Cloudflare HTTP" 2>/dev/null || true
            ufw allow from "$ip" to any port 443 proto tcp comment "Cloudflare HTTPS" 2>/dev/null || true
        fi
    done < "$TMP_DIR/cloudflare-ips-v4.txt"
    
    echo "Adicionando regras IPv6..."
    while read -r ip; do
        if [ -n "$ip" ]; then
            ufw allow from "$ip" to any port 80 proto tcp comment "Cloudflare HTTP IPv6" 2>/dev/null || true
            ufw allow from "$ip" to any port 443 proto tcp comment "Cloudflare HTTPS IPv6" 2>/dev/null || true
        fi
    done < "$TMP_DIR/cloudflare-ips-v6.txt"
    
    echo -e "${GREEN}Regras do Cloudflare adicionadas.${NC}"
else
    echo "Permitindo acesso geral às portas 80/443..."
    ufw allow 80/tcp comment "HTTP"
    ufw allow 443/tcp comment "HTTPS"
fi

# Limpar arquivos temporários
rm -rf "$TMP_DIR"

# 5. Ativar UFW
echo -e "\n${YELLOW}[5/5] Status do Firewall:${NC}"
ufw status verbose

echo -e "\n${RED}⚠️  ÚLTIMA CHANCE ANTES DE ATIVAR!${NC}"
echo -e "Certifique-se de que:"
echo "  - SSH está configurado corretamente"
echo "  - Tem acesso alternativo ao servidor (console VNC/KVM)"
echo "  - Todas as regras necessárias foram adicionadas"

if confirm "Ativar UFW agora?"; then
    ufw --force enable
    echo -e "${GREEN}UFW ativado com sucesso!${NC}"
    echo -e "\nStatus final:"
    ufw status numbered
else
    echo -e "${YELLOW}UFW não foi ativado. Execute manualmente com: sudo ufw enable${NC}"
fi

# 6. Instalar Fail2Ban (opcional)
echo -e "\n${YELLOW}Instalação do Fail2Ban (opcional)...${NC}"
if confirm "Instalar e configurar Fail2Ban para proteção SSH?"; then
    if ! command -v fail2ban-server &> /dev/null; then
        apt install -y fail2ban
    fi
    
    # Criar configuração se não existir
    if [ ! -f /etc/fail2ban/jail.local ]; then
        cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
        echo -e "${GREEN}Arquivo jail.local criado.${NC}"
        echo -e "${YELLOW}Edite /etc/fail2ban/jail.local para personalizar configurações.${NC}"
    fi
    
    systemctl restart fail2ban
    systemctl enable fail2ban
    
    echo -e "${GREEN}Fail2Ban instalado e ativado.${NC}"
    echo "Status:"
    fail2ban-client status
fi

echo -e "\n${GREEN}=== Configuração Concluída ===${NC}"
echo -e "\nPróximos passos:"
echo "  1. Configure o Cloudflare conforme documentação em docs/SEGURANCA_CLOUDFLARE.md"
echo "  2. Monitore logs: sudo tail -f /var/log/ufw.log"
echo "  3. Verifique regras: sudo ufw status verbose"
echo "  4. Se necessário, adicione seu IP à whitelist: sudo ufw allow from SEU_IP"
