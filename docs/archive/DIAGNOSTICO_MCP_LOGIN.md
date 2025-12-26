# Diagnóstico: Problema de Login do MCP

**Data:** 2025-12-23  
**Status:** 🔍 INVESTIGAÇÃO EM ANDAMENTO

---

## 🎯 PROBLEMA

O MCP está falhando em 100% dos testes com erro:
```
Erro ao fazer login: 401 - Email ou senha incorretos
```

---

## ✅ VERIFICAÇÕES REALIZADAS

### 1. API está funcionando

**Teste direto via curl:**
```bash
curl -X POST https://phdstudio.com.br/api/crm/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@phdstudio.com.br","password":"admin123"}'
```

**Resultado:** ✅ `{"success":true,"message":"Login realizado com sucesso",...}`

### 2. Usuário existe e está ativo

```sql
SELECT id, email, role, is_active FROM users WHERE email = 'admin@phdstudio.com.br';
```

**Resultado:**
```
id | email                  | role  | is_active
1  | admin@phdstudio.com.br | admin | t (true)
```

### 3. Senha foi resetada

- Script `reset-admin-password.sh` executado com sucesso
- Hash bcrypt gerado e atualizado no banco
- Hash válido (formato `$2a$10$...`)

### 4. Bcrypt funcionando

Teste interno no container:
```javascript
const hash = bcrypt.hashSync('admin123', 10);
const match = bcrypt.compareSync('admin123', hash);
// Resultado: match = true ✅
```

---

## 🔍 POSSÍVEIS CAUSAS

### Causa 1: Credenciais incorretas no MCP ⚠️ **MAIS PROVÁVEL**

O MCP pode estar configurado com:
- Email diferente de `admin@phdstudio.com.br`
- Senha diferente de `admin123`
- Variáveis de ambiente não configuradas corretamente

**Verificar:**
- `CRM_LOGIN_EMAIL` no MCP
- `CRM_LOGIN_PASSWORD` no MCP
- Se as variáveis estão sendo lidas corretamente

---

### Causa 2: URL diferente ou problema de rede

O MCP pode estar usando:
- URL diferente (ex: `http://` em vez de `https://`)
- Porta diferente
- Problema de DNS/resolução
- Timeout de rede

**Verificar:**
- URL base configurada no MCP
- Se o MCP consegue acessar `https://phdstudio.com.br/api/crm/v1/health`

---

### Causa 3: Formato de requisição diferente

O MCP pode estar enviando:
- Headers diferentes
- Formato de body diferente
- Encoding diferente

**Verificar:**
- Logs da API para ver exatamente o que o MCP está enviando
- Comparar com requisição curl que funciona

---

### Causa 4: Cache ou sessão antiga

O MCP pode estar:
- Usando token antigo/cacheado
- Tentando reutilizar sessão expirada
- Não limpando estado entre tentativas

**Verificar:**
- Se o MCP limpa tokens antigos
- Se há cache de credenciais

---

## 📋 CHECKLIST DE VERIFICAÇÃO DO MCP

### 1. Verificar variáveis de ambiente

```bash
# No servidor/configuração do MCP, verificar:
echo $CRM_LOGIN_EMAIL
echo $CRM_LOGIN_PASSWORD
```

**Valores esperados:**
- `CRM_LOGIN_EMAIL=admin@phdstudio.com.br`
- `CRM_LOGIN_PASSWORD=admin123`

---

### 2. Verificar URL base

O MCP deve usar:
```
https://phdstudio.com.br/api/crm/v1/auth/login
```

**Não usar:**
- `http://` (deve ser `https://`)
- Porta explícita (não precisa de `:443`)
- Path diferente de `/api/crm/v1/auth/login`

---

### 3. Verificar formato da requisição

O MCP deve enviar:
```http
POST /api/crm/v1/auth/login
Content-Type: application/json

{
  "email": "admin@phdstudio.com.br",
  "password": "admin123"
}
```

