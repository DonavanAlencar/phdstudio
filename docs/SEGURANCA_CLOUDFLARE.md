# 🔐 Guia Completo de Segurança - Cloudflare + Servidor

## 📊 Análise da Infraestrutura Atual

### Situação Detectada:
- **Servidor**: Ubuntu 24.04 LTS (srv934629)
- **Reverse Proxy**: Traefik (Docker) nas portas 80/443
- **Domínio**: phdstudio.com.br
- **Firewall**: iptables ativo, mas política INPUT=ACCEPT (sem restrições)
- **SSH**: Porta 22 exposta publicamente
- **Containers**: Traefik, API, PostgreSQL, MySQL, n8n, Redis

### ⚠️ Vulnerabilidades Identificadas:
1. **Firewall permissivo**: INPUT policy ACCEPT permite todo tráfego
2. **SSH exposto**: Porta 22 acessível de qualquer IP
3. **Sem rate limiting**: Nenhuma proteção contra DDoS/brute force
4. **Sem WAF**: Falta de proteção contra ataques web
5. **Logs limitados**: Sem monitoramento de tentativas de ataque

---

## 🛡️ CONFIGURAÇÃO CLOUDFLARE - PASSO A PASSO

### **1. CONFIGURAÇÃO DNS**

#### 1.1 Adicionar Domínio no Cloudflare
1. Acesse: https://dash.cloudflare.com
2. Clique em **"Add a Site"**
3. Digite: `phdstudio.com.br`
4. Escolha o plano (Free é suficiente para começar)

#### 1.2 Configurar Nameservers
1. Cloudflare fornecerá 2 nameservers (ex: `alice.ns.cloudflare.com` e `bob.ns.cloudflare.com`)
2. No seu registrador de domínio, altere os nameservers para os fornecidos pelo Cloudflare
3. Aguarde propagação (pode levar até 48h, geralmente 1-2h)

#### 1.3 Configurar Registros DNS
No painel Cloudflare → **DNS** → **Records**, adicione:

| Tipo | Nome | Conteúdo | Proxy | TTL |
|------|------|----------|-------|-----|
| A | @ | `SEU_IP_DO_SERVIDOR` | 🟠 Proxied | Auto |
| A | www | `SEU_IP_DO_SERVIDOR` | 🟠 Proxied | Auto |
| AAAA | @ | `SEU_IPv6` (se tiver) | 🟠 Proxied | Auto |

**⚠️ IMPORTANTE**: 
- **Proxy (🟠 laranja)**: Ativa proteção Cloudflare (recomendado)
- **DNS Only (⚪ cinza)**: Sem proteção (não use para produção)

---

### **2. CONFIGURAÇÃO SSL/TLS**

#### 2.1 Modo SSL/TLS
**Cloudflare Dashboard** → **SSL/TLS** → **Overview**

**Configuração Recomendada:**
- **Encryption mode**: `Full (strict)`
  - Cloudflare ↔ Visitante: HTTPS
  - Servidor ↔ Cloudflare: HTTPS (requer certificado válido no servidor)

**Alternativa (se não tiver certificado no servidor):**
- **Encryption mode**: `Full`
  - Cloudflare ↔ Visitante: HTTPS
  - Servidor ↔ Cloudflare: HTTPS (aceita certificado auto-assinado)

#### 2.2 Certificado Origin (Opcional mas Recomendado)
**Cloudflare Dashboard** → **SSL/TLS** → **Origin Server**

1. Clique em **"Create Certificate"**
2. Selecione:
   - **Private key type**: RSA (2048)
   - **Hostnames**: `phdstudio.com.br`, `*.phdstudio.com.br`
   - **Certificate Validity**: 15 anos
3. Clique em **"Create"**
4. **Copie o certificado e a chave privada**
5. No servidor, configure o Traefik para usar este certificado

#### 2.3 Configurações Avançadas SSL
**SSL/TLS** → **Edge Certificates**:
- ✅ **Always Use HTTPS**: ON
- ✅ **Automatic HTTPS Rewrites**: ON
- ✅ **Minimum TLS Version**: 1.2
- ✅ **Opportunistic Encryption**: ON
- ✅ **TLS 1.3**: ON
- ✅ **Automatic Certificate Management**: ON

---

### **3. FIREWALL RULES (WAF) - PROTEÇÃO CRÍTICA**

