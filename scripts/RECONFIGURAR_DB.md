# 🔄 Reconfiguração Rápida do PostgreSQL

## 🎯 Objetivo

Este guia ajuda a reconfigurar completamente o banco de dados PostgreSQL para o PHD Studio CRM.

## ⚡ Método Rápido

Execute o script de reconfiguração:

```bash
cd /home/donavan/projetos/phdstudio-1
./scripts/reconfigure-db.sh
```

Este script irá:
1. ✅ Recriar o usuário `phd_crm_user`
2. ✅ Recriar o banco de dados `phd_crm`
3. ✅ Executar todas as migrações
4. ✅ Atualizar os arquivos `.env`
5. ✅ Testar a conexão

## 📝 Configuração Manual

Se preferir fazer manualmente:

### 1. Conectar ao PostgreSQL

```bash
sudo -u postgres psql
```

### 2. Recriar usuário e banco

```sql
-- Remover se existir
DROP DATABASE IF EXISTS phd_crm;
DROP USER IF EXISTS phd_crm_user;

-- Criar usuário
CREATE USER phd_crm_user WITH PASSWORD 'PhdCrm@2024!Strong#Pass';

-- Criar banco
CREATE DATABASE phd_crm OWNER phd_crm_user;

-- Dar permissões
GRANT ALL PRIVILEGES ON DATABASE phd_crm TO phd_crm_user;

-- Sair
\q
```

### 3. Executar migrações

```bash
cd /home/donavan/projetos/phdstudio-1

export PGPASSWORD='PhdCrm@2024!Strong#Pass'

psql -h localhost -p 5432 -U phd_crm_user -d phd_crm -f backend/db/migrations/001_init_schema.sql
psql -h localhost -p 5432 -U phd_crm_user -d phd_crm -f backend/db/migrations/002_products.sql
psql -h localhost -p 5432 -U phd_crm_user -d phd_crm -f backend/db/migrations/003_messaging_custom_fields_timeline.sql
psql -h localhost -p 5432 -U phd_crm_user -d phd_crm -f backend/db/migrations/004_pipelines_deals_automation_integrations_files_profile.sql
psql -h localhost -p 5432 -U phd_crm_user -d phd_crm -f backend/db/migrations/005_client_mobilechat_management.sql
```

### 4. Verificar arquivos .env

Certifique-se de que ambos os arquivos têm a configuração correta:

**backend/.env** e **api/.env**:
```env
CRM_DB_HOST=localhost
CRM_DB_PORT=5432
CRM_DB_USER=phd_crm_user
CRM_DB_PASSWORD=PhdCrm@2024!Strong#Pass
CRM_DB_NAME=phd_crm
```

⚠️ **IMPORTANTE:** Sem aspas na senha!

## ✅ Testar

### Testar conexão diretamente

```bash
export PGPASSWORD='PhdCrm@2024!Strong#Pass'
psql -h localhost -p 5432 -U phd_crm_user -d phd_crm -c "SELECT version();"
```

### Verificar tabelas criadas

```bash
psql -h localhost -p 5432 -U phd_crm_user -d phd_crm -c "\dt"
```

### Reiniciar a API

```bash
cd backend
npm start
```

### Testar API

```bash
curl http://localhost:3001/health
```

## 🔍 Troubleshooting

### Erro: "Peer authentication failed"

Use `sudo -u postgres psql` ao invés de `psql -U postgres`.

### Erro: "Senha incorreta"

1. Verifique se não há aspas no `.env`
2. Recrie o usuário com a senha correta:
   ```sql
   ALTER USER phd_crm_user WITH PASSWORD 'PhdCrm@2024!Strong#Pass';
   ```

### Erro: "Banco não existe"

Execute o script de reconfiguração novamente ou crie manualmente conforme passo 2 acima.

### Porta incorreta

Verifique qual porta o PostgreSQL está usando:
```bash
sudo netstat -tlnp | grep postgres
```

Atualize o `.env` com a porta correta (geralmente 5432).

## 📌 Credenciais Padrão

- **Host:** localhost
- **Porta:** 5432
- **Usuário:** phd_crm_user
- **Senha:** PhdCrm@2024!Strong#Pass
- **Banco:** phd_crm
