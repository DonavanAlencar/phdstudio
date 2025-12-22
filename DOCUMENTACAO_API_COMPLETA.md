# 📚 Documentação Completa da API PHD Studio

**Versão:** 1.0.0  
**Data:** Dezembro 2024  
**Base URL Produção:** `https://phdstudio.com.br/api`  
**Base URL Desenvolvimento:** `http://localhost:3001`

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Autenticação](#autenticação)
3. [Endpoints CRM](#endpoints-crm)
   - [Autenticação](#autenticação-crm)
   - [Leads](#leads)
   - [Tags](#tags)
   - [Atividades](#atividades)
   - [Kanban](#kanban)
   - [Dashboard](#dashboard)
4. [Endpoints de Produtos](#endpoints-de-produtos)
5. [Health Check](#health-check)
6. [Códigos de Status HTTP](#códigos-de-status-http)
7. [Tratamento de Erros](#tratamento-de-erros)
8. [Rate Limiting](#rate-limiting)
9. [Exemplos de Uso](#exemplos-de-uso)
10. [Model Context Protocol (MCP)](#model-context-protocol-mcp)

---

## 🎯 Visão Geral

A API PHD Studio é uma API REST completa que fornece acesso ao sistema CRM (Customer Relationship Management) e ao catálogo de produtos/serviços. A API é dividida em dois grupos principais:

1. **CRM API** (`/api/crm/v1/*`): Sistema completo de gerenciamento de relacionamento com clientes, incluindo leads, tags, atividades, kanban e dashboard.
2. **Produtos API** (`/phd/v1/products`): Catálogo de produtos e serviços do PHD Studio.

### Características Principais

- ✅ Autenticação JWT para CRM API
- ✅ Autenticação via API Key para Produtos API
- ✅ Rate limiting para proteção contra abuso
- ✅ Validação rigorosa de dados
- ✅ Soft delete (exclusão lógica)
- ✅ Paginação em todas as listagens
- ✅ Filtros avançados
- ✅ Documentação Swagger/OpenAPI

---

## 🔐 Autenticação

### CRM API - JWT Bearer Token

A maioria dos endpoints do CRM requer autenticação via JWT (JSON Web Token).

#### Fluxo de Autenticação

1. **Login**: `POST /api/crm/v1/auth/login`
   - Forneça `email` e `password`
   - Receba `accessToken` e `refreshToken`

2. **Usar Token**: Inclua o token no header de todas as requisições:
   ```
   Authorization: Bearer <accessToken>
   ```

3. **Renovar Token**: Quando o `accessToken` expirar (1 hora), use:
   - `POST /api/crm/v1/auth/refresh` com o `refreshToken`

#### Exemplo de Login

```bash
curl -X POST https://phdstudio.com.br/api/crm/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@phdstudio.com.br",
    "password": "sua-senha"
  }'
```

**Resposta:**
```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "data": {
    "user": {
      "id": 1,
      "email": "admin@phdstudio.com.br",
      "first_name": "Admin",
      "last_name": "User",
      "role": "admin",
      "is_active": true
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresAt": "2024-12-22T02:00:00.000Z"
  }
}
```

### Produtos API - API Key

Os endpoints de produtos requerem uma API Key no header:

```
X-PHD-API-KEY: <sua-api-key>
```

A API Key deve ser configurada no arquivo `.env` do servidor como `PHD_API_KEY`.

---

## 📊 Endpoints CRM

### Autenticação CRM

#### POST /api/crm/v1/auth/login

Realiza login do usuário e retorna tokens JWT.

**Request Body:**
```json
{
  "email": "string (obrigatório, formato email)",
  "password": "string (obrigatório, mínimo 6 caracteres)"
}
```

**Respostas:**
- `200 OK`: Login bem-sucedido
- `401 Unauthorized`: Credenciais inválidas
- `403 Forbidden`: Conta desativada
- `400 Bad Request`: Dados inválidos

**Exemplo de Uso:**
```javascript
const response = await fetch('https://phdstudio.com.br/api/crm/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@phdstudio.com.br',
    password: 'senha123'
  })
});
const data = await response.json();
localStorage.setItem('accessToken', data.data.accessToken);
```

#### POST /api/crm/v1/auth/logout

Encerra a sessão do usuário, invalidando o token atual.

**Headers:**
- `Authorization: Bearer <token>` (obrigatório)

**Respostas:**
- `200 OK`: Logout bem-sucedido
- `401 Unauthorized`: Token inválido

#### POST /api/crm/v1/auth/refresh

Renova o accessToken usando o refreshToken.

**Request Body:**
```json
{
  "refreshToken": "string (obrigatório)"
}
```

**Respostas:**
- `200 OK`: Token renovado
- `401 Unauthorized`: Refresh token inválido ou expirado

**Exemplo:**
```javascript
const response = await fetch('https://phdstudio.com.br/api/crm/v1/auth/refresh', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    refreshToken: localStorage.getItem('refreshToken')
  })
});
const data = await response.json();
localStorage.setItem('accessToken', data.data.accessToken);
```

#### GET /api/crm/v1/auth/me

Retorna os dados do usuário autenticado.

**Headers:**
- `Authorization: Bearer <token>` (obrigatório)

**Respostas:**
- `200 OK`: Dados do usuário
- `401 Unauthorized`: Token inválido

---

### Leads

O sistema de Leads é o núcleo do CRM, permitindo gerenciar contatos, oportunidades e conversões.

#### GET /api/crm/v1/leads

Lista leads com filtros e paginação.

**Query Parameters:**
- `page` (integer, padrão: 1): Número da página
- `limit` (integer, padrão: 20, máximo: 100): Itens por página
- `status` (string, opcional): Filtrar por status (`new`, `contacted`, `qualified`, `converted`, `lost`)
- `stage` (string, opcional): Filtrar por estágio (`Curioso`, `Avaliando`, `Pronto para agir`)
- `search` (string, opcional): Buscar por nome ou email
- `assigned_to` (integer, opcional): Filtrar por usuário atribuído
- `tags` (array de integers, opcional): Filtrar por tags (IDs)

**Headers:**
- `Authorization: Bearer <token>` (obrigatório)

**Respostas:**
- `200 OK`: Lista de leads com paginação

**Exemplo de Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "email": "lead@example.com",
      "first_name": "João",
      "last_name": "Silva",
      "phone": "+5511999999999",
      "status": "new",
      "stage": "Curioso",
      "source": "Website",
      "pain_point": "Necessita aumentar vendas",
      "assigned_to": 1,
      "custom_fields": {
        "intencao_estagio": "Avaliando",
        "dor_necessidade": "Aumentar vendas"
      },
      "tags": [
        { "id": 1, "name": "Hot Lead", "color": "#3B82F6" }
      ],
      "created_at": "2024-12-20T10:00:00.000Z",
      "updated_at": "2024-12-20T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

**Exemplo de Uso:**
```javascript
// Buscar leads com filtros
const response = await fetch(
  'https://phdstudio.com.br/api/crm/v1/leads?page=1&limit=20&status=new&search=joão',
  {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
);
const data = await response.json();
console.log(data.data); // Array de leads
console.log(data.pagination); // Informações de paginação
```

#### GET /api/crm/v1/leads/:id

Obtém detalhes completos de um lead específico.

**Path Parameters:**
- `id` (integer, obrigatório): ID do lead

**Headers:**
- `Authorization: Bearer <token>` (obrigatório)

**Respostas:**
- `200 OK`: Dados do lead
- `404 Not Found`: Lead não encontrado

**Exemplo de Resposta:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "lead@example.com",
    "first_name": "João",
    "last_name": "Silva",
    "phone": "+5511999999999",
    "status": "new",
    "stage": "Curioso",
    "source": "Website",
    "pain_point": "Necessita aumentar vendas",
    "assigned_to": 1,
    "assigned_first_name": "Admin",
    "assigned_last_name": "User",
    "assigned_email": "admin@phdstudio.com.br",
    "tags": [
      { "id": 1, "name": "Hot Lead", "color": "#3B82F6" }
    ],
    "custom_fields": {
      "intencao_estagio": "Avaliando",
      "dor_necessidade": "Aumentar vendas"
    },
    "created_at": "2024-12-20T10:00:00.000Z",
    "updated_at": "2024-12-20T10:00:00.000Z"
  }
}
```

#### GET /api/crm/v1/leads/check/:email

Verifica se um lead existe pelo email. Este endpoint é público (não requer autenticação obrigatória, mas retorna mais dados se autenticado).

**Path Parameters:**
- `email` (string, obrigatório): Email do lead (URL encoded)

**Headers:**
- `Authorization: Bearer <token>` (opcional, mas recomendado)

**Respostas:**
- `200 OK`: Lead encontrado
- `404 Not Found`: Lead não encontrado

**Exemplo de Uso:**
```javascript
const email = encodeURIComponent('lead@example.com');
const response = await fetch(
  `https://phdstudio.com.br/api/crm/v1/leads/check/${email}`,
  {
    headers: {
      'Authorization': `Bearer ${token}` // Opcional
    }
  }
);
if (response.status === 404) {
  console.log('Lead novo, não encontrado');
} else {
  const data = await response.json();
  console.log('Lead encontrado:', data.data);
}
```

#### POST /api/crm/v1/leads

Cria um novo lead ou atualiza um existente (upsert baseado em email).

**Request Body:**
```json
{
  "email": "string (obrigatório, formato email)",
  "first_name": "string (opcional)",
  "last_name": "string (opcional)",
  "phone": "string (opcional)",
  "status": "string (opcional, padrão: 'new')",
  "stage": "string (opcional, padrão: 'Curioso')",
  "source": "string (opcional)",
  "pain_point": "string (opcional)",
  "assigned_to": "integer (opcional, ID do usuário)",
  "custom_fields": {
    "campo1": "valor1",
    "campo2": "valor2"
  },
  "tags": [1, 2, 3]
}
```

**Headers:**
- `Authorization: Bearer <token>` (obrigatório)

**Respostas:**
- `201 Created`: Lead criado
- `200 OK`: Lead atualizado (se já existia)
- `400 Bad Request`: Dados inválidos
- `409 Conflict`: Email já existe (em caso de conflito)

**Exemplo de Uso:**
```javascript
const response = await fetch('https://phdstudio.com.br/api/crm/v1/leads', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    email: 'novo@example.com',
    first_name: 'Maria',
    last_name: 'Santos',
    phone: '+5511888888888',
    status: 'new',
    stage: 'Curioso',
    source: 'Website',
    pain_point: 'Precisa de consultoria',
    custom_fields: {
      intencao_estagio: 'Avaliando',
      dor_necessidade: 'Crescimento de vendas'
    },
    tags: [1, 2]
  })
});
const data = await response.json();
console.log(data.message); // "Lead criado com sucesso" ou "Lead atualizado com sucesso"
```

#### PUT /api/crm/v1/leads/:id

Atualiza um lead existente.

**Path Parameters:**
- `id` (integer, obrigatório): ID do lead

**Request Body:** (mesmo formato do POST, todos os campos opcionais)

**Headers:**
- `Authorization: Bearer <token>` (obrigatório)

**Respostas:**
- `200 OK`: Lead atualizado
- `404 Not Found`: Lead não encontrado
- `400 Bad Request`: Dados inválidos

#### DELETE /api/crm/v1/leads/:id

Remove um lead (soft delete - marca como deletado, não remove do banco).

**Path Parameters:**
- `id` (integer, obrigatório): ID do lead

**Headers:**
- `Authorization: Bearer <token>` (obrigatório)

**Respostas:**
- `200 OK`: Lead removido
- `404 Not Found`: Lead não encontrado

---

### Tags

Tags são usadas para categorizar e organizar leads.

#### GET /api/crm/v1/tags

Lista todas as tags com busca e paginação.

**Query Parameters:**
- `page` (integer, padrão: 1)
- `limit` (integer, padrão: 100, máximo: 100)
- `search` (string, opcional): Buscar por nome

**Headers:**
- `Authorization: Bearer <token>` (obrigatório)

**Exemplo de Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Hot Lead",
      "color": "#3B82F6",
      "description": "Leads com alto potencial",
      "created_at": "2024-12-20T10:00:00.000Z",
      "updated_at": "2024-12-20T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 100,
    "total": 10,
    "totalPages": 1
  }
}
```

#### GET /api/crm/v1/tags/:id

Obtém detalhes de uma tag específica.

#### POST /api/crm/v1/tags

Cria uma nova tag.

**Request Body:**
```json
{
  "name": "string (obrigatório, único)",
  "color": "string (opcional, padrão: '#3B82F6', formato hex)",
  "description": "string (opcional)"
}
```

#### PUT /api/crm/v1/tags/:id

Atualiza uma tag existente.

#### DELETE /api/crm/v1/tags/:id

Remove uma tag (soft delete).

---

### Atividades

Atividades representam ações e tarefas relacionadas a leads.

#### GET /api/crm/v1/activities

Lista atividades com filtros.

**Query Parameters:**
- `page` (integer, padrão: 1)
- `limit` (integer, padrão: 20, máximo: 100)
- `lead_id` (integer, opcional): Filtrar por lead
- `user_id` (integer, opcional): Filtrar por usuário
- `type` (string, opcional): Filtrar por tipo (`call`, `email`, `meeting`, `note`, `task`)
- `completed` (boolean, opcional): Filtrar por status de conclusão

**Exemplo de Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "lead_id": 1,
      "user_id": 1,
      "type": "call",
      "title": "Ligar para cliente",
      "description": "Discutir proposta comercial",
      "due_date": "2024-12-25T10:00:00.000Z",
      "completed_at": null,
      "lead_email": "lead@example.com",
      "lead_first_name": "João",
      "lead_last_name": "Silva",
      "user_first_name": "Admin",
      "user_last_name": "User",
      "created_at": "2024-12-20T10:00:00.000Z",
      "updated_at": "2024-12-20T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

#### GET /api/crm/v1/activities/:id

Obtém detalhes de uma atividade específica.

#### POST /api/crm/v1/activities

Cria uma nova atividade.

**Request Body:**
```json
{
  "lead_id": "integer (obrigatório)",
  "type": "string (obrigatório: 'call', 'email', 'meeting', 'note', 'task')",
  "title": "string (obrigatório)",
  "description": "string (opcional)",
  "due_date": "string (opcional, formato ISO 8601)",
  "user_id": "integer (opcional, padrão: usuário autenticado)"
}
```

#### PUT /api/crm/v1/activities/:id

Atualiza uma atividade existente.

#### PATCH /api/crm/v1/activities/:id/complete

Marca uma atividade como concluída.

**Respostas:**
- `200 OK`: Atividade marcada como concluída
- `404 Not Found`: Atividade não encontrada

#### DELETE /api/crm/v1/activities/:id

Remove uma atividade (soft delete).

---

### Kanban

Sistema de Kanban para visualização e gestão de pipeline de vendas.

#### GET /api/crm/v1/kanban/boards

Lista todos os boards do usuário autenticado.

**Exemplo de Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Pipeline de Vendas",
      "description": "Board principal de vendas",
      "user_id": 1,
      "is_default": true,
      "columns": [
        {
          "id": 1,
          "name": "Novos Leads",
          "position": 0,
          "color": "#3B82F6",
          "cards": [
            {
              "id": 1,
              "lead_id": 1,
              "position": 0,
              "lead": {
                "id": 1,
                "email": "lead@example.com",
                "first_name": "João",
                "last_name": "Silva"
              }
            }
          ]
        }
      ],
      "created_at": "2024-12-20T10:00:00.000Z",
      "updated_at": "2024-12-20T10:00:00.000Z"
    }
  ]
}
```

#### GET /api/crm/v1/kanban/boards/:id

Obtém um board específico com todas as colunas e cards.

#### POST /api/crm/v1/kanban/boards

Cria um novo board. Automaticamente cria colunas padrão.

**Request Body:**
```json
{
  "name": "string (obrigatório)",
  "description": "string (opcional)",
  "is_default": "boolean (opcional, padrão: false)"
}
```

#### PUT /api/crm/v1/kanban/boards/:id

Atualiza um board existente.

#### DELETE /api/crm/v1/kanban/boards/:id

Remove um board e todas suas colunas e cards.

#### POST /api/crm/v1/kanban/columns

Cria uma nova coluna em um board.

**Request Body:**
```json
{
  "board_id": "integer (obrigatório)",
  "name": "string (obrigatório)",
  "position": "integer (obrigatório)",
  "color": "string (opcional, formato hex)"
}
```

#### PUT /api/crm/v1/kanban/columns/:id

Atualiza uma coluna existente.

#### DELETE /api/crm/v1/kanban/columns/:id

Remove uma coluna e todos seus cards.

#### POST /api/crm/v1/kanban/cards

Cria um novo card (associa um lead a uma coluna).

**Request Body:**
```json
{
  "column_id": "integer (obrigatório)",
  "lead_id": "integer (obrigatório)",
  "position": "integer (obrigatório)"
}
```

#### PATCH /api/crm/v1/kanban/cards/:id/move

Move um card entre colunas (drag & drop).

**Request Body:**
```json
{
  "column_id": "integer (obrigatório, nova coluna)",
  "position": "integer (obrigatório, nova posição)"
}
```

#### PUT /api/crm/v1/kanban/cards/:id

Atualiza um card existente.

#### DELETE /api/crm/v1/kanban/cards/:id

Remove um card (não remove o lead, apenas a associação com a coluna).

---

### Dashboard

Estatísticas e métricas do CRM.

#### GET /api/crm/v1/dashboard/stats

Obtém estatísticas gerais do CRM.

**Headers:**
- `Authorization: Bearer <token>` (obrigatório)

**Respostas:**
- `200 OK`: Estatísticas gerais

**Exemplo de Resposta:**
```json
{
  "success": true,
  "data": {
    "leads": {
      "total": 150,
      "by_status": {
        "new": 50,
        "contacted": 40,
        "qualified": 30,
        "converted": 20,
        "lost": 10
      },
      "by_stage": {
        "Curioso": 60,
        "Avaliando": 50,
        "Pronto para agir": 40
      }
    },
    "activities": {
      "total": 200,
      "pending": 45,
      "completed": 155
    },
    "top_tags": [
      {
        "id": 1,
        "name": "Hot Lead",
        "color": "#3B82F6",
        "count": 25
      }
    ]
  }
}
```

**Nota:** Usuários não-admin veem apenas estatísticas de leads atribuídos a eles ou não atribuídos.

#### GET /api/crm/v1/dashboard/my-stats

Obtém estatísticas do usuário autenticado.

**Exemplo de Resposta:**
```json
{
  "success": true,
  "data": {
    "leads": {
      "total": 30,
      "converted_this_month": 5
    },
    "activities": {
      "pending": 12,
      "upcoming": 3,
      "overdue": 2
    }
  }
}
```

---

## 🛍️ Endpoints de Produtos

### GET /phd/v1/products

Lista todos os produtos cadastrados.

**Headers:**
- `X-PHD-API-KEY: <sua-api-key>` (obrigatório)

**Respostas:**
- `200 OK`: Lista de produtos
- `401 Unauthorized`: API Key inválida ou ausente

**Exemplo de Resposta:**
```json
{
  "success": true,
  "count": 9,
  "data": [
    {
      "id": 1,
      "nome": "Consultoria em Marketing Digital",
      "categoria": "Consultoria",
      "atributos": {
        "duracao": "3 meses",
        "investimento": "R$ 15.000",
        "metodologia": "Data-driven"
      },
      "preco_estimado": "R$ 15.000 - R$ 30.000",
      "foto_url": "https://phdstudio.com.br/wp-content/uploads/produto1.jpg",
      "updated_at": "2024-12-20T10:00:00.000Z"
    }
  ],
  "timestamp": "2024-12-22T01:00:00.000Z"
}
```

**Exemplo de Uso:**
```bash
curl -X GET https://phdstudio.com.br/api/phd/v1/products \
  -H "X-PHD-API-KEY: sua-api-key"
```

### GET /phd/v1/products/:id

Obtém um produto específico por ID.

**Path Parameters:**
- `id` (integer, obrigatório): ID do produto

**Headers:**
- `X-PHD-API-KEY: <sua-api-key>` (obrigatório)

**Respostas:**
- `200 OK`: Dados do produto
- `404 Not Found`: Produto não encontrado
- `401 Unauthorized`: API Key inválida

**Exemplo de Uso:**
```bash
curl -X GET https://phdstudio.com.br/api/phd/v1/products/1 \
  -H "X-PHD-API-KEY: sua-api-key"
```

---

## 🏥 Health Check

### GET /api/crm/v1/health

Verifica o status da API CRM.

**Respostas:**
- `200 OK`: API funcionando

**Exemplo de Resposta:**
```json
{
  "status": "ok",
  "service": "CRM API",
  "timestamp": "2024-12-22T01:00:00.000Z"
}
```

### GET /health

Health check geral da API (legado).

---

## 📊 Códigos de Status HTTP

| Código | Significado | Descrição |
|--------|-------------|-----------|
| 200 | OK | Requisição bem-sucedida |
| 201 | Created | Recurso criado com sucesso |
| 400 | Bad Request | Dados inválidos na requisição |
| 401 | Unauthorized | Não autenticado ou token inválido |
| 403 | Forbidden | Acesso negado (conta desativada, sem permissão) |
| 404 | Not Found | Recurso não encontrado |
| 409 | Conflict | Conflito (ex: email já existe) |
| 429 | Too Many Requests | Rate limit excedido |
| 500 | Internal Server Error | Erro interno do servidor |

---

## ⚠️ Tratamento de Erros

Todas as respostas de erro seguem o formato padrão:

```json
{
  "success": false,
  "error": "Tipo do erro",
  "message": "Descrição detalhada do erro"
}
```

**Exemplos:**

**400 Bad Request:**
```json
{
  "success": false,
  "error": "Dados inválidos",
  "errors": [
    {
      "field": "email",
      "message": "Email é obrigatório"
    }
  ]
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "error": "Token não fornecido",
  "message": "Envie o token no header Authorization: Bearer <token>"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "error": "Lead não encontrado"
}
```

---

## 🚦 Rate Limiting

A API implementa rate limiting para proteção contra abuso:

- **CRM API**: 100 requisições por IP a cada 15 minutos
- **Autenticação**: 5 tentativas de login por IP a cada 15 minutos
- **Produtos API**: 100 requisições por IP a cada 15 minutos

Quando o limite é excedido, a API retorna:

```json
{
  "error": "Muitas requisições deste IP",
  "message": "Por favor, tente novamente em alguns minutos."
}
```

Status HTTP: `429 Too Many Requests`

---

## 💡 Exemplos de Uso

### Exemplo Completo: Criar Lead e Adicionar Atividade

```javascript
// 1. Login
const loginResponse = await fetch('https://phdstudio.com.br/api/crm/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@phdstudio.com.br',
    password: 'senha123'
  })
});
const loginData = await loginResponse.json();
const token = loginData.data.accessToken;

// 2. Criar Lead
const leadResponse = await fetch('https://phdstudio.com.br/api/crm/v1/leads', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    email: 'novo@example.com',
    first_name: 'João',
    last_name: 'Silva',
    phone: '+5511999999999',
    status: 'new',
    stage: 'Curioso',
    source: 'Website',
    pain_point: 'Necessita aumentar vendas'
  })
});
const leadData = await leadResponse.json();
const leadId = leadData.data.id;

// 3. Criar Atividade
const activityResponse = await fetch('https://phdstudio.com.br/api/crm/v1/activities', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    lead_id: leadId,
    type: 'call',
    title: 'Ligar para cliente',
    description: 'Discutir proposta comercial',
    due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Amanhã
  })
});
const activityData = await activityResponse.json();
console.log('Atividade criada:', activityData.data);
```

### Exemplo: Buscar Leads com Filtros

```javascript
// Buscar leads novos do estágio "Avaliando" atribuídos ao usuário
const response = await fetch(
  'https://phdstudio.com.br/api/crm/v1/leads?status=new&stage=Avaliando&assigned_to=1&page=1&limit=20',
  {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
);
const data = await response.json();
console.log('Leads encontrados:', data.data);
console.log('Total:', data.pagination.total);
```

### Exemplo: Mover Card no Kanban

```javascript
// Mover card da coluna 1 para coluna 2, posição 0
const response = await fetch('https://phdstudio.com.br/api/crm/v1/kanban/cards/1/move', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    column_id: 2,
    position: 0
  })
});
const data = await response.json();
console.log('Card movido:', data.data);
```

---

## 🤖 Model Context Protocol (MCP)

O MCP (Model Context Protocol) é um servidor que permite integração com sistemas de IA (como Claude, GPT, etc.) para gerenciar leads automaticamente.

### Configuração

O servidor MCP está localizado em `/root/mcp-crm-server/` e usa a API REST do CRM.

**Variáveis de Ambiente:**
- `CRM_API_URL`: URL base da API (padrão: `https://phdstudio.com.br/api/crm/v1`)
- `CRM_AUTH_TOKEN`: Token JWT para autenticação (opcional, mas recomendado)

