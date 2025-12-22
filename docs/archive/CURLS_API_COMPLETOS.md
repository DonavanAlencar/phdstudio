# Comandos cURL Completos - API PHD Studio

**IP do Servidor:** `148.230.79.105`  
**Porta API:** `3001`  
**Porta WordPress:** `8080`

> **⚠️ IMPORTANTE:** Todas as URLs usam IP direto (sem ngrok) para maior estabilidade.

---

## 🔑 Autenticação

Todas as requisições (exceto `/health`) requerem o header:
```
X-PHD-API-KEY: CNZZoJ6rz7Gcb8Z80rYNSHfCW1jPxZTU
```

---

## 📋 Endpoints Disponíveis

### 1. Health Check

Verifica se a API está online.

```bash
curl -X GET "http://148.230.79.105:3001/health" \
  -H "Content-Type: application/json"
```

**Resposta esperada:**
```json
{
  "status": "ok",
  "timestamp": "2025-12-21T16:50:22.000Z"
}
```

---

### 2. Listar Todos os Produtos

Retorna todos os produtos cadastrados.

```bash
curl -X GET "http://148.230.79.105:3001/phd/v1/products" \
  -H "Content-Type: application/json" \
  -H "X-PHD-API-KEY: CNZZoJ6rz7Gcb8Z80rYNSHfCW1jPxZTU"
```

**Resposta esperada:**
```json
{
  "success": true,
  "count": 9,
  "data": [
    {
      "id": 1,
      "nome": "Nome do Produto",
      "categoria": "Categoria",
      "atributos": {
        "keywords": ["palavra1", "palavra2"],
        "descricao": "Descrição do produto",
        "tecnologias": ["tech1", "tech2"]
      },
      "preco_estimado": "R$ 1.000,00",
      "foto_url": "https://...",
      "updated_at": "2025-12-21T16:50:22.000Z"
    }
  ],
  "timestamp": "2025-12-21T16:50:22.000Z"
}
```

---

### 3. Obter Produto por ID

Retorna um produto específico pelo ID.

```bash
curl -X GET "http://148.230.79.105:3001/phd/v1/products/1" \
  -H "Content-Type: application/json" \
  -H "X-PHD-API-KEY: CNZZoJ6rz7Gcb8Z80rYNSHfCW1jPxZTU"
```

**Resposta esperada:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nome": "Nome do Produto",
    "categoria": "Categoria",
    "atributos": {
      "keywords": ["palavra1", "palavra2"],
      "descricao": "Descrição do produto",
      "tecnologias": ["tech1", "tech2"]
    },
    "preco_estimado": "R$ 1.000,00",
    "foto_url": "https://...",
    "updated_at": "2025-12-21T16:50:22.000Z"
  },
  "timestamp": "2025-12-21T16:50:22.000Z"
}
```

---

### 4. Filtrar Produtos por Categoria

Retorna produtos filtrados por categoria.

```bash
curl -X GET "http://148.230.79.105:3001/phd/v1/products?categoria=Marketing%20Recorrente" \
  -H "Content-Type: application/json" \
  -H "X-PHD-API-KEY: CNZZoJ6rz7Gcb8Z80rYNSHfCW1jPxZTU"
```

**Resposta esperada:** Mesmo formato do endpoint "Listar Todos os Produtos", mas filtrado.

---

## 🔐 Endpoints CRM (WordPress/FluentCRM)

### 5. Verificar Lead por Email

Verifica se um lead existe no CRM.

```bash
curl -X GET "http://148.230.79.105:8080/wp-json/phd/v1/lead/teste@example.com" \
  -H "Content-Type: application/json"
```

**Resposta (lead encontrado):**
```json
{
  "success": true,
  "data": {
    "id": 19,
    "email": "teste@example.com",
    "first_name": "João",
    "last_name": "Silva",
    "status": "subscribed",
    "custom_fields": {
      "telefone_whatsapp": "11999999999",
      "origem_canal": "teste_mcp_cursor",
      "intencao_estagio": "Curioso",
      "dor_necessidade": "Precisa de automação de vendas"
    }
  }
}
```

**Resposta (lead não encontrado):**
```json
{
  "code": "not_found",
  "message": "Contato não encontrado",
  "data": {
    "status": 404
  }
}
```

---

### 6. Criar/Atualizar Lead

Registra ou atualiza um lead no CRM.

```bash
curl -X POST "http://148.230.79.105:8080/wp-json/phd/v1/lead" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@example.com",
    "Nome": "João Silva",
    "Telefone_WhatsApp": "11999999999",
    "origem_canal": "teste_api",
    "intencao_estagio": "Curioso",
    "dor_necessidade": "Precisa de automação de vendas"
  }'