**Verificar:**
- Header `Content-Type: application/json`
- Body é JSON válido
- Campos `email` e `password` presentes

---

### 4. Testar conectividade

O MCP deve conseguir acessar:
```bash
# Health check (sem autenticação)
curl https://phdstudio.com.br/api/crm/v1/health

# Deve retornar: {"status":"ok",...}
```

---

## 🔧 SOLUÇÕES SUGERIDAS

### Solução 1: Verificar e corrigir credenciais no MCP

1. Acessar configuração do MCP
2. Verificar `CRM_LOGIN_EMAIL` e `CRM_LOGIN_PASSWORD`
3. Garantir que estão corretos:
   - Email: `admin@phdstudio.com.br`
   - Senha: `admin123`
4. Reiniciar serviço do MCP após alterar

---

### Solução 2: Testar endpoint diretamente do servidor do MCP

Se o MCP estiver em outro servidor:

```bash
# No servidor do MCP, testar:
curl -X POST https://phdstudio.com.br/api/crm/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@phdstudio.com.br","password":"admin123"}'
```

Se funcionar, o problema é na configuração do MCP.  
Se não funcionar, pode ser problema de rede/firewall.

---

### Solução 3: Habilitar logs detalhados na API

Adicionar logs mais detalhados para ver exatamente o que o MCP está enviando:

```javascript
// Em api/routes/auth.js, adicionar:
console.log('🔍 [LOGIN] Body recebido:', JSON.stringify(req.body));
console.log('🔍 [LOGIN] Headers:', JSON.stringify(req.headers));
```

Isso ajudará a identificar diferenças entre requisição do MCP e curl.

---

### Solução 4: Criar endpoint de teste

Criar endpoint temporário para debug:

```javascript
// GET /api/crm/v1/auth/test-login
router.get('/test-login', async (req, res) => {
  const { email, password } = req.query;
  // ... lógica de teste sem retornar token
});
```

---

## 📊 LOGS DA API PARA ANÁLISE

Últimos logs de login:
```
✅ [LOGIN] Usuário encontrado: admin@phdstudio.com.br
🔐 [LOGIN] Verificando senha...
✅ [LOGIN] Bcrypt concluído em 77ms, match: false
❌ [LOGIN] Senha incorreta
```

**Observação:** Os logs mostram tentativas de login que falharam. Isso pode ser:
1. Tentativas antigas (antes do reset)
2. Tentativas do MCP com senha incorreta
3. Problema de timing (hash não atualizado ainda)

---

## ✅ PRÓXIMOS PASSOS

1. **Verificar configuração do MCP:**
   - Email: `admin@phdstudio.com.br`
   - Senha: `admin123`
   - URL: `https://phdstudio.com.br/api/crm/v1/auth/login`

2. **Testar conectividade do MCP:**
   - Verificar se consegue acessar a API
   - Testar health check
   - Verificar logs de rede/firewall

3. **Habilitar logs detalhados:**
   - Ver exatamente o que o MCP está enviando
   - Comparar com requisição curl que funciona

4. **Testar após correções:**
   - Executar testes do MCP novamente
   - Verificar se login funciona

---

## 🔄 COMANDOS ÚTEIS

### Testar login manualmente
```bash
curl -X POST https://phdstudio.com.br/api/crm/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@phdstudio.com.br","password":"admin123"}' \
  | jq '.success, .message'
```

### Ver logs de login em tempo real
```bash
docker logs -f phd-api | grep LOGIN
```

### Verificar usuário no banco
```bash
docker exec phd-crm-db psql -U phd_crm_user -d phd_crm -c \
  "SELECT id, email, is_active FROM users WHERE email = 'admin@phdstudio.com.br';"
```

### Resetar senha novamente
```bash
cd /root/phdstudio
./reset-admin-password.sh admin123
```

---

**Última atualização:** 2025-12-23  
**Status:** Aguardando verificação da configuração do MCP

