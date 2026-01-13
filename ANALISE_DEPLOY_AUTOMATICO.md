# 📋 Análise do Fluxo de Deploy Automático - GitHub Actions

## 🎯 Visão Geral

O projeto PHD Studio utiliza **GitHub Actions** para realizar deploy automático de ponta a ponta sempre que há push na branch `main` ou `master`, ou quando acionado manualmente via `workflow_dispatch`.

---

## 🔄 Fluxo Completo de Deploy

### **1. Trigger (Gatilho do Workflow)**

O workflow é acionado automaticamente em duas situações:

```yaml
on:
  push:
    branches:
      - main
      - master
  workflow_dispatch:  # Permite execução manual
```

**Arquivo:** `.github/workflows/deploy.yml`

---

### **2. Ambiente de Execução**

- **Runner:** `ubuntu-latest` (máquina virtual do GitHub)
- **Timeout:** 15 minutos máximo
- **Job:** `deploy` (único job do workflow)

---

### **3. Etapas do Deploy (Step-by-Step)**

#### **Step 1: Checkout do Código**
```yaml
- name: Checkout code
  uses: actions/checkout@v3
```
- Faz checkout do código do repositório no runner do GitHub Actions
- Prepara o ambiente com todos os arquivos do projeto

---

#### **Step 2: Setup SSH**
```yaml
- name: Setup SSH
  uses: webfactory/ssh-agent@v0.7.0
  with:
    ssh-private-key: ${{ secrets.SSH_PRIVATE_KEY }}
```
- Configura o agente SSH usando a chave privada armazenada nos GitHub Secrets
- Permite conexão segura com o servidor de produção
- **Secrets necessários:** `SSH_PRIVATE_KEY`

---

#### **Step 3: Teste de Conectividade do Servidor**
```yaml
- name: Test server connectivity
  timeout-minutes: 2
```
**Ações realizadas:**
1. Testa ping ao servidor (pode falhar se ICMP estiver bloqueado - não é crítico)
2. Testa conectividade na porta 22 (SSH)
3. Valida se o servidor está acessível antes de prosseguir
4. **Secrets necessários:** `SERVER_HOST` (IP ou hostname do servidor)

**Validações:**
- ✅ Porta 22 acessível
- ✅ Servidor online
- ❌ Falha se não conseguir conectar (com mensagens de troubleshooting)

---

#### **Step 4: Teste de Conexão SSH**
```yaml
- name: Test SSH connection
  timeout-minutes: 2
```
**Ações realizadas:**
1. Testa conexão SSH real com o servidor
2. Usa opções de segurança:
   - `StrictHostKeyChecking=no` (aceita host automaticamente)
   - `ConnectTimeout=20` (timeout de 20s)
   - `ServerAliveInterval=30` (mantém conexão viva)
   - `BatchMode=yes` (modo não-interativo)
3. Executa comando simples: `echo "✅ Conexão SSH OK"`
4. **Se falhar:** Exibe mensagens de troubleshooting detalhadas

---

#### **Step 5: Deploy no Servidor**
```yaml
- name: Deploy to server (Docker / Traefik)
  timeout-minutes: 10
```
**Ações realizadas via SSH:**
1. Conecta ao servidor via SSH
2. Navega para `/root/phdstudio`
3. Torna o script executável: `chmod +x deploy-remote.sh`
4. Executa o script de deploy: `./deploy-remote.sh`

---

### **4. Script de Deploy Remoto (`deploy-remote.sh`)**

O script `deploy-remote.sh` executa as seguintes etapas no servidor:

#### **4.1. Validações Iniciais**

**a) Verificação de Diretório**
- Valida se `/root/phdstudio` existe
- Navega para o diretório do projeto

**b) Verificação do Docker**
- Verifica se Docker está instalado
- Verifica se Docker Compose está disponível
- Exibe versões instaladas

**c) Verificação de Arquivo .env**
- Verifica se existe arquivo `.env` no servidor
- Se existir, carrega as variáveis de ambiente
- Se não existir, continua com aviso (usa valores padrão)

**d) Verificação do Traefik**
- Verifica se o Traefik (proxy reverso) está rodando
- Traefik é necessário para roteamento e SSL automático
- Se não estiver rodando, exibe aviso mas continua

---

#### **4.2. Atualização do Código (Git Pull)**

```bash
git_pull()
```

**Lógica:**
1. Faz `git fetch origin main`
2. Compara commits local vs remoto:
   - **Se iguais:** Nenhuma mudança, encerra o deploy
   - **Se remoto mais novo:** Faz `git pull`
   - **Se local tem commits não enviados:** Faz merge
3. **Se não houver mudanças:** Script encerra com sucesso (não faz rebuild desnecessário)

---

