# 🚀 Guia Completo de Deploy - PHD Studio CRM

## 📋 Pré-requisitos

- Docker e Docker Compose instalados
- Traefik rodando (para HTTPS automático)
- Domínio configurado (phdstudio.com.br)
- Acesso SSH ao servidor
- Redes Docker externas: `n8n_default` e `wordpress_wp_network` (se necessário)

## 📁 Estrutura de Arquivos Necessários

```
phdstudio/
├── .env                    # Variáveis de ambiente (CRIAR)
├── docker-compose.yml      # ✅ Já existe
├── Dockerfile              # ✅ Já existe
├── api/
│   ├── Dockerfile          # ✅ Já existe
│   └── package.json        # ✅ Já existe
└── deploy.sh               # ✅ Já existe (opcional)
```

## 🔧 Passo 1: Criar Arquivo .env

Crie o arquivo `.env` na raiz do projeto com todas as variáveis necessárias:

```bash
cd /root/phdstudio
nano .env
```

### Conteúdo do arquivo .env:

```env
# ==========================================
# VARIÁVEIS DO FRONTEND (Build Time)
# ==========================================

# Gemini AI (para chat)
GEMINI_API_KEY=sua-chave-gemini-aqui

# EmailJS (para formulários)
VITE_EMAILJS_SERVICE_ID=seu-service-id
VITE_EMAILJS_TEMPLATE_ID=seu-template-id
VITE_EMAILJS_PUBLIC_KEY=sua-public-key
VITE_RECIPIENT_EMAIL=contato@phdstudio.com.br

# Webhook do Chat (n8n)
VITE_CHAT_WEBHOOK_URL=https://seu-n8n.com/webhook/chat
VITE_CHAT_AUTH_TOKEN=seu-token-aqui

# URL da API (produção)
VITE_API_URL=https://phdstudio.com.br/api

# ==========================================
# VARIÁVEIS DO BACKEND (Runtime)
# ==========================================

# MySQL WordPress (se usar)
WP_DB_HOST=wp_db
WP_DB_USER=wp_user
WP_DB_PASSWORD=WpUser@2024!Strong#Pass
WP_DB_NAME=wordpress_db
WP_TABLE_PREFIX=wp_
WP_DB_SSL=false
WP_URL=http://localhost:8080

# PostgreSQL CRM
CRM_DB_HOST=crm_db
CRM_DB_PORT=5432
CRM_DB_USER=phd_crm_user
CRM_DB_PASSWORD=PhdCrm@2024!Strong#Pass
CRM_DB_NAME=phd_crm

# API Key (gerar uma chave segura)
PHD_API_KEY=CNZZoJ6rz7Gcb8Z80rYNSHfCW1jPxZTU

# JWT Secrets (GERAR VALORES ÚNICOS E SEGUROS!)
JWT_SECRET=seu-jwt-secret-super-seguro-aqui-minimo-32-caracteres
JWT_REFRESH_SECRET=seu-refresh-secret-super-seguro-aqui-minimo-32-caracteres

# CORS
ALLOWED_ORIGINS=https://phdstudio.com.br,http://phdstudio.com.br

# Porta da API
API_PORT=3001

# Ambiente
NODE_ENV=production
```

### 🔐 Gerar Secrets Seguros:

```bash
# Gerar JWT_SECRET
openssl rand -base64 32

# Gerar JWT_REFRESH_SECRET
openssl rand -base64 32

# Gerar PHD_API_KEY
openssl rand -base64 24
```

## 🚀 Passo 2: Deploy Completo

### Opção A: Deploy Automático (Recomendado)

```bash
cd /root/phdstudio
chmod +x deploy.sh
./deploy.sh
```

O script vai:
- ✅ Verificar Docker e Docker Compose
- ✅ Verificar arquivo .env
- ✅ Verificar Traefik
- ✅ Parar containers antigos
- ✅ Build das imagens
- ✅ Iniciar todos os serviços
- ✅ Verificar status

### Opção B: Deploy Manual

