# 🚫 Bloqueio de Deploy no Vercel

Este projeto **NÃO** deve ser publicado no Vercel. O deploy deve ser feito **apenas** via Docker/Docker Compose.

## Por quê?

Este projeto foi configurado para rodar em containers Docker com:
- Traefik como proxy reverso
- PostgreSQL como banco de dados
- Configurações específicas de rede e segurança

O Vercel usa uma arquitetura serverless que não é compatível com nossa configuração atual.

## Mecanismos de Bloqueio

### 1. Arquivo `.vercelignore`
Criado na raiz do projeto para bloquear qualquer tentativa de deploy no Vercel.

### 2. Script `scripts/block-vercel.sh`
Script que:
- Detecta ambiente Vercel e bloqueia execução
- Remove arquivos de configuração do Vercel (`.vercel/`, `vercel.json`)
- Verifica e previne vinculação ao Vercel

### 3. Integração nos Scripts de Deploy
Os scripts `deploy-local.sh` e `deploy-remote.sh` executam automaticamente a verificação de bloqueio do Vercel antes de fazer o deploy.

### 4. GitHub Actions
Workflow `.github/workflows/block-vercel.yml` que:
- Verifica em cada push/PR se há configuração do Vercel
- Remove automaticamente arquivos de configuração do Vercel
- Falha o build se detectar tentativa de deploy no Vercel

### 5. Package.json
O script `build` no `package.json` executa automaticamente o bloqueio antes do build.

## Como Usar

### Verificação Manual
```bash
npm run block-vercel
# ou
bash scripts/block-vercel.sh
```

### Deploy Correto
Use apenas os scripts de deploy Docker:
```bash
# Deploy local
./deploy/docker/scripts/deploy-local.sh

# Deploy remoto
./deploy/docker/scripts/deploy-remote.sh
```

## O que Fazer se Tentar Deploy no Vercel

Se você tentar fazer deploy no Vercel, os mecanismos de bloqueio irão:
1. ❌ Detectar a tentativa
2. 🗑️ Remover arquivos de configuração do Vercel
3. 🚫 Bloquear a execução
4. ✅ Redirecionar para usar Docker

## Arquivos Removidos/Modificados

- ✅ `vercel.json` - **REMOVIDO**
- ✅ Referências ao Vercel no `backend/server.js` - **REMOVIDAS**
- ✅ Verificação `process.env.VERCEL` - **REMOVIDA**

## Manutenção

Se precisar adicionar mais verificações, edite:
- `scripts/block-vercel.sh` - Script principal de bloqueio
- `.github/workflows/block-vercel.yml` - Workflow do GitHub Actions
- Scripts de deploy - Adicione chamada a `block_vercel()` se necessário

---

**Última atualização:** 2026-01-19
**Status:** ✅ Bloqueio ativo e funcionando