#### 3.1 Firewall Rules Básicas
**Cloudflare Dashboard** → **Security** → **WAF** → **Custom Rules**

**Regra 1: Bloquear Países Suspeitos**
```
(http.request.uri.path contains "/wp-admin" or http.request.uri.path contains "/wp-login.php") and ip.geoip.country in {"CN" "RU" "KP" "IR"}
```
**Action**: Block
**Description**: "Bloquear países suspeitos em WordPress"

**Regra 2: Proteger Endpoints Sensíveis**
```
(http.request.uri.path contains "/admin" or http.request.uri.path contains "/wp-admin" or http.request.uri.path contains "/.env" or http.request.uri.path contains "/phpmyadmin")
```
**Action**: Challenge (CAPTCHA)
**Description**: "Proteger endpoints administrativos"

**Regra 3: Bloquear User-Agents Maliciosos**
```
(http.user_agent contains "sqlmap" or http.user_agent contains "nikto" or http.user_agent contains "nmap" or http.user_agent contains "masscan")
```
**Action**: Block
**Description**: "Bloquear ferramentas de hacking"

**Regra 4: Rate Limiting - Login**
```
(http.request.uri.path eq "/wp-login.php" or http.request.uri.path eq "/api/auth/login")
```
**Action**: Rate Limit
**Rate**: 5 requests per minute
**Description**: "Rate limit em tentativas de login"

**Regra 5: Bloquear Query Strings Suspeitas**
```
(http.request.uri.query contains "union" or http.request.uri.query contains "select" or http.request.uri.query contains "drop" or http.request.uri.query contains "exec" or http.request.uri.query contains "script")
```
**Action**: Block
**Description**: "Bloquear SQL injection e XSS em query strings"

#### 3.2 Managed Rules (WAF)
**Security** → **WAF** → **Managed Rules**

Ative os seguintes pacotes:
- ✅ **Cloudflare Managed Ruleset**: ON
- ✅ **Cloudflare OWASP Core Ruleset**: ON
- ✅ **Cloudflare Exposed Credentials Check**: ON

**Configuração de Sensibilidade:**
- **Sensitivity**: Medium (ajuste conforme necessário)
- **Action**: Block (para regras críticas)

---

### **4. RATE LIMITING**

**Security** → **WAF** → **Rate limiting rules**

#### Regra 1: Proteção Geral do Site
- **Rule name**: "Proteção DDoS Geral"
- **Match**: `(http.request.uri.path)`
- **Requests**: 100
- **Period**: 1 minute
- **Action**: Block

#### Regra 2: Proteção API
- **Rule name**: "Rate Limit API"
- **Match**: `(http.request.uri.path contains "/api")`
- **Requests**: 60
- **Period**: 1 minute
- **Action**: Challenge

#### Regra 3: Proteção Login
- **Rule name**: "Rate Limit Login"
- **Match**: `(http.request.uri.path contains "/login" or http.request.uri.path contains "/wp-login")`
- **Requests**: 5
- **Period**: 5 minutes
- **Action**: Block

---

### **5. BOT FIGHT MODE**

**Security** → **Bots**

**Configuração:**
- ✅ **Bot Fight Mode**: ON (gratuito)
- ✅ **Super Bot Fight Mode**: Considerar upgrade (plano pago)

**O que faz:**
- Bloqueia bots maliciosos automaticamente
- Reduz tráfego de scraping e ataques automatizados

---

### **6. DDoS PROTECTION**

**Security** → **DDoS**

**Configuração Automática:**
- ✅ **HTTP DDoS attack protection**: ON (automático)
- ✅ **Network-layer DDoS attack protection**: ON (automático)

**Ajustes Manuais:**
- **Sensitivity**: Normal (ajuste se houver muitos falsos positivos)
- **Action**: Default (Challenge para suspeitos, Block para confirmados)

---

### **7. ACCESS RULES (IP ACCESS RULES)**

**Security** → **WAF** → **Tools** → **IP Access Rules**

#### Whitelist - Seu IP
1. Adicione seu IP pessoal como **Allow**
2. Isso evita bloqueios acidentais durante testes

#### Blacklist - IPs Maliciosos
1. Monitore logs de ataques
2. Adicione IPs repetidamente maliciosos como **Block**

---

### **8. PAGE RULES (CACHE & SECURITY)**

