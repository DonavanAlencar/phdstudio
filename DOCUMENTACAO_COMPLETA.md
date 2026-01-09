# 📚 Documentação Completa - PHD Studio CRM

**Versão:** 1.0.0  
**Última Atualização:** Dezembro 2024  
**Base URL Produção:** `https://phdstudio.com.br`

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Instalação e Configuração](#instalação-e-configuração)
4. [API REST - CRM](#api-rest---crm)
   - [Autenticação](#autenticação)
   - [Leads](#leads)
   - [Tags](#tags)
   - [Atividades](#atividades)
   - [Kanban](#kanban)
   - [Dashboard](#dashboard)
5. [API REST - Produtos](#api-rest---produtos)
6. [Model Context Protocol (MCP)](#model-context-protocol-mcp)
7. [Correções e Melhorias](#correções-e-melhorias)
8. [Troubleshooting](#troubleshooting)
9. [Comandos Úteis](#comandos-úteis)

---

## 🎯 Visão Geral

O PHD Studio CRM é um sistema completo de gerenciamento de relacionamento com clientes (CRM) desenvolvido com:

- **Frontend:** React + Vite + TypeScript
- **Backend:** Node.js + Express
- **Banco de Dados:** PostgreSQL (CRM) + MySQL (Produtos)
- **Proxy Reverso:** Traefik
- **Containerização:** Docker + Docker Compose
- **Autenticação:** JWT (JSON Web Tokens)

### Características Principais

- ✅ Sistema completo de gerenciamento de leads
- ✅ Autenticação JWT com refresh tokens
- ✅ Sistema de tags e categorização
- ✅ Atividades e tarefas
- ✅ Kanban para visualização de pipeline
- ✅ Dashboard com estatísticas
- ✅ Integração via MCP para sistemas de IA
- ✅ API REST completa e documentada
- ✅ Soft delete (exclusão lógica)
- ✅ Paginação e filtros avançados
- ✅ Rate limiting
- ✅ Validação rigorosa de dados

---

## 🏗️ Arquitetura

### Diagrama de Arquitetura

```
┌─────────────────┐
│   Frontend      │
│  (React/Vite)   │
│  phdstudio-app  │
└────────┬────────┘
         │
         │ HTTPS
         ▼
┌─────────────────┐
│    Traefik      │
│  (Proxy Reverso)│
└────────┬────────┘
         │
    ┌────┴────┐
    │        │
    ▼        ▼
┌────────┐ ┌──────────┐
│  API   │ │ Frontend │
│ Node.js│ │  Nginx   │
│ :3001  │ │   :80    │
└───┬────┘ └──────────┘
    │
    ▼
┌─────────────┐
│ PostgreSQL  │
│  phd-crm-db │
└─────────────┘
```

### Serviços Docker

- **phdstudio-app:** Frontend React servido via Nginx
- **phd-api:** API Node.js/Express na porta 3001
- **phd-crm-db:** Banco PostgreSQL para CRM
- **Traefik:** Proxy reverso gerenciando roteamento e SSL

### Rotas Traefik

- `phdstudio.com.br` → Frontend (phdstudio-app:80)
- `phdstudio.com.br/api/*` → API (phd-api:3001)

---

## 🚀 Instalação e Configuração

### Pré-requisitos

- Docker e Docker Compose instalados
- Acesso ao servidor
- Domínio configurado (opcional, para produção)

### Instalação

1. **Clone o repositório ou acesse o diretório:**
```bash
cd /root/phdstudio
```

2. **Configure variáveis de ambiente:**
```bash
cp api/.env.example api/.env
# Edite api/.env com suas configurações
```

3. **Inicie os serviços:**
```bash
docker compose up -d
```

4. **Verifique o status:**
```bash
docker ps --filter "name=phd"
```

### Configuração Inicial

#### 1. Criar usuário admin

O usuário admin padrão é criado automaticamente. Para resetar a senha:

```bash
cd /root/phdstudio
./reset-admin-password.sh admin123
```

**Credenciais padrão:**
- Email: `admin@phdstudio.com.br`
- Senha: `admin123`

#### 2. Verificar Health Check

```bash
curl https://phdstudio.com.br/api/crm/v1/health
```

Resposta esperada:
```json
{
  "status": "ok",
  "service": "CRM API",
  "timestamp": "2024-12-23T20:00:00.000Z"
}
```

### Variáveis de Ambiente

#### API (api/.env)

```env
# Banco de Dados
DB_HOST=phd-crm-db
DB_PORT=5432
DB_NAME=phd_crm
DB_USER=phd_crm_user
DB_PASSWORD=sua_senha_segura

# JWT
JWT_SECRET=sua_chave_secreta_jwt
JWT_REFRESH_SECRET=sua_chave_secreta_refresh
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Node
NODE_ENV=production
PORT=3001
```

---

## 📡 API REST - CRM

### Base URL

```
https://phdstudio.com.br/api/crm/v1
```

### Autenticação

A API CRM usa autenticação JWT (JSON Web Token). A maioria dos endpoints requer o header:

```
Authorization: Bearer <accessToken>
```

#### POST /auth/login

Realiza login e retorna tokens JWT.

**Request:**
```json
{
  "email": "admin@phdstudio.com.br",
  "password": "admin123"
}
```

**Response (200 OK):**
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
    "expiresAt": "2024-12-23T21:00:00.000Z"
  }
}
```

**Erros:**
- `401 Unauthorized`: Credenciais inválidas
- `403 Forbidden`: Conta desativada
- `400 Bad Request`: Dados inválidos

#### POST /auth/refresh

Renova o accessToken usando o refreshToken.

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "accessToken": "novo_token...",
    "expiresAt": "2024-12-23T22:00:00.000Z"
  }
}
```

#### POST /auth/logout

Encerra a sessão do usuário.

**Headers:**
```
Authorization: Bearer <token>
```

#### GET /auth/me

Retorna dados do usuário autenticado.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "admin@phdstudio.com.br",
    "first_name": "Admin",
    "last_name": "User",
    "role": "admin",
    "is_active": true
  }
}
```

---

### Leads

O sistema de Leads é o núcleo do CRM, permitindo gerenciar contatos, oportunidades e conversões.

#### GET /leads

Lista leads com filtros e paginação.

**Query Parameters:**
- `page` (integer, padrão: 1): Número da página
- `limit` (integer, padrão: 20, máximo: 100): Itens por página
- `status` (string, opcional): `new`, `contacted`, `qualified`, `converted`, `lost`
- `stage` (string, opcional): `Curioso`, `Avaliando`, `Pronto para agir`
- `search` (string, opcional): Buscar por nome ou email
- `assigned_to` (integer, opcional): ID do usuário atribuído
- `tags` (array de integers, opcional): IDs das tags

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
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

#### GET /leads/:id

Obtém detalhes completos de um lead específico.

**Path Parameters:**
- `id` (integer, obrigatório): ID do lead

**Response (200 OK):**
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

#### GET /leads/check/:email

Verifica se um lead existe pelo email. Endpoint público (autenticação opcional).

**Path Parameters:**
- `email` (string, obrigatório, URL encoded): Email do lead

**Response (200 OK):** Lead encontrado  
**Response (404 Not Found):** Lead não encontrado

#### POST /leads

Cria um novo lead ou atualiza um existente (upsert baseado em email).

**Request Body:**
```json
{
  "email": "novo@example.com",
  "first_name": "Maria",
  "last_name": "Santos",
  "phone": "+5511888888888",
  "status": "new",
  "stage": "Curioso",
  "source": "Website",
  "pain_point": "Precisa de consultoria",
  "assigned_to": 1,
  "custom_fields": {
    "intencao_estagio": "Avaliando",
    "dor_necessidade": "Crescimento de vendas"
  },
  "tags": [1, 2]
}
```

**Response (201 Created):** Lead criado  
**Response (200 OK):** Lead atualizado (se já existia)

#### PUT /leads/:id

Atualiza um lead existente.

**Path Parameters:**
- `id` (integer, obrigatório): ID do lead

**Request Body:** (mesmo formato do POST, todos os campos opcionais)

**Response (200 OK):** Lead atualizado

#### DELETE /leads/:id

Remove um lead (soft delete).

**Path Parameters:**
- `id` (integer, obrigatório): ID do lead

**Response (200 OK):** Lead removido

---

### Tags

Tags são usadas para categorizar e organizar leads.

#### GET /tags

Lista todas as tags com busca e paginação.

**Query Parameters:**
- `page` (integer, padrão: 1)
- `limit` (integer, padrão: 100, máximo: 100)
- `search` (string, opcional): Buscar por nome

**Response (200 OK):**
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

#### GET /tags/:id

Obtém detalhes de uma tag específica.

#### POST /tags

Cria uma nova tag.

**Request Body:**
```json
{
  "name": "Hot Lead",
  "color": "#3B82F6",
  "description": "Leads com alto potencial"
}
```

#### PUT /tags/:id

Atualiza uma tag existente.

#### DELETE /tags/:id

Remove uma tag (soft delete).

---

### Atividades

Atividades representam ações e tarefas relacionadas a leads.

#### GET /activities

Lista atividades com filtros.

**Query Parameters:**
- `page` (integer, padrão: 1)
- `limit` (integer, padrão: 20, máximo: 100)
- `lead_id` (integer, opcional): Filtrar por lead
- `user_id` (integer, opcional): Filtrar por usuário
- `type` (string, opcional): `call`, `email`, `meeting`, `note`, `task`
- `completed` (boolean, opcional): Filtrar por status de conclusão

**Response (200 OK):**
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

#### GET /activities/:id

Obtém detalhes de uma atividade específica.

#### POST /activities

Cria uma nova atividade.

**Request Body:**
```json
{
  "lead_id": 1,
  "type": "call",
  "title": "Ligar para cliente",
  "description": "Discutir proposta comercial",
  "due_date": "2024-12-25T10:00:00.000Z",
  "user_id": 1
}
```

#### PUT /activities/:id

Atualiza uma atividade existente.

#### PATCH /activities/:id/complete

Marca uma atividade como concluída.

**Response (200 OK):** Atividade marcada como concluída

#### DELETE /activities/:id

Remove uma atividade (soft delete).

---

### Kanban

Sistema de Kanban para visualização e gestão de pipeline de vendas.

#### GET /kanban/boards

Lista todos os boards do usuário autenticado.

**Response (200 OK):**
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

#### GET /kanban/boards/:id

Obtém um board específico com todas as colunas e cards.

#### POST /kanban/boards

Cria um novo board. Automaticamente cria colunas padrão.

**Request Body:**
```json
{
  "name": "Pipeline de Vendas",
  "description": "Board principal de vendas",
  "is_default": false
}
```

#### PUT /kanban/boards/:id

Atualiza um board existente.

#### DELETE /kanban/boards/:id

Remove um board e todas suas colunas e cards.

#### POST /kanban/columns

Cria uma nova coluna em um board.

**Request Body:**
```json
{
  "board_id": 1,
  "name": "Novos Leads",
  "position": 0,
  "color": "#3B82F6"
}
```

#### PUT /kanban/columns/:id

Atualiza uma coluna existente.

#### DELETE /kanban/columns/:id

Remove uma coluna e todos seus cards.

#### POST /kanban/cards

Cria um novo card (associa um lead a uma coluna).

**Request Body:**
```json
{
  "column_id": 1,
  "lead_id": 1,
  "position": 0
}
```

#### PATCH /kanban/cards/:id/move

Move um card entre colunas (drag & drop).

**Request Body:**
```json
{
  "column_id": 2,
  "position": 0
}
```

#### PUT /kanban/cards/:id

Atualiza um card existente.

#### DELETE /kanban/cards/:id

Remove um card (não remove o lead, apenas a associação com a coluna).

---

### Dashboard

Estatísticas e métricas do CRM.

#### GET /dashboard/stats

Obtém estatísticas gerais do CRM.

**Response (200 OK):**
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

#### GET /dashboard/my-stats

Obtém estatísticas do usuário autenticado.

**Response (200 OK):**
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

## 🛍️ API REST - Produtos

### Base URL

```
https://phdstudio.com.br/api/phd/v1
```

### Autenticação

Os endpoints de produtos requerem uma API Key no header:

```
X-PHD-API-KEY: <sua-api-key>
```

### GET /products

Lista todos os produtos cadastrados.

**Response (200 OK):**
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

### GET /products/:id

Obtém um produto específico por ID.

**Path Parameters:**
- `id` (integer, obrigatório): ID do produto

**Response (200 OK):** Dados do produto  
**Response (404 Not Found):** Produto não encontrado

---

## 🤖 Model Context Protocol (MCP)

O MCP (Model Context Protocol) é um servidor que permite integração com sistemas de IA (como Claude, GPT, etc.) para gerenciar leads automaticamente.

### Configuração

O servidor MCP está localizado em `/root/mcp-crm-server/` e usa a API REST do CRM.

**Variáveis de Ambiente:**
- `CRM_API_URL`: URL base da API (padrão: `https://phdstudio.com.br/api/crm/v1`)
- `CRM_LOGIN_EMAIL`: Email para autenticação (padrão: `admin@phdstudio.com.br`)
- `CRM_LOGIN_PASSWORD`: Senha para autenticação (padrão: `admin123`)

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
- `intencao_estagio` (string, opcional): `Curioso`, `Avaliando`, `Pronto para agir`
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

### Persistência de Token

O MCP implementa persistência de token em `/tmp/mcp-crm-token-cache.json` para evitar múltiplos logins. O token é automaticamente renovado quando expira.

---

## 🔧 Correções e Melhorias

### Correções Aplicadas

#### 1. Traefik Labels Inválidas (2024-12-22)

**Problema:** Labels de timeout inválidas causando erro "field not found, node: timeout"

**Solução:** Removidas labels inválidas do Traefik v3, health check corrigido para usar IPv4 (127.0.0.1)

#### 2. Otimização N+1 Queries em Leads (2024-12-22)

**Problema:** Uma query separada para cada lead buscar campos customizados (20 leads = 21 queries)

**Solução:** Implementada query única para buscar todos os campos customizados e agrupamento por lead_id

#### 3. Timeout do Frontend (2024-12-22)

**Problema:** Timeout de 10s muito curto, deslogando usuário em problemas de rede temporários

**Solução:** 
- Timeout aumentado para 30s no Axios
- Tratamento diferenciado de erros (timeout de rede vs token inválido)
- Mantém sessão local em caso de timeout de rede

#### 4. Persistência de Token no MCP (2024-12-23)

**Problema:** MCP perdia token em cada reinício, causando múltiplos logins

**Solução:** Implementada persistência de token em arquivo (`/tmp/mcp-crm-token-cache.json`)

#### 5. Debounce e AbortController no Frontend (2024-12-23)

**Problema:** Múltiplas requisições simultâneas na tela de leads causando race conditions

**Solução:**
- Implementado debounce de 500ms no campo de busca
- AbortController para cancelar requisições anteriores
- Melhor tratamento de erros com botão "Tentar novamente"

### Melhorias Futuras Sugeridas

1. **Índices no Banco de Dados:**
```sql
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_leads_deleted_at ON leads(deleted_at);
CREATE INDEX IF NOT EXISTS idx_lead_tags_lead_id ON lead_tags(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_custom_fields_lead_id ON lead_custom_fields(lead_id);
```

2. **Cache de Sessões:**
- Implementar Redis para cache de sessões válidas
- Reduzir carga no banco de dados

3. **Retry Logic:**
- Adicionar retry automático em caso de timeout
- Exponential backoff

4. **Monitoramento:**
- Adicionar métricas de performance
- Alertas para queries lentas
- Monitoramento de pool de conexões

---

## 🐛 Troubleshooting

### Problema: 404 Not Found

**Causa:** Traefik não está roteando corretamente

**Solução:**
```bash
# Verificar labels do container
docker inspect phd-api | grep -A 20 Labels

# Verificar logs do Traefik
docker logs n8n-traefik-1 --tail 50 | grep phd-api

# Reiniciar container para aplicar labels
docker compose restart phd-api
```

### Problema: Timeout na API

**Causa:** Queries lentas ou pool de conexões esgotado

**Solução:**
```bash
# Verificar conexões ativas
docker exec phd-crm-db psql -U phd_crm_user -d phd_crm -c \
  "SELECT COUNT(*) FROM pg_stat_activity WHERE datname = 'phd_crm';"

# Verificar queries lentas
docker logs phd-api --tail 100 | grep -E "(slow|timeout|ERROR)"
```

### Problema: Usuário não consegue fazer login

**Causa:** Senha incorreta ou usuário inativo

**Solução:**
```bash
# Redefinir senha
cd /root/phdstudio
./reset-admin-password.sh nova_senha

# Verificar usuário
docker exec phd-crm-db psql -U phd_crm_user -d phd_crm -c \
  "SELECT id, email, is_active FROM users WHERE email = 'admin@phdstudio.com.br';"
```

### Problema: MCP não consegue fazer login

**Causa:** Credenciais incorretas ou token expirado

**Solução:**
```bash
# Verificar variáveis de ambiente do MCP
systemctl show mcp-crm-server --property=Environment

# Limpar cache de token do MCP
rm /tmp/mcp-crm-token-cache.json

# Reiniciar serviço MCP
systemctl restart mcp-crm-server
```

---

## 🛠️ Comandos Úteis

### Verificar Status

```bash
# Containers
docker ps --filter "name=phd"

# Logs da API
docker logs phd-api --tail 50

# Logs do Traefik
docker logs n8n-traefik-1 --tail 50 | grep phd-api

# Health check direto
docker exec phd-api wget -O- http://127.0.0.1:3001/api/crm/v1/health
```

### Reiniciar Serviços

```bash
# Reiniciar apenas API
docker compose restart phd-api

# Rebuild e reiniciar frontend
docker compose up -d --build phdstudio-app

# Reiniciar tudo
docker compose restart
```

### Testar Endpoints

```bash
# Login
curl -X POST https://phdstudio.com.br/api/crm/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@phdstudio.com.br","password":"admin123"}'

# Health check
curl https://phdstudio.com.br/api/crm/v1/health

# Testar com token
TOKEN="seu_token_aqui"
curl -X GET https://phdstudio.com.br/api/crm/v1/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

### Banco de Dados

```bash
# Conectar ao banco
docker exec -it phd-crm-db psql -U phd_crm_user -d phd_crm

# Verificar usuários
docker exec phd-crm-db psql -U phd_crm_user -d phd_crm -c \
  "SELECT id, email, role, is_active FROM users;"

# Verificar sessões
docker exec phd-crm-db psql -U phd_crm_user -d phd_crm -c \
  "SELECT COUNT(*) FROM sessions WHERE expires_at > NOW();"
```

### MCP

```bash
# Ver logs do MCP
journalctl -u mcp-crm-server --no-pager --tail 50

# Reiniciar MCP
systemctl restart mcp-crm-server

# Verificar status do MCP
systemctl status mcp-crm-server
```

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
| 504 | Gateway Timeout | Timeout no proxy/gateway |

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

- **CRM API:** 100 requisições por IP a cada 15 minutos
- **Autenticação:** 5 tentativas de login por IP a cada 15 minutos
- **Produtos API:** 100 requisições por IP a cada 15 minutos

Quando o limite é excedido, a API retorna:

```json
{
  "error": "Muitas requisições deste IP",
  "message": "Por favor, tente novamente em alguns minutos."
}
```

Status HTTP: `429 Too Many Requests`

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

- **Swagger UI:** `https://phdstudio.com.br/api/docs` (quando logado como admin)
- **Health Check:** `https://phdstudio.com.br/api/crm/v1/health`
- **Frontend:** `https://phdstudio.com.br`

---

## 📞 Suporte

Para dúvidas ou problemas:
- Email: contato@phdstudio.com.br
- Documentação Swagger: Acesse `/api/docs` quando logado como admin

---

**Última atualização:** Dezembro 2024  
**Versão da API:** 1.0.0  
**Versão do Documento:** 1.0.0


