# Solução: Problema de Login do MCP

**Data:** 2025-12-23  
**Status:** ✅ LOGS DETALHADOS ADICIONADOS - AGUARDANDO TESTES DO MCP

---

## 🔧 CORREÇÕES APLICADAS

### 1. Logs Detalhados Adicionados

**Arquivo modificado:** `/root/phdstudio/api/routes/auth.js`

**Mudanças:**
- Adicionado `requestId` único para cada requisição de login
- Logs detalhados de IP, User-Agent e body recebido
- Logs de cada etapa do processo (query, bcrypt, tokens, sessão)
- Logs de erros com stack trace completo

**Benefícios:**
- Agora podemos ver exatamente o que o MCP está enviando
- Podemos rastrear cada requisição individualmente
- Identificar diferenças entre requisições do MCP e curl

---

## 📊 DIAGNÓSTICO ATUAL

### API está funcionando ✅

**Evidências:**
- Login via curl: `success:true` em ~0.5s
- Logs mostram: "match: true" e "Login concluído com sucesso"
- Banco de dados: conectado e funcionando
- Containers: todos saudáveis

### Problema identificado ⚠️

**O MCP está reportando:**
- Erro 401 (Email ou senha incorretos)
- Timeout > 10s

**Mas a API está:**
- Respondendo rápido (~355ms nos logs)
- Aceitando login com sucesso

**Conclusão:** O problema está na comunicação entre MCP e API, não na API em si.

---

## 🔍 PRÓXIMOS PASSOS PARA DEBUG

### 1. Verificar logs após testes do MCP

Após o MCP tentar fazer login, verificar:

```bash
docker logs phd-api --tail 100 | grep LOGIN
```

**O que procurar:**
- Se as requisições do MCP estão chegando na API
- Qual IP/User-Agent o MCP está usando
- Qual email/senha o MCP está enviando
- Se há diferença entre requisições do MCP e curl

---

### 2. Verificar configuração do MCP

**Variáveis de ambiente esperadas:**
```bash
CRM_API_URL=https://phdstudio.com.br/api/crm/v1
CRM_LOGIN_EMAIL=admin@phdstudio.com.br
CRM_LOGIN_PASSWORD=admin123
```

**Verificar:**
- Se as variáveis estão sendo lidas corretamente
- Se a URL está correta (com `https://`)
- Se não há espaços ou caracteres especiais nas credenciais

---

### 3. Testar conectividade do servidor do MCP

No servidor onde o MCP está rodando:

```bash
# Testar se consegue acessar a API
curl -X POST https://phdstudio.com.br/api/crm/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@phdstudio.com.br","password":"admin123"}'

# Deve retornar: {"success":true,...}
```

Se não funcionar, pode ser:
- Problema de rede/firewall
- DNS não resolvendo
- Certificado SSL inválido

---

### 4. Verificar timeout do MCP

O MCP pode ter timeout muito curto (10s). Se a primeira requisição demorar mais (por exemplo, por cold start), pode dar timeout antes de receber resposta.

**Solução:** Aumentar timeout do MCP para 30-60s.

---

## 📋 CHECKLIST DE VERIFICAÇÃO

Após testes do MCP:

- [ ] Logs da API mostram requisições do MCP chegando
- [ ] IP/User-Agent do MCP identificado nos logs
- [ ] Email/senha enviados pelo MCP estão corretos
- [ ] Não há diferença entre requisição do MCP e curl
- [ ] Timeout do MCP é suficiente (>30s)
- [ ] Conectividade do servidor do MCP está OK

---

## 🎯 POSSÍVEIS CAUSAS E SOLUÇÕES

### Causa 1: Credenciais incorretas no MCP

**Sintoma:** Logs mostram "match: false" ou "Usuário não encontrado"

**Solução:** Verificar variáveis de ambiente do MCP

---

### Causa 2: URL incorreta

**Sintoma:** Logs não mostram requisições chegando

**Solução:** Verificar `CRM_API_URL` no MCP

---

### Causa 3: Timeout muito curto

**Sintoma:** Logs mostram requisição chegando mas timeout antes de resposta

**Solução:** Aumentar timeout do MCP

---

### Causa 4: Problema de rede/firewall

**Sintoma:** Requisições não chegam na API

**Solução:** Verificar conectividade e firewall

---

## ✅ COMANDOS ÚTEIS

### Ver logs em tempo real
```bash
docker logs -f phd-api | grep LOGIN
```

### Testar login manualmente
```bash
curl -X POST https://phdstudio.com.br/api/crm/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@phdstudio.com.br","password":"admin123"}' \
  | jq '.success, .message'
```

### Verificar usuário no banco
```bash
docker exec phd-crm-db psql -U phd_crm_user -d phd_crm -c \
  "SELECT id, email, is_active FROM users WHERE email = 'admin@phdstudio.com.br';"
```

### Resetar senha (se necessário)
```bash
cd /root/phdstudio
./reset-admin-password.sh admin123
```

---

**Última atualização:** 2025-12-23  
**Próxima ação:** Aguardar testes do MCP e analisar logs detalhados

