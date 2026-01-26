# ✅ Checklist de Deploy - PHD Studio

Este documento lista todos os passos necessários para garantir que o deploy seja bem-sucedido.

## 📋 Pré-requisitos

### 1. Banco de Dados PostgreSQL
- [ ] PostgreSQL instalado e rodando
- [ ] Banco de dados `phd_crm` criado
- [ ] Usuário `phd_crm_user` criado com permissões adequadas
- [ ] Senha do banco configurada no arquivo `.env`

### 2. Variáveis de Ambiente
- [ ] Arquivo `deploy/config/shared/.env` criado a partir de `.env.example`
- [ ] Todas as variáveis obrigatórias preenchidas:
  - `CRM_DB_HOST` - Host do PostgreSQL
  - `CRM_DB_PORT` - Porta do PostgreSQL (padrão: 5432)
  - `CRM_DB_USER` - Usuário do banco
  - `CRM_DB_PASSWORD` - Senha do banco
  - `CRM_DB_NAME` - Nome do banco (padrão: phd_crm)
  - `PHD_API_KEY` - Chave de API (gerar uma chave segura)
  - `JWT_SECRET` - Secret para JWT (gerar valor único e seguro)
  - `JWT_REFRESH_SECRET` - Secret para refresh token (gerar valor único e seguro)
  - `GEMINI_API_KEY` - Chave da API Gemini (opcional)
  - `VITE_EMAILJS_*` - Configurações do EmailJS (opcional)
  - `VITE_CHAT_WEBHOOK_URL` - URL do webhook do chat (opcional)
  - `VITE_CHAT_AUTH_TOKEN` - Token de autenticação do chat (opcional)
  - `INSTAGRAM_ACCESS_TOKEN` - Token do Instagram (opcional)
  - `VITE_YOUTUBE_*` - Configurações do YouTube (opcional)

### 3. Docker e Docker Compose
- [ ] Docker instalado
- [ ] Docker Compose instalado
- [ ] Rede `n8n_default` criada (se usar Traefik)
- [ ] Rede `phd_crm_network` criada (se usar banco externo)

## 🗄️ Inicialização do Banco de Dados

### Opção 1: Script Automático (Recomendado)
```bash
cd /home/donavan/projetos/phdstudio-1/backend/db
./init-db.sh
```

### Opção 2: Manual
```bash
# Conectar ao banco
psql -h localhost -U phd_crm_user -d phd_crm

# Executar migrations em ordem:
\i migrations/001_init_schema.sql
\i migrations/002_products.sql
\i migrations/003_messaging_custom_fields_timeline.sql
\i migrations/004_pipelines_deals_automation_integrations_files_profile.sql
\i migrations/005_client_mobilechat_management.sql
\i migrations/006_fix_sessions_token_length.sql
```

## 🚀 Deploy

### 1. Verificar Prontidão
```bash
./scripts/check-deploy-ready.sh
```

### 2. Build e Deploy com Docker Compose
```bash
# Definir variáveis de ambiente para build
export PROJECT_ROOT=/home/donavan/projetos/phdstudio-1
export GEMINI_API_KEY=sua-chave-aqui
# ... outras variáveis

# Build e start
docker-compose -f docker-compose.yml up -d --build
```

### 3. Verificar Status
```bash
# Ver logs do frontend
docker logs phdstudio-app

# Ver logs da API
docker logs phd-api

# Verificar saúde da API
curl http://localhost:3001/api/crm/v1/health
```

## 🔍 Verificações Pós-Deploy

### Frontend
- [ ] Container `phdstudio-app` está rodando
- [ ] Site acessível em `https://phdstudio.com.br` (ou domínio configurado)
- [ ] Assets carregando corretamente
- [ ] Rotas SPA funcionando

### API
- [ ] Container `phd-api` está rodando
- [ ] Health check respondendo: `GET /api/crm/v1/health`
- [ ] API acessível em `https://phdstudio.com.br/api`
- [ ] CORS configurado corretamente
- [ ] Autenticação via API Key funcionando

### Banco de Dados
- [ ] Conexão estabelecida (verificar logs da API)
- [ ] Todas as tabelas criadas
- [ ] Usuário admin padrão criado (email: admin@phdstudio.com.br, senha: admin123)
- [ ] Tags padrão criadas
- [ ] Board Kanban padrão criado

## 🐛 Troubleshooting

### API não conecta ao banco
1. Verificar variáveis de ambiente no container:
   ```bash
   docker exec phd-api env | grep CRM_DB
   ```
2. Verificar se o banco está acessível:
   ```bash
   docker exec phd-api ping phd-crm-db
   ```
3. Verificar logs:
   ```bash
   docker logs phd-api | grep -i "postgres\|database\|connection"
   ```

### Frontend não carrega
1. Verificar build:
   ```bash
   docker exec phdstudio-app ls -la /usr/share/nginx/html
   ```
2. Verificar nginx:
   ```bash
   docker logs phdstudio-app
   ```
3. Verificar variáveis de ambiente no build (verificar Dockerfile)

### Migrations não executaram
1. Executar manualmente:
   ```bash
   cd backend/db
   ./init-db.sh
   ```
2. Verificar permissões do usuário do banco
3. Verificar se o banco existe

## 📝 Notas Importantes

1. **Senha do Admin**: O usuário admin padrão tem senha `admin123`. **ALTERE IMEDIATAMENTE** após o primeiro login.

2. **API Key**: Gere uma chave segura e única para `PHD_API_KEY`. Não use valores padrão em produção.

3. **JWT Secrets**: Gere valores únicos e seguros para `JWT_SECRET` e `JWT_REFRESH_SECRET`. Use ferramentas como `openssl rand -hex 32`.

4. **Networks Docker**: Certifique-se de que as redes `n8n_default` e `phd_crm_network` existem antes do deploy.

5. **Traefik**: Se usar Traefik, certifique-se de que está rodando e configurado corretamente.

## 🔐 Segurança

- [ ] Senha do admin alterada
- [ ] API Key segura configurada
- [ ] JWT Secrets únicos e seguros
- [ ] CORS configurado apenas para domínios permitidos
- [ ] Rate limiting ativo
- [ ] Headers de segurança configurados (Helmet.js)

## 📚 Documentação Adicional

- `docs/deployment/` - Guias detalhados de deploy
- `docs/api/overview.md` - Documentação da API
- `README.md` - Visão geral do projeto
