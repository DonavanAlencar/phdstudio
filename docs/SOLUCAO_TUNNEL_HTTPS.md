# Solução: Tunnel HTTPS sem Domínio

## Problema
O navegador bloqueia requisições HTTP quando o site está em HTTPS (Mixed Content). Sem um domínio próprio, não podemos configurar SSL diretamente.

## Solução: Tunnel HTTPS Gratuito

Use um serviço de tunnel que fornece HTTPS grátis apontando para seu servidor HTTP.

---

## Opção 1: Cloudflare Tunnel (Recomendado - Gratuito e Ilimitado)

### Vantagens:
- ✅ Totalmente gratuito
- ✅ Sem limite de tráfego
- ✅ Subdomínio personalizado
- ✅ Sem necessidade de instalar nada no servidor (pode rodar localmente)

### Passo a Passo:

1. **Criar conta no Cloudflare** (se não tiver)
   - Acesse: https://dash.cloudflare.com/sign-up
   - É gratuito

2. **Instalar cloudflared** (cliente do tunnel)
   ```bash
   # Linux
   wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64
   chmod +x cloudflared-linux-amd64
   sudo mv cloudflared-linux-amd64 /usr/local/bin/cloudflared
   
   # Ou via package manager
   # Ubuntu/Debian
   sudo apt install cloudflared
   ```

3. **Autenticar no Cloudflare**
   ```bash
   cloudflared tunnel login
   ```
   - Isso abrirá o navegador para autenticar

4. **Criar um tunnel**
   ```bash
   cloudflared tunnel create phdstudio-webhook
   ```

5. **Configurar o tunnel**
   ```bash
   # Criar arquivo de configuração
   mkdir -p ~/.cloudflared
   nano ~/.cloudflared/config.yml
   ```
   
   Conteúdo do arquivo:
   ```yaml
   tunnel: <TUNNEL_ID>  # ID retornado no passo 4
   credentials-file: /root/.cloudflared/<TUNNEL_ID>.json
   
   ingress:
     - hostname: phdstudio-webhook.your-subdomain.workers.dev
       service: http://148.230.79.105:5679
     - service: http_status:404
   ```

6. **Rodar o tunnel**
   ```bash
   cloudflared tunnel run phdstudio-webhook
   ```

7. **Configurar URL no .env**
   ```bash
   VITE_CHAT_WEBHOOK_URL=https://phdstudio-webhook.your-subdomain.workers.dev/webhook/32f58b69-ef50-467f-b884-50e72a5eefa2
   ```

---

## Opção 2: ngrok (Mais Simples, mas com Limites)

### Vantagens:
- ✅ Muito fácil de usar
- ✅ Setup em 2 minutos
- ⚠️ Limite de 40 conexões/minuto no plano gratuito
- ⚠️ URL muda a cada reinício (pode usar domínio fixo no plano pago)

### Passo a Passo:

1. **Criar conta no ngrok**
   - Acesse: https://dashboard.ngrok.com/signup
   - É gratuito

2. **Instalar ngrok**
   ```bash
   # Linux
   wget https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz
   tar -xzf ngrok-v3-stable-linux-amd64.tgz
   sudo mv ngrok /usr/local/bin/
   
   # Ou via snap
   sudo snap install ngrok
   ```

3. **Autenticar**
   ```bash
   ngrok config add-authtoken <SEU_TOKEN>
   ```
   - Token disponível em: https://dashboard.ngrok.com/get-started/your-authtoken

4. **Iniciar tunnel**
   ```bash
   ngrok http 148.230.79.105:5679
   ```

5. **Copiar a URL HTTPS** (exemplo: `https://abc123.ngrok-free.app`)

6. **Configurar URL no .env**
   ```bash
   VITE_CHAT_WEBHOOK_URL=https://abc123.ngrok-free.app/webhook/32f58b69-ef50-467f-b884-50e72a5eefa2
   ```

7. **Manter ngrok rodando** (use systemd ou screen/tmux)
   ```bash
   # Criar serviço systemd
   sudo nano /etc/systemd/system/ngrok.service
   ```
   
   Conteúdo:
   ```ini
   [Unit]
   Description=ngrok tunnel
   After=network.target
   
   [Service]
   Type=simple
   User=root
   ExecStart=/usr/local/bin/ngrok http 148.230.79.105:5679
   Restart=always
   
   [Install]
   WantedBy=multi-user.target
   ```
   
   Ativar:
   ```bash
   sudo systemctl enable ngrok
   sudo systemctl start ngrok
   ```

---

## Opção 3: LocalTunnel (Open Source, Sem Conta)

### Vantagens:
- ✅ Não precisa de conta
- ✅ Open source
- ⚠️ URL muda a cada reinício
- ⚠️ Pode ser instável

### Passo a Passo:

1. **Instalar via npm** (já tem Node no servidor)
   ```bash
   npm install -g localtunnel
   ```

2. **Iniciar tunnel**
   ```bash
   lt --port 5679 --subdomain phdstudio-webhook
   ```
   - URL será: `https://phdstudio-webhook.loca.lt`

3. **Configurar URL no .env**
   ```bash
   VITE_CHAT_WEBHOOK_URL=https://phdstudio-webhook.loca.lt/webhook/32f58b69-ef50-467f-b884-50e72a5eefa2
   ```

---

## Recomendação

**Use Cloudflare Tunnel** se:
- Quer estabilidade e URL fixa
- Não quer limites de tráfego
- Pode configurar uma vez e esquecer

**Use ngrok** se:
- Quer algo rápido e simples
- Não se importa com limites básicos
- Quer interface web para monitorar

**Use LocalTunnel** se:
- Quer algo temporário/teste
- Não quer criar conta em lugar nenhum

---

## Após Configurar

1. Atualize o arquivo `.env` com a nova URL HTTPS
2. Rebuild da aplicação:
   ```bash
   cd /root/phdstudio
   docker compose up -d --build
   ```
3. Teste em: `https://phdstudio.com.br/chat-diagnostico`

---

## Troubleshooting

### Tunnel não conecta
- Verifique se o servidor HTTP está acessível: `curl http://148.230.79.105:5679`
- Verifique firewall: `sudo ufw status`
- Verifique se a porta está aberta: `netstat -tulpn | grep 5679`

### URL muda a cada reinício (ngrok/LocalTunnel)
- Use Cloudflare Tunnel para URL fixa
- Ou configure um script que atualiza o .env automaticamente

### Erro 502 Bad Gateway
- Verifique se o tunnel está rodando
- Verifique se o servidor HTTP está respondendo
- Verifique logs do tunnel