**Rules** → **Page Rules**

#### Regra 1: Cache de Assets Estáticos
- **URL**: `phdstudio.com.br/*.jpg` OR `phdstudio.com.br/*.png` OR `phdstudio.com.br/*.css` OR `phdstudio.com.br/*.js`
- **Settings**:
  - Cache Level: Cache Everything
  - Edge Cache TTL: 1 month
  - Browser Cache TTL: 1 month

#### Regra 2: Bypass Cache para API
- **URL**: `phdstudio.com.br/api/*`
- **Settings**:
  - Cache Level: Bypass
  - Security Level: High

#### Regra 3: Proteção Admin
- **URL**: `phdstudio.com.br/wp-admin/*` OR `phdstudio.com.br/admin/*`
- **Settings**:
  - Security Level: High
  - Cache Level: Bypass
  - Disable Apps: ON

---

### **9. SECURITY HEADERS**

**Rules** → **Transform Rules** → **Modify Response Header**

#### Regra 1: Headers de Segurança
**Name**: `X-Frame-Options`
**Value**: `SAMEORIGIN`

**Name**: `X-Content-Type-Options`
**Value**: `nosniff`

**Name**: `X-XSS-Protection`
**Value**: `1; mode=block`

**Name**: `Referrer-Policy`
**Value**: `strict-origin-when-cross-origin`

**Name**: `Permissions-Policy`
**Value**: `geolocation=(), microphone=(), camera=()`

---

### **10. LOGS & MONITORING**

#### 10.1 Cloudflare Analytics
**Analytics** → **Security Events**

Monitore:
- Ataques bloqueados
- Requisições desafiadas
- Top países de origem
- Top regras acionadas

#### 10.2 Cloudflare Logs (Plano Pago)
Se tiver plano pago, ative:
- **Cloudflare Logpush**: Envie logs para análise externa
- **Real-time Logs**: Visualize tráfego em tempo real

---

## 🔒 CONFIGURAÇÕES ADICIONAIS NO SERVIDOR

### **1. FIREWALL (UFW) - RECOMENDADO**

```bash
# Instalar UFW
sudo apt update
sudo apt install ufw -y

# Permitir SSH (IMPORTANTE: faça isso ANTES de ativar!)
sudo ufw allow 22/tcp

# Permitir portas do Docker/Traefik (já gerenciadas pelo Docker)
# Não precisa abrir 80/443 manualmente se usar Cloudflare

# Permitir apenas Cloudflare IPs (opcional, mas recomendado)
# Baixar lista de IPs do Cloudflare
curl -s https://www.cloudflare.com/ips-v4 > /tmp/cloudflare-ips-v4.txt
curl -s https://www.cloudflare.com/ips-v6 > /tmp/cloudflare-ips-v6.txt

# Permitir apenas IPs do Cloudflare nas portas 80/443
while read ip; do
    sudo ufw allow from $ip to any port 80 proto tcp comment "Cloudflare HTTP"
    sudo ufw allow from $ip to any port 443 proto tcp comment "Cloudflare HTTPS"
done < /tmp/cloudflare-ips-v4.txt

while read ip; do
    sudo ufw allow from $ip to any port 80 proto tcp comment "Cloudflare HTTP IPv6"
    sudo ufw allow from $ip to any port 443 proto tcp comment "Cloudflare HTTPS IPv6"
done < /tmp/cloudflare-ips-v6.txt

# Ativar firewall
sudo ufw enable

# Verificar status
sudo ufw status verbose
```

**⚠️ ATENÇÃO**: 
- Configure SSH antes de ativar UFW
- Teste acesso SSH após ativar
- Se bloquear, acesse via console do provedor

### **2. FAIL2BAN - PROTEÇÃO SSH**

```bash
# Instalar Fail2Ban
sudo apt install fail2ban -y

# Criar configuração personalizada
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local

# Editar configuração
sudo nano /etc/fail2ban/jail.local
```

**Configuração recomendada** (`/etc/fail2ban/jail.local`):
```ini
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5
destemail = seu-email@exemplo.com
sendername = Fail2Ban
action = %(action_)s

[sshd]
enabled = true
port = 22
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 7200
```

```bash
# Reiniciar Fail2Ban
sudo systemctl restart fail2ban
sudo systemctl enable fail2ban

# Verificar status
sudo fail2ban-client status
sudo fail2ban-client status sshd
```

