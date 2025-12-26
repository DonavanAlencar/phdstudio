# Prompt para Retomar Trabalho - Correções de Timeout e 404

## Instruções para o Assistente

Olá! Preciso que você leia o arquivo de documentação completo antes de continuar qualquer trabalho neste projeto.

### Passo 1: Ler Documentação

Por favor, leia completamente o arquivo:
```
/root/phdstudio/DOCUMENTACAO_CORRECOES_TIMEOUT_404.md
```

Este arquivo contém:
- Todo o contexto dos problemas encontrados
- Análise detalhada realizada
- Todas as correções aplicadas
- Status atual do sistema
- Comandos úteis
- Próximos passos

### Passo 2: Verificar Status Atual

Após ler a documentação, verifique o status atual:

```bash
# Verificar containers
docker ps --filter "name=phd"

# Verificar logs recentes
docker logs phd-api --tail 20

# Testar endpoints principais
curl -s https://phdstudio.com.br/api/crm/v1/health
```

### Passo 3: Entender o Contexto

Este projeto é um sistema CRM com:
- **Frontend:** React/Vite (container phdstudio-app)
- **Backend:** Node.js/Express (container phd-api na porta 3001)
- **Proxy:** Traefik roteando requisições
- **Banco:** PostgreSQL (phd-crm-db) para CRM

### Passo 4: Próximas Ações

Com base na documentação, as principais pendências são:

1. **Rebuild do Frontend** (CRÍTICO)
   - Mudanças no `AuthContext.tsx` e `api.ts` precisam ser aplicadas
   - Comando: `docker compose up -d --build phdstudio`

2. **Validação Completa**
   - Testar login no navegador
   - Verificar se timeouts foram resolvidos
   - Validar carregamento de leads

3. **Monitoramento**
   - Verificar se não há mais erros de timeout
   - Confirmar que queries estão otimizadas

### Informações Importantes

- **Credenciais Admin:**
  - Email: `admin@phdstudio.com.br`
  - Senha: `admin123`
  - Script de reset: `/root/phdstudio/reset-admin-password.sh`

- **Arquivos Modificados:**
  - `docker-compose.yml` ✅ Aplicado
  - `api/routes/leads.js` ✅ Aplicado
  - `src/admin/contexts/AuthContext.tsx` ⚠️ Requer rebuild
  - `src/admin/utils/api.ts` ⚠️ Requer rebuild

- **Comandos Úteis:**
  - Ver documentação completa para lista completa

### Ao Continuar o Trabalho

1. Sempre consulte a documentação primeiro
2. Verifique o status atual antes de fazer mudanças
3. Teste as mudanças após aplicá-las
4. Atualize a documentação se necessário

---

**Quando estiver pronto, confirme que leu a documentação e informe qual tarefa deseja realizar.**

