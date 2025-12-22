# Plano de Ação: HTTPS sem ngrok

Este documento descreve o plano completo para implementar HTTPS em todos os serviços sem depender do ngrok.

## 🎯 Objetivo

Implementar HTTPS usando certificados SSL/TLS válidos para:
- ✅ WordPress (porta 8080)
- ✅ API REST (porta 3001)
- ✅ Servidor MCP CRM
- ✅ Frontend PHD Studio
- ❌ n8n (mantém ngrok conforme solicitado)

## 📋 Situação Atual

- **IP do Servidor:** `148.230.79.105`
- **WordPress:** `http://148.230.79.105:8080` (HTTP)
- **API REST:** `http://148.230.79.105:3001` (HTTP)
- **Frontend:** `https://phdstudio.com.br` (já tem HTTPS via Traefik)
- **n8n:** `https://b673c9874ec4.ngrok-free.app` (mantém ngrok)

## 🔧 Opções de Implementação

### Opção 1: Traefik com Let's Encrypt (Recomendado) ⭐

**Vantagens:**
- ✅ Já está configurado no projeto (docker-compose.yml)
- ✅ Renovação automática de certificados
- ✅ Suporte a múltiplos domínios
- ✅ Gratuito (Let's Encrypt)
- ✅ Gerenciamento centralizado

**Requisitos:**
- Domínio apontando para o IP do servidor
- Portas 80 e 443 abertas no firewall
- Traefik rodando e configurado

**Passos:**

1. **Configurar DNS:**
   ```
   A     api.phdstudio.com.br    148.230.79.105
   A     wp.phdstudio.com.br     148.230.79.105
   A     mcp.phdstudio.com.br    148.230.79.105
   ```

2. **Atualizar docker-compose.yml:**
   ```yaml
   services:
     phd-api:
       labels:
         - "traefik.enable=true"
         - "traefik.http.routers.phd-api.rule=Host(`api.phdstudio.com.br`)"
         - "traefik.http.routers.phd-api.entrypoints=websecure"
         - "traefik.http.routers.phd-api.tls.certresolver=mytlschallenge"
         - "traefik.http.services.phd-api.loadbalancer.server.port=3001"
   
     wordpress:
       labels:
         - "traefik.enable=true"
         - "traefik.http.routers.wordpress.rule=Host(`wp.phdstudio.com.br`)"
         - "traefik.http.routers.wordpress.entrypoints=websecure"
         - "traefik.http.routers.wordpress.tls.certresolver=mytlschallenge"
         - "traefik.http.services.wordpress.loadbalancer.server.port=80"
   ```

3. **Atualizar configurações:**
   - MCP: `https://wp.phdstudio.com.br/wp-json/phd/v1`
   - API: `https://api.phdstudio.com.br`
   - Frontend: `https://phdstudio.com.br` (já configurado)

**Tempo estimado:** 2-3 horas  
**Custo:** Gratuito  
**Complexidade:** Média

---

### Opção 2: Nginx Reverse Proxy com Certbot

**Vantagens:**
- ✅ Controle total sobre configuração
- ✅ Renovação automática (certbot)
- ✅ Performance excelente
- ✅ Gratuito (Let's Encrypt)

**Requisitos:**
- Nginx instalado
- Domínio apontando para o IP
- Portas 80 e 443 abertas

**Passos:**

1. **Instalar Nginx e Certbot:**
   ```bash
   sudo apt update
   sudo apt install nginx certbot python3-certbot-nginx -y
   ```

2. **Configurar Nginx para WordPress:**
   ```nginx
   # /etc/nginx/sites-available/wp.phdstudio.com.br
   server {
       listen 80;
       server_name wp.phdstudio.com.br;
       
       location / {
           proxy_pass http://127.0.0.1:8080;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

3. **Configurar Nginx para API:**
   ```nginx
   # /etc/nginx/sites-available/api.phdstudio.com.br
   server {
       listen 80;
       server_name api.phdstudio.com.br;
       
       location / {
           proxy_pass http://127.0.0.1:3001;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

4. **Obter certificados SSL:**
   ```bash
   sudo certbot --nginx -d wp.phdstudio.com.br
   sudo certbot --nginx -d api.phdstudio.com.br
   ```

5. **Configurar renovação automática:**
   ```bash
   sudo certbot renew --dry-run
   ```

**Tempo estimado:** 3-4 horas  
**Custo:** Gratuito  
**Complexidade:** Média-Alta

---

### Opção 3: Cloudflare Tunnel (Cloudflared)

**Vantagens:**
- ✅ Gratuito e ilimitado
- ✅ URL fixa (não muda como ngrok)
- ✅ HTTPS automático
- ✅ Proteção DDoS incluída
- ✅ Não precisa abrir portas no firewall

**Requisitos:**
- Conta Cloudflare (gratuita)
- Domínio gerenciado no Cloudflare

**Passos:**

1. **Instalar Cloudflared:**
   ```bash
   wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64
   chmod +x cloudflared-linux-amd64
   sudo mv cloudflared-linux-amd64 /usr/local/bin/cloudflared
   ```

2. **Autenticar:**
   ```bash
   cloudflared tunnel login
   ```

3. **Criar túnel:**
   ```bash
   cloudflared tunnel create phdstudio
   ```

4. **Configurar túnel:**
   ```yaml
   # ~/.cloudflared/config.yml
   tunnel: <tunnel-id>
   credentials-file: /root/.cloudflared/<tunnel-id>.json
   
   ingress:
     - hostname: wp.phdstudio.com.br
       service: http://127.0.0.1:8080
     - hostname: api.phdstudio.com.br
       service: http://127.0.0.1:3001
     - service: http_status:404
   ```

5. **Configurar DNS:**
   ```bash
   cloudflared tunnel route dns phdstudio wp.phdstudio.com.br
   cloudflared tunnel route dns phdstudio api.phdstudio.com.br
   ```

6. **Rodar túnel como serviço:**
   ```bash
   sudo cloudflared service install
   sudo systemctl start cloudflared
   sudo systemctl enable cloudflared
   ```

**Tempo estimado:** 2-3 horas  
**Custo:** Gratuito  
**Complexidade:** Média

---

### Opção 4: Caddy Server

**Vantagens:**
- ✅ HTTPS automático (sem configuração)
- ✅ Renovação automática
- ✅ Configuração simples
- ✅ Gratuito

**Requisitos:**
- Domínio apontando para o IP
- Portas 80 e 443 abertas

**Passos:**

1. **Instalar Caddy:**
   ```bash
   sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
   curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
   curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
   sudo apt update
   sudo apt install caddy
   ```

2. **Configurar Caddyfile:**
   ```caddy
   # /etc/caddy/Caddyfile
   wp.phdstudio.com.br {
       reverse_proxy 127.0.0.1:8080
   }
   
   api.phdstudio.com.br {
       reverse_proxy 127.0.0.1:3001
   }
   ```

3. **Iniciar Caddy:**
   ```bash
   sudo systemctl start caddy
   sudo systemctl enable caddy
   ```

**Tempo estimado:** 1-2 horas  
**Custo:** Gratuito  
**Complexidade:** Baixa

---

## 📊 Comparação de Opções

| Opção | Complexidade | Tempo | Custo | Manutenção | Recomendação |
|-------|--------------|-------|-------|------------|--------------|
| Traefik | Média | 2-3h | Grátis | Baixa | ⭐⭐⭐⭐⭐ |
| Nginx + Certbot | Média-Alta | 3-4h | Grátis | Média | ⭐⭐⭐⭐ |
| Cloudflare Tunnel | Média | 2-3h | Grátis | Baixa | ⭐⭐⭐⭐⭐ |
| Caddy | Baixa | 1-2h | Grátis | Baixa | ⭐⭐⭐⭐ |

## 🎯 Recomendação Final

**Opção Recomendada: Traefik com Let's Encrypt**

**Motivos:**
1. ✅ Já está parcialmente configurado no projeto
2. ✅ Integração nativa com Docker
3. ✅ Renovação automática de certificados
4. ✅ Gerenciamento centralizado
5. ✅ Suporte a múltiplos serviços

## 📝 Plano de Implementação (Traefik)

### Fase 1: Preparação (30 min)

1. Verificar se Traefik está rodando:
   ```bash
   docker ps | grep traefik
   ```

2. Verificar configuração atual do Traefik:
   ```bash
   docker logs traefik
   ```

3. Verificar se portas 80 e 443 estão abertas:
   ```bash
   sudo ufw status
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   ```

### Fase 2: Configuração DNS (30 min)

1. Adicionar registros DNS no provedor:
   ```
   A     api.phdstudio.com.br    148.230.79.105
   A     wp.phdstudio.com.br     148.230.79.105
   ```

2. Aguardar propagação DNS (pode levar até 24h, geralmente 1-2h):
   ```bash
   dig api.phdstudio.com.br
   dig wp.phdstudio.com.br
   ```

### Fase 3: Atualizar Docker Compose (1h)

1. Atualizar `docker-compose.yml` com labels Traefik para:
   - WordPress (porta 8080)
   - API REST (porta 3001)

2. Reiniciar containers:
   ```bash
   cd /root/phdstudio
   docker compose up -d
   ```

### Fase 4: Atualizar Configurações (30 min)

1. Atualizar MCP server:
   - Mudar URL de `http://148.230.79.105:8080` para `https://wp.phdstudio.com.br`

2. Atualizar documentação:
   - Atualizar todos os curls para usar HTTPS
   - Atualizar README.md

3. Testar todos os endpoints:
   ```bash
   curl https://api.phdstudio.com.br/health
   curl https://wp.phdstudio.com.br/wp-json/phd/v1/lead/teste@example.com
   ```

### Fase 5: Validação (30 min)

1. Testar renovação automática:
   ```bash
   docker exec traefik certbot certificates
   ```

2. Verificar logs:
   ```bash
   docker logs traefik
   ```

3. Testar todos os serviços:
   - WordPress: `https://wp.phdstudio.com.br`
   - API: `https://api.phdstudio.com.br/health`
   - MCP: Testar via Cursor

## 🔒 Segurança Adicional

Após implementar HTTPS:

1. **Forçar HTTPS:**
   - Configurar redirecionamento HTTP → HTTPS
   - Adicionar HSTS headers

2. **Firewall:**
   - Fechar portas HTTP/HTTPS diretas (80, 443, 8080, 3001)
   - Manter apenas Traefik acessível

3. **Rate Limiting:**
   - Configurar rate limiting no Traefik
   - Proteger contra DDoS

## 📞 Próximos Passos

1. ✅ Escolher opção de implementação
2. ⏳ Configurar DNS
3. ⏳ Implementar solução escolhida
4. ⏳ Atualizar todas as configurações
5. ⏳ Testar e validar
6. ⏳ Documentar mudanças

## 🆘 Troubleshooting

### Certificado não é gerado

**Causa:** DNS não propagado ou porta 80 bloqueada.

**Solução:**
```bash
# Verificar DNS
dig api.phdstudio.com.br

# Verificar portas
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :443

# Verificar logs Traefik
docker logs traefik | grep -i cert
```

### Erro 502 Bad Gateway

**Causa:** Serviço backend não está acessível.

**Solução:**
```bash
# Verificar se serviços estão rodando
docker ps

# Testar conectividade interna
curl http://127.0.0.1:8080
curl http://127.0.0.1:3001/health
```

### Certificado expira

**Causa:** Renovação automática não configurada.

**Solução:**
```bash
# Verificar renovação automática
docker exec traefik certbot renew --dry-run

# Renovar manualmente se necessário
docker exec traefik certbot renew
```

## 📚 Referências

- [Traefik Documentation](https://doc.traefik.io/traefik/)
- [Let's Encrypt](https://letsencrypt.org/)
- [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)
- [Caddy Server](https://caddyserver.com/docs/)


