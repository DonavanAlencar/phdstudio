# ✅ Solução Final: Webhook MCP do n8n

## 🎯 Problema Identificado

O workflow está **ATIVO** no n8n, mas o webhook retorna 404 porque o **path está incorreto**.

## 🔍 Solução: Obter a URL Correta do Nó MCP

A URL do webhook MCP é gerada automaticamente pelo n8n e **deve ser copiada diretamente do nó**, não adivinhada.

## 📋 Passo a Passo (IMPORTANTE)

### 1. Abrir o Nó MCP Trigger no n8n

1. Acesse: `https://n8n.546digitalservices.com`
2. Abra o workflow **"Google Ads Tool MCP Server"**
3. Clique no nó **"Google Ads Tool MCP Server"** (o nó com ícone de raio ⚡ no topo do workflow)

### 2. Encontrar a URL do Webhook

No painel de configuração do nó (lado direito), procure por:

- **"Production URL"** ou **"Webhook URL"**
- Um campo mostrando a URL completa
- Um botão **"Copy"** ou **"Copy URL"** ao lado da URL

**A URL deve ter um formato como:**
```
https://n8n.546digitalservices.com/webhook/[ID-UNICO]
```

ou

```
https://n8n.546digitalservices.com/[PATH-CUSTOMIZADO]
```

### 3. Copiar a URL Completa

⚠️ **CRÍTICO:** Copie a URL **EXATA** mostrada no nó. Não tente adivinhar ou modificar o path!

### 4. Testar a URL Copiada

Após copiar a URL do nó, teste com:

```bash
curl -v -N \
  -H "Accept: text/event-stream" \
  -H "Cache-Control: no-cache" \
  [URL-COPIA-DO-NO]
```

Ou use o Postman com:
- **Método:** GET
- **URL:** [URL copiada do nó]
- **Headers:**
  - `Accept: text/event-stream`
  - `Cache-Control: no-cache`

## 🛠️ Scripts Disponíveis

### Script de Teste Múltiplos Paths
```bash
./scripts/test-multiple-paths.sh
```
Testa vários paths comuns automaticamente.

### Script de Teste Completo
```bash
./scripts/test-n8n-sse.sh
```
Testa conectividade, status, SSE e CORS.

## ⚠️ Por Que Não Funciona Sem Copiar do Nó?

1. **Path Gerado Automaticamente:** O n8n gera um path único para cada webhook MCP
2. **Pode Incluir IDs:** O path pode conter IDs únicos do workflow ou nó
3. **Configuração Específica:** O path depende de como o nó MCP Trigger foi configurado
4. **Não é Padronizado:** Diferente de webhooks normais, MCP triggers podem ter paths customizados

## 📝 Checklist Final

- [ ] Workflow está **ATIVO** (toggle verde no topo)
- [ ] Cliquei no nó **"Google Ads Tool MCP Server"**
- [ ] Encontrei o campo **"Production URL"** ou **"Webhook URL"**
- [ ] Copiei a URL **COMPLETA** do nó
- [ ] Testei a URL copiada com curl ou Postman
- [ ] Funcionou! ✅

## 🔗 Recursos Adicionais

- **Guia Completo:** `docs/COMO_OBTER_URL_WEBHOOK_MCP.md`
- **Troubleshooting:** `docs/TROUBLESHOOTING_N8N_SSE.md`
- **Guia Postman:** `docs/GUIA_POSTMAN_N8N_SSE.md`
- **Coleção Postman:** `docs/POSTMAN_COLLECTION_N8N_SSE.json`

## 💡 Dica Final

**Sempre copie a URL diretamente do nó MCP Trigger no n8n.** Essa é a única forma garantida de obter o path correto, pois o n8n gera paths únicos para webhooks MCP.

---

**Última atualização:** 29 de Janeiro de 2026