#### **4.3. Parada de Containers Existentes**

```bash
stop_existing()
```

**Ações:**
1. Verifica se container `phdstudio-app` existe
2. Para o container: `docker stop phdstudio-app`
3. Remove o container: `docker rm phdstudio-app`
4. Prepara ambiente limpo para novo deploy

---

#### **4.4. Build da Imagem Docker**

```bash
build_image()
```

**Comando executado:**
```bash
docker compose -f docker-compose.yml build
```

**O que acontece:**

**a) Build do Frontend (`phdstudio` service):**
- Usa `Dockerfile` multi-stage
- **Stage 1 (Builder):**
  - Base: `node:20-alpine`
  - Instala dependências (`npm ci` ou `npm install`)
  - Copia código fonte
  - Cria `.env.local` com variáveis de ambiente (build-time)
  - Executa `npm run build` (gera arquivos em `/app/dist`)
- **Stage 2 (Production):**
  - Base: `nginx:alpine`
  - Copia arquivos buildados de `/app/dist` para `/usr/share/nginx/html`
  - Copia configuração nginx: `nginx-init.conf`
  - Expõe portas 80 e 443

**b) Build da API (`phd-api` service):**
- Usa `api/Dockerfile`
- Base: `node:20-alpine`
- Instala apenas dependências de produção
- Copia código da API
- Expõe porta 3001

**Variáveis de ambiente passadas como build args:**
- `GEMINI_API_KEY`
- `VITE_EMAILJS_SERVICE_ID`
- `VITE_EMAILJS_TEMPLATE_ID`
- `VITE_EMAILJS_PUBLIC_KEY`
- `VITE_RECIPIENT_EMAIL`
- `VITE_CHAT_WEBHOOK_URL`
- `VITE_CHAT_AUTH_TOKEN`
- `VITE_API_URL`
- `VITE_INSTAGRAM_API_URL`

---

#### **4.5. Deploy com Docker Compose**

```bash
deploy()
```

**Comando executado:**
```bash
docker compose -f docker-compose.yml up -d
```

**O que acontece:**

**a) Criação de Containers:**
- **Container `phdstudio-app`:**
  - Imagem do frontend (nginx servindo arquivos estáticos)
  - Expõe porta 80 internamente
  - Labels Traefik configurados:
    - Roteamento: `Host(phdstudio.com.br) && !PathPrefix(/api)`
    - Entrypoint: `websecure` (HTTPS)
    - Certificado SSL: `mytlschallenge` (Let's Encrypt automático)
    - Porta do serviço: 80
  - Rede: `n8n_default` (compartilhada com outros serviços)

- **Container `phd-api`:**
  - Imagem da API Node.js
  - Expõe porta 3001 internamente
  - Labels Traefik configurados:
    - Roteamento: `Host(phdstudio.com.br) && PathPrefix(/api)`
    - Middleware: Remove prefixo `/api` antes de encaminhar
    - Entrypoint: `websecure` (HTTPS)
    - Certificado SSL: `mytlschallenge`
    - Porta do serviço: 3001
  - Redes: `n8n_default`, `wordpress_wp_network`, `phd_crm_network`
  - Healthcheck configurado: `/api/crm/v1/health`

**b) Variáveis de Ambiente (Runtime):**
- Carregadas do arquivo `.env` do servidor
- Incluem:
  - Credenciais de banco de dados (MySQL, PostgreSQL)
  - JWT secrets
  - API keys
  - Tokens do Instagram
  - URLs e configurações

**c) Restart Policy:**
- `restart: unless-stopped` (reinicia automaticamente se parar)

---

#### **4.6. Verificação de Status**

```bash
check_status()
```

**Ações:**
1. Aguarda 3 segundos (tempo para containers iniciarem)
2. Verifica se container `phdstudio-app` está rodando
3. Se não estiver rodando:
   - Exibe logs do container
   - Lista todos os containers
   - Encerra com erro

---

#### **4.7. Limpeza de Imagens Antigas**

```bash
cleanup_images()
```

**Ações:**
- Executa `docker image prune -f`
- Remove imagens Docker não utilizadas
- Libera espaço em disco
- Não remove imagens em uso

---

### **5. Notificação Final**

```yaml
- name: Notify deployment
  if: always()
```

**Ações:**
- Executa sempre (sucesso ou falha)
- Se sucesso: Exibe mensagem de sucesso
- Se falha: Exibe troubleshooting detalhado:
  - Como verificar se servidor está online
  - Como testar porta SSH
  - Como verificar chave SSH
  - Como verificar logs do servidor

---

## 🔐 Secrets Necessários no GitHub

Para o workflow funcionar, é necessário configurar os seguintes secrets no repositório GitHub:

