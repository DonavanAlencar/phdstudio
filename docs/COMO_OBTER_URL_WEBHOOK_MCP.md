# Como Obter a URL Correta do Webhook MCP no n8n

## 🔍 Problema

O workflow está **ATIVO**, mas o webhook retorna 404. Isso geralmente significa que o **path do webhook está diferente** do que você está tentando usar.

## 📋 Passo a Passo para Obter a URL Correta

### 1. Abrir o Nó MCP Trigger

1. No n8n, abra o workflow **"Google Ads Tool MCP Server"**
2. Clique no nó **"Google Ads Tool MCP Server"** (o nó com ícone de raio ⚡)
3. Este é o nó **MCP Trigger** que gera o webhook

### 2. Verificar a URL do Webhook

No painel de configuração do nó MCP Trigger, procure por:

- **"Webhook URL"** ou **"Production URL"**
- **"Test URL"** (se estiver em modo de teste)
- Um botão **"Copy URL"** ou **"Copy webhook URL"**

### 3. Copiar a URL Completa

A URL deve ter um formato como:
```
https://n8n.546digitalservices.com/webhook/[ID-UNICO]
```

ou

```
https://n8n.546digitalservices.com/mcp-test/[PATH-CUSTOMIZADO]
```

**⚠️ IMPORTANTE:** Copie a URL **COMPLETA** exibida no nó, não tente adivinhar o path!

### 4. Verificar o Path no Nó

Alguns nós MCP mostram o path configurado. Verifique:

1. No painel do nó MCP Trigger
2. Procure por campo **"Path"** ou **"Webhook Path"**
3. Anote o path exato (pode ser diferente de `/mcp-test/google-ads-tool-mcp/sse`)

## 🧪 Testar a URL Correta

Após obter a URL do nó, teste com:

```bash
curl -v -N \
  -H "Accept: text/event-stream" \
  -H "Cache-Control: no-cache" \
  [URL-COPIA-DO-NO]
```

## 🔄 Paths Alternativos Comuns

Se não conseguir encontrar a URL no nó, teste estes paths alternativos:

### Opção 1: Path sem prefixo `/mcp-test/`
```
https://n8n.546digitalservices.com/google-ads-tool-mcp/sse
```

### Opção 2: Path com ID do workflow
```
https://n8n.546digitalservices.com/webhook/[ID-DO-WORKFLOW]
```

### Opção 3: Path baseado no nome do workflow
```
https://n8n.546digitalservices.com/webhook/google-ads-tool-mcp-server
```

### Opção 4: Path com formato MCP padrão
```
https://n8n.546digitalservices.com/mcp/google-ads-tool-mcp/sse
```

## 🛠️ Script para Testar Múltiplos Paths

Execute este script para testar vários paths automaticamente:

```bash
#!/bin/bash

BASE_URL="https://n8n.546digitalservices.com"
PATHS=(
    "/mcp-test/google-ads-tool-mcp/sse"
    "/google-ads-tool-mcp/sse"
    "/webhook/google-ads-tool-mcp"
    "/mcp/google-ads-tool-mcp/sse"
    "/webhook/google-ads-tool-mcp-server"
)

for path in "${PATHS[@]}"; do
    echo "Testando: $BASE_URL$path"
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$path")
    if [ "$HTTP_CODE" = "200" ]; then
        echo "✅ SUCESSO! Path correto: $path"
        echo "URL completa: $BASE_URL$path"
        exit 0
    elif [ "$HTTP_CODE" != "404" ]; then
        echo "⚠️  HTTP $HTTP_CODE: $path"
    fi
done

echo "❌ Nenhum path funcionou. Verifique a URL no nó MCP Trigger."
```

## 📸 Onde Encontrar a URL no n8n

### Método 1: Painel do Nó
1. Clique no nó **"Google Ads Tool MCP Server"**
2. No painel direito, procure por **"Webhook URL"** ou **"Production URL"**
3. Deve haver um botão para copiar

### Método 2: Menu de Ações
1. Clique com botão direito no nó
2. Procure por opção **"Copy Webhook URL"** ou **"Show Webhook URL"**

### Método 3: Executar Workflow
1. Clique em **"Execute workflow"** (botão vermelho)
2. Após executar, verifique os logs
3. A URL do webhook pode aparecer nos logs de execução

## ⚠️ Problemas Comuns

### Problema: Não consigo encontrar a URL no nó

**Solução:**
1. Certifique-se de que o workflow está **ATIVO** (toggle verde no topo)
2. Salve o workflow novamente
3. Recarregue a página do n8n
4. Clique no nó MCP Trigger novamente

### Problema: A URL mostra "Test URL" mas preciso de "Production URL"

**Solução:**
1. Certifique-se de que o workflow está **ATIVO** (não em modo de teste)
2. A URL de produção só aparece quando o workflow está ativo
3. Se ainda não aparecer, pode ser necessário configurar o path manualmente no nó

### Problema: O path no nó é diferente do que estou usando

**Solução:**
- Use **EXATAMENTE** o path mostrado no nó
- Não adicione ou remova partes do path
- Copie e cole a URL completa

## ✅ Checklist

- [ ] Workflow está **ATIVO** (toggle verde)
- [ ] Cliquei no nó **"Google Ads Tool MCP Server"**
- [ ] Encontrei a URL do webhook no painel do nó
- [ ] Copiei a URL **COMPLETA**
- [ ] Testei a URL copiada com curl ou Postman
- [ ] Se não funcionou, testei os paths alternativos

## 📞 Próximos Passos

1. **Obtenha a URL do nó MCP Trigger** (método mais confiável)
2. **Teste a URL copiada** com o script ou curl
3. **Atualize o Postman** com a URL correta
4. **Execute o script de teste** novamente para confirmar

---

**Lembre-se:** A URL exibida no nó MCP Trigger é a **fonte da verdade**. Use sempre essa URL, não tente adivinhar o path!
