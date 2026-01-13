# Deploy PHD Studio no Windows (SEM DOCKER)

Este guia explica como fazer o deploy completo da aplicação PHD Studio no Windows usando **Node.js e PostgreSQL nativos**, sem Docker.

## Pré-requisitos

1. **Node.js** instalado (versão 18 ou superior)
   - Download: https://nodejs.org/
   - Verificar: `node --version`
   - Verificar: `npm --version`

2. **PostgreSQL** instalado e rodando
   - Download: https://www.postgresql.org/download/windows/
   - Verificar se o serviço está rodando
   - `psql` deve estar no PATH ou o script tentará encontrar automaticamente

3. **PowerShell** (já vem com Windows)

## Estrutura do Deploy

O script `deploy-windows.ps1` automatiza:

1. ✅ Verificação de pré-requisitos (Node.js, npm, PostgreSQL)
2. ✅ Criação de arquivos `.env` com todas as variáveis de ambiente
3. ✅ Configuração de API keys e secrets (embutidos no script)
4. ✅ Execução automática de migrations do PostgreSQL
5. ✅ Instalação de dependências (npm install)
6. ✅ Build do frontend (npm run build)
7. ✅ Criação de scripts de inicialização

## Execução Rápida

### Opção 1: Usando valores padrão

```powershell
.\deploy-windows.ps1
```

Isso usará:
- PostgreSQL em `localhost:5432`
- Usuário: `phd_crm_user`
- Senha: `PhdCrm@2024!Strong#Pass`
- Database: `phd_crm`
- API na porta: `3001`
- Frontend na porta: `8080`

### Opção 2: Especificando parâmetros

```powershell
.\deploy-windows.ps1 `
    -PostgresHost "seu-postgres-host" `
    -PostgresPort 5432 `
    -PostgresUser "seu_usuario" `
    -PostgresPassword "sua_senha" `
    -PostgresDatabase "phd_crm" `
    -ApiPort 3001 `
    -FrontendPort 8080
```

### Opção 3: Pular migrations ou build

```powershell
# Pular migrations (se já executadas)
.\deploy-windows.ps1 -SkipMigrations

# Pular build (se já foi feito)
.\deploy-windows.ps1 -SkipBuild

# Pular ambos
.\deploy-windows.ps1 -SkipMigrations -SkipBuild
```

## Iniciar Serviços

Após o deploy, você precisa iniciar os serviços:

### Opção 1: Iniciar ambos automaticamente

```powershell
.\start-all.ps1
```

Isso abrirá duas janelas PowerShell:
- Uma para a API
- Uma para o Frontend

### Opção 2: Iniciar separadamente

**Terminal 1 - API:**
```powershell
.\start-api.ps1
```

**Terminal 2 - Frontend:**
```powershell
.\start-frontend.ps1
```

## Configurações e Secrets

Todas as configurações e API keys estão **embutidas no script** `deploy-windows.ps1` na seção `$Config`:

```powershell
$Config = @{
    PHD_API_KEY = "CNZZoJ6rz7Gcb8Z80rYNSHfCW1jPxZTU"
    JWT_SECRET = "phd-jwt-secret-production-2024-change-in-production"
    # ... outras configurações
}
```

**IMPORTANTE**: Para produção, edite o script e altere os valores conforme necessário.

## Migrations do Banco de Dados

O script executa automaticamente todas as migrations na seguinte ordem:

1. `001_init_schema.sql` - Schema inicial (users, leads, tags, kanban, etc.)
2. `002_products.sql` - Tabela de produtos
3. `003_messaging_custom_fields_timeline.sql` - Mensagens, campos customizados, timeline
4. `004_pipelines_deals_automation_integrations_files_profile.sql` - Pipelines, deals, automações, integrações

### Executar migrations manualmente

Se precisar executar migrations separadamente:

```powershell
.\scripts\run-migrations.ps1 `
    -PostgresHost "localhost" `
    -PostgresPort 5432 `
    -PostgresUser "phd_crm_user" `
    -PostgresPassword "PhdCrm@2024!Strong#Pass" `
    -PostgresDatabase "phd_crm"
```

## Estrutura de Serviços

Após iniciar os serviços:

### Frontend
- **Porta**: 8080 (ou a especificada)
- **URL**: http://localhost:8080
- **Tecnologia**: React + Vite (build estático servido por Vite Preview)