### **3. DESABILITAR LOGIN ROOT VIA SSH**

```bash
# Editar SSH config
sudo nano /etc/ssh/sshd_config
```

Alterar:
```
PermitRootLogin no
PasswordAuthentication no  # Se usar chaves SSH
PubkeyAuthentication yes
```

```bash
# Reiniciar SSH
sudo systemctl restart sshd

# Testar antes de fechar sessão atual!
```

### **4. ATUALIZAÇÕES AUTOMÁTICAS**

```bash
# Instalar unattended-upgrades
sudo apt install unattended-upgrades -y

# Configurar
sudo dpkg-reconfigure -plow unattended-upgrades

# Verificar status
sudo systemctl status unattended-upgrades
```

### **5. LOGS E MONITORAMENTO**

```bash
# Instalar ferramentas de monitoramento
sudo apt install htop iotop nethogs -y

# Configurar logrotate para logs do Docker
sudo nano /etc/logrotate.d/docker-containers
```

Conteúdo:
```
/var/lib/docker/containers/*/*.log {
    rotate 7
    daily
    compress
    size=10M
    missingok
    delaycompress
    copytruncate
}
```

---

## 📋 CHECKLIST DE IMPLEMENTAÇÃO

### Fase 1: Cloudflare (Imediato)
- [ ] Adicionar domínio no Cloudflare
- [ ] Configurar nameservers
- [ ] Ativar Proxy (🟠) nos registros DNS
- [ ] Configurar SSL/TLS (Full strict)
- [ ] Ativar Bot Fight Mode
- [ ] Configurar Firewall Rules básicas
- [ ] Ativar Managed Rules (WAF)
- [ ] Configurar Rate Limiting

### Fase 2: Servidor (Após Cloudflare)
- [ ] Configurar UFW (permitir apenas Cloudflare IPs)
- [ ] Instalar e configurar Fail2Ban
- [ ] Desabilitar login root SSH
- [ ] Configurar atualizações automáticas
- [ ] Configurar logrotate

### Fase 3: Monitoramento (Contínuo)
- [ ] Monitorar Security Events no Cloudflare
- [ ] Revisar logs de ataques bloqueados
- [ ] Ajustar regras conforme necessário
- [ ] Manter sistema atualizado

---

## 🚨 TROUBLESHOOTING

### Problema: Site inacessível após configurar Cloudflare
**Solução:**
1. Verifique se nameservers foram alterados corretamente
2. Verifique se IP do servidor está correto no DNS
3. Verifique se Proxy está ativado (🟠)
4. Aguarde propagação DNS (pode levar até 48h)

### Problema: Muitos falsos positivos (bloqueios legítimos)
**Solução:**
1. Ajuste sensibilidade das regras WAF para "Low"
2. Adicione seu IP à whitelist
3. Revise regras customizadas (podem estar muito restritivas)

### Problema: SSH bloqueado após configurar UFW
**Solução:**
1. Acesse via console do provedor (VNC/KVM)
2. Desative UFW temporariamente: `sudo ufw disable`
3. Corrija regras e reative

### Problema: API retornando erro após rate limiting
**Solução:**
1. Aumente limite de requests na regra de rate limiting
2. Adicione IPs legítimos à whitelist
3. Considere usar API keys para bypass

---

## 📚 RECURSOS ADICIONAIS

### Documentação Oficial:
- [Cloudflare WAF](https://developers.cloudflare.com/waf/)
- [Cloudflare Firewall Rules](https://developers.cloudflare.com/firewall/)
- [Cloudflare SSL/TLS](https://developers.cloudflare.com/ssl/)

### Ferramentas Úteis:
- [Cloudflare IPs](https://www.cloudflare.com/ips/)
- [Teste de Segurança](https://securityheaders.com/)
- [SSL Labs Test](https://www.ssllabs.com/ssltest/)

---

## ⚡ PRÓXIMOS PASSOS RECOMENDADOS

1. **Implementar 2FA** no acesso administrativo
2. **Backup automatizado** diário
3. **Monitoramento proativo** (ex: UptimeRobot, Pingdom)
4. **Plano de resposta a incidentes**
5. **Auditoria de segurança** trimestral

---

**Última atualização**: 2025-01-XX
**Versão**: 1.0
