# Implantação Docker - PHD Studio

## ✅ Status: IMPLANTADO COM SUCESSO

Data: 15/12/2025 02:15 UTC

## 📋 O que foi feito

### 1. Configuração Docker
- ✅ Ajustado `docker-compose.yml` para usar rede `n8n_default` (onde o Traefik está)
- ✅ Corrigidos entrypoints do Traefik:
  - HTTP: `web` (redireciona automaticamente para HTTPS)
  - HTTPS: `websecure`
  - Certificate resolver: `mytlschallenge`
- ✅ Container `phdstudio-app` criado e rodando

### 2. Arquivos criados
- ✅ `.env` - Arquivo de variáveis de ambiente (precisa ser preenchido)
- ✅ `backups/ROLLBACK.sh` - Script de rollback
- ✅ Backups automáticos do `docker-compose.yml`

### 3. Build e Deploy
- ✅ Build da aplicação React/Vite concluído
- ✅ Container implantado e rodando
- ✅ Nginx servindo a aplicação na porta 80 (interno)

## 🔧 Configuração Atual

### Container
- **Nome**: `phdstudio-app`
- **Rede**: `n8n_default` (mesma do Traefik)
- **Porta interna**: 80 (exposta apenas na rede Docker)
- **Status**: ✅ Rodando

### Traefik
- **Entrypoint HTTP**: `web` (porta 80) - redireciona para HTTPS
- **Entrypoint HTTPS**: `websecure` (porta 443)
- **Certificate Resolver**: `mytlschallenge`
- **Domínio configurado**: `phdstudio.com.br`

## ⚠️ Próximos Passos

### 1. Configurar variáveis de ambiente
Edite o arquivo `.env` e preencha as variáveis:

```bash
nano /root/phdstudio/.env
```

Variáveis necessárias:
- `GEMINI_API_KEY` - Chave da API do Google Gemini
- `VITE_EMAILJS_SERVICE_ID` - ID do serviço EmailJS
- `VITE_EMAILJS_TEMPLATE_ID` - ID do template EmailJS
- `VITE_EMAILJS_PUBLIC_KEY` - Chave pública EmailJS
- `VITE_RECIPIENT_EMAIL` - Email para receber mensagens

**Após preencher, reconstrua o container:**
```bash
cd /root/phdstudio
docker compose up -d --build
```

### 2. Configurar DNS
No Registro.br, configure o registro A:

```
Tipo: A
Nome: @ (ou deixe em branco)
Valor: [IP do servidor]
TTL: 3600
```

**Para descobrir o IP do servidor:**
```bash
curl -4 ifconfig.me
```

### 3. Aguardar propagação DNS
- DNS pode levar de 5 minutos a 48 horas
- Verificar com: `dig phdstudio.com.br` ou `nslookup phdstudio.com.br`

### 4. SSL automático
Após o DNS propagar, o Traefik irá:
- Detectar automaticamente o domínio
- Solicitar certificado SSL via Let's Encrypt
- Configurar HTTPS automaticamente

## 🛠️ Comandos Úteis

### Ver logs
```bash
docker logs -f phdstudio-app
```

### Ver logs do Traefik
```bash
docker logs -f n8n-traefik-1
```

### Parar aplicação
```bash
cd /root/phdstudio
docker compose down
```

### Reiniciar aplicação
```bash
cd /root/phdstudio
docker compose restart
```

### Rebuild completo
```bash
cd /root/phdstudio
docker compose up -d --build
```

### Verificar status
```bash
docker ps | grep phdstudio
```

### Testar aplicação (dentro do container)
```bash
docker exec phdstudio-app curl -s http://localhost | head -20
```

## 🔄 Rollback

Se precisar reverter as mudanças:

```bash
cd /root/phdstudio
./backups/ROLLBACK.sh
```

Ou manualmente:
```bash
docker stop phdstudio-app
docker rm phdstudio-app
```

## 📝 Notas Importantes

1. **Variáveis de ambiente**: As variáveis são usadas no BUILD, não em runtime. Se alterar o `.env`, precisa fazer rebuild.

2. **Traefik**: O Traefik detecta automaticamente containers na rede `n8n_default` com labels `traefik.enable=true`.

3. **SSL**: O certificado SSL será gerado automaticamente quando o DNS propagar e o Traefik conseguir validar o domínio.

4. **Rede**: O container está na mesma rede do Traefik (`n8n_default`), permitindo comunicação interna.

## 🔍 Verificação

### Container rodando
```bash
docker ps | grep phdstudio-app
```

### Rede conectada
```bash
docker network inspect n8n_default | grep phdstudio
```

### Labels do Traefik
```bash
docker inspect phdstudio-app | grep -A 10 "Labels"
```

## 📞 Suporte

Em caso de problemas:
1. Verificar logs: `docker logs phdstudio-app`
2. Verificar logs do Traefik: `docker logs n8n-traefik-1`
3. Verificar rede: `docker network inspect n8n_default`
4. Executar rollback se necessário

