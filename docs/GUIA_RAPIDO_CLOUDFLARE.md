# ⚡ Guia Rápido - Configuração Cloudflare

## 🎯 Configuração em 10 Minutos

### **1. Adicionar Domínio (2 min)**
```
1. Acesse: https://dash.cloudflare.com
2. Clique: "Add a Site"
3. Digite: phdstudio.com.br
4. Escolha plano: Free
```

### **2. Configurar DNS (3 min)**
```
Cloudflare Dashboard → DNS → Records

Adicionar:
┌──────┬──────┬──────────────────┬──────────┐
│ Tipo │ Nome │ Conteúdo         │ Proxy    │
├──────┼──────┼──────────────────┼──────────┤
│ A    │ @    │ SEU_IP_SERVIDOR  │ 🟠 ON    │
│ A    │ www  │ SEU_IP_SERVIDOR  │ 🟠 ON    │
└──────┴──────┴──────────────────┴──────────┘
```

### **3. Alterar Nameservers (2 min)**
```
1. No registrador do domínio
2. Substitua nameservers pelos fornecidos pelo Cloudflare
3. Aguarde propagação (1-2h)
```

### **4. SSL/TLS (1 min)**
```
SSL/TLS → Overview → Encryption mode: Full (strict)
SSL/TLS → Edge Certificates:
  ✅ Always Use HTTPS: ON
  ✅ TLS 1.3: ON
```

### **5. WAF (2 min)**
```
Security → WAF → Managed Rules:
  ✅ Cloudflare Managed Ruleset: ON
  ✅ OWASP Core Ruleset: ON
  ✅ Exposed Credentials Check: ON

Security → Bots → Bot Fight Mode: ON
```

---

## 🔥 Regras WAF Essenciais

### **Regra 1: Bloquear Ferramentas de Hacking**
```
(http.user_agent contains "sqlmap" or http.user_agent contains "nikto" or http.user_agent contains "nmap")
Action: Block
```

### **Regra 2: Rate Limit Login**
```
(http.request.uri.path eq "/wp-login.php" or http.request.uri.path eq "/api/auth/login")
Action: Rate Limit
Rate: 5 requests per minute
```

### **Regra 3: Bloquear SQL Injection**
```
(http.request.uri.query contains "union" or http.request.uri.query contains "select" or http.request.uri.query contains "drop")
Action: Block
```

### **Regra 4: Proteger Admin**
```
(http.request.uri.path contains "/admin" or http.request.uri.path contains "/wp-admin")
Action: Challenge
```

---

## 📊 Rate Limiting Rápido

| Regra | Path | Limite | Ação |
|-------|------|--------|------|
| Site Geral | `*` | 100/min | Block |
| API | `/api/*` | 60/min | Challenge |
| Login | `/login*` | 5/5min | Block |

---

## ✅ Checklist Rápido

```
CLOUDFLARE:
[ ] Domínio adicionado
[ ] Nameservers alterados
[ ] DNS com Proxy ON (🟠)
[ ] SSL/TLS: Full (strict)
[ ] WAF Managed Rules: ON
[ ] Bot Fight Mode: ON
[ ] Rate Limiting configurado

SERVIDOR:
[ ] UFW configurado
[ ] Fail2Ban instalado
[ ] SSH root desabilitado
```

---

## 🚨 Comandos Essenciais

### **Verificar Status Cloudflare:**
```
Dashboard → Analytics → Security Events
```

### **Configurar Firewall Servidor:**
```bash
sudo /root/phdstudio/scripts/configurar-firewall-seguranca.sh
```

### **Verificar IPs Cloudflare:**
```bash
curl https://www.cloudflare.com/ips-v4
```

### **Monitorar Ataques:**
```bash
# Cloudflare
Dashboard → Security → Events

# Servidor
sudo tail -f /var/log/ufw.log
sudo fail2ban-client status sshd
```

---

## 📞 Suporte

- **Documentação Completa**: `docs/SEGURANCA_CLOUDFLARE.md`
- **Resumo Executivo**: `docs/RESUMO_SEGURANCA.md`
- **Arquitetura**: `docs/ARQUITETURA_SEGURANCA.md`

---

**Tempo Total**: ~10 minutos  
**Dificuldade**: ⭐⭐ (Fácil)  
**Impacto**: 🛡️🛡️🛡️🛡️🛡️ (Máximo)
