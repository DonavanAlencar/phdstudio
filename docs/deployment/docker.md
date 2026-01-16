# Deploy Docker

Dockerfiles, compose e scripts foram centralizados em `deploy/docker/`.

## Estrutura
- `deploy/docker/config/Dockerfile` – build do frontend (Nginx).
- `deploy/docker/config/api.Dockerfile` – build da API Node.
- `deploy/docker/config/docker-compose.yml` – stack principal (Traefik/prod).
- `deploy/docker/config/docker-compose.local.yml` – stack local (frontend + API + Postgres dev).
- `deploy/docker/scripts/` – automações:
  - `deploy-traefik.sh` – build/up para ambiente com Traefik já rodando.
  - `deploy-remote.sh` – pull de código + build/up remoto.
  - `deploy-easypanel.sh` – build/up simples (Easypanel ou compose direto).
  - `deploy-local.sh` / `deploy-local.ps1` – ambiente local com Docker.

## Pré-requisitos
- Docker + Docker Compose plugin instalados.
- Arquivo `deploy/config/shared/.env` preenchido (copie o `.env.example`).
- Para modo local, arquivos `env.dev` e `api/env.dev` permanecem suportados.

## Uso rápido
Criar arquivo de ambiente:
```bash
cp deploy/config/shared/.env.example deploy/config/shared/.env
```
Deploy (Traefik):
```bash
bash deploy/docker/scripts/deploy-traefik.sh
```
Deploy remoto (pull + build + up):
```bash
bash deploy/docker/scripts/deploy-remote.sh
```
Ambiente local:
```bash
bash deploy/docker/scripts/deploy-local.sh
# ou no Windows (PowerShell)
pwsh deploy/docker/scripts/deploy-local.ps1
```

## Dependências e validações
- Scripts checam Docker/Compose e exigem `.env` centralizado antes do build.
- `deploy-local` cria `.env` automaticamente a partir do template quando ausente.
- Compose files usam caminhos relativos ao repositório; Dockerfiles e Nginx configs ficam em `deploy/docker/config` (symlinks mantêm compatibilidade nos caminhos antigos).

## Troubleshooting
- `env file not found`: crie `deploy/config/shared/.env` a partir do template.
- Build da API falha: verifique `deploy/docker/config/api.Dockerfile` e permissões dos arquivos em `api/`.
- Traefik não detectado: o script `deploy-traefik.sh` aborta se não encontrar um container `traefik` rodando.