```

**Resposta esperada:**
```json
{
  "success": true,
  "message": "Lead criado/atualizado com sucesso no FluentCRM",
  "data": {
    "id": 19,
    "email": "teste@example.com",
    "status": "subscribed",
    "first_name": "João",
    "last_name": "Silva",
    "created_at": {
      "date": "2025-12-21 16:50:22.000000",
      "timezone_type": 3,
      "timezone": "America/Sao_Paulo"
    },
    "custom_fields": {
      "telefone_whatsapp": "11999999999",
      "origem_canal": "teste_api",
      "intencao_estagio": "Curioso",
      "dor_necessidade": "Precisa de automação de vendas"
    }
  }
}
```

---

## 🧪 Script de Testes Rápido

```bash
#!/bin/bash

API_BASE="http://148.230.79.105:3001"
API_KEY="CNZZoJ6rz7Gcb8Z80rYNSHfCW1jPxZTU"
WP_BASE="http://148.230.79.105:8080"

echo "=== Teste 1: Health Check ==="
curl -s "${API_BASE}/health" | python3 -m json.tool && echo -e "\n"

echo "=== Teste 2: Listar Produtos ==="
curl -s "${API_BASE}/phd/v1/products" \
  -H "X-PHD-API-KEY: ${API_KEY}" | python3 -m json.tool | head -20 && echo -e "\n"

echo "=== Teste 3: Produto por ID ==="
curl -s "${API_BASE}/phd/v1/products/1" \
  -H "X-PHD-API-KEY: ${API_KEY}" | python3 -m json.tool && echo -e "\n"

echo "=== Teste 4: Filtrar por Categoria ==="
curl -s "${API_BASE}/phd/v1/products?categoria=Marketing%20Recorrente" \
  -H "X-PHD-API-KEY: ${API_KEY}" | python3 -m json.tool | head -20 && echo -e "\n"

echo "=== Teste 5: Verificar Lead ==="
curl -s "${WP_BASE}/wp-json/phd/v1/lead/teste@example.com" \
  -H "Content-Type: application/json" | python3 -m json.tool && echo -e "\n"

echo "=== Teste 6: Criar Lead ==="
curl -s -X POST "${WP_BASE}/wp-json/phd/v1/lead" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste_api@example.com",
    "Nome": "Teste API",
    "Telefone_WhatsApp": "11999999999",
    "origem_canal": "teste_curl",
    "intencao_estagio": "Curioso",
    "dor_necessidade": "Teste de integração"
  }' | python3 -m json.tool && echo -e "\n"
```

---

## 📝 Variáveis de Ambiente

Para facilitar o uso, exporte as variáveis:

```bash
export API_BASE="http://148.230.79.105:3001"
export WP_BASE="http://148.230.79.105:8080"
export API_KEY="CNZZoJ6rz7Gcb8Z80rYNSHfCW1jPxZTU"
```

Depois use nos curls:

```bash
curl -s "${API_BASE}/health" && echo -e "\n"
curl -s "${API_BASE}/phd/v1/products" -H "X-PHD-API-KEY: ${API_KEY}" | python3 -m json.tool
```

---

## ⚠️ Tratamento de Erros

### Erro 401 - Não autorizado
```json
{
  "error": "API Key inválida ou ausente"
}
```

### Erro 404 - Não encontrado
```json
{
  "error": "Produto não encontrado"
}
```

### Erro 429 - Rate limit
```json
{
  "error": "Muitas requisições. Tente novamente em alguns segundos."
}
```

### Erro 500 - Erro interno
```json
{
  "error": "Erro interno do servidor"
}
```

---

## 🔒 Segurança

- ✅ API Key obrigatória para todos os endpoints (exceto `/health`)
- ✅ Rate limiting configurado (100 req/min por IP)
- ✅ Headers de segurança (Helmet.js)
- ✅ Validação e sanitização rigorosa
- ✅ Prepared statements (proteção SQL injection)
- ✅ CORS configurado para domínios permitidos

---

## 📞 Suporte

Para mais informações, consulte:
- `README.md` - Documentação geral do projeto
- `API_CONFIGURACAO.md` - Configuração detalhada da API
- `SEGURANCA.md` - Práticas de segurança


