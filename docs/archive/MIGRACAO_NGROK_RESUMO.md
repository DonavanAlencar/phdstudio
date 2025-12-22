# Resumo da Migração: ngrok → IP Direto

**Data:** 21 de dezembro de 2025  
**Status:** ✅ Concluído

## 📋 Objetivo

Remover dependência do ngrok de todos os serviços (exceto n8n) e migrar para IP direto para maior estabilidade.

## ✅ Mudanças Realizadas

### 1. Servidor MCP CRM

**Arquivo:** `/root/mcp-crm-server/server.js`

**Antes:**
```javascript
const API_BASE_URL = process.env.CRM_API_URL || 'https://cbee244bb379.ngrok-free.app/wp-json/phd/v1';
```

**Depois:**
```javascript
const API_BASE_URL = process.env.CRM_API_URL || 'http://148.230.79.105:8080/wp-json/phd/v1';
```

**Status:** ✅ Atualizado

---

### 2. Arquivos Removidos

- ❌ `/root/phdstudio/CURLS_API_NGROK.md` - Documentação obsoleta
- ❌ `/root/phdstudio/CURLS_COMPLETOS.md` - Documentação obsoleta
- ❌ `/root/phdstudio/scripts/setup-ngrok-api.sh` - Script obsoleto
- ❌ `/root/phdstudio/scripts/setup-ngrok-tunnel.sh` - Script obsoleto
- ❌ `/root/phdstudio/scripts/test-api-ngrok.sh` - Script obsoleto

**Mantido:**
- ✅ `/root/phdstudio/scripts/update-ngrok-webhook.sh` - Para n8n (conforme solicitado)

**Status:** ✅ Limpeza concluída

---

### 3. Documentação Atualizada

**Novos arquivos criados:**
- ✅ `/root/phdstudio/CURLS_API_COMPLETOS.md` - Todos os curls atualizados com IP direto
- ✅ `/root/phdstudio/MCP_CRM_SERVER.md` - Documentação completa do servidor MCP
- ✅ `/root/phdstudio/PLANO_HTTPS_SEM_NGROK.md` - Plano de ação para implementar HTTPS

**Arquivos atualizados:**
- ✅ `/root/phdstudio/README.md` - URLs atualizadas para IP direto
- ✅ `/root/phdstudio/src/components/ChatDiagnostic.tsx` - Removida referência ao ngrok

**Status:** ✅ Documentação completa

---

### 4. Configurações Atuais

**IP do Servidor:** `148.230.79.105`

**Serviços:**
- **WordPress:** `http://148.230.79.105:8080`
- **API REST:** `http://148.230.79.105:3001`
- **Frontend:** `https://phdstudio.com.br` (via Traefik)
- **n8n:** `https://b673c9874ec4.ngrok-free.app` (mantém ngrok)

**Status:** ✅ Configurado

---

## 🧪 Testes Realizados

### Teste 1: API WordPress/FluentCRM
```bash
curl "http://148.230.79.105:8080/wp-json/phd/v1/lead/teste@example.com"
```
**Resultado:** ✅ Funcionando

### Teste 2: API REST Produtos
```bash
curl "http://148.230.79.105:3001/health"
```
**Resultado:** ✅ Funcionando

### Teste 3: MCP Server
**Status:** ⏳ Aguardando reinício do Cursor para aplicar mudanças

---

## 📝 Próximos Passos

### Imediato
1. ⏳ Reiniciar Cursor para aplicar mudanças no MCP
2. ⏳ Testar servidor MCP após reinício
3. ⏳ Validar todos os endpoints

### Curto Prazo
1. ⏳ Implementar HTTPS conforme `PLANO_HTTPS_SEM_NGROK.md`
2. ⏳ Configurar DNS para subdomínios (api.phdstudio.com.br, wp.phdstudio.com.br)
3. ⏳ Atualizar todas as URLs para HTTPS

### Longo Prazo
1. ⏳ Monitorar estabilidade do IP direto
2. ⏳ Considerar domínio fixo se IP mudar
3. ⏳ Implementar monitoramento de uptime

---

## 🔒 Segurança

**Status Atual:**
- ⚠️ Usando HTTP (não HTTPS) para WordPress e API
- ✅ Frontend já tem HTTPS via Traefik
- ✅ API Key protegida
- ✅ Rate limiting configurado

**Recomendação:**
- Implementar HTTPS conforme `PLANO_HTTPS_SEM_NGROK.md` o mais rápido possível

---

## 📚 Documentação de Referência

- **CURLS_API_COMPLETOS.md** - Todos os comandos cURL atualizados
- **MCP_CRM_SERVER.md** - Documentação do servidor MCP
- **PLANO_HTTPS_SEM_NGROK.md** - Plano para implementar HTTPS
- **README.md** - Documentação geral atualizada

---

## ✅ Checklist Final

- [x] Servidor MCP atualizado para IP direto
- [x] Arquivos obsoletos removidos
- [x] Documentação atualizada
- [x] CURLS gerados para notebookLM
- [x] Plano HTTPS criado
- [ ] MCP testado após reinício do Cursor
- [ ] HTTPS implementado (conforme plano)

---

## 🆘 Troubleshooting

### MCP não funciona após reinício

1. Verificar se servidor está rodando:
   ```bash
   ps aux | grep mcp-crm-server
   ```

2. Verificar logs do Cursor

3. Testar API diretamente:
   ```bash
   curl "http://148.230.79.105:8080/wp-json/phd/v1/lead/teste@example.com"
   ```

### API não responde

1. Verificar se containers estão rodando:
   ```bash
   docker ps
   ```

2. Verificar logs:
   ```bash
   docker logs phd-api
   docker logs wp_wordpress
   ```

3. Testar conectividade:
   ```bash
   curl http://148.230.79.105:3001/health
   curl http://148.230.79.105:8080
   ```

---

**Migração concluída com sucesso!** 🎉