### Ferramentas Disponíveis

#### check_lead

Verifica se um lead já existe no CRM pelo email.

**Parâmetros:**
- `email` (string, obrigatório): Email do lead

**Retorno:**
- Se encontrado: Dados completos do lead
- Se não encontrado: Status "new_lead"

**Exemplo de Uso (via MCP):**
```json
{
  "name": "check_lead",
  "arguments": {
    "email": "lead@example.com"
  }
}
```

#### update_lead

Registra ou atualiza um lead no CRM.

**Parâmetros:**
- `email` (string, obrigatório): Email do lead
- `first_name` (string, opcional): Nome
- `phone` (string, opcional): Telefone/WhatsApp
- `origem_canal` (string, opcional): Canal de origem
- `intencao_estagio` (string, opcional): Estágio de intenção (`Curioso`, `Avaliando`, `Pronto para agir`)
- `dor_necessidade` (string, opcional): Resumo da dor ou necessidade

**Retorno:**
- Dados do lead criado/atualizado

**Exemplo de Uso (via MCP):**
```json
{
  "name": "update_lead",
  "arguments": {
    "email": "lead@example.com",
    "first_name": "João Silva",
    "phone": "+5511999999999",
    "origem_canal": "Website",
    "intencao_estagio": "Avaliando",
    "dor_necessidade": "Necessita aumentar vendas"
  }
}
```

