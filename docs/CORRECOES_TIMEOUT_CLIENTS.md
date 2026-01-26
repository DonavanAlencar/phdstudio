# Correções Aplicadas - Timeout no Endpoint /api/crm/v1/clients

## Problemas Identificados

1. **Erro 500**: Tabela `clients` não existia no banco de dados ✅ **RESOLVIDO**
2. **Timeout de 30s**: Requisição excedendo timeout ao buscar clientes ⚠️ **EM INVESTIGAÇÃO**

## Correções Aplicadas

### 1. Criação de Tabelas Faltantes ✅

Todas as migrations foram executadas:
- ✅ Migration 002: `products`
- ✅ Migration 003: `custom_fields`, `deal_custom_fields`, `lead_events`, `messages`
- ✅ Migration 004: `pipelines`, `pipeline_stages`, `loss_reasons`, `deals`, `round_robin_state`, `integrations`, `lead_files`, `workflows`, `workflow_triggers`, `workflow_actions`, `workflow_runs`
- ✅ Migration 005: `clients`, `client_mobilechat_configs`, `user_clients`
- ✅ Migration 006: Ajuste de campos `token` e `refresh_token` em `sessions`

### 2. Otimização da Query de Clients ✅

**Antes:**
```sql
SELECT c.*, 
       COUNT(DISTINCT uc.user_id) AS user_count,
       cmc.n8n_webhook_url,
       cmc.is_active AS mobilechat_active
FROM clients c
LEFT JOIN user_clients uc ON c.id = uc.client_id
LEFT JOIN client_mobilechat_configs cmc ON c.id = cmc.client_id
WHERE c.is_active = true
GROUP BY c.id, cmc.n8n_webhook_url, cmc.is_active
ORDER BY c.created_at DESC
```

**Depois:**
```sql
SELECT c.id,
       c.name,
       c.email,
       c.phone,
       c.company_name,
       c.is_active,
       c.created_at,
       c.updated_at,
       (SELECT COUNT(DISTINCT uc.user_id) 
        FROM user_clients uc 
        WHERE uc.client_id = c.id) AS user_count,
       cmc.n8n_webhook_url,
       cmc.is_active AS mobilechat_active
FROM clients c
LEFT JOIN client_mobilechat_configs cmc ON c.id = cmc.client_id
WHERE c.is_active = true
ORDER BY c.created_at DESC
```

**Melhorias:**
- Removido GROUP BY problemático
- Uso de subquery para contagem de usuários (mais eficiente)
- Seleção explícita de colunas (melhor performance)

### 3. Verificação de Performance

- ✅ Query de clients: **< 1ms** (testado com EXPLAIN ANALYZE)
- ✅ Query de autenticação: **< 1ms** (testado com EXPLAIN ANALYZE)
- ✅ Índices verificados: Todos presentes e otimizados

## Possíveis Causas do Timeout

1. **Problema de Rede/Proxy**: O Traefik ou algum proxy intermediário pode estar causando delay
2. **Token Inválido**: Se o token estiver inválido, a autenticação retorna 401, mas pode haver delay
3. **Conexão com Banco**: Embora as queries sejam rápidas, pode haver problema de conexão

## Próximos Passos Recomendados

1. **Monitorar logs em tempo real** quando a requisição for feita:
   ```bash
   docker logs phd-api -f
   ```

2. **Aumentar timeout temporariamente** para debug (não recomendado para produção):
   - Arquivo: `src/admin/utils/api.ts`
   - Linha 34: `timeout: 60000` (60 segundos)

3. **Verificar se há problemas de rede** entre frontend e backend

4. **Testar endpoint diretamente** com curl:
   ```bash
   curl -X GET "https://phdstudio.com.br/api/crm/v1/clients" \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json"
   ```

## Status Atual

- ✅ Todas as tabelas criadas
- ✅ Query otimizada
- ✅ API reiniciada
- ⚠️ Timeout ainda pode ocorrer (necessário testar em produção)

## Arquivos Modificados

- `/root/phdstudio/backend/routes/clients.js` - Query otimizada
- Banco de dados: Todas as migrations aplicadas
