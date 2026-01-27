# 🏗️ Arquitetura de Segurança - Diagrama

## Fluxo de Tráfego com Cloudflare

```
┌─────────────────────────────────────────────────────────────────┐
│                         INTERNET                                 │
│  (Ataques DDoS, Bots, Hackers, Scanners)                        │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CLOUDFLARE EDGE                                │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 1. DNS (Proxy ON 🟠)                                     │   │
│  │    - Resolve phdstudio.com.br → IP do servidor          │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 2. SSL/TLS Termination                                    │   │
│  │    - Certificado Edge (Let's Encrypt)                    │   │
│  │    - TLS 1.3, HTTPS Forced                                │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 3. WAF (Web Application Firewall)                         │   │
│  │    ✅ Managed Rules (OWASP, Cloudflare)                  │   │
│  │    ✅ Custom Rules (SQL injection, XSS, etc)             │   │
│  │    ✅ Bot Fight Mode                                      │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 4. Rate Limiting                                          │   │
│  │    - Site: 100 req/min                                    │   │
│  │    - API: 60 req/min                                      │   │
│  │    - Login: 5 req/5min                                    │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 5. DDoS Protection                                         │   │
│  │    - HTTP DDoS: Automático                                │   │
│  │    - Network-layer: Automático                            │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  🛡️ ATAQUES BLOQUEADOS AQUI                                      │
│  ❌ Bots maliciosos                                             │
│  ❌ SQL Injection                                               │
│  ❌ XSS                                                          │
│  ❌ DDoS                                                         │
│  ❌ Brute Force                                                  │
│  ❌ Países suspeitos (se configurado)                           │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTPS (TLS 1.3)
                             │ Apenas IPs do Cloudflare
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SEU SERVIDOR                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ FIREWALL (UFW)                                            │   │
│  │ ✅ Porta 22 (SSH): Permitida                              │   │
│  │ ✅ Porta 80/443: Apenas IPs Cloudflare                    │   │
│  │ ❌ Todo resto: Bloqueado                                  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                             │                                    │
│                             ▼                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ FAIL2BAN                                                   │   │
│  │ ✅ Monitora SSH                                            │   │
│  │ ✅ Bloqueia após 3 tentativas falhas                      │   │
│  │ ✅ Ban: 2 horas                                           │   │
│  └──────────────────────────────────────────────────────────┘   │
│                             │                                    │
│                             ▼                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ TRAEFIK (Docker)                                           │   │
│  │ ✅ Porta 80 → Redireciona para HTTPS                      │   │
│  │ ✅ Porta 443 → SSL/TLS (Origin Certificate)              │   │
│  │ ✅ Roteamento para containers                             │   │
│  └──────────────────────────────────────────────────────────┘   │
│                             │                                    │
│                             ▼                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ CONTAINERS                                                 │   │
│  │  - phdstudio (Frontend)                                    │   │
│  │  - phd-api (Backend API)                                   │   │
│  │  - phd-crm-db (PostgreSQL)                                 │   │
│  │  - n8n, Redis, etc.                                        │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Camadas de Proteção

### **Camada 1: Cloudflare (Edge)**
- **Localização**: Fora do seu servidor
- **Proteção**: DDoS, WAF, Bot Protection, Rate Limiting
- **Vantagem**: Ataques nunca chegam ao servidor

### **Camada 2: Firewall (Servidor)**
- **Localização**: Servidor (UFW/iptables)
- **Proteção**: Apenas IPs do Cloudflare podem acessar 80/443
- **Vantagem**: Reduz superfície de ataque

### **Camada 3: Fail2Ban (Servidor)**
- **Localização**: Servidor
- **Proteção**: SSH brute force
- **Vantagem**: Bloqueia IPs após tentativas falhas

### **Camada 4: Aplicação (Containers)**
- **Localização**: Docker containers
- **Proteção**: Headers de segurança, validação de entrada
- **Vantagem**: Última linha de defesa

---

## Fluxo de Decisão - WAF Cloudflare

```
Requisição Chega
       │
       ▼
┌──────────────────┐
│ É Bot Malicioso? │───SIM──→ ❌ BLOQUEAR
└────────┬─────────┘
         │ NÃO
         ▼
┌──────────────────┐
│ Query String     │───SIM──→ ❌ BLOQUEAR
│ Suspeita?        │
└────────┬─────────┘
         │ NÃO
         ▼
┌──────────────────┐
│ User-Agent       │───SIM──→ ❌ BLOQUEAR
│ Malicioso?       │
└────────┬─────────┘
         │ NÃO
         ▼