```bash
cd /root/phdstudio

# 1. Verificar redes Docker necessárias
docker network ls | grep n8n_default
docker network ls | grep wordpress_wp_network

# Se não existirem, criar:
docker network create n8n_default 2>/dev/null || true
docker network create wordpress_wp_network 2>/dev/null || true

# 2. Parar serviços existentes (se houver)
docker compose down

# 3. Build das imagens
docker compose build --no-cache

# 4. Iniciar serviços
docker compose up -d

# 5. Verificar logs
docker compose logs -f
```

## 🔍 Passo 3: Verificar Deploy

### Verificar Containers

```bash
docker ps
```

Você deve ver:
- `phdstudio-app` - Frontend React
- `phd-api` - Backend API Node.js
- `phd-crm-db` - PostgreSQL CRM

### Verificar Logs

```bash
# Frontend
docker logs -f phdstudio-app

# Backend
docker logs -f phd-api

# Database
docker logs -f phd-crm-db
```

### Verificar Banco de Dados

```bash
# Conectar ao PostgreSQL
docker exec -it phd-crm-db psql -U phd_crm_user -d phd_crm

# Verificar tabelas
\dt

# Verificar usuários iniciais
SELECT id, email, first_name, last_name FROM users;

# Sair
\q
```

### Verificar API

```bash
# Health check
curl http://localhost:3001/api/crm/v1/health

# Testar autenticação
curl -X POST http://localhost:3001/api/crm/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@phdstudio.com.br","password":"admin123"}'
```

### Verificar Frontend

Acesse no navegador:
- **Frontend**: https://phdstudio.com.br
- **Admin CRM**: https://phdstudio.com.br/admin
- **API**: https://phdstudio.com.br/api

## 👤 Passo 4: Criar Usuário Administrador

O banco é criado automaticamente, mas você precisa criar o primeiro usuário admin.

### Opção A: Script Automático (Recomendado)

```bash
# Gerar hash da senha primeiro (se tiver Node.js e bcryptjs)
./scripts/generate-hash.sh "suaSenhaSegura123"

# OU gerar online em: https://bcrypt-generator.com/ (10 rounds)

# Depois criar usuário com o hash
./scripts/create-admin-user-simple.sh admin@phdstudio.com.br "$HASH"
```

### Opção B: Script Python (Alternativa)

```bash
# Instalar bcrypt (se necessário)
pip install bcrypt

# Criar usuário
python3 scripts/create-admin-user.py admin@phdstudio.com.br "suaSenhaSegura123"
```

### Opção C: Via SQL Manual

```bash
docker exec -it phd-crm-db psql -U phd_crm_user -d phd_crm
```

**Primeiro, gere o hash bcrypt da sua senha:**
- Online: https://bcrypt-generator.com/ (10 rounds)
- Ou use: `./scripts/generate-hash.sh "suaSenha"`

**Depois execute o SQL:**

```sql
-- Substitua 'SEU_HASH_AQUI' pelo hash gerado
INSERT INTO users (
  email, 
  password_hash, 
  first_name, 
  last_name, 
  role, 
  created_at
) VALUES (
  'admin@phdstudio.com.br',
  'SEU_HASH_AQUI',
  'Admin',
  'PHD Studio',
  'admin',
  NOW()
) ON CONFLICT (email) DO UPDATE SET 
  password_hash = EXCLUDED.password_hash, 
  role = 'admin', 
  updated_at = NOW();

-- Verificar
SELECT id, email, first_name, role FROM users;
```

**⚠️ IMPORTANTE**: 
- Use 10 rounds ao gerar o hash bcrypt
- Nunca use senhas fracas em produção

## 🔧 Passo 5: Configuração do Traefik

O `docker-compose.yml` já está configurado com labels do Traefik. Certifique-se de que:

1. **Traefik está rodando**:
```bash
docker ps | grep traefik
```

2. **DNS configurado**:
   - `phdstudio.com.br` aponta para o IP do servidor
   - `A record`: `@ -> IP_DO_SERVIDOR`

