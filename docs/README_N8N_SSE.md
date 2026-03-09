# 🔗 Recursos para Testar Webhook SSE do n8n

Este diretório contém todos os recursos necessários para diagnosticar e testar o webhook SSE do n8n.

## 📁 Arquivos Disponíveis

### 1. Script de Teste Automatizado
**Arquivo:** `scripts/test-n8n-sse.sh`

Script bash que testa automaticamente:
- ✅ Conectividade com o servidor
- ✅ Status do webhook (ativo/não ativo)
- ✅ Resposta completa do servidor
- ✅ Conexão SSE (se ativo)
- ✅ Headers CORS

**Uso:**
```bash
./scripts/test-n8n-sse.sh
```

### 2. Guia de Troubleshooting
**Arquivo:** `docs/TROUBLESHOOTING_N8N_SSE.md`

Guia completo com:
- Diagnóstico do problema
- Soluções passo a passo
- Checklist de verificação
- Notas importantes sobre SSE

### 3. Guia do Postman
**Arquivo:** `docs/GUIA_POSTMAN_N8N_SSE.md`

Guia detalhado para:
- Importar coleção do Postman
- Configurar requisição manualmente
- Resolver problemas comuns
- Interpretar respostas SSE

### 4. Coleção do Postman
**Arquivo:** `docs/POSTMAN_COLLECTION_N8N_SSE.json`

Coleção pronta para importar no Postman com:
- Requisição SSE configurada
- Headers corretos
- Variáveis de ambiente
- Descrições detalhadas

**Como usar:**
1. Abra o Postman
2. Clique em "Import"
3. Selecione `docs/POSTMAN_COLLECTION_N8N_SSE.json`
4. Configure timeout (60s+) nas Settings
5. Execute a requisição

## 🚀 Fluxo Recomendado

### Passo 1: Diagnóstico Rápido
```bash
./scripts/test-n8n-sse.sh
```

### Passo 2: Se o webhook não estiver ativo
1. Acesse: https://n8n.546digitalservices.com
2. Abra o workflow `google-ads-tool-mcp`
3. Clique no botão **"Active"** para ativar
4. Execute o script novamente para verificar

### Passo 3: Testar no Postman
1. Importe a coleção: `docs/POSTMAN_COLLECTION_N8N_SSE.json`
2. Siga o guia: `docs/GUIA_POSTMAN_N8N_SSE.md`
3. Configure timeout para 60s+
4. Execute a requisição

## 📊 Status Atual

**Última verificação:** O webhook está retornando **404 - Não registrado**

**Ação necessária:** Ativar o workflow no n8n

## 🔗 Links Úteis

- **n8n:** https://n8n.546digitalservices.com
- **URL do Webhook:** https://n8n.546digitalservices.com/mcp-test/google-ads-tool-mcp/sse
- **Documentação SSE:** https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events

## ❓ Precisa de Ajuda?

1. Execute o script de teste primeiro
2. Consulte o guia de troubleshooting
3. Verifique os logs do n8n
4. Teste com cURL antes do Postman

---

**Criado em:** 29 de Janeiro de 2026  
**Última atualização:** 29 de Janeiro de 2026
