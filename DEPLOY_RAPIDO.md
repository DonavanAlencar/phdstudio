# 🚀 Deploy Rápido - PHD Studio CRM

## Passos Essenciais

### 1. Criar arquivo .env

```bash
cd /root/phdstudio
nano .env
```

**Conteúdo mínimo necessário:**

```env
# Frontend
GEMINI_API_KEY=sua-chave
VITE_API_URL=https://phdstudio.com.br/api

# Backend
CRM_DB_PASSWORD=senhaSegura123
JWT_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)
PHD_API_KEY=$(openssl rand -base64 24)
```

### 2. Criar redes Docker (se necessário)

```bash
docker network create n8n_default 2>/dev/null || true
docker network create wordpress_wp_network 2>/dev/null || true
```

### 3. Deploy

```bash
docker compose up -d --build
```

### 4. Verificar

```bash
./scripts/check-deploy.sh
```

### 5. Criar usuário admin

```bash
./scripts/create-admin-user.sh admin@phdstudio.com.br senha123
```

## Acesso

- Frontend: https://phdstudio.com.br
- Admin: https://phdstudio.com.br/admin
- API: https://phdstudio.com.br/api

---

📖 **Para instruções completas, consulte:** `GUIA_DEPLOY.md`