### Fluxo de Integração

1. **Sistema de IA recebe interação do usuário**
2. **Chama `check_lead` para verificar se o lead existe**
3. **Se não existir, chama `update_lead` para criar**
4. **Se existir, pode atualizar com novas informações**

---

## 📝 Notas Importantes

### Soft Delete

Todos os recursos (leads, tags, atividades) usam **soft delete**, ou seja, não são removidos fisicamente do banco de dados, apenas marcados como deletados com `deleted_at`. Isso permite:
- Auditoria completa
- Recuperação de dados
- Histórico preservado

### Paginação

Todas as listagens suportam paginação:
- `page`: Número da página (começa em 1)
- `limit`: Itens por página (máximo varia por endpoint)
- Resposta inclui objeto `pagination` com `total` e `totalPages`

### Filtros

A maioria dos endpoints de listagem suporta múltiplos filtros que podem ser combinados:
- Busca por texto (nome, email)
- Filtros por status, estágio, tipo
- Filtros por relacionamentos (assigned_to, lead_id, etc.)

### Campos Customizados

Leads suportam campos customizados via `custom_fields`, um objeto JSON que permite armazenar dados adicionais específicos do negócio.

### Timezone

Todas as datas são retornadas em formato ISO 8601 (UTC). O cliente deve converter para o timezone local se necessário.

---

## 🔗 Links Úteis

- **Swagger UI**: `https://phdstudio.com.br/api/docs`
- **Health Check**: `https://phdstudio.com.br/api/crm/v1/health`
- **Repositório**: (se aplicável)

---

## 📞 Suporte

Para dúvidas ou problemas:
- Email: contato@phdstudio.com.br
- Documentação Swagger: Acesse `/api/docs` quando logado como admin

---

**Última atualização:** Dezembro 2024  
**Versão da API:** 1.0.0

