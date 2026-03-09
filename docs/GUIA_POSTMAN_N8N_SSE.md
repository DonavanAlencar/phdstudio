# Guia Completo: Testar Webhook SSE do n8n no Postman

## 📋 Pré-requisitos

Antes de testar no Postman, certifique-se de que:

- [ ] O workflow está **ATIVO** no n8n (não apenas salvo)
- [ ] O path do webhook está correto: `/mcp-test/google-ads-tool-mcp/sse`
- [ ] Você tem acesso ao n8n: `https://n8n.546digitalservices.com`

## 🚀 Método 1: Importar Coleção do Postman (Recomendado)

### Passo 1: Importar a Coleção

1. Abra o Postman
2. Clique em **"Import"** (canto superior esquerdo)
3. Selecione o arquivo: `docs/POSTMAN_COLLECTION_N8N_SSE.json`
4. Clique em **"Import"**

### Passo 2: Configurar o Postman para SSE

1. Abra a requisição **"SSE Webhook Test"**
2. Vá em **Settings** (⚙️) no canto superior direito
3. Desabilite **"Follow redirects"**
4. Aumente o **Timeout** para pelo menos **60 segundos** (ou desabilite)

### Passo 3: Executar a Requisição

1. Clique em **"Send"**
2. **Importante:** O Postman pode mostrar "aguardando resposta" indefinidamente - isso é **NORMAL** para SSE
3. Os eventos SSE aparecerão na aba **"Body"** conforme forem recebidos

## 🛠️ Método 2: Criar Requisição Manualmente

### Passo 1: Criar Nova Requisição

1. No Postman, clique em **"New"** → **"HTTP Request"**
2. Nomeie como: `n8n SSE Webhook Test`

### Passo 2: Configurar Método e URL

- **Método:** `GET`
- **URL:** `https://n8n.546digitalservices.com/mcp-test/google-ads-tool-mcp/sse`

### Passo 3: Adicionar Headers

Na aba **"Headers"**, adicione:

| Key | Value |
|-----|-------|
| `Accept` | `text/event-stream` |
| `Cache-Control` | `no-cache` |

### Passo 4: Configurar Settings

1. Clique no ícone **⚙️ Settings** (canto superior direito)
2. Desabilite **"Follow redirects"**
3. Aumente **"Request timeout"** para **60000 ms** (60 segundos) ou desabilite

### Passo 5: Executar

1. Clique em **"Send"**
2. Aguarde os eventos SSE aparecerem na resposta

## 🔍 Verificar Status do Webhook

Antes de testar SSE, você pode verificar se o webhook está registrado:

### Requisição de Verificação

- **Método:** `GET`
- **URL:** `https://n8n.546digitalservices.com/mcp-test/google-ads-tool-mcp/sse`
- **Headers:** Nenhum (ou apenas `Accept: application/json`)

**Resposta esperada:**

✅ **Webhook ativo (200):**
```json
{
  "status": "ok"
}
```

❌ **Webhook não registrado (404):**
```json
{
  "code": 404,
  "message": "The requested webhook \"google-ads-tool-mcp/sse\" is not registered.",
  "hint": "Click the 'Execute workflow' button on the canvas, then try again."
}
```

## ⚠️ Problemas Comuns

### Problema 1: Erro 404 - Webhook não registrado

**Sintoma:**
```json
{
  "code": 404,
  "message": "The requested webhook is not registered."
}
```

**Solução:**
1. Acesse: `https://n8n.546digitalservices.com`
2. Abra o workflow `google-ads-tool-mcp`
3. Clique no botão **"Active"** para ativar o workflow
4. Verifique o path do webhook no nó Webhook

### Problema 2: Timeout no Postman

**Sintoma:** Postman fecha a conexão após alguns segundos

**Solução:**
1. Vá em **Settings** (⚙️)
2. Aumente **"Request timeout"** para **60000 ms** ou mais
3. Ou desabilite o timeout completamente

### Problema 3: Nenhum evento recebido

**Sintoma:** Conexão estabelecida, mas nenhum evento SSE recebido

**Possíveis causas:**
- O workflow não está enviando eventos
- O servidor está aguardando alguma ação para enviar eventos
- Verifique os logs do n8n para ver se o workflow está sendo executado

### Problema 4: Erro de CORS

**Sintoma:** Erro no console do navegador sobre CORS

**Solução:**
1. No n8n, adicione headers CORS no nó Webhook:
   - `Access-Control-Allow-Origin: *`
   - `Access-Control-Allow-Methods: GET, OPTIONS`
   - `Access-Control-Allow-Headers: Accept, Cache-Control`

## 📊 Como Interpretar a Resposta SSE

### Formato SSE

Os eventos SSE seguem o formato:
```
data: {"event": "message", "data": "conteúdo"}

data: {"event": "update", "data": "atualização"}

```

### No Postman

- Os eventos aparecerão na aba **"Body"** conforme forem recebidos
- Cada linha `data:` é um evento separado
- A conexão permanece aberta até ser fechada manualmente ou pelo servidor

## 🧪 Teste Rápido com Script

Você também pode usar o script de teste:

```bash
./scripts/test-n8n-sse.sh
```

Este script verifica:
- ✅ Conectividade com o servidor
- ✅ Status do webhook (ativo/não ativo)
- ✅ Headers CORS
- ✅ Conexão SSE (se o webhook estiver ativo)

## 📝 Checklist Final

Antes de considerar o problema resolvido:

- [ ] Workflow está **ATIVO** no n8n
- [ ] Path do webhook está correto
- [ ] Headers corretos no Postman (`Accept: text/event-stream`)
- [ ] Timeout configurado adequadamente (60s+)
- [ ] Script de teste executado com sucesso
- [ ] Postman consegue estabelecer conexão SSE
- [ ] Eventos SSE estão sendo recebidos (se aplicável)

## 🔗 Links Úteis

- **n8n:** https://n8n.546digitalservices.com
- **Documentação SSE:** https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events
- **Troubleshooting completo:** `docs/TROUBLESHOOTING_N8N_SSE.md`

## 💡 Dicas

1. **SSE mantém conexão aberta:** É normal o Postman mostrar "aguardando resposta" indefinidamente
2. **Use o script de teste primeiro:** Ele verifica rapidamente se o webhook está ativo
3. **Verifique os logs do n8n:** Se o workflow não está sendo executado, pode haver um erro no workflow
4. **Teste com cURL:** Se o Postman não funcionar, teste primeiro com cURL para isolar o problema
