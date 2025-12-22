# Limpeza de Arquivos e Documentação

## Arquivos a Manter

### Documentação Principal
- `README.md` - Documentação principal do projeto
- `PLANO_MIGRACAO_CRM.md` - Plano de migração (referência)
- `PROGRESSO_FASE_*.md` - Histórico de progresso das fases

### Scripts Úteis
- `deploy.sh` - Script de deploy principal
- Scripts em `scripts/` que forem ativos

### Backups
- `backups/` - Backups importantes

## Arquivos a Remover/Arquivar

### Documentação Desatualizada
- `API_CONFIGURACAO.md` - Referente à API antiga WordPress
- `CORRECAO_API.md` - Correções da API antiga
- `CURLS_API_COMPLETOS.md` - Exemplos da API WordPress antiga
- `MCP_CRM_SERVER.md` - Documentação antiga (já migrado)
- `MIGRACAO_NGROK_RESUMO.md` - Resumo da migração ngrok (histórico)
- `PLANO_HTTPS_SEM_NGROK.md` - Plano antigo de HTTPS
- `README_PLUGIN.md` - Documentação de plugin WordPress
- `README_PRODUTOS.md` - Documentação específica de produtos
- `SEGURANCA.md` - Documentação de segurança (pode consolidar)
- `SETUP_SEGURANCA.md` - Setup de segurança (pode consolidar)
- `STATUS_INSTALACAO.md` - Status antigo de instalação
- `INSTALACAO_DOCKER.md` - Instruções antigas de instalação

### Scripts Antigos
- `TESTE_API.sh` - Testes da API antiga
- `ativar-plugin.sh` - Script específico WordPress
- Scripts de deploy antigos que não são mais usados:
  - `deploy-easypanel.sh` (se não usar mais)
  - `deploy-remote.sh` (se não usar mais)
  - `setup-automated-deploy.sh` (se não usar mais)
- `webhook-handler.sh` - Se não usado mais

## Ações Recomendadas

1. **Mover para `docs/archive/`** - Documentação histórica importante
2. **Deletar** - Scripts e documentação obsoletos
3. **Consolidar** - Juntar documentações similares (ex: segurança)

## Status

- [ ] Revisar cada arquivo antes de deletar
- [ ] Mover arquivos históricos para `docs/archive/`
- [ ] Deletar scripts não utilizados
- [ ] Atualizar README.md com informações atuais