3. **Certificados SSL**:
   - Traefik gerencia automaticamente via Let's Encrypt
   - Certifique-se de que o email do ACME está configurado no Traefik

## 📊 Passo 6: Verificação Final

### Checklist de Deploy

- [ ] Todos os containers rodando (`docker ps`)
- [ ] Frontend acessível: https://phdstudio.com.br
- [ ] Admin acessível: https://phdstudio.com.br/admin
- [ ] API respondendo: https://phdstudio.com.br/api/crm/v1/health
- [ ] Login funcionando no admin
- [ ] Banco de dados com tabelas criadas
- [ ] Usuário admin criado
- [ ] SSL funcionando (certificado válido)
- [ ] Logs sem erros críticos

### Comandos Úteis

```bash
# Ver logs em tempo real
docker compose logs -f

# Reiniciar um serviço específico
docker compose restart phd-api

# Rebuild e restart
docker compose up -d --build

# Ver uso de recursos
docker stats

# Backup do banco
docker exec phd-crm-db pg_dump -U phd_crm_user phd_crm > backup_$(date +%Y%m%d).sql

# Restaurar backup
cat backup.sql | docker exec -i phd-crm-db psql -U phd_crm_user -d phd_crm

# Parar tudo
docker compose down

# Parar e remover volumes (CUIDADO: apaga dados!)
docker compose down -v
```

## 🐛 Troubleshooting

### Erro: "Network not found"
```bash
# Criar rede manualmente
docker network create n8n_default
docker network create wordpress_wp_network
```

### Erro: "Port already in use"
```bash
# Verificar quem está usando a porta
sudo lsof -i :3001
sudo lsof -i :80

# Parar processo ou mudar porta no docker-compose.yml
```

### Erro: "Cannot connect to database"
```bash
# Verificar se o container do banco está rodando
docker ps | grep phd-crm-db

# Verificar logs do banco
docker logs phd-crm-db

# Verificar variáveis de ambiente
docker exec phd-api env | grep CRM_DB
```

### Frontend não carrega
```bash
# Verificar build
docker logs phdstudio-app

# Verificar nginx
docker exec phdstudio-app cat /etc/nginx/conf.d/default.conf

# Rebuild frontend
docker compose up -d --build phdstudio
```

### API retorna 401/403
```bash
# Verificar JWT_SECRET
docker exec phd-api env | grep JWT

# Verificar CORS
docker exec phd-api env | grep ALLOWED_ORIGINS

# Verificar logs da API
docker logs phd-api | tail -50
```

## 📝 Atualizações Futuras

Para fazer deploy de atualizações:

```bash
cd /root/phdstudio

# 1. Fazer pull das mudanças (se usar git)
git pull

# 2. Rebuild e restart
docker compose up -d --build

# 3. Verificar logs
docker compose logs -f
```

## 🔒 Segurança

### Recomendações Importantes:

1. **Senhas Fortes**: Use senhas fortes para:
   - PostgreSQL (`CRM_DB_PASSWORD`)
   - MySQL (`WP_DB_PASSWORD`)
   - JWT secrets (mínimo 32 caracteres)

2. **API Key**: Gere uma `PHD_API_KEY` única e segura

3. **HTTPS**: Sempre use HTTPS em produção (Traefik cuida disso)

4. **Firewall**: Configure firewall para permitir apenas:
   - 80/tcp (HTTP)
   - 443/tcp (HTTPS)
   - 22/tcp (SSH)

5. **Backup**: Configure backups automáticos do PostgreSQL

6. **Monitoramento**: Configure alertas para:
   - Containers parados
   - Espaço em disco
   - Uso de memória/CPU

## 📞 Suporte

Em caso de problemas:

1. Verificar logs: `docker compose logs -f`
2. Verificar status: `docker ps`
3. Verificar recursos: `docker stats`
4. Verificar redes: `docker network ls`

---

**✅ Deploy concluído com sucesso!**

Acesse:
- Frontend: https://phdstudio.com.br
- Admin CRM: https://phdstudio.com.br/admin
- API: https://phdstudio.com.br/api

