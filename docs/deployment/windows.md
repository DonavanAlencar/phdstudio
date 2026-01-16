# Deploy Windows (sem Docker)

Scripts centralizados para implantações nativas em Windows, com validação automática de banco de dados.

## Scripts e funções
- `deploy/windows/deploy.ps1`: orquestra deploy completo (sincroniza `.env`, chama validação de DB, instala dependências, builda frontend).
- `deploy/windows/setup-database.ps1`: valida conexão, cria banco/usuário (PostgreSQL ou MySQL) e executa migrations do PostgreSQL de forma idempotente. Aplica rollback se criar o banco e ocorrer falha crítica.

## Pré-requisitos
- Windows PowerShell 5+ ou `pwsh` (PowerShell 7 recomendado).
- Node.js >= 18.18 e npm no `PATH`.
- Cliente de banco correspondente (`psql` para PostgreSQL e/ou `mysql` para MySQL).
- Acesso de rede ao host do banco e credenciais administrativas para criação inicial.

## Configuração
1. Copie e preencha o arquivo de ambiente compartilhado:
   ```powershell
   Copy-Item deploy/config/shared/.env.example deploy/config/shared/.env
   ```
2. Ajuste `deploy/config/windows/app-config.json` (portas, localização do `.env`, se deve instalar dependências e executar migrations).
3. Ajuste `deploy/config/windows/db-config.json` com o engine (`postgres` ou `mysql`), host, porta, usuário da aplicação e credenciais administrativas (`adminUser`/`adminPassword`).

## Como usar
Deploy completo:
```powershell
pwsh deploy/windows/deploy.ps1
```
Parâmetros úteis:
- `-DbConfigPath` e `-AppConfigPath`: apontar para configs alternativas.
- `-SkipMigrations`: valida o banco sem executar migrations.

Somente preparar banco:
```powershell
pwsh deploy/windows/setup-database.ps1 -ConfigPath deploy/config/windows/db-config.json
```

## Saída, logs e segurança
- Logs estruturados no console com timestamps; não expõem senhas.
- Variáveis obrigatórias validadas antes do build (ex.: `PHD_API_KEY`, `CRM_DB_*`, `JWT_SECRET`).
- Rollback automático para PostgreSQL se o banco for criado nesta execução e uma migration falhar.

## Troubleshooting
- `psql` ou `mysql` não encontrados: instale os clientes e adicione ao `PATH`.
- Falha de autenticação: confirme `adminUser`/`adminPassword` no `db-config.json` e no servidor de banco.
- Porta em uso: ajuste `apiPort`/`frontendPort` no `app-config.json` e reflita no `.env`.
- Migrations repetidas: o script ignora erros idempotentes (`already exists`, `duplicate key`).
