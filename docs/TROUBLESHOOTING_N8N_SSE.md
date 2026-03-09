# Troubleshooting: n8n SSE Webhook

## Problema
Não consegue disparar requisições do Postman para:
```
https://n8n.546digitalservices.com/mcp-test/google-ads-tool-mcp/sse
```

## Diagnóstico
O servidor está respondendo, mas retorna erro 404:
```json
{
  "code": 404,
  "message": "The requested webhook \"google-ads-tool-mcp/sse\" is not registered.",
  "hint": "Click the 'Execute workflow' button on the canvas, then try again. (In test mode, the webhook only works for one call after you click this button)"
}
```

## Soluções

### 1. Ativar o Workflow no n8n

O workflow precisa estar **ATIVO** (não apenas salvo):

1. Acesse o n8n: `https://n8n.546digitalservices.com`
2. Abra o workflow `google-ads-tool-mcp`
3. Clique no botão **"Active"** no canto superior direito para ativar o workflow
4. O workflow deve ficar com status **"Active"** (verde)

### 2. Verificar o Path do Webhook

No n8n, verifique o path configurado no nó Webhook:

1. Abra o workflow
2. Clique no nó **Webhook**
3. Verifique o campo **"Path"**
4. Deve estar configurado como: `/mcp-test/google-ads-tool-mcp/sse`

**Nota:** O path pode ser diferente. Verifique no n8n qual é o path real.

### 3. Publicar o Workflow (Produção)

Se o workflow estiver em modo de teste, ele só funciona uma vez após clicar em "Execute workflow".

Para funcionar continuamente:

1. Ative o workflow (botão "Active")
2. O workflow deve estar **publicado/ativo** (não em modo de teste)

### 4. Testar no Postman

Após ativar o workflow, teste no Postman:

**Método:** `GET`

**URL:**
```
https://n8n.546digitalservices.com/mcp-test/google-ads-tool-mcp/sse
```

**Headers:**
```
Accept: text/event-stream
Cache-Control: no-cache
```

**Configurações do Postman:**
- Desabilite "Follow redirects"
- Timeout: Aumente para pelo menos 60 segundos (SSE mantém conexão aberta)

### 5. Verificar CORS (se necessário)

Se ainda houver problemas de CORS, você pode:

1. No n8n, adicionar headers CORS no nó Webhook:
   - `Access-Control-Allow-Origin: *`
   - `Access-Control-Allow-Methods: GET, OPTIONS`
   - `Access-Control-Allow-Headers: Accept, Cache-Control`

2. Ou configurar CORS no n8n globalmente (configuração do servidor)

### 6. Verificar Logs do n8n

Se o problema persistir:

1. Acesse os logs do n8n
2. Verifique se há erros ao processar a requisição
3. Verifique se o workflow está sendo executado

## Teste Rápido com cURL

```bash
curl -v -N \
  -H "Accept: text/event-stream" \
  -H "Cache-Control: no-cache" \
  https://n8n.546digitalservices.com/mcp-test/google-ads-tool-mcp/sse
```

**Resultado esperado:**
- Se o workflow estiver ativo: Conexão SSE mantida, eventos sendo enviados
- Se não estiver ativo: Erro 404 com mensagem de webhook não registrado

## Checklist

- [ ] Workflow está **ATIVO** no n8n (não apenas salvo)
- [ ] Path do webhook está correto: `/mcp-test/google-ads-tool-mcp/sse`
- [ ] Workflow está **publicado** (não em modo de teste)
- [ ] Headers corretos no Postman: `Accept: text/event-stream`
- [ ] Timeout configurado adequadamente no Postman
- [ ] Logs do n8n verificados para erros

## Notas Importantes

1. **SSE (Server-Sent Events)** mantém a conexão aberta - o Postman pode mostrar como "aguardando resposta" indefinidamente (isso é normal)

2. **Modo de Teste:** No n8n, workflows em modo de teste só funcionam uma vez após clicar em "Execute workflow". Para uso contínuo, o workflow precisa estar **ATIVO**

3. **Path do Webhook:** O path pode incluir o prefixo `/mcp-test/` ou não, dependendo da configuração do n8n. Verifique no nó Webhook qual é o path completo.