1. **`SSH_PRIVATE_KEY`**
   - Chave privada SSH para autenticação no servidor
   - Deve corresponder à chave pública no servidor (`~/.ssh/authorized_keys`)

2. **`SERVER_HOST`**
   - IP ou hostname do servidor de produção
   - Exemplo: `123.456.789.0` ou `phdstudio.com.br`

**Como configurar:**
- GitHub → Settings → Secrets and variables → Actions → New repository secret

---

## 🏗️ Arquitetura de Deploy

```
┌─────────────────────────────────────────────────────────────┐
│                    GITHUB REPOSITORY                        │
│  Push to main/master → Trigger GitHub Actions Workflow      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              GITHUB ACTIONS RUNNER (Ubuntu)                  │
│  1. Checkout código                                          │
│  2. Setup SSH                                                │
│  3. Testa conectividade                                      │
│  4. Testa SSH                                                │
│  5. Conecta via SSH e executa deploy-remote.sh              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ SSH Connection
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              SERVIDOR DE PRODUÇÃO                            │
│  /root/phdstudio                                             │
│                                                              │
│  deploy-remote.sh executa:                                   │
│  1. Validações (Docker, .env, Traefik)                      │
│  2. git pull (atualiza código)                              │
│  3. docker stop/rm (para containers antigos)                │
│  4. docker compose build (builda imagens)                   │
│  5. docker compose up -d (sobe containers)                  │
│  6. Verifica status                                          │
│  7. Limpa imagens antigas                                    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    DOCKER CONTAINERS                         │
│                                                              │
│  ┌──────────────────┐      ┌──────────────────┐            │
│  │  phdstudio-app   │      │    phd-api       │            │
│  │  (Frontend)      │      │  (Backend API)  │            │
│  │  nginx:alpine    │      │  node:20-alpine │            │
│  │  Porta: 80       │      │  Porta: 3001    │            │
│  └────────┬─────────┘      └────────┬─────────┘            │
│           │                         │                       │
└───────────┼─────────────────────────┼───────────────────────┘
            │                         │
            │ Labels Traefik          │ Labels Traefik
            │                         │
            ▼                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    TRAEFIK (Proxy Reverso)                  │
│  - Roteamento: phdstudio.com.br → phdstudio-app             │
│  - Roteamento: phdstudio.com.br/api → phd-api               │
│  - SSL/TLS automático (Let's Encrypt)                       │
│  - Redirecionamento HTTP → HTTPS                            │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    INTERNET / USUÁRIOS                      │
│  https://phdstudio.com.br                                    │
│  https://phdstudio.com.br/api                                │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Estrutura de Containers

### **Container: phdstudio-app (Frontend)**

- **Imagem base:** `nginx:alpine`
- **Conteúdo:** Arquivos estáticos buildados (React/Vite)
- **Porta interna:** 80
- **Roteamento Traefik:**
  - Domínio: `phdstudio.com.br`
  - Path: Qualquer path EXCETO `/api`
  - SSL: Automático via Let's Encrypt

### **Container: phd-api (Backend)**

- **Imagem base:** `node:20-alpine`
- **Aplicação:** API Node.js/Express
- **Porta interna:** 3001
- **Roteamento Traefik:**
  - Domínio: `phdstudio.com.br`
  - Path: `/api/*`
  - Middleware: Remove prefixo `/api` antes de encaminhar
  - SSL: Automático via Let's Encrypt
- **Healthcheck:** `/api/crm/v1/health` (verifica a cada 10s)

---

## 🔄 Fluxo de Dados

### **Build Time (Durante docker compose build)**

1. Variáveis de ambiente do `.env` do servidor são lidas
2. Passadas como `--build-arg` para o Dockerfile
3. Frontend: Criado `.env.local` com variáveis VITE_*
4. Frontend: `npm run build` compila React com variáveis embutidas
5. Imagens Docker são criadas

### **Runtime (Durante docker compose up)**

1. Containers são iniciados
2. Variáveis de ambiente do `.env` são injetadas nos containers
3. Frontend (nginx) serve arquivos estáticos
4. Backend (Node.js) inicia servidor na porta 3001
5. Traefik detecta containers via labels Docker
6. Traefik configura roteamento e SSL automaticamente

---

## ⚙️ Configurações Importantes

### **Docker Compose Networks**

O projeto utiliza redes Docker externas:
- `n8n_default`: Rede compartilhada com n8n
- `wordpress_wp_network`: Rede do WordPress
- `phd_crm_network`: Rede do banco PostgreSQL do CRM

**Importante:** Essas redes devem existir antes do deploy!

### **Traefik Labels**

Labels são usados para configuração automática do Traefik:
- `traefik.enable=true`: Habilita o serviço
- `traefik.http.routers.*.rule`: Regra de roteamento
- `traefik.http.routers.*.entrypoints`: Entrypoint (websecure = HTTPS)
- `traefik.http.routers.*.tls.certresolver`: Resolvedor de certificado SSL
- `traefik.http.services.*.loadbalancer.server.port`: Porta do serviço

---

## 🚨 Pontos de Atenção

### **1. Arquivo .env no Servidor**

- Deve existir em `/root/phdstudio/.env`
- Contém todas as variáveis de ambiente sensíveis
- **NÃO** deve ser commitado no Git (está no `.gitignore`)
- Deve ser criado manualmente no servidor antes do primeiro deploy

### **2. Chave SSH**

- Chave privada deve estar nos GitHub Secrets
- Chave pública deve estar no servidor (`~/.ssh/authorized_keys`)
- Usuário SSH: `root` (configurado no workflow)

### **3. Traefik**

- Traefik deve estar rodando antes do deploy
- Traefik deve estar na mesma rede Docker (`n8n_default`)
- Certificados SSL são gerados automaticamente pelo Traefik

### **4. Redes Docker Externas**

- Redes `n8n_default`, `wordpress_wp_network`, `phd_crm_network` devem existir
- Se não existirem, o deploy falhará

### **5. Git Pull**

- Se não houver mudanças no repositório, o deploy é encerrado sem rebuild
- Isso economiza tempo e recursos
- Mas pode ser um problema se houver mudanças em variáveis de ambiente

---

## 📊 Tempo Estimado de Deploy

- **Checkout + Setup SSH:** ~10-20 segundos
- **Testes de conectividade:** ~5-10 segundos
- **Git Pull:** ~5-30 segundos (depende do tamanho das mudanças)
- **Docker Build:** ~2-5 minutos (depende das dependências)
- **Docker Up:** ~10-30 segundos
- **Verificações:** ~5 segundos

**Total estimado:** 3-7 minutos

---

## 🔍 Troubleshooting

### **Deploy falha no teste de conectividade**

1. Verificar se servidor está online
2. Verificar se porta 22 está aberta no firewall
3. Verificar se IP do servidor está correto no secret `SERVER_HOST`

### **Deploy falha no teste SSH**

1. Verificar se chave SSH está correta nos GitHub Secrets
2. Verificar se chave pública está no servidor
3. Verificar permissões da chave SSH (deve ser 600)

### **Deploy falha no git pull**

1. Verificar se repositório Git está configurado corretamente
2. Verificar se branch `main` existe
3. Verificar permissões do diretório `/root/phdstudio`

### **Deploy falha no docker build**

1. Verificar se arquivo `.env` existe e tem variáveis necessárias
2. Verificar logs do build: `docker compose build --progress=plain`
3. Verificar se há espaço em disco no servidor

### **Deploy falha no docker up**

1. Verificar se Traefik está rodando
2. Verificar se redes Docker externas existem
3. Verificar logs: `docker compose logs`
4. Verificar se portas não estão em conflito

### **Container não inicia**

1. Verificar logs: `docker logs phdstudio-app`
2. Verificar logs da API: `docker logs phd-api`
3. Verificar se variáveis de ambiente estão corretas
4. Verificar se bancos de dados estão acessíveis

---

## 📝 Checklist de Deploy

Antes de fazer o primeiro deploy, verificar:

- [ ] Secrets configurados no GitHub (`SSH_PRIVATE_KEY`, `SERVER_HOST`)
- [ ] Arquivo `.env` criado no servidor em `/root/phdstudio/.env`
- [ ] Traefik rodando e configurado
- [ ] Redes Docker externas criadas
- [ ] Docker e Docker Compose instalados no servidor
- [ ] Repositório Git clonado em `/root/phdstudio`
- [ ] Chave SSH pública adicionada ao servidor
- [ ] Firewall permitindo conexões na porta 22

---

## 🎯 Resumo do Fluxo

1. **Push para main/master** → GitHub Actions é acionado
2. **Runner do GitHub** → Faz checkout, configura SSH, testa conectividade
3. **Conexão SSH** → Conecta ao servidor e executa `deploy-remote.sh`
4. **Script no servidor** → Atualiza código, para containers, builda imagens, sobe containers
5. **Traefik** → Detecta containers e configura roteamento/SSL automaticamente
6. **Aplicação** → Disponível em `https://phdstudio.com.br`

---

## 📚 Arquivos Relacionados

- `.github/workflows/deploy.yml` - Workflow do GitHub Actions
- `deploy-remote.sh` - Script de deploy executado no servidor
- `docker-compose.yml` - Configuração dos containers
- `Dockerfile` - Build do frontend
- `api/Dockerfile` - Build da API
- `env.example` - Template de variáveis de ambiente

---

**Última atualização:** $(date +%Y-%m-%d)

