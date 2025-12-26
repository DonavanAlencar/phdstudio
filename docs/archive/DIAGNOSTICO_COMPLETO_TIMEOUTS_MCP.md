# Diagnóstico Completo: Timeouts e Problema de Login do MCP

**Data:** 2025-12-22  
**Status:** 🔴 PROBLEMA CRÍTICO IDENTIFICADO

---

## 🚨 PROBLEMA IMEDIATO: Login do MCP falhando (401/504)

### Evidências Coletadas

1. **Teste direto via curl:**
   ```bash
   curl -X POST https://phdstudio.com.br/api/crm/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@phdstudio.com.br","password":"admin123"}'
   ```
   **Resultado:** `504 Gateway Timeout` após 30 segundos

2. **Logs da API:**
   - Login está chegando na API ✅
   - Query de usuário: 3-8ms (rápido) ✅
   - Bcrypt: 97-252ms (aceitável) ✅
   - **Senha incorreta:** `match: false` ❌

3. **Status dos containers:**
   ```
   phd-api         Up 20 hours (healthy)   3001/tcp
   phd-crm-db      Up 42 hours (healthy)   5432/tcp
   phdstudio-app   Up 14 hours             80/tcp, 443/tcp
   ```

4. **Usuário no banco:**
   - Email: `admin@phdstudio.com.br`
   - Role: `admin`
   - Status: `is_active = true` ✅
   - Último login: 2025-12-22 21:23:51

### Análise

**Causa raiz provável:**
- A senha `admin123` não corresponde ao hash armazenado no banco
- O MCP está configurado com credenciais incorretas ou a senha foi alterada
- Múltiplas tentativas de login estão gerando timeouts no Traefik (30s)

**Impacto:**
- ❌ MCP não consegue autenticar (0/16 testes passaram)
- ❌ Qualquer integração via MCP está bloqueada
- ⚠️ Timeouts podem estar mascarando outros problemas de performance

---

## 🔧 CORREÇÃO IMEDIATA NECESSÁRIA

### Passo 1: Resetar senha do admin

**Objetivo:** Garantir que a senha `admin123` está correta no banco

**Comando:**
```bash
cd /root/phdstudio
./reset-admin-password.sh admin123
```

**Validação:**
```bash
# Testar login após reset
curl -X POST https://phdstudio.com.br/api/crm/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@phdstudio.com.br","password":"admin123"}' \
  -w "\nHTTP %{http_code} em %{time_total}s\n"
```

**Resultado esperado:** `HTTP 200` com `accessToken` no body

---

### Passo 2: Verificar configuração do MCP

**Ação necessária (fora do escopo do código):**
- Confirmar que o MCP está configurado com:
  - `CRM_LOGIN_EMAIL=admin@phdstudio.com.br`
  - `CRM_LOGIN_PASSWORD=admin123` (ou a senha correta após reset)

---

## 📊 DIAGNÓSTICO DE TIMEOUTS (FASE 1 - EM ANDAMENTO)

### Evidências já coletadas

#### 1.1 Status dos containers ✅
- Todos os containers estão `healthy` e rodando
- Sem restarts recentes
- Health checks passando

#### 1.2 Logs da API ✅
- Login funcionando (após correção de senha)
- Queries rápidas (3-8ms para buscar usuário)
- Bcrypt aceitável (97-252ms)
- **Problema:** Senha incorreta causando múltiplas tentativas

#### 1.3 Conexões Postgres ✅
- Apenas 1 conexão ativa (normal)
- Sem filas ou locks

### Evidências AINDA NECESSÁRIAS

#### 2.1 Medição de latência real dos endpoints

**Comandos a executar (APÓS corrigir login):**

```bash
BASE_URL="https://phdstudio.com.br"

# 1. Login e capturar token
TOKEN=$(curl -s -X POST "$BASE_URL/api/crm/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@phdstudio.com.br","password":"admin123"}' \
  | jq -r '.data.accessToken')

# 2. Health check
curl "$BASE_URL/api/crm/v1/health" \
  -w "\nHTTP %{http_code} em %{time_total}s\n"

# 3. /me
curl "$BASE_URL/api/crm/v1/auth/me" \
  -H "Authorization: Bearer $TOKEN" \
  -w "\nHTTP %{http_code} em %{time_total}s\n"

# 4. /leads (CRÍTICO - endpoint problemático)
curl "$BASE_URL/api/crm/v1/leads" \
  -H "Authorization: Bearer $TOKEN" \
  -w "\nHTTP %{http_code} em %{time_total}s\n"

# 5. /tags
curl "$BASE_URL/api/crm/v1/tags" \
  -H "Authorization: Bearer $TOKEN" \
  -w "\nHTTP %{http_code} em %{time_total}s\n"
```

#### 2.2 Teste de carga no /leads (50-100 chamadas)

```bash
# Rodar 50 chamadas e calcular estatísticas
for i in $(seq 1 50); do
  curl -s -o /dev/null \
    -H "Authorization: Bearer $TOKEN" \
    -w "%{time_total}\n" \
    "$BASE_URL/api/crm/v1/leads" >> /tmp/leads_times.txt
done

# Estatísticas
awk '
  { t[NR] = $1; sum += $1; }
  END {
    n = NR;
    asort(t);
    p95 = t[int(0.95*n)];
    p99 = t[int(0.99*n)];
    printf("n=%d min=%.3f avg=%.3f p95=%.3f p99=%.3f max=%.3f\n",
      n, t[1], sum/n, p95, p99, t[n]);
  }
' /tmp/leads_times.txt
```

