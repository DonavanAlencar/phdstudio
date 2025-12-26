# 📦 Deploy - PHD Studio CRM

## 🚀 Início Rápido

### 1. Preparar Ambiente

```bash
# Copiar exemplo de .env
cp env.example .env

# Editar e preencher variáveis
nano .env
```

**⚠️ OBRIGATÓRIO preencher:**
- `JWT_SECRET` e `JWT_REFRESH_SECRET` (gerar com `openssl rand -base64 32`)
- `CRM_DB_PASSWORD` (senha segura para PostgreSQL)
- `PHD_API_KEY` (gerar com `openssl rand -base64 24`)
- `VITE_API_URL` (URL da API em produção)

### 2. Criar Redes Docker

```bash
docker network create n8n_default 2>/dev/null || true
docker network create wordpress_wp_network 2>/dev/null || true
```

### 3. Deploy

```bash
# Opção A: Script automático
./deploy.sh

# Opção B: Manual
docker compose up -d --build
```

### 4. Verificar Deploy

```bash
./scripts/check-deploy.sh
```

### 5. Criar Usuário Admin

```bash
./scripts/create-admin-user.sh admin@phdstudio.com.br minhaSenhaSegura123
```

## 📚 Documentação

- **`GUIA_DEPLOY.md`** - Guia completo e detalhado
- **`DEPLOY_RAPIDO.md`** - Passos essenciais resumidos
- **`env.example`** - Template de variáveis de ambiente

## 🛠️ Scripts Úteis

| Script | Descrição |
|--------|-----------|
| `./deploy.sh` | Deploy completo automatizado |
| `./scripts/check-deploy.sh` | Verificar status do deploy |
| `./scripts/create-admin-user.sh` | Criar usuário admin |
| `./scripts/backup-db.sh` | Backup do banco de dados |

## 🔍 Comandos Úteis

```bash
# Ver logs
docker compose logs -f

# Reiniciar serviços
docker compose restart

# Parar tudo
docker compose down

# Rebuild completo
docker compose up -d --build

# Verificar containers
docker ps

# Verificar logs específicos
docker logs -f phd-api
docker logs -f phdstudio-app
docker logs -f phd-crm-db
```

## 🌐 URLs

Após o deploy:

- **Frontend**: https://phdstudio.com.br
- **Admin CRM**: https://phdstudio.com.br/admin
- **API**: https://phdstudio.com.br/api

## ✅ Checklist Pós-Deploy

- [ ] Todos os containers rodando (`docker ps`)
- [ ] Frontend acessível
- [ ] Admin acessível e login funciona
- [ ] API respondendo (`curl https://phdstudio.com.br/api/crm/v1/health`)
- [ ] Banco de dados criado e acessível
- [ ] Usuário admin criado
- [ ] SSL funcionando (HTTPS)

## 🐛 Problemas Comuns

Veja a seção **Troubleshooting** em `GUIA_DEPLOY.md`

---

**📖 Documentação completa:** `GUIA_DEPLOY.md`

