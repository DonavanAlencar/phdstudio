# 🛡️ Resumo Executivo - Segurança do Servidor

## 📊 Situação Atual

**Servidor**: Ubuntu 24.04 LTS  
**Domínio**: phdstudio.com.br  
**Infraestrutura**: Docker + Traefik  
**Status de Segurança**: ⚠️ **VULNERÁVEL**

### Principais Vulnerabilidades:
1. ❌ Firewall permissivo (iptables INPUT=ACCEPT)
2. ❌ SSH exposto sem proteção
3. ❌ Sem proteção DDoS/WAF
4. ❌ Sem rate limiting
5. ❌ Sem monitoramento de ataques

---

## 🎯 Plano de Ação Imediato

### **FASE 1: Cloudflare (Prioridade ALTA) - 30 minutos**

#### Passo 1: Adicionar Domínio
1. Acesse: https://dash.cloudflare.com
2. **Add a Site** → Digite `phdstudio.com.br`
3. Escolha plano (Free é suficiente)

#### Passo 2: Configurar DNS
1. Altere nameservers no registrador para os fornecidos pelo Cloudflare
2. No Cloudflare → **DNS** → Adicione:
   - Tipo **A**, Nome **@**, IP do servidor, **Proxy ON** (🟠)
   - Tipo **A**, Nome **www**, IP do servidor, **Proxy ON** (🟠)

#### Passo 3: SSL/TLS
1. **SSL/TLS** → **Overview** → Modo: **Full (strict)**
2. **Edge Certificates**:
   - ✅ Always Use HTTPS: ON
   - ✅ TLS 1.3: ON
   - ✅ Minimum TLS: 1.2

#### Passo 4: WAF (Firewall)
1. **Security** → **WAF** → **Managed Rules**:
   - ✅ Cloudflare Managed Ruleset: ON
   - ✅ OWASP Core Ruleset: ON
   - ✅ Exposed Credentials Check: ON

2. **Custom Rules** → Adicione:
   ```
   Bloquear países suspeitos em /wp-admin
   Bloquear user-agents maliciosos (sqlmap, nikto, etc)
   Rate limit em /login (5 req/min)
   Bloquear query strings suspeitas (SQL injection, XSS)
   ```

#### Passo 5: Rate Limiting
1. **Security** → **WAF** → **Rate limiting**:
   - Site geral: 100 req/min
   - API: 60 req/min
   - Login: 5 req/5min

#### Passo 6: Bot Protection
1. **Security** → **Bots** → **Bot Fight Mode**: ON

---

### **FASE 2: Servidor (Após Cloudflare) - 15 minutos**

#### Passo 1: Firewall (UFW)
```bash
# Execute o script automatizado:
sudo /root/phdstudio/scripts/configurar-firewall-seguranca.sh

# OU configure manualmente:
sudo ufw allow 22/tcp
# Adicione IPs do Cloudflare (script faz isso automaticamente)
sudo ufw enable
```

#### Passo 2: Fail2Ban
```bash
sudo apt install fail2ban -y
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo nano /etc/fail2ban/jail.local  # Ajuste bantime, maxretry
sudo systemctl restart fail2ban
```

#### Passo 3: SSH Hardening
```bash
sudo nano /etc/ssh/sshd_config
# Altere: PermitRootLogin no
sudo systemctl restart sshd
```

---

## 📋 Checklist Rápido

### Cloudflare (Fazer AGORA):
- [ ] Domínio adicionado
- [ ] Nameservers alterados
- [ ] DNS com Proxy ON (🟠)
- [ ] SSL/TLS: Full (strict)
- [ ] WAF Managed Rules: ON
- [ ] Custom Rules criadas
- [ ] Rate Limiting configurado
- [ ] Bot Fight Mode: ON

### Servidor (Fazer DEPOIS do Cloudflare):
- [ ] UFW configurado (apenas Cloudflare IPs)
- [ ] Fail2Ban instalado
- [ ] SSH root desabilitado
- [ ] Atualizações automáticas ativadas

---

## 🚨 Comandos Úteis

### Verificar Status:
```bash
# Firewall
sudo ufw status verbose

# Fail2Ban
sudo fail2ban-client status
sudo fail2ban-client status sshd

# Logs de ataques
sudo tail -f /var/log/ufw.log
sudo tail -f /var/log/fail2ban.log
```

### Adicionar IP à Whitelist:
```bash
# UFW
sudo ufw allow from SEU_IP comment "Meu IP"

# Fail2Ban (desbanir)
sudo fail2ban-client set sshd unbanip IP_BANIDO
```

### Atualizar IPs do Cloudflare:
```bash
# Re-executar script ou manualmente:
curl -s https://www.cloudflare.com/ips-v4 | while read ip; do
    sudo ufw allow from $ip to any port 80,443 proto tcp
done
```

---

## 📊 Monitoramento

### Cloudflare Dashboard:
- **Analytics** → **Security Events**: Ver ataques bloqueados
- **Security** → **Events**: Logs detalhados
- **Analytics** → **Traffic**: Análise de tráfego

### Servidor:
```bash
# Monitorar tentativas de login SSH
sudo grep "Failed password" /var/log/auth.log | tail -20

# Monitorar bloqueios do Fail2Ban
sudo fail2ban-client status sshd

# Monitorar tráfego
sudo nethogs
```

---

## ⚠️ IMPORTANTE

1. **Configure Cloudflare PRIMEIRO** antes de restringir firewall no servidor
2. **Teste acesso SSH** após configurar UFW
3. **Mantenha acesso alternativo** (console VNC/KVM) sempre disponível
4. **Monitore logs** nas primeiras 24h após implementação
5. **Ajuste regras** conforme necessário (falsos positivos)

---

## 📚 Documentação Completa

Para instruções detalhadas, consulte:
- **`docs/SEGURANCA_CLOUDFLARE.md`** - Guia completo passo a passo

---

**Última atualização**: 2025-01-XX
