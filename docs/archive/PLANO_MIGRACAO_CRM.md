# Plano de Migração CRM - PHD Studio

## 📋 Visão Geral

Migração completa do CRM do WordPress/FluentCRM para uma solução integrada na aplicação React do PHD Studio, com banco de dados dedicado, APIs REST completas e interface administrativa moderna.

---

## 🎯 Objetivos

1. **CRM Integrado**: Sistema completo de CRM dentro da aplicação React
2. **Banco de Dados Dedicado**: PostgreSQL para o CRM (separado do WordPress)
3. **APIs REST Completas**: Todas as operações do CRM via API
4. **Interface Admin**: Telas administrativas modernas em React
5. **Segurança**: Camada de segurança robusta (autenticação, autorização, validação)
6. **Funcionalidades Essenciais**: Leads, Tags, Campos Customizados, Kanban, Atividades
7. **Limpeza**: Remover arquivos e documentação desnecessários
8. **HTTPS Interno**: Solução HTTPS sem dependência de serviços externos (exceto n8n que mantém ngrok)

---

## 📊 Estrutura do Banco de Dados

### Banco: PostgreSQL (Container Docker)

#### Tabela: `users`
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) DEFAULT 'user', -- 'admin', 'manager', 'user'
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Tabela: `leads`
```sql
CREATE TABLE leads (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    status VARCHAR(50) DEFAULT 'new', -- 'new', 'contacted', 'qualified', 'converted', 'lost'
    source VARCHAR(100), -- origem_canal
    stage VARCHAR(50) DEFAULT 'Curioso', -- 'Curioso', 'Avaliando', 'Pronto para agir'
    pain_point TEXT, -- dor_necessidade
    assigned_to INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX idx_leads_created_at ON leads(created_at);
```

#### Tabela: `lead_custom_fields`
```sql
CREATE TABLE lead_custom_fields (
    id SERIAL PRIMARY KEY,
    lead_id INTEGER NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    field_key VARCHAR(100) NOT NULL,
    field_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(lead_id, field_key)
);

CREATE INDEX idx_lead_custom_fields_lead_id ON lead_custom_fields(lead_id);
CREATE INDEX idx_lead_custom_fields_key ON lead_custom_fields(field_key);
```

#### Tabela: `tags`
```sql
CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    color VARCHAR(7) DEFAULT '#3B82F6', -- cor em hex
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Tabela: `lead_tags`
```sql
CREATE TABLE lead_tags (
    id SERIAL PRIMARY KEY,
    lead_id INTEGER NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(lead_id, tag_id)
);

