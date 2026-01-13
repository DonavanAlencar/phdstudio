# Deploy PHD Studio no Windows

Este guia explica como fazer o deploy completo da aplicação PHD Studio no Windows usando apenas scripts PowerShell, sem ações manuais.

## Pré-requisitos

1. **Docker Desktop** instalado e rodando
   - Download: https://www.docker.com/products/docker-desktop
   - Certifique-se de que o Docker está rodando antes de executar o script

2. **PostgreSQL** configurado e acessível
   - Pode ser local ou remoto
   - O script suporta conexão via hostname ou IP
   - MySQL **NÃO** é necessário (não está configurado)

3. **PowerShell** (já vem com Windows)

## Estrutura do Deploy

O script `deploy-windows.ps1` automatiza:

1. ✅ Verificação de pré-requisitos (Docker, PostgreSQL)
2. ✅ Criação de arquivos `.env` com todas as variáveis de ambiente
3. ✅ Configuração de API keys e secrets (embutidos no script)
4. ✅ Criação do `docker-compose.windows.yml` otimizado para Windows
5. ✅ Execução automática de migrations do PostgreSQL
6. ✅ Build e deploy da API (Node.js/Express)
7. ✅ Build e deploy do Frontend (React/Vite)
8. ✅ Verificação de saúde dos serviços

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

### Opção 2: Especificando parâmetros

```powershell
.\deploy-windows.ps1 `
    -PostgresHost "seu-postgres-host" `
    -PostgresPort 5432 `
    -PostgresUser "seu_usuario" `
    -PostgresPassword "sua_senha" `
    -PostgresDatabase "phd_crm"
```

### Opção 3: Pular migrations (se já executadas)

```powershell
.\deploy-windows.ps1 -SkipMigrations
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

Após o deploy, os seguintes serviços estarão rodando:

### Frontend (phdstudio-app)
- **Porta**: 8080
- **URL**: http://localhost:8080
- **Tecnologia**: React + Vite (build estático servido por Nginx)

### API (phd-api)
- **Porta**: 3001
- **URL**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/crm/v1/health
- **Tecnologia**: Node.js + Express
- **Banco de Dados**: PostgreSQL (CRM)

### Container de Inicialização (phd-db-init)
- Executa migrations automaticamente na primeira inicialização
- Aguarda PostgreSQL estar disponível
- Cria banco de dados se não existir

## Comandos Úteis

### Ver logs
```powershell
# Logs da API
docker logs -f phd-api

# Logs do Frontend
docker logs -f phdstudio-app

# Logs de todos os serviços
docker compose -f docker-compose.windows.yml logs -f
```

### Parar serviços
```powershell
docker compose -f docker-compose.windows.yml down
```

### Reiniciar serviços
```powershell
docker compose -f docker-compose.windows.yml restart
```

### Rebuild completo
```powershell
docker compose -f docker-compose.windows.yml down
docker compose -f docker-compose.windows.yml build --no-cache
docker compose -f docker-compose.windows.yml up -d
```

## Troubleshooting

### Docker não está rodando
```
✗ Docker não está rodando. Por favor, inicie o Docker Desktop
```
**Solução**: Abra o Docker Desktop e aguarde até que esteja totalmente iniciado.

### PostgreSQL não está acessível
```
✗ Não foi possível conectar ao PostgreSQL
```
**Soluções**:
1. Verifique se o PostgreSQL está rodando
2. Verifique host, porta, usuário e senha
3. Se PostgreSQL estiver em outro host, use `-PostgresHost` com o IP/hostname correto
4. Verifique firewall (porta 5432 deve estar aberta)

### Erro ao executar migrations
```
⚠ Migration já foi executada (ignorando)
```
Isso é normal se as migrations já foram executadas anteriormente.

### API não responde
```powershell
# Verificar logs
docker logs phd-api

# Verificar se container está rodando
docker ps

# Verificar variáveis de ambiente
docker exec phd-api env | grep CRM_DB
```

### Porta já em uso
```
Error: bind: address already in use
```
**Solução**: Pare o serviço que está usando a porta ou altere a porta no `docker-compose.windows.yml`.

## Arquivos Criados pelo Script

O script cria os seguintes arquivos:

- `.env` - Variáveis de ambiente do frontend (build time)
- `api\.env` - Variáveis de ambiente da API (runtime)
- `docker-compose.windows.yml` - Configuração Docker Compose para Windows

**IMPORTANTE**: Estes arquivos contêm secrets. Não os commite no Git!

## Próximos Passos

Após o deploy bem-sucedido:

1. ✅ Acesse http://localhost:8080 para ver o frontend
2. ✅ Teste a API em http://localhost:3001/api/crm/v1/health
3. ✅ Faça login com as credenciais padrão (verificar migrations para usuário admin)
4. ✅ Configure domínio personalizado (se necessário)
5. ✅ Configure SSL/HTTPS (se necessário)

## Suporte

Em caso de problemas:

1. Verifique os logs: `docker logs -f phd-api`
2. Verifique se todos os containers estão rodando: `docker ps`
3. Verifique as variáveis de ambiente: `docker exec phd-api env`
4. Execute migrations manualmente se necessário: `.\scripts\run-migrations.ps1`

