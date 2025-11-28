# PHD Studio - Deploy Docker

Aplicação React/Vite com deploy automatizado via Docker.

## 🚀 Deploy Rápido

```bash
./deploy.sh
```

A aplicação está configurada para usar Traefik automaticamente.
Domínio: **phdstudio.com.br** (portas 80/443)

## 📋 Pré-requisitos

- Docker e Docker Compose instalados
- Arquivo `.env` com `GEMINI_API_KEY` (o script cria se não existir)

## 🌐 Configuração DNS no Registro.br

### Passo 1: Acesse o Registro.br

1. Acesse: https://registro.br
2. Faça login com sua conta
3. Vá em **Meus Domínios** → Selecione seu domínio

### Passo 2: Configurar DNS

1. Clique em **DNS** ou **Gerenciar DNS**
2. Adicione/edite os registros:

#### Para domínio raiz (phdstudio.com.br):
```
Tipo: A
Nome: @ (ou deixe em branco para raiz)
Valor: 148.230.79.105
TTL: 3600
```

### Passo 3: Aguardar Propagação

- DNS pode levar de 5 minutos a 48 horas para propagar
- Verifique com: `dig phdstudio.com.br` ou `nslookup phdstudio.com.br`

### Passo 4: Acessar

Após propagação do DNS, acesse:
- **HTTPS**: https://phdstudio.com.br (SSL automático via Traefik)
- **HTTP**: http://phdstudio.com.br (redireciona para HTTPS)

## 🔒 SSL/HTTPS

SSL é configurado automaticamente pelo Traefik quando o DNS propagar.
Não é necessário configurar manualmente.

## 📁 Estrutura de Arquivos

- `deploy.sh` - Script de deploy automático
- `docker-compose.yml` - Configuração Docker com Traefik
- `Dockerfile` - Build da aplicação
- `nginx.conf` - Configuração Nginx com SSL
- `nginx-init.conf` - Configuração inicial (sem SSL)

## 🛠️ Comandos Úteis

```bash
# Ver logs
docker logs -f phdstudio-app

# Parar
docker compose down

# Reiniciar
docker compose restart

# Rebuild
docker compose up -d --build
```

## 🔍 Verificar Status

```bash
# Ver container
docker ps | grep phdstudio

# Testar acesso (após DNS propagar)
curl https://phdstudio.com.br
```

## 📝 Notas

- **Domínio**: phdstudio.com.br (configurado no Traefik)
- **Portas**: 80 (HTTP) e 443 (HTTPS) - gerenciadas pelo Traefik
- **SSL**: Automático via Traefik/Let's Encrypt