┌──────────────────┐
│ Rate Limit       │───SIM──→ ⚠️ CHALLENGE/BLOCK
│ Excedido?        │
└────────┬─────────┘
         │ NÃO
         ▼
┌──────────────────┐
│ País Bloqueado?  │───SIM──→ ❌ BLOQUEAR
│ (se configurado) │
└────────┬─────────┘
         │ NÃO
         ▼
┌──────────────────┐
│ Managed Rules    │───SIM──→ ❌ BLOQUEAR/CHALLENGE
│ Acionadas?       │
└────────┬─────────┘
         │ NÃO
         ▼
    ✅ PERMITIR
    (Encaminhar para servidor)
```

---

## Portas e Protocolos

### **Portas Expostas Publicamente:**

| Porta | Protocolo | Serviço | Proteção | Acesso |
|-------|-----------|---------|----------|--------|
| 22 | TCP | SSH | Fail2Ban | Todos (recomendado: apenas seu IP) |
| 80 | TCP | HTTP | Cloudflare + UFW | Apenas Cloudflare IPs |
| 443 | TCP | HTTPS | Cloudflare + UFW | Apenas Cloudflare IPs |

### **Portas Internas (Docker):**

| Porta | Serviço | Acesso |
|-------|---------|--------|
| 3001 | API | Apenas via Traefik |
| 5432 | PostgreSQL | Apenas containers |
| 3306 | MySQL | Apenas containers |
| 6379 | Redis | Apenas containers |

---

## IPs do Cloudflare

### **IPv4 Ranges:**
```
173.245.48.0/20
103.21.244.0/22
103.22.200.0/22
103.31.4.0/22
141.101.64.0/18
108.162.192.0/18
190.93.240.0/20
188.114.96.0/20
197.234.240.0/22
198.41.128.0/17
162.158.0.0/15
104.16.0.0/13
104.24.0.0/14
172.64.0.0/13
131.0.72.0/22
```

### **IPv6 Ranges:**
```
2400:cb00::/32
2606:4700::/32
2803:f800::/32
2405:b500::/32
2405:8100::/32
2a06:98c0::/29
2c0f:f248::/32
```

**Atualização**: IPs podem mudar. Sempre use:
```bash
curl https://www.cloudflare.com/ips-v4
curl https://www.cloudflare.com/ips-v6
```

---

## Headers de Segurança

### **Cloudflare Adiciona:**
```
CF-Ray: [ID único]
CF-Connecting-IP: [IP real do visitante]
CF-Visitor: [esquema (http/https)]
```

### **Servidor Adiciona (via Traefik/Nginx):**
```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

---

## Monitoramento e Alertas

### **O que Monitorar:**

1. **Cloudflare Dashboard:**
   - Security Events (ataques bloqueados)
   - Traffic Analytics (picos suspeitos)
   - Rate Limiting (falsos positivos)

2. **Servidor:**
   - Logs SSH: `/var/log/auth.log`
   - Logs UFW: `/var/log/ufw.log`
   - Logs Fail2Ban: `/var/log/fail2ban.log`
   - Logs Docker: `docker logs [container]`

### **Alertas Recomendados:**
- Múltiplos bloqueios do Fail2Ban
- Picos de tráfego anômalos
- Muitas requisições bloqueadas pelo WAF
- Tentativas de login SSH suspeitas

---

## Cenários de Ataque e Resposta

### **Cenário 1: DDoS Attack**
```
Ataque → Cloudflare detecta → Mitiga automaticamente
→ Servidor nunca vê o ataque
```

### **Cenário 2: SQL Injection**
```
Payload malicioso → WAF detecta padrão SQL
→ Bloqueia antes de chegar ao servidor
→ Log registrado no Cloudflare
```

### **Cenário 3: Brute Force SSH**
```
Tentativas de login → Fail2Ban detecta 3 falhas
→ IP banido por 2 horas
→ Log registrado
```

### **Cenário 4: Bot Scraping**
```
Bot malicioso → Bot Fight Mode detecta
→ Challenge (CAPTCHA) ou bloqueio
→ Tráfego legítimo passa normalmente
```

---

## Melhorias Futuras

### **Curto Prazo:**
- [ ] 2FA para acesso administrativo
- [ ] Monitoramento proativo (UptimeRobot)
- [ ] Backup automatizado diário

### **Médio Prazo:**
- [ ] Cloudflare Access (Zero Trust)
- [ ] WAF customizado mais específico
- [ ] Logs centralizados (ELK Stack)

### **Longo Prazo:**
- [ ] Penetration testing
- [ ] Security audit trimestral
- [ ] Plano de resposta a incidentes

---

**Última atualização**: 2025-01-XX
