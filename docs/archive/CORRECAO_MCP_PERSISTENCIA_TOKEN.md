# Correção MCP - Persistência de Token

**Data:** 2025-12-23  
**Status:** ✅ APLICADO

---

## Problema Identificado

O MCP estava falhando com erro 401 porque:

1. **Cache em memória perdido:** O serviço MCP é um servidor stdio que é desativado quando não há conexão ativa, perdendo o cache de tokens em memória
2. **Timeout muito curto:** O timeout de login era de 10s, muito curto para a primeira requisição
3. **Reinicializações frequentes:** O serviço reiniciava constantemente, perdendo o cache a cada reinício

---

## Correções Aplicadas

### 1. Persistência de Token em Arquivo

**Arquivo:** `/root/mcp-crm-server/server.js`

Adicionado sistema de persistência de tokens em arquivo (`/tmp/mcp-crm-token-cache.json`):

- **`loadTokenCache()`:** Carrega tokens do arquivo ao iniciar
- **`saveTokenCache()`:** Salva tokens no arquivo após login/refresh
- **`clearTokenCache()`:** Limpa cache em memória e arquivo

### 2. Timeout Aumentado

**Antes:**
```javascript
const TOKEN_VALIDATION_TIMEOUT = 10000; // 10 segundos
```

**Depois:**
```javascript
const TOKEN_VALIDATION_TIMEOUT = 30000; // 30 segundos
```

### 3. Logs Detalhados

Adicionados logs para debug:
- Tamanho da senha
- Timeout configurado
- Status do cache (carregado/salvo)

---

## Como Funciona

1. **Ao iniciar:** MCP tenta carregar cache do arquivo `/tmp/mcp-crm-token-cache.json`
2. **Após login:** Token é salvo em memória E no arquivo
3. **Após refresh:** Token renovado é salvo no arquivo
4. **Ao limpar:** Cache é removido da memória e do arquivo

---

## Validação

### Verificar se o cache está funcionando:

```bash
# Verificar se o arquivo existe
ls -la /tmp/mcp-crm-token-cache.json

# Ver conteúdo (mascarado)
cat /tmp/mcp-crm-token-cache.json | jq -r '.accessToken = (.accessToken | if . then .[0:20] + "..." else null end)'

# Ver logs do MCP
journalctl -u mcp-crm-server -f | grep -E "Cache|Token|LOGIN"
```

### Testar login:

```bash
# Verificar logs da API
docker logs phd-api -f | grep LOGIN

# Verificar logs do MCP
journalctl -u mcp-crm-server -f
```

---

## Rollback

Se necessário, restaurar versão anterior:

```bash
cd /root/mcp-crm-server
cp server.js.bak_YYYYMMDD_HHMMSS server.js
systemctl restart mcp-crm-server
```

---

## Próximos Passos

1. Monitorar se o cache está sendo salvo corretamente
2. Verificar se os testes do MCP passam agora
3. Se necessário, aumentar ainda mais o timeout ou ajustar a lógica de refresh

---

**Última atualização:** 2025-12-23 19:16 UTC

