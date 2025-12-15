# PHD Studio - Documentação Completa

Aplicação React/Vite com deploy automatizado via Docker e Traefik.

**Domínio**: phdstudio.com.br  
**IP do Servidor**: 148.230.79.105

---

## 📋 Índice

1. [Status da Implantação](#status-da-implantação)
2. [Configuração Inicial](#configuração-inicial)
3. [Deploy](#deploy)
4. [Configuração de Domínio](#configuração-de-domínio)
5. [Variáveis de Ambiente](#variáveis-de-ambiente)
6. [Comandos Úteis](#comandos-úteis)
7. [Deploy Automatizado](#deploy-automatizado)
8. [Documentação Técnica](#documentação-técnica)
9. [Troubleshooting](#troubleshooting)

---

## ✅ Status da Implantação

**Status**: ✅ **IMPLANTADO COM SUCESSO**  
**Data**: 15/12/2025

### O que está funcionando:

- ✅ Container `phdstudio-app` rodando
- ✅ Aplicação React/Vite buildada e servida pelo Nginx
- ✅ Conectado à rede `n8n_default` (mesma do Traefik)
- ✅ Labels do Traefik configurados corretamente
- ✅ Entrypoints: `web` (HTTP) e `websecure` (HTTPS)
- ✅ Certificate resolver: `mytlschallenge`

### Configuração Atual:

- **Container**: `phdstudio-app`
- **Rede**: `n8n_default`
- **Porta interna**: 80 (exposta apenas na rede Docker)
- **Traefik**: Detecta automaticamente via labels

---

## 🚀 Configuração Inicial

### Pré-requisitos

- Docker e Docker Compose instalados ✅
- Traefik rodando na rede `n8n_default` ✅
- Arquivo `.env` configurado (veja seção abaixo)

### Estrutura de Arquivos

```
/root/phdstudio/
├── docker-compose.yml      # Configuração Docker com Traefik
├── Dockerfile              # Build da aplicação
├── nginx.conf              # Configuração Nginx com SSL
├── nginx-init.conf         # Configuração inicial (sem SSL)
├── .env                    # Variáveis de ambiente (criar/preencher)
├── deploy.sh               # Script de deploy automático
├── backups/                # Backups e scripts de rollback
└── README.md               # Esta documentação
```

---

## 🔧 Deploy

### Deploy Manual (servidor)

```bash
cd /root/phdstudio
docker compose up -d --build
```

### Deploy via Script Local (servidor)

```bash
cd /root/phdstudio
./deploy.sh
```

### Deploy Automatizado (GitHub Actions → servidor) ✅

Fluxo atual (sem Easypanel):

1. **Servidor** (`srv934629`):
   - Projeto clonado em `/root/phdstudio`
   - Docker + Docker Compose instalados
   - Script `deploy-remote.sh` presente no diretório do projeto
2. **GitHub** (repositório `DonavanAlencar/phdstudio`):
   - Secret `SSH_PRIVATE_KEY` configurado com a chave privada `id_ed25519_phdstudio`
   - Secret `SERVER_HOST` configurado com o IP/host do servidor (ex.: `148.230.79.105`)
   - Workflow `.github/workflows/deploy.yml` habilitado

Quando houver **push na branch `main` ou `master`**, o GitHub:

- Abre conexão SSH com `root@${SERVER_HOST}`
- Entra em `/root/phdstudio`
- Executa:

```bash
./deploy-remote.sh
```

O script `deploy-remote.sh` faz:

- `git fetch` / `git pull origin main`  
- Carrega variáveis do `.env` (se existir)  
- Para e remove o container antigo `phdstudio-app`  
- `docker compose build`  
- `docker compose up -d`  
- `docker image prune -f`  

#### Como testar o deploy automatizado

1. Confirme que você consegue acessar o servidor com a mesma chave usada no GitHub:

```bash
ssh -i ~/.ssh/id_ed25519_phdstudio root@148.230.79.105
```

2. No GitHub, verifique em **Settings → Secrets and variables → Actions**:
   - `SSH_PRIVATE_KEY` preenchido com o conteúdo de `~/.ssh/id_ed25519_phdstudio`
   - `SERVER_HOST` = `148.230.79.105`

3. Faça uma pequena alteração no código (por exemplo, comentário em `App.tsx`), faça commit e push na **`main`**:

```bash
git add .
git commit -m "teste: deploy automatizado"
git push origin main
```

4. Acesse a aba **Actions → Deploy to Server** no GitHub e acompanhe o job:
   - As etapas **Checkout code**, **Setup SSH** e **Deploy to server (Docker / Traefik)** devem ficar verdes

5. No servidor, valide:

```bash
docker ps | grep phdstudio-app
docker logs -f phdstudio-app
```

### Verificar Status

```bash
# Ver container
docker ps | grep phdstudio

# Ver logs
docker logs -f phdstudio-app

# Testar aplicação (dentro do container)
docker exec phdstudio-app curl -s http://localhost | head -20
```

### Rebuild (após alterar .env)

```bash
cd /root/phdstudio
docker compose up -d --build
```

---

## 🌐 Configuração de Domínio

### 1. Configurar DNS no Registro.br

1. Acesse: https://registro.br
2. Faça login e vá em **Meus Domínios** → Selecione `phdstudio.com.br`
3. Clique em **DNS** ou **Gerenciar DNS**
4. Adicione/edite o registro:

```
Tipo: A
Nome: @ (ou deixe em branco para raiz)
Valor: 148.230.79.105
TTL: 3600
```

### 2. Aguardar Propagação DNS

- DNS pode levar de 5 minutos a 48 horas
- Verificar com: `dig phdstudio.com.br` ou `nslookup phdstudio.com.br`

### 3. SSL Automático

Após o DNS propagar, o Traefik irá:
- Detectar automaticamente o domínio
- Solicitar certificado SSL via Let's Encrypt
- Configurar HTTPS automaticamente

**Não é necessário configurar manualmente!**

### 4. Acessar

Após propagação do DNS:
- **HTTPS**: https://phdstudio.com.br (SSL automático via Traefik)
- **HTTP**: http://phdstudio.com.br (redireciona automaticamente para HTTPS)

---

## 🔐 Variáveis de Ambiente

### Arquivo .env

Edite o arquivo `/root/phdstudio/.env` e preencha as variáveis:

```bash
nano /root/phdstudio/.env
```

### Variáveis Necessárias

```env
# Google Gemini API
GEMINI_API_KEY=sua-chave-aqui

# EmailJS - Configure apenas seu email Gmail
VITE_RECIPIENT_EMAIL=seu-email@gmail.com

# EmailJS - Configure uma vez (obtenha em https://www.emailjs.com)
VITE_EMAILJS_SERVICE_ID=seu-service-id
VITE_EMAILJS_TEMPLATE_ID=seu-template-id
VITE_EMAILJS_PUBLIC_KEY=sua-public-key
```

### Importante

⚠️ **As variáveis são usadas no BUILD, não em runtime.**  
Se alterar o `.env`, você precisa fazer rebuild:

```bash
cd /root/phdstudio
docker compose up -d --build
```

---

## 🛠️ Comandos Úteis

### Gerenciamento do Container

```bash
# Ver logs
docker logs -f phdstudio-app

# Parar aplicação
cd /root/phdstudio && docker compose down

# Reiniciar aplicação
cd /root/phdstudio && docker compose restart

# Rebuild completo
cd /root/phdstudio && docker compose up -d --build

# Ver status
docker ps | grep phdstudio
```

### Verificação

```bash
# Container rodando
docker ps | grep phdstudio-app

# Rede conectada
docker network inspect n8n_default | grep phdstudio

# Labels do Traefik
docker inspect phdstudio-app | grep -A 10 "Labels"

# Logs do Traefik
docker logs -f n8n-traefik-1
```

### Testes

```bash
# Testar aplicação (dentro do container)
docker exec phdstudio-app curl -s http://localhost | head -20

# Testar acesso externo (após DNS propagar)
curl -I https://phdstudio.com.br
```

---

## 🔄 Deploy Automatizado

### Opção 1: Webhook (Recomendado) ⭐

O webhook recebe notificações do GitHub/GitLab quando há push e dispara o deploy automaticamente.

#### Configuração:

1. **Execute o script de setup:**
   ```bash
   cd /root/phdstudio
   bash setup-automated-deploy.sh
   ```

2. **Configure webhook no GitHub:**
   - Acesse: https://github.com/DonavanAlencar/phdstudio/settings/hooks
   - Clique em "Add webhook"
   - **Payload URL**: `http://148.230.79.105:9000/webhook`
   - **Content type**: `application/json`
   - **Events**: Selecione "Just the push event"
   - Clique em "Add webhook"

### Opção 2: Cron Job

O cron job verifica periodicamente se há atualizações no repositório.

- **Frequência**: A cada 5 minutos
- **Log**: `/var/log/phdstudio-deploy.log`

### Opção 3: GitHub Actions

O GitHub Actions executa o deploy automaticamente quando há push na branch main.

1. **Configure secrets no GitHub:**
   - Acesse: https://github.com/DonavanAlencar/phdstudio/settings/secrets/actions
   - Adicione:
     - `SSH_PRIVATE_KEY`: Sua chave SSH privada
     - `SERVER_HOST`: `148.230.79.105`

2. **O workflow já está configurado** em `.github/workflows/deploy.yml`

### Verificar Deploy Automatizado

```bash
# Ver logs do deploy
tail -f /var/log/phdstudio-deploy.log

# Ver logs do webhook
tail -f /var/log/phdstudio-webhook.log
```

---

## 📚 Documentação Técnica

### Valores do JSON

Todos os valores numéricos das telas vêm do arquivo JSON:

**Arquivo**: `public/data/projecoes_faturamento_vendas.json`

#### Estrutura do JSON:

1. **Agregados por Cenário** (dentro de cada cenário)
   ```json
   {
     "nome": "Conservador",
     "dadosMensais": [...],
     "agregados": {
       "totalLeads": 845,
       "totalVendas": 12,
       "totalTrafego": 2452,
       "totalInvestimento": 19800,
       "cpaMedio": 1650,
       "conversaoMedia": 1.420
     }
   }
   ```

2. **Valores do Funil** (em `dadosAdicionais.funil`)
   ```json
   "funil": {
     "valoresFunil": {
       "start": {
         "trafegoTotal": 2452,
         "leads": 845,
         "conversoes": 380,
         "vendas": 12
       }
     }
   }
   ```

3. **Investimento por Canal** (em `dadosAdicionais.estruturaCanais`)
   ```json
   "estruturaCanais": {
     "metaAds": {
       "investimentoPorPlano": {
         "start": 900,
         "premium": 1200
       }
     }
   }
   ```

#### Como Atualizar Valores:

1. Edite `public/data/projecoes_faturamento_vendas.json`
2. Atualize os valores desejados
3. Faça rebuild: `docker compose up -d --build`

---

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

---

## 🔍 Troubleshooting

### Container não inicia

```bash
# Ver logs detalhados
docker logs phdstudio-app

# Verificar se há erros no build
docker compose build --no-cache
```

### Traefik não detecta o serviço

```bash
# Verificar se container está na rede correta
docker network inspect n8n_default | grep phdstudio

# Verificar labels do Traefik
docker inspect phdstudio-app | grep -A 10 "Labels"

# Ver logs do Traefik
docker logs n8n-traefik-1 | tail -50
```

### DNS não propagou

```bash
# Verificar DNS
dig phdstudio.com.br
nslookup phdstudio.com.br

# Verificar IP do servidor
curl -4 ifconfig.me
```

### SSL não funciona

1. Aguarde alguns minutos (certificados podem levar 2-5 minutos)
2. Verifique se o DNS propagou completamente
3. Verifique logs do Traefik: `docker logs n8n-traefik-1`

### Variáveis de ambiente não funcionam

⚠️ **Lembre-se**: Variáveis são usadas no BUILD, não em runtime.

Se alterou o `.env`, faça rebuild:

```bash
docker compose up -d --build
```

### Aplicação não atualiza após deploy

1. Verifique se o build foi concluído: `docker compose build`
2. Verifique logs: `docker logs phdstudio-app`
3. Force rebuild: `docker compose up -d --build --force-recreate`

---

## 📝 Notas Importantes

1. **Variáveis de ambiente**: Usadas no BUILD, não em runtime. Alterar `.env` requer rebuild.

2. **Traefik**: Detecta automaticamente containers na rede `n8n_default` com labels `traefik.enable=true`.

3. **SSL**: Certificado SSL será gerado automaticamente quando o DNS propagar.

4. **Rede**: Container está na mesma rede do Traefik (`n8n_default`), permitindo comunicação interna.

5. **Entrypoints Traefik**:
   - HTTP: `web` (porta 80) - redireciona automaticamente para HTTPS
   - HTTPS: `websecure` (porta 443)
   - Certificate resolver: `mytlschallenge`

---

## 📞 Suporte

Em caso de problemas:

1. Verificar logs: `docker logs phdstudio-app`
2. Verificar logs do Traefik: `docker logs n8n-traefik-1`
3. Verificar rede: `docker network inspect n8n_default`
4. Executar rollback se necessário: `./backups/ROLLBACK.sh`

---

## 📁 Backups

Backups automáticos são criados em `/root/phdstudio/backups/`:

- `docker-compose.yml.backup-*` - Backups do docker-compose.yml
- `ROLLBACK.sh` - Script de rollback

---

**Última atualização**: 15/12/2025