CREATE INDEX idx_lead_tags_lead_id ON lead_tags(lead_id);
CREATE INDEX idx_lead_tags_tag_id ON lead_tags(tag_id);
```

#### Tabela: `activities`
```sql
CREATE TABLE activities (
    id SERIAL PRIMARY KEY,
    lead_id INTEGER NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id),
    type VARCHAR(50) NOT NULL, -- 'call', 'email', 'meeting', 'note', 'task'
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_activities_lead_id ON activities(lead_id);
CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_type ON activities(type);
CREATE INDEX idx_activities_due_date ON activities(due_date);
```

#### Tabela: `kanban_boards`
```sql
CREATE TABLE kanban_boards (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    user_id INTEGER REFERENCES users(id),
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Tabela: `kanban_columns`
```sql
CREATE TABLE kanban_columns (
    id SERIAL PRIMARY KEY,
    board_id INTEGER NOT NULL REFERENCES kanban_boards(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    position INTEGER NOT NULL,
    color VARCHAR(7) DEFAULT '#3B82F6',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_kanban_columns_board_id ON kanban_columns(board_id);
```

#### Tabela: `kanban_cards`
```sql
CREATE TABLE kanban_cards (
    id SERIAL PRIMARY KEY,
    column_id INTEGER NOT NULL REFERENCES kanban_columns(id) ON DELETE CASCADE,
    lead_id INTEGER REFERENCES leads(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    position INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_kanban_cards_column_id ON kanban_cards(column_id);
CREATE INDEX idx_kanban_cards_lead_id ON kanban_cards(lead_id);
```

#### Tabela: `sessions` (Autenticação)
```sql
CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
```

---

## 🔌 APIs REST

### Base URL: `/api/crm/v1`

### Autenticação
- **Método**: JWT Token via header `Authorization: Bearer <token>`
- **Login**: `POST /api/crm/v1/auth/login`
- **Logout**: `POST /api/crm/v1/auth/logout`
- **Refresh Token**: `POST /api/crm/v1/auth/refresh`

### Endpoints de Leads

#### Listar Leads
```
GET /api/crm/v1/leads
Query Params:
  - page (default: 1)
  - limit (default: 20, max: 100)
  - status (filter)
  - stage (filter)
  - search (busca em nome/email)
  - assigned_to (filter)
  - tags (array de tag IDs)
```

#### Obter Lead
```
GET /api/crm/v1/leads/:id
```

#### Criar Lead
```
POST /api/crm/v1/leads
Body: {
  email: string (required),
  first_name?: string,
  last_name?: string,
  phone?: string,
  source?: string,
  stage?: string,
  pain_point?: string,
  custom_fields?: { [key: string]: any },
  tags?: number[]
}
```

#### Atualizar Lead
```
PUT /api/crm/v1/leads/:id
Body: (mesmos campos do POST)
```

#### Deletar Lead (soft delete)
```
DELETE /api/crm/v1/leads/:id
```

#### Verificar Lead por Email
```
GET /api/crm/v1/leads/check/:email
```

### Endpoints de Tags

#### Listar Tags
```
GET /api/crm/v1/tags
```

#### Criar Tag
```
POST /api/crm/v1/tags
Body: {
  name: string (required),
  color?: string,
  description?: string
}
```

#### Atualizar Tag
```
PUT /api/crm/v1/tags/:id
```

#### Deletar Tag
```
DELETE /api/crm/v1/tags/:id
```

### Endpoints de Atividades

#### Listar Atividades
```
GET /api/crm/v1/activities
Query Params:
  - lead_id (filter)
  - user_id (filter)
  - type (filter)
  - completed (boolean)
```

#### Criar Atividade
```
POST /api/crm/v1/activities
Body: {
  lead_id: number (required),
  type: string (required),
  title: string (required),
  description?: string,
  due_date?: string (ISO 8601)
}
```

#### Atualizar Atividade
```
PUT /api/crm/v1/activities/:id
```

#### Completar Atividade
```
PATCH /api/crm/v1/activities/:id/complete
```

#### Deletar Atividade
```
DELETE /api/crm/v1/activities/:id
```

### Endpoints de Kanban

#### Listar Boards
```
GET /api/crm/v1/kanban/boards
```

#### Criar Board
```
POST /api/crm/v1/kanban/boards
Body: {
  name: string (required),
  description?: string,
  is_default?: boolean
}
```

#### Obter Board com Cards
```
GET /api/crm/v1/kanban/boards/:id
```

#### Mover Card
```
PATCH /api/crm/v1/kanban/cards/:id/move
Body: {
  column_id: number (required),
  position?: number
}
```

### Endpoints de Usuários (Admin)

#### Listar Usuários
```
GET /api/crm/v1/users
```

#### Criar Usuário
```
POST /api/crm/v1/users
Body: {
  email: string (required),
  password: string (required),
  first_name?: string,
  last_name?: string,
  role?: string
}
```

---

## 🎨 Estrutura de Telas Admin (React)

### Rotas Admin
```
/admin
  /login
  /dashboard
  /leads
    /list
    /:id
    /new
  /kanban
  /activities
  /tags
  /users (admin only)
  /settings
```

### Componentes Principais

#### 1. Layout Admin
- `src/admin/components/Layout/AdminLayout.tsx`
- Sidebar com navegação
- Header com usuário e logout
- Breadcrumbs

#### 2. Leads
- `src/admin/pages/Leads/LeadsList.tsx` - Lista com filtros e busca
- `src/admin/pages/Leads/LeadDetail.tsx` - Detalhes do lead
- `src/admin/pages/Leads/LeadForm.tsx` - Criar/Editar lead
- `src/admin/components/Leads/LeadCard.tsx` - Card de lead
- `src/admin/components/Leads/LeadFilters.tsx` - Filtros avançados
- `src/admin/components/Leads/LeadStatusBadge.tsx` - Badge de status

#### 3. Kanban
- `src/admin/pages/Kanban/KanbanBoard.tsx` - Board principal
- `src/admin/components/Kanban/KanbanColumn.tsx` - Coluna
- `src/admin/components/Kanban/KanbanCard.tsx` - Card arrastável
- Drag & Drop com react-beautiful-dnd ou dnd-kit

#### 4. Atividades
- `src/admin/pages/Activities/ActivitiesList.tsx` - Lista de atividades
- `src/admin/components/Activities/ActivityCard.tsx` - Card de atividade
- `src/admin/components/Activities/ActivityForm.tsx` - Form de atividade
- Timeline view

#### 5. Tags
- `src/admin/pages/Tags/TagsList.tsx` - Lista de tags
- `src/admin/components/Tags/TagBadge.tsx` - Badge de tag
- `src/admin/components/Tags/TagSelector.tsx` - Seletor de tags

#### 6. Autenticação
- `src/admin/pages/Auth/Login.tsx` - Tela de login
- `src/admin/contexts/AuthContext.tsx` - Context de autenticação
- `src/admin/hooks/useAuth.ts` - Hook de autenticação

#### 7. Utilitários
- `src/admin/utils/api.ts` - Cliente API
- `src/admin/utils/auth.ts` - Utilitários de autenticação
- `src/admin/types/index.ts` - Types TypeScript

---

## 🔒 Segurança

### Camadas de Segurança

1. **Autenticação JWT**
   - Tokens com expiração (1 hora)
   - Refresh tokens (7 dias)
   - Blacklist de tokens revogados

2. **Autorização por Roles**
   - Admin: acesso total
   - Manager: gerenciar leads e atividades
   - User: visualizar e editar próprios leads

3. **Validação de Dados**
   - Validação no frontend (React Hook Form + Zod)
   - Validação no backend (express-validator)
   - Sanitização de inputs

4. **Rate Limiting**
   - 100 req/min por IP
   - 5 req/min para login

5. **CORS**
   - Apenas domínios permitidos
   - Credentials habilitado

6. **HTTPS**
   - Certificados Let's Encrypt via Traefik
   - Redirecionamento HTTP → HTTPS

---

## 🐳 Docker Compose

### Novo Serviço: PostgreSQL
```yaml
crm_db:
  image: postgres:16-alpine
  container_name: phd-crm-db
  environment:
    POSTGRES_DB: phd_crm
    POSTGRES_USER: phd_crm_user
    POSTGRES_PASSWORD: ${CRM_DB_PASSWORD}
  volumes:
    - crm_db_data:/var/lib/postgresql/data
  networks:
    - phd_crm_network
  restart: unless-stopped
```

### Atualizar API
- Adicionar conexão PostgreSQL
- Manter MySQL para produtos (compatibilidade)
- Adicionar rotas `/api/crm/v1/*`

---

## 📁 Estrutura de Arquivos

```
/root/phdstudio/
├── api/
│   ├── server.js (atualizar)
│   ├── routes/
│   │   ├── auth.js
│   │   ├── leads.js
│   │   ├── tags.js
│   │   ├── activities.js
│   │   ├── kanban.js
│   │   └── users.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── validation.js
│   │   └── rateLimit.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Lead.js
│   │   ├── Tag.js
│   │   ├── Activity.js
│   │   └── Kanban.js
│   ├── utils/
│   │   ├── db.js (PostgreSQL)
│   │   ├── jwt.js
│   │   └── validation.js
│   └── package.json (atualizar dependências)
├── src/
│   ├── admin/ (NOVO)
│   │   ├── pages/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── types/
│   ├── components/ (manter existentes)
│   └── ...
├── docker-compose.yml (atualizar)
└── ...
```

---

## 🧹 Limpeza de Arquivos

### Documentação para Remover
- `CORRECAO_API.md` (obsoleto)
- `LIMPEZA_REALIZADA.md` (obsoleto)
- `MIGRACAO_NGROK_RESUMO.md` (obsoleto, manter apenas referência)
- `STATUS_INSTALACAO.md` (obsoleto)
- `README_PLUGIN.md` (não será mais usado)
- `README_PRODUTOS.md` (integrar no README principal)

### Scripts para Remover
- `ativar-plugin.sh` (não será mais usado)
- `scripts/update-ngrok-webhook.sh` (manter apenas para n8n)
- `deploy-easypanel.sh` (manter se ainda usado)
- `deploy-remote.sh` (manter se ainda usado)
- `deploy.sh` (manter se ainda usado)
- `setup-automated-deploy.sh` (manter se ainda usado)
- `webhook-handler.sh` (manter se ainda usado)

### Documentação para Manter/Atualizar
- `README.md` (atualizar com nova estrutura)
- `CURLS_API_COMPLETOS.md` (atualizar com novos endpoints)
- `MCP_CRM_SERVER.md` (atualizar após migração)
- `SEGURANCA.md` (atualizar)
- `API_CONFIGURACAO.md` (atualizar)
- `PLANO_HTTPS_SEM_NGROK.md` (manter como referência)

---

## 📦 Dependências Necessárias

### Backend (API)
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "pg": "^8.11.3",
    "pg-pool": "^3.6.1",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "express-validator": "^7.0.1",
    "express-rate-limit": "^7.1.5",
    "helmet": "^7.1.0",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1"
  }
}
```

### Frontend (React)
```json
{
  "dependencies": {
    "react-router-dom": "^7.9.6",
    "react-hook-form": "^7.49.2",
    "zod": "^3.22.4",
    "@hookform/resolvers": "^3.3.2",
    "axios": "^1.6.2",
    "@tanstack/react-query": "^5.17.0",
    "react-beautiful-dnd": "^13.1.1",
    "date-fns": "^3.0.6",
    "recharts": "^3.5.1"
  }
}
```

---

## 🚀 Fases de Implementação

### Fase 1: Infraestrutura (Semana 1)
- [ ] Configurar PostgreSQL no Docker
- [ ] Criar schema do banco de dados
- [ ] Atualizar docker-compose.yml
- [ ] Configurar conexão PostgreSQL na API
- [ ] Criar migrations/seeds

### Fase 2: Backend - Autenticação (Semana 1-2)
- [ ] Implementar JWT authentication
- [ ] Criar endpoints de auth (login, logout, refresh)
- [ ] Middleware de autenticação
- [ ] Middleware de autorização por roles

### Fase 3: Backend - CRUD Básico (Semana 2)
- [ ] Endpoints de Leads (CRUD completo)
- [ ] Endpoints de Tags (CRUD completo)
- [ ] Endpoints de Atividades (CRUD completo)
- [ ] Validação e sanitização

### Fase 4: Backend - Funcionalidades Avançadas (Semana 3)
- [ ] Endpoints de Kanban
- [ ] Filtros e busca avançada
- [ ] Relacionamentos (tags, atividades, etc)
- [ ] Soft delete

### Fase 5: Frontend - Autenticação e Layout (Semana 3-4)
- [ ] Tela de login
- [ ] Layout admin (sidebar, header)
- [ ] Context de autenticação
- [ ] Proteção de rotas
- [ ] Cliente API configurado

### Fase 6: Frontend - Leads (Semana 4-5)
- [ ] Lista de leads com filtros
- [ ] Detalhes do lead
- [ ] Form de criar/editar lead
- [ ] Integração com tags e atividades

### Fase 7: Frontend - Kanban (Semana 5)
- [ ] Board de Kanban
- [ ] Drag & Drop
- [ ] Cards arrastáveis

### Fase 8: Frontend - Atividades e Tags (Semana 6)
- [ ] Lista de atividades
- [ ] Form de atividades
- [ ] Gerenciamento de tags

### Fase 9: Integração e Testes (Semana 6-7)
- [ ] Testes de integração
- [ ] Ajustes de performance
- [ ] Correção de bugs
- [ ] Documentação final

### Fase 10: Migração MCP (Semana 7)
- [ ] Atualizar MCP para usar nova API
- [ ] Testes de compatibilidade
- [ ] Documentação MCP atualizada

---

## 🔄 Migração de Dados (Opcional)

Se necessário migrar dados do WordPress/FluentCRM:

1. **Script de Migração**
   - Conectar ao banco WordPress
   - Extrair leads do FluentCRM
   - Transformar dados
   - Inserir no PostgreSQL

2. **Mapeamento de Campos**
   - `email` → `email`
   - `first_name` → `first_name`
   - `last_name` → `last_name`
   - `telefone_whatsapp` → `phone`
   - `origem_canal` → `source`
   - `intencao_estagio` → `stage`
   - `dor_necessidade` → `pain_point`

---

## ✅ Checklist Final

- [ ] Banco de dados PostgreSQL configurado
- [ ] Todas as APIs implementadas e testadas
- [ ] Telas admin funcionando
- [ ] Autenticação e autorização funcionando
- [ ] Kanban com drag & drop funcionando
- [ ] Tags e atividades funcionando
- [ ] Segurança implementada
- [ ] HTTPS configurado (Traefik)
- [ ] MCP atualizado para nova API
- [ ] Documentação atualizada
- [ ] Arquivos desnecessários removidos
- [ ] Testes realizados
- [ ] Deploy realizado

---

## 📝 Notas Importantes

1. **Compatibilidade**: Manter API de produtos funcionando (MySQL)
2. **HTTPS**: Usar Traefik com Let's Encrypt (já configurado)
3. **ngrok**: Manter apenas para n8n
4. **Backup**: Configurar backup automático do PostgreSQL
5. **Performance**: Índices no banco de dados para queries rápidas
6. **Escalabilidade**: Estrutura preparada para crescimento

---

## 🎯 Próximos Passos

1. Revisar e aprovar este plano
2. Iniciar Fase 1 (Infraestrutura)
3. Implementar fase por fase
4. Testes contínuos
5. Deploy incremental

---

**Data de Criação**: 2025-12-21  
**Versão**: 1.0  
**Status**: Aguardando Aprovação