### API
- **Porta**: 3001 (ou a especificada)
- **URL**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/crm/v1/health
- **Tecnologia**: Node.js + Express
- **Banco de Dados**: PostgreSQL (CRM)

## Comandos Úteis

### Verificar se serviços estão rodando

```powershell
# Ver processos Node.js
Get-Process node

# Verificar porta
netstat -ano | findstr :3001
netstat -ano | findstr :8080
```

### Parar serviços

```powershell
# Parar todos os processos Node.js
Get-Process node | Stop-Process

# Ou parar por porta específica
# (encontre o PID primeiro com netstat)
Stop-Process -Id <PID>
```

### Ver logs

Os logs aparecem diretamente nas janelas PowerShell onde os serviços foram iniciados.

## Troubleshooting

### Node.js não encontrado

```
✗ Node.js não está instalado ou não está no PATH
```

**Solução**: 
1. Instale o Node.js: https://nodejs.org/
2. Certifique-se de que está no PATH: `node --version`
3. Reinicie o PowerShell após instalar

### psql não encontrado

```
⚠ psql não encontrado no PATH ou em caminhos comuns
```

**Soluções**:
1. Adicione o PostgreSQL ao PATH:
   - Normalmente: `C:\Program Files\PostgreSQL\16\bin`
   - Ou use o caminho completo no script
2. O script tentará encontrar automaticamente em caminhos comuns
3. Migrations podem ser executadas manualmente depois

### PostgreSQL não está acessível

```
✗ Não foi possível conectar ao PostgreSQL
```

**Soluções**:
1. Verifique se o PostgreSQL está rodando:
   ```powershell
   Get-Service postgresql*
   ```
2. Verifique host, porta, usuário e senha
3. Verifique firewall (porta 5432 deve estar aberta)
4. Verifique `pg_hba.conf` se PostgreSQL está em outro host

### Erro ao executar migrations

```
⚠ Migration já foi executada (ignorando)
```

Isso é normal se as migrations já foram executadas anteriormente.

### Porta já em uso

```
Error: listen EADDRINUSE: address already in use :::3001
```

**Solução**: 
1. Pare o processo que está usando a porta:
   ```powershell
   netstat -ano | findstr :3001
   Stop-Process -Id <PID>
   ```
2. Ou use outra porta: `.\deploy-windows.ps1 -ApiPort 3002`

### Build falha

```
✗ Falha ao fazer build do frontend
```

**Soluções**:
1. Verifique se todas as dependências foram instaladas: `npm install`
2. Verifique se há erros no código
3. Tente limpar e rebuild:
   ```powershell
   Remove-Item -Recurse -Force node_modules
   Remove-Item -Recurse -Force dist
   npm install
   npm run build
   ```

## Arquivos Criados pelo Script

O script cria os seguintes arquivos:

- `.env` - Variáveis de ambiente do frontend (build time)
- `api\.env` - Variáveis de ambiente da API (runtime)
- `start-api.ps1` - Script para iniciar API
- `start-frontend.ps1` - Script para iniciar Frontend
- `start-all.ps1` - Script para iniciar ambos

**IMPORTANTE**: Os arquivos `.env` contêm secrets. Não os commite no Git!

## Próximos Passos

Após o deploy bem-sucedido:

1. ✅ Execute `.\start-all.ps1` para iniciar os serviços
2. ✅ Acesse http://localhost:8080 para ver o frontend
3. ✅ Teste a API em http://localhost:3001/api/crm/v1/health
4. ✅ Faça login com as credenciais padrão (verificar migrations para usuário admin)
5. ✅ Configure domínio personalizado (se necessário)
6. ✅ Configure SSL/HTTPS (se necessário)

## Desenvolvimento vs Produção

### Desenvolvimento

Para desenvolvimento, você pode usar:

```powershell
# Terminal 1 - API em modo dev (com watch)
cd api
npm run dev

# Terminal 2 - Frontend em modo dev (hot reload)
npm run dev
```

### Produção

Para produção, use o deploy completo:

```powershell
.\deploy-windows.ps1
.\start-all.ps1
```

## Suporte

Em caso de problemas:

1. Verifique os logs nas janelas PowerShell
2. Verifique se Node.js e PostgreSQL estão rodando
3. Verifique as variáveis de ambiente nos arquivos `.env`
4. Execute migrations manualmente se necessário: `.\scripts\run-migrations.ps1`

