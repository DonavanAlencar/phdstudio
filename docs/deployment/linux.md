# Deploy Linux (Ubuntu, sem Docker)

Automação em Bash para servidores Ubuntu, incluindo validação/criação de banco de dados e build do frontend.

## Scripts e funções
- `deploy/linux/deploy.sh`: fluxo completo (sincroniza `.env`, instala pacotes de sistema opcionalmente, chama validação de DB, instala dependências npm e executa build do frontend).
- `deploy/linux/setup-database.sh`: valida ou cria banco PostgreSQL/MySQL, cria usuário, aplica migrations PostgreSQL de forma idempotente e faz rollback se o banco recém-criado falhar.

## Pré-requisitos
- Bash + `python3`.
- Node.js >= 18.18 e npm.
- Clientes de banco (`psql` e/ou `mysql`).
- Permissão sudo para instalar pacotes de sistema, se `installSystemPackages` estiver habilitado em `app-config.json`.

## Configuração
1. Crie o arquivo de ambiente compartilhado:
   ```bash
   cp deploy/config/shared/.env.example deploy/config/shared/.env
   ```
2. Ajuste `deploy/config/linux/app-config.json` (portas, pacotes de sistema a instalar, flags de build e caminho do `.env`).
3. Ajuste `deploy/config/linux/db-config.json` (engine, host/porta, usuário de aplicação, credenciais administrativas e diretório de migrations se quiser sobrescrever o padrão).

## Como usar
Deploy completo:
```bash
bash deploy/linux/deploy.sh
```
Parâmetros:
- `--app-config <path>` e `--db-config <path>` para configs alternativas.
- `--skip-migrations` para pular migrations (mantém validação de conexão).

Somente preparar banco:
```bash
bash deploy/linux/setup-database.sh --config deploy/config/linux/db-config.json
```

## Validações e segurança
- Verificação de comandos obrigatórios (node, npm, python3, psql/mysql).
- `installSystemPackages` instala via `apt-get` quando disponível.
- Variáveis obrigatórias do `.env` são verificadas antes do build (`CRM_DB_*`, `PHD_API_KEY`, JWT...).
- Rollback aplicado a bancos PostgreSQL criados na execução em caso de falha crítica.

## Troubleshooting
- `Comando obrigatório não encontrado`: instale o binário indicado ou ajuste o `PATH`.
- `Credenciais de aplicação não conectam`: revise usuário/senha em `db-config.json` e no servidor.
- Falha em migrations: verifique logs; erros idempotentes são ignorados automaticamente.
- Pacotes não instalados (sem sudo): execute o script como usuário com privilégios ou instale manualmente os pacotes listados.
