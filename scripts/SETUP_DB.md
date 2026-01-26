# 🔧 Guia de Setup do PostgreSQL - PHD Studio CRM

Este guia ajuda você a configurar o banco de dados PostgreSQL do zero.

## 📋 Pré-requisitos

- PostgreSQL instalado e rodando localmente
- Acesso ao usuário `postgres` (sudo ou senha)

## 🚀 Setup Rápido

### Opção 1: Script Automatizado

```bash
cd /home/donavan/projetos/phdstudio-1
./scripts/setup-postgres.sh
```

### Opção 2: Configuração Manual

#### 1. Conectar ao PostgreSQL

```bash
sudo -u postgres psql
# ou
psql -U postgres
```

#### 2. Criar usuário e banco de dados

```sql
-- Criar usuário
CREATE USER phd_crm_user WITH PASSWORD 'PhdCrm@2024!Strong#Pass';

-- Criar banco de dados
CREATE DATABASE phd_crm OWNER phd_crm_user;

-- Dar permissões
GRANT ALL PRIVILEGES ON DATABASE phd_crm TO phd_crm_user;

-- Sair do psql
\q
```

#### 3. Executar migrações

```bash
cd /home/donavan/projetos/phdstudio-1

# Definir senha temporariamente
export PGPASSWORD='PhdCrm@2024!Strong#Pass'

# Executar cada migração em ordem
psql -h localhost -p 5432 -U phd_crm_user -d phd_crm -f backend/db/migrations/001_init_schema.sql
psql -h localhost -p 5432 -U phd_crm_user -d phd_crm -f backend/db/migrations/002_products.sql
psql -h localhost -p 5432 -U phd_crm_user -d phd_crm -f backend/db/migrations/003_messaging_custom_fields_timeline.sql
psql -h localhost -p 5432 -U phd_crm_user -d phd_crm -f backend/db/migrations/004_pipelines_deals_automation_integrations_files_profile.sql
psql -h localhost -p 5432 -U phd_crm_user -d phd_crm -f backend/db/migrations/005_client_mobilechat_management.sql
```

#### 4. Verificar arquivo .env

Certifique-se de que o arquivo `api/.env` tem as seguintes configurações:

```env
CRM_DB_HOST=localhost
CRM_DB_PORT=5432
CRM_DB_USER=phd_crm_user
CRM_DB_PASSWORD=PhdCrm@2024!Strong#Pass
CRM_DB_NAME=phd_crm
```

**⚠️ IMPORTANTE:** Sem aspas na senha!

## 🔍 Verificar Configuração

### Testar conexão

```bash
export PGPASSWORD='PhdCrm@2024!Strong#Pass'
psql -h localhost -p 5432 -U phd_crm_user -d phd_crm -c "SELECT version();"
```

### Verificar se as tabelas foram criadas

```bash
psql -h localhost -p 5432 -U phd_crm_user -d phd_crm -c "\dt"
```

## 🔧 Solução de Problemas

### Erro: "Peer authentication failed"

O PostgreSQL está configurado para usar autenticação peer. Use:

```bash
sudo -u postgres psql
```

### Erro: "Senha incorreta"

1. Verifique se não há aspas na senha no arquivo `.env`
2. Verifique a senha no banco:
   ```sql
   ALTER USER phd_crm_user WITH PASSWORD 'PhdCrm@2024!Strong#Pass';
   ```

### Erro: "Banco de dados não existe"

Crie o banco de dados manualmente:
```sql
CREATE DATABASE phd_crm OWNER phd_crm_user;
```

### Porta diferente

Se seu PostgreSQL estiver em outra porta (ex: 5433), atualize o `.env`:
```env
CRM_DB_PORT=5433
```

## 📝 Credenciais Padrão

- **Usuário:** `phd_crm_user`
- **Senha:** `PhdCrm@2024!Strong#Pass`
- **Banco:** `phd_crm`
- **Host:** `localhost`
- **Porta:** `5432` (ou `5433` se configurado)