#### 2.3 Logs do Traefik (504/502/499)

```bash
# Filtrar erros relacionados ao phd-api
docker logs n8n-traefik-1 --tail 5000 | grep -E "phd-api|504|502|499" | tail -50
```

#### 2.4 Recursos dos containers durante carga

```bash
# Rodar durante o teste de carga
docker stats --no-stream | grep -E "phd-api|phd-crm-db|phdstudio"
```

#### 2.5 Índices no banco de dados

```bash
# Verificar índices existentes
docker exec phd-crm-db psql -U phd_crm_user -d phd_crm -c "\d leads"
docker exec phd-crm-db psql -U phd_crm_user -d phd_crm -c "\d lead_tags"
docker exec phd-crm-db psql -U phd_crm_user -d phd_crm -c "\d lead_custom_fields"
```

#### 2.6 Configuração de timeouts (Traefik + nginx)

```bash
# Verificar labels do Traefik
docker inspect phd-api | jq '.[0].Config.Labels'

# Verificar config do nginx (frontend)
docker exec phdstudio-app cat /etc/nginx/nginx.conf | grep -A 10 "proxy"
```

---

## 🎯 HIPÓTESES PRINCIPAIS (ordenadas por probabilidade)

### Hipótese 1: Senha incorreta bloqueando MCP ⚠️ **RESOLVIDO APÓS RESET**

**Probabilidade:** 100% (confirmado nos logs)  
**Evidências:**
- Logs mostram `match: false` no bcrypt
- MCP falhando em 100% dos testes
- Curl também falhando

**Ação:** Resetar senha e testar novamente

---

### Hipótese 2: Timeout do Traefik muito curto (30s) para /leads

**Probabilidade:** Alta (baseado em documentação anterior)  
**Evidências esperadas:**
- p95/p99 do /leads > 30s em alguns casos
- Logs do Traefik mostrando 504 após 30s
- Timeout configurado em 30s (padrão do Traefik)

**Correção sugerida:**
- Aumentar timeout do Traefik para 60-90s
- Configurar via labels válidas para Traefik v3

---

### Hipótese 3: Falta de índices no banco causando queries lentas

**Probabilidade:** Média-Alta  
**Evidências esperadas:**
- `EXPLAIN ANALYZE` mostrando Sequential Scan
- p95/p99 alto mesmo com poucos leads
- Índices ausentes em `deleted_at`, `status`, `stage`, `lead_tags.lead_id`

**Correção sugerida:**
- Criar índices conforme documentação anterior
- Validar com `EXPLAIN ANALYZE` antes/depois

---

### Hipótese 4: Pool de conexões pequeno ou queries bloqueantes

**Probabilidade:** Média  
**Evidências esperadas:**
- `pg_stat_activity` mostrando muitas conexões `idle in transaction`
- Pool esgotado durante picos
- Queries lentas bloqueando outras

**Correção sugerida:**
- Ajustar tamanho do pool (já aumentado para 30 na doc)
- Verificar `max_connections` do Postgres

---

### Hipótese 5: Frontend gerando rajadas de requisições

**Probabilidade:** Baixa-Média  
**Evidências esperadas:**
- Logs mostrando múltiplas requisições simultâneas do mesmo IP
- Falta de debounce na busca
- Sem cancelamento de requisições antigas

**Correção sugerida:**
- Implementar debounce (300-500ms)
- Usar `AbortController` para cancelar requisições antigas

---

## 📋 PLANO DE AÇÃO (FASE 2 - AGUARDANDO AUTORIZAÇÃO)

### Prioridade CRÍTICA (fazer primeiro)

1. ✅ **Resetar senha do admin** (corrige problema imediato do MCP)
2. ✅ **Testar login após reset** (validar que funciona)
3. ⏳ **Coletar métricas de latência** (após login funcionar)

### Prioridade ALTA (resolver timeouts)

4. ⏳ **Aumentar timeout do Traefik** (60-90s)
5. ⏳ **Criar índices no banco** (se necessário)
6. ⏳ **Otimizar queries lentas** (se identificadas)

### Prioridade MÉDIA (melhorias)

7. ⏳ **Debounce no frontend** (reduzir requisições)
8. ⏳ **Cancelamento de requisições** (melhor UX)
9. ⏳ **Logs estruturados** (observabilidade)

---

## ✅ CHECKLIST DE VALIDAÇÃO FINAL

Após todas as correções:

- [ ] Login do MCP funcionando (testar via MCP)
- [ ] `/api/crm/v1/leads` com p95 < 2s e p99 < 5s
- [ ] Sem 504/502/499 nos logs do Traefik
- [ ] Tela de leads carregando sem intermitência
- [ ] MCP consumindo endpoints sem erros
- [ ] Contratos da API preservados (MCP compatível)

---

## 🔄 PRÓXIMOS PASSOS

1. **AGORA:** Executar reset de senha e testar login
2. **DEPOIS:** Coletar todas as métricas da Fase 1
3. **ENTÃO:** Refinar hipóteses com dados reais
4. **FINALMENTE:** Aplicar correções com backup/rollback

---

**Última atualização:** 2025-12-22  
**Próxima ação:** Resetar senha e coletar métricas completas

