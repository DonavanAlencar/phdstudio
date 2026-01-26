# Prompt de Implementação - Features de Área do Cliente e Gestão

## Contexto do Projeto

Este é um projeto React + TypeScript (Vite) com backend Node.js/Express e PostgreSQL. O sistema já possui:
- Sistema de autenticação JWT
- Roles básicas (admin, manager, user)
- Tela de login em `/login`
- Tela de mobilechat em `/mobilechat`
- Tela de logs em `/logs` (apenas para admin)
- Integração com webhooks n8n para o mobilechat

## Objetivo

Implementar um sistema completo de gestão de clientes com:
1. Role específica para clientes
2. Área do cliente com acesso apenas ao mobilechat
3. Sistema de mobilechat isolado por cliente
4. Gestão de usuários e roles na tela de Logs
5. Gestão de URLs de webhook n8n por cliente

---

## 1. ESTRUTURA DE BANCO DE DADOS

### 1.1. Criar Migration para Novas Tabelas

Criar arquivo: `backend/db/migrations/005_client_mobilechat_management.sql`

```sql
-- Adicionar role 'client' ao enum de roles existente
-- Nota: Se o CHECK constraint não permitir, será necessário recriar a tabela users
-- Alternativa: usar ALTER TABLE para adicionar o valor ao enum

-- Tabela: clients (clientes)
CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    company_name VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_clients_is_active ON clients(is_active);

-- Tabela: client_mobilechat_configs (configurações de mobilechat por cliente)
CREATE TABLE IF NOT EXISTS client_mobilechat_configs (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    n8n_webhook_url TEXT NOT NULL,
    n8n_auth_token VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(client_id)
);

CREATE INDEX idx_client_mobilechat_configs_client_id ON client_mobilechat_configs(client_id);
CREATE INDEX idx_client_mobilechat_configs_is_active ON client_mobilechat_configs(is_active);

-- Tabela: user_clients (relação usuário-cliente)
-- Um usuário pode estar associado a um cliente
CREATE TABLE IF NOT EXISTS user_clients (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, client_id)
);

CREATE INDEX idx_user_clients_user_id ON user_clients(user_id);
CREATE INDEX idx_user_clients_client_id ON user_clients(client_id);

-- Atualizar tabela users para permitir role 'client'
-- Se o CHECK constraint não permitir, será necessário:
-- 1. Remover o constraint
-- 2. Adicionar o novo valor
-- 3. Recriar o constraint

-- Verificar se o constraint existe e remover
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'users_role_check' 
        AND conrelid = 'users'::regclass
    ) THEN
        ALTER TABLE users DROP CONSTRAINT users_role_check;
    END IF;
END $$;

-- Recriar constraint com role 'client' incluído
ALTER TABLE users 
ADD CONSTRAINT users_role_check 
CHECK (role IN ('admin', 'manager', 'user', 'client'));

-- Triggers para updated_at
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_mobilechat_configs_updated_at BEFORE UPDATE ON client_mobilechat_configs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## 2. BACKEND - NOVAS ROTAS E ENDPOINTS

### 2.1. Criar Rota de Clientes

Criar arquivo: `backend/routes/clients.js`

```javascript
/**
 * Rotas de gerenciamento de clientes
 */

import express from 'express';
import { queryCRM } from '../utils/db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { validateId } from '../middleware/validation.js';

const router = express.Router();

/**
 * GET /api/crm/v1/clients
 * Listar todos os clientes (apenas admin/manager)
 */
router.get('/', authenticateToken, requireRole('admin', 'manager'), async (req, res) => {
  try {
    const result = await queryCRM(
      `SELECT c.*, 
              COUNT(DISTINCT uc.user_id) as user_count,
              cmc.n8n_webhook_url,
              cmc.is_active as mobilechat_active
       FROM clients c
       LEFT JOIN user_clients uc ON c.id = uc.client_id
       LEFT JOIN client_mobilechat_configs cmc ON c.id = cmc.client_id
       WHERE c.is_active = true
       GROUP BY c.id, cmc.n8n_webhook_url, cmc.is_active
       ORDER BY c.created_at DESC`
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Erro ao listar clientes:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * GET /api/crm/v1/clients/:id
 * Obter cliente específico
 */
router.get('/:id', authenticateToken, requireRole('admin', 'manager'), validateId, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await queryCRM(
      `SELECT c.*, 
              cmc.n8n_webhook_url,
              cmc.n8n_auth_token,
              cmc.is_active as mobilechat_active
       FROM clients c
       LEFT JOIN client_mobilechat_configs cmc ON c.id = cmc.client_id
       WHERE c.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Cliente não encontrado'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao obter cliente:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * POST /api/crm/v1/clients
 * Criar novo cliente
 */
router.post('/', authenticateToken, requireRole('admin', 'manager'), async (req, res) => {
  try {
    const { name, email, phone, company_name } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        error: 'Dados inválidos',
        message: 'Nome e email são obrigatórios'
      });
    }

    const result = await queryCRM(
      `INSERT INTO clients (name, email, phone, company_name)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, email, phone || null, company_name || null]
    );

    res.status(201).json({
      success: true,
      message: 'Cliente criado com sucesso',
      data: result.rows[0]
    });
  } catch (error) {
    if (error.code === '23505') { // Unique violation
      return res.status(409).json({
        error: 'Email já cadastrado'
      });
    }
    console.error('Erro ao criar cliente:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * PUT /api/crm/v1/clients/:id
 * Atualizar cliente
 */
router.put('/:id', authenticateToken, requireRole('admin', 'manager'), validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, company_name, is_active } = req.body;

    const result = await queryCRM(
      `UPDATE clients 
       SET name = COALESCE($1, name),
           email = COALESCE($2, email),
           phone = COALESCE($3, phone),
           company_name = COALESCE($4, company_name),
           is_active = COALESCE($5, is_active),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING *`,
      [name, email, phone, company_name, is_active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Cliente não encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Cliente atualizado com sucesso',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * DELETE /api/crm/v1/clients/:id
 * Desativar cliente (soft delete)
 */
router.delete('/:id', authenticateToken, requireRole('admin'), validateId, async (req, res) => {
  try {
    const { id } = req.params;

    await queryCRM(
      'UPDATE clients SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );

    res.json({
      success: true,
      message: 'Cliente desativado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao desativar cliente:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

export default router;
```

### 2.2. Criar Rota de Configurações de Mobilechat

Criar arquivo: `backend/routes/clientMobilechat.js`

```javascript
/**
 * Rotas de configuração de mobilechat por cliente
 */

import express from 'express';
import { queryCRM } from '../utils/db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { validateId } from '../middleware/validation.js';

const router = express.Router();

/**
 * GET /api/crm/v1/client-mobilechat/:clientId
 * Obter configuração de mobilechat de um cliente
 */
router.get('/:clientId', authenticateToken, requireRole('admin', 'manager'), validateId, async (req, res) => {
  try {
    const { clientId } = req.params;

    const result = await queryCRM(
      `SELECT cmc.*, c.name as client_name, c.email as client_email
       FROM client_mobilechat_configs cmc
       JOIN clients c ON cmc.client_id = c.id
       WHERE cmc.client_id = $1`,
      [clientId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Configuração não encontrada'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao obter configuração:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * POST /api/crm/v1/client-mobilechat
 * Criar ou atualizar configuração de mobilechat
 */
router.post('/', authenticateToken, requireRole('admin', 'manager'), async (req, res) => {
  try {
    const { client_id, n8n_webhook_url, n8n_auth_token, is_active } = req.body;

    if (!client_id || !n8n_webhook_url) {
      return res.status(400).json({
        error: 'Dados inválidos',
        message: 'client_id e n8n_webhook_url são obrigatórios'
      });
    }

    // Validar URL
    try {
      new URL(n8n_webhook_url);
    } catch {
      return res.status(400).json({
        error: 'URL inválida'
      });
    }

    const result = await queryCRM(
      `INSERT INTO client_mobilechat_configs (client_id, n8n_webhook_url, n8n_auth_token, is_active)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (client_id) 
       DO UPDATE SET 
         n8n_webhook_url = EXCLUDED.n8n_webhook_url,
         n8n_auth_token = EXCLUDED.n8n_auth_token,
         is_active = EXCLUDED.is_active,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [client_id, n8n_webhook_url, n8n_auth_token || null, is_active !== false]
    );

    res.json({
      success: true,
      message: 'Configuração salva com sucesso',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao salvar configuração:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * GET /api/crm/v1/client-mobilechat/my-config
 * Cliente obter sua própria configuração
 */
router.get('/my-config', authenticateToken, requireRole('client'), async (req, res) => {
  try {
    const userId = req.user.id;

    // Buscar cliente associado ao usuário
    const clientResult = await queryCRM(
      `SELECT c.id as client_id
       FROM clients c
       JOIN user_clients uc ON c.id = uc.client_id
       WHERE uc.user_id = $1 AND c.is_active = true`,
      [userId]
    );

    if (clientResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Cliente não encontrado para este usuário'
      });
    }

    const clientId = clientResult.rows[0].client_id;

    // Buscar configuração
    const configResult = await queryCRM(
      `SELECT n8n_webhook_url, n8n_auth_token, is_active
       FROM client_mobilechat_configs
       WHERE client_id = $1 AND is_active = true`,
      [clientId]
    );

    if (configResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Configuração de mobilechat não encontrada'
      });
    }

    res.json({
      success: true,
      data: configResult.rows[0]
    });
  } catch (error) {
    console.error('Erro ao obter configuração do cliente:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

export default router;
```

### 2.3. Criar Rota de Gestão de Usuários

Criar arquivo: `backend/routes/users.js`

```javascript
/**
 * Rotas de gerenciamento de usuários
 */

import express from 'express';
import bcrypt from 'bcryptjs';
import { queryCRM } from '../utils/db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { validateId } from '../middleware/validation.js';

const router = express.Router();

/**
 * GET /api/crm/v1/users
 * Listar todos os usuários (apenas admin)
 */
router.get('/', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const result = await queryCRM(
      `SELECT u.id, u.email, u.first_name, u.last_name, u.role, u.is_active, u.last_login, u.created_at,
              c.id as client_id, c.name as client_name
       FROM users u
       LEFT JOIN user_clients uc ON u.id = uc.user_id
       LEFT JOIN clients c ON uc.client_id = c.id
       ORDER BY u.created_at DESC`
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * POST /api/crm/v1/users
 * Criar novo usuário
 */
router.post('/', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { email, password, first_name, last_name, role, client_id } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({
        error: 'Dados inválidos',
        message: 'Email, senha e role são obrigatórios'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'Senha muito curta',
        message: 'A senha deve ter no mínimo 6 caracteres'
      });
    }

    // Hash da senha
    const password_hash = await bcrypt.hash(password, 10);

    // Criar usuário
    const userResult = await queryCRM(
      `INSERT INTO users (email, password_hash, first_name, last_name, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, first_name, last_name, role, is_active, created_at`,
      [email, password_hash, first_name || null, last_name || null, role]
    );

    const userId = userResult.rows[0].id;

    // Se client_id foi fornecido, associar usuário ao cliente
    if (client_id && role === 'client') {
      await queryCRM(
        'INSERT INTO user_clients (user_id, client_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [userId, client_id]
      );
    }

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      data: userResult.rows[0]
    });
  } catch (error) {
    if (error.code === '23505') { // Unique violation
      return res.status(409).json({
        error: 'Email já cadastrado'
      });
    }
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * PUT /api/crm/v1/users/:id/reset-password
 * Resetar senha de usuário
 */
router.put('/:id/reset-password', authenticateToken, requireRole('admin'), validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const { new_password } = req.body;

    if (!new_password || new_password.length < 6) {
      return res.status(400).json({
        error: 'Senha inválida',
        message: 'A senha deve ter no mínimo 6 caracteres'
      });
    }

    const password_hash = await bcrypt.hash(new_password, 10);

    const result = await queryCRM(
      `UPDATE users 
       SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, email`,
      [password_hash, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Usuário não encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Senha resetada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao resetar senha:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * PUT /api/crm/v1/users/:id
 * Atualizar usuário
 */
router.put('/:id', authenticateToken, requireRole('admin'), validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const { email, first_name, last_name, role, is_active, client_id } = req.body;

    const result = await queryCRM(
      `UPDATE users 
       SET email = COALESCE($1, email),
           first_name = COALESCE($2, first_name),
           last_name = COALESCE($3, last_name),
           role = COALESCE($4, role),
           is_active = COALESCE($5, is_active),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING id, email, first_name, last_name, role, is_active`,
      [email, first_name, last_name, role, is_active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Usuário não encontrado'
      });
    }

    // Atualizar associação com cliente se necessário
    if (client_id !== undefined) {
      if (client_id) {
        await queryCRM(
          'INSERT INTO user_clients (user_id, client_id) VALUES ($1, $2) ON CONFLICT DO UPDATE SET client_id = EXCLUDED.client_id',
          [id, client_id]
        );
      } else {
        await queryCRM(
          'DELETE FROM user_clients WHERE user_id = $1',
          [id]
        );
      }
    }

    res.json({
      success: true,
      message: 'Usuário atualizado com sucesso',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * DELETE /api/crm/v1/users/:id
 * Desativar usuário
 */
router.delete('/:id', authenticateToken, requireRole('admin'), validateId, async (req, res) => {
  try {
    const { id } = req.params;

    await queryCRM(
      'UPDATE users SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );

    res.json({
      success: true,
      message: 'Usuário desativado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao desativar usuário:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

export default router;
```

### 2.4. Registrar Rotas no server.js

Adicionar no arquivo `backend/server.js`:

```javascript
import clientsRoutes from './routes/clients.js';
import clientMobilechatRoutes from './routes/clientMobilechat.js';
import usersRoutes from './routes/users.js';

// ... depois das outras rotas ...

app.use('/api/crm/v1/clients', clientsRoutes);
app.use('/api/crm/v1/client-mobilechat', clientMobilechatRoutes);
app.use('/api/crm/v1/users', usersRoutes);
```

---

## 3. FRONTEND - ÁREA DO CLIENTE

### 3.1. Modificar Login para Redirecionar Clientes

No arquivo `App.tsx`, modificar a função `handleSubmit` do `LoginPage`:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');

  const success = await login(username, password);

  if (success) {
    // Verificar role do usuário
    const userRole = localStorage.getItem('userRole');
    
    if (userRole === 'admin') {
      navigate('/logs', { replace: true });
    } else if (userRole === 'client') {
      // Clientes vão direto para o mobilechat
      navigate('/mobilechat', { replace: true });
    } else if (username === 'vexin') {
      navigate('/funil_vexin', { replace: true });
    } else {
      navigate(from || '/', { replace: true });
    }
  } else {
    setError('Usuário ou senha incorretos');
  }
};
```

### 3.2. Modificar MobileChatPage para Usar Configuração do Cliente

Modificar `src/components/MobileChat/MobileChatInterface.tsx`:

```typescript
// Adicionar função para buscar configuração do cliente
const fetchClientMobilechatConfig = async (): Promise<{ webhookUrl: string; authToken?: string } | null> => {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;

    const response = await fetch('/api/crm/v1/client-mobilechat/my-config', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      return {
        webhookUrl: data.data.n8n_webhook_url,
        authToken: data.data.n8n_auth_token
      };
    }
  } catch (error) {
    console.error('Erro ao buscar configuração:', error);
  }
  return null;
};

// Modificar getWebhookConfig para usar configuração do cliente
const getWebhookConfig = async () => {
  const userRole = localStorage.getItem('userRole');
  
  // Se for cliente, buscar configuração do backend
  if (userRole === 'client') {
    const clientConfig = await fetchClientMobilechatConfig();
    if (clientConfig) {
      return {
        webhookUrl: clientConfig.webhookUrl,
        authToken: clientConfig.authToken,
        usingEnvVars: false
      };
    }
  }
  
  // Fallback para configuração padrão
  const envWebhookUrl = import.meta.env.VITE_CHAT_WEBHOOK_URL;
  const envAuthToken = import.meta.env.VITE_CHAT_AUTH_TOKEN;
  
  return {
    webhookUrl: envWebhookUrl || 'https://n8n.546digitalservices.com/webhook/32f58b69-ef50-467f-b884-50e72a5eefa2',
    authToken: envAuthToken,
    usingEnvVars: !!(envWebhookUrl || envAuthToken)
  };
};
```

### 3.3. Criar Componente de Área do Cliente

Criar arquivo: `src/components/ClientArea/ClientArea.tsx`

```typescript
import React from 'react';
import { Navigate } from 'react-router-dom';
import MobileChatPage from '../MobileChat/MobileChatPage';

const ClientArea: React.FC = () => {
  const userRole = localStorage.getItem('userRole');
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (userRole !== 'client') {
    return <Navigate to="/" replace />;
  }

  // Clientes têm acesso apenas ao mobilechat
  return <MobileChatPage />;
};

export default ClientArea;
```

---

## 4. FRONTEND - TELA DE LOGS (ADMIN)

### 4.1. Adicionar Abas na Tela de Logs

Modificar `App.tsx` - componente `LogsPage`:

Adicionar novo estado para abas:
```typescript
const [activeTab, setActiveTab] = useState<'access' | 'login' | 'dashboard' | 'users' | 'roles' | 'mobilechat-configs'>('dashboard');
```

Adicionar novas abas no JSX:
```typescript
<div className="flex space-x-2 mb-6 border-b border-white/10">
  <button
    onClick={() => setActiveTab('dashboard')}
    className={`px-6 py-3 font-semibold transition-colors ${activeTab === 'dashboard'
      ? 'border-b-2 border-brand-red text-brand-red'
      : 'text-gray-400 hover:text-white'
    }`}
  >
    Dashboard
  </button>
  <button
    onClick={() => setActiveTab('access')}
    className={`px-6 py-3 font-semibold transition-colors ${activeTab === 'access'
      ? 'border-b-2 border-brand-red text-brand-red'
      : 'text-gray-400 hover:text-white'
    }`}
  >
    Logs de Acesso ({accessLogs.length})
  </button>
  <button
    onClick={() => setActiveTab('login')}
    className={`px-6 py-3 font-semibold transition-colors ${activeTab === 'login'
      ? 'border-b-2 border-brand-red text-brand-red'
      : 'text-gray-400 hover:text-white'
    }`}
  >
    Logs de Login ({loginLogs.length})
  </button>
  <button
    onClick={() => setActiveTab('users')}
    className={`px-6 py-3 font-semibold transition-colors ${activeTab === 'users'
      ? 'border-b-2 border-brand-red text-brand-red'
      : 'text-gray-400 hover:text-white'
    }`}
  >
    Usuários
  </button>
  <button
    onClick={() => setActiveTab('mobilechat-configs')}
    className={`px-6 py-3 font-semibold transition-colors ${activeTab === 'mobilechat-configs'
      ? 'border-b-2 border-brand-red text-brand-red'
      : 'text-gray-400 hover:text-white'
    }`}
  >
    Config. Mobilechat
  </button>
</div>
```

### 4.2. Criar Componente de Gestão de Usuários

Criar arquivo: `src/components/Logs/UsersManagement.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit, Trash2, Key, X } from 'lucide-react';

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'manager' | 'user' | 'client';
  is_active: boolean;
  last_login: string;
  client_id?: number;
  client_name?: string;
}

const UsersManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [clients, setClients] = useState<any[]>([]);

  // Form states
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role: 'user' as User['role'],
    client_id: ''
  });
  const [resetPassword, setResetPassword] = useState('');

  useEffect(() => {
    loadUsers();
    loadClients();
  }, []);

  const loadUsers = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/crm/v1/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadClients = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/crm/v1/clients', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setClients(data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      const payload = {
        ...formData,
        client_id: formData.role === 'client' && formData.client_id ? parseInt(formData.client_id) : undefined
      };

      const response = await fetch('/api/crm/v1/users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setShowCreateModal(false);
        setFormData({
          email: '',
          password: '',
          first_name: '',
          last_name: '',
          role: 'user',
          client_id: ''
        });
        loadUsers();
      } else {
        const error = await response.json();
        alert(error.message || 'Erro ao criar usuário');
      }
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      alert('Erro ao criar usuário');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !resetPassword) return;

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/crm/v1/users/${selectedUser.id}/reset-password`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ new_password: resetPassword })
      });

      if (response.ok) {
        setShowResetPasswordModal(false);
        setSelectedUser(null);
        setResetPassword('');
        alert('Senha resetada com sucesso');
      } else {
        const error = await response.json();
        alert(error.message || 'Erro ao resetar senha');
      }
    } catch (error) {
      console.error('Erro ao resetar senha:', error);
      alert('Erro ao resetar senha');
    }
  };

  const handleToggleActive = async (user: User) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/crm/v1/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_active: !user.is_active })
      });

      if (response.ok) {
        loadUsers();
      }
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Gestão de Usuários</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-red text-white rounded-lg hover:bg-brand-red/80 transition-colors"
        >
          <Plus size={20} />
          Criar Usuário
        </button>
      </div>

      <div className="bg-brand-gray rounded-lg border border-white/10 overflow-hidden">
        <table className="w-full">
          <thead className="bg-white/5">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Nome</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Role</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Cliente</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-white/10">
                <td className="px-4 py-3">{user.email}</td>
                <td className="px-4 py-3">{user.first_name} {user.last_name}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs ${
                    user.role === 'admin' ? 'bg-red-500/20 text-red-400' :
                    user.role === 'client' ? 'bg-blue-500/20 text-blue-400' :
                    user.role === 'manager' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3">{user.client_name || '-'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs ${
                    user.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {user.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setShowResetPasswordModal(true);
                      }}
                      className="p-2 text-yellow-400 hover:bg-yellow-500/20 rounded transition-colors"
                      title="Resetar Senha"
                    >
                      <Key size={16} />
                    </button>
                    <button
                      onClick={() => handleToggleActive(user)}
                      className={`p-2 rounded transition-colors ${
                        user.is_active
                          ? 'text-red-400 hover:bg-red-500/20'
                          : 'text-green-400 hover:bg-green-500/20'
                      }`}
                      title={user.is_active ? 'Desativar' : 'Ativar'}
                    >
                      {user.is_active ? <X size={16} /> : <Edit size={16} />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Criar Usuário */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-brand-gray border border-white/10 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Criar Usuário</h3>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-brand-dark border border-white/10 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Senha *</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-brand-dark border border-white/10 rounded px-3 py-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nome</label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="w-full bg-brand-dark border border-white/10 rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Sobrenome</label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="w-full bg-brand-dark border border-white/10 rounded px-3 py-2"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Role *</label>
                <select
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as User['role'] })}
                  className="w-full bg-brand-dark border border-white/10 rounded px-3 py-2"
                >
                  <option value="user">User</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                  <option value="client">Client</option>
                </select>
              </div>
              {formData.role === 'client' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Cliente</label>
                  <select
                    value={formData.client_id}
                    onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                    className="w-full bg-brand-dark border border-white/10 rounded px-3 py-2"
                  >
                    <option value="">Selecione um cliente</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name} ({client.email})
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-gray-500/20 text-gray-400 rounded hover:bg-gray-500/30"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-red text-white rounded hover:bg-brand-red/80"
                >
                  Criar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Resetar Senha */}
      {showResetPasswordModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-brand-gray border border-white/10 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Resetar Senha</h3>
            <p className="text-sm text-gray-400 mb-4">Usuário: {selectedUser.email}</p>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nova Senha *</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={resetPassword}
                  onChange={(e) => setResetPassword(e.target.value)}
                  className="w-full bg-brand-dark border border-white/10 rounded px-3 py-2"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowResetPasswordModal(false);
                    setSelectedUser(null);
                    setResetPassword('');
                  }}
                  className="px-4 py-2 bg-gray-500/20 text-gray-400 rounded hover:bg-gray-500/30"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-red text-white rounded hover:bg-brand-red/80"
                >
                  Resetar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManagement;
```

### 4.3. Criar Componente de Gestão de Configurações Mobilechat

Criar arquivo: `src/components/Logs/MobilechatConfigsManagement.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import { Settings, Plus, Edit, Trash2, Link as LinkIcon } from 'lucide-react';

interface Client {
  id: number;
  name: string;
  email: string;
  company_name?: string;
}

interface MobilechatConfig {
  id: number;
  client_id: number;
  client_name: string;
  client_email: string;
  n8n_webhook_url: string;
  n8n_auth_token?: string;
  is_active: boolean;
}

const MobilechatConfigsManagement: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [configs, setConfigs] = useState<MobilechatConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({
    client_id: '',
    n8n_webhook_url: '',
    n8n_auth_token: '',
    is_active: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      
      // Carregar clientes
      const clientsResponse = await fetch('/api/crm/v1/clients', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (clientsResponse.ok) {
        const clientsData = await clientsResponse.json();
        setClients(clientsData.data);
        
        // Carregar configurações
        const configsPromises = clientsData.data.map(async (client: Client) => {
          const configResponse = await fetch(`/api/crm/v1/client-mobilechat/${client.id}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (configResponse.ok) {
            const configData = await configResponse.json();
            return {
              ...configData.data,
              client_name: client.name,
              client_email: client.email
            };
          }
          return null;
        });

        const configsResults = await Promise.all(configsPromises);
        setConfigs(configsResults.filter(c => c !== null));
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/crm/v1/client-mobilechat', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          client_id: parseInt(formData.client_id),
          n8n_webhook_url: formData.n8n_webhook_url,
          n8n_auth_token: formData.n8n_auth_token || undefined,
          is_active: formData.is_active
        })
      });

      if (response.ok) {
        setShowModal(false);
        setFormData({
          client_id: '',
          n8n_webhook_url: '',
          n8n_auth_token: '',
          is_active: true
        });
        loadData();
      } else {
        const error = await response.json();
        alert(error.message || 'Erro ao salvar configuração');
      }
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      alert('Erro ao salvar configuração');
    }
  };

  const handleEdit = (config: MobilechatConfig) => {
    setFormData({
      client_id: config.client_id.toString(),
      n8n_webhook_url: config.n8n_webhook_url,
      n8n_auth_token: config.n8n_auth_token || '',
      is_active: config.is_active
    });
    setShowModal(true);
  };

  if (loading) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Configurações de Mobilechat</h2>
        <button
          onClick={() => {
            setFormData({
              client_id: '',
              n8n_webhook_url: '',
              n8n_auth_token: '',
              is_active: true
            });
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-brand-red text-white rounded-lg hover:bg-brand-red/80 transition-colors"
        >
          <Plus size={20} />
          Nova Configuração
        </button>
      </div>

      <div className="grid gap-4">
        {configs.map((config) => (
          <div key={config.id} className="bg-brand-gray border border-white/10 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{config.client_name}</h3>
                <p className="text-sm text-gray-400">{config.client_email}</p>
                <div className="mt-2 flex items-center gap-2">
                  <LinkIcon size={16} className="text-gray-400" />
                  <a
                    href={config.n8n_webhook_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-400 hover:underline break-all"
                  >
                    {config.n8n_webhook_url}
                  </a>
                </div>
                <div className="mt-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    config.is_active
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {config.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleEdit(config)}
                className="p-2 text-blue-400 hover:bg-blue-500/20 rounded transition-colors"
                title="Editar"
              >
                <Edit size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-brand-gray border border-white/10 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Configuração de Mobilechat</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Cliente *</label>
                <select
                  required
                  value={formData.client_id}
                  onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                  className="w-full bg-brand-dark border border-white/10 rounded px-3 py-2"
                  disabled={!!formData.client_id && configs.some(c => c.client_id.toString() === formData.client_id)}
                >
                  <option value="">Selecione um cliente</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name} ({client.email})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">URL do Webhook n8n *</label>
                <input
                  type="url"
                  required
                  value={formData.n8n_webhook_url}
                  onChange={(e) => setFormData({ ...formData, n8n_webhook_url: e.target.value })}
                  className="w-full bg-brand-dark border border-white/10 rounded px-3 py-2"
                  placeholder="https://n8n.example.com/webhook/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Token de Autenticação (opcional)</label>
                <input
                  type="text"
                  value={formData.n8n_auth_token}
                  onChange={(e) => setFormData({ ...formData, n8n_auth_token: e.target.value })}
                  className="w-full bg-brand-dark border border-white/10 rounded px-3 py-2"
                  placeholder="Token de autenticação do webhook"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="is_active" className="text-sm">Ativo</label>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setFormData({
                      client_id: '',
                      n8n_webhook_url: '',
                      n8n_auth_token: '',
                      is_active: true
                    });
                  }}
                  className="px-4 py-2 bg-gray-500/20 text-gray-400 rounded hover:bg-gray-500/30"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-red text-white rounded hover:bg-brand-red/80"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobilechatConfigsManagement;
```

### 4.4. Integrar Componentes na LogsPage

No `App.tsx`, importar e usar os componentes:

```typescript
import UsersManagement from './src/components/Logs/UsersManagement';
import MobilechatConfigsManagement from './src/components/Logs/MobilechatConfigsManagement';

// Dentro do componente LogsPage, adicionar renderização condicional:
{activeTab === 'users' && <UsersManagement />}
{activeTab === 'mobilechat-configs' && <MobilechatConfigsManagement />}
```

---

## 5. ATUALIZAR AUTENTICAÇÃO PARA SUPORTAR ROLE CLIENT

### 5.1. Modificar Login no App.tsx

Atualizar a função `login` no `AuthContext`:

```typescript
const login = async (username: string, password: string): Promise<boolean> => {
  try {
    // Tentar login via API do backend
    const response = await fetch('/api/crm/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: username,
        password: password,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const user = data.data.user;
      
      // Salvar tokens
      localStorage.setItem('accessToken', data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('username', user.email);
      localStorage.setItem('userRole', user.role);
      localStorage.setItem('userId', user.id.toString());
      
      setIsAuthenticated(true);
      setUsername(user.email);
      
      // Registrar login bem-sucedido
      logLogin(username, true, location).catch(() => {});
      
      return true;
    }
  } catch (error) {
    console.error('Erro no login:', error);
  }

  // Fallback para login local (manter compatibilidade)
  if (username === 'phdstudioadmin' && password === 'phdstudio2024!') {
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('username', username);
    localStorage.setItem('userRole', 'admin');
    setIsAuthenticated(true);
    setUsername(username);
    logLogin(username, true, location).catch(() => {});
    return true;
  }

  // Registrar tentativa de login falhada
  logLogin(username, false, location).catch(() => {});
  return false;
};
```

---

## 6. TESTES E VALIDAÇÕES

### Checklist de Implementação:

- [ ] Migration criada e executada no banco de dados
- [ ] Rotas do backend criadas e registradas
- [ ] Frontend atualizado para suportar role 'client'
- [ ] Área do cliente redireciona para mobilechat
- [ ] Mobilechat usa configuração específica do cliente
- [ ] Tela de logs tem abas de usuários e configurações
- [ ] Gestão de usuários funcional (criar, resetar senha, ativar/desativar)
- [ ] Gestão de configurações mobilechat funcional
- [ ] Testes de autenticação com diferentes roles
- [ ] Validação de URLs de webhook
- [ ] Tratamento de erros implementado

---

## 7. NOTAS IMPORTANTES

1. **Segurança**: Todas as rotas devem usar autenticação JWT e verificação de roles
2. **Validação**: Validar todas as entradas do usuário (emails, URLs, etc.)
3. **Erros**: Implementar tratamento de erros adequado em todas as operações
4. **UX**: Fornecer feedback visual para todas as ações (loading, success, error)
5. **Compatibilidade**: Manter compatibilidade com sistema de login existente durante transição

---

## 8. PRÓXIMOS PASSOS (OPCIONAL)

Após implementação básica, considerar:
- Histórico de alterações de configurações
- Logs de uso do mobilechat por cliente
- Dashboard de métricas por cliente
- Notificações quando webhook estiver inativo
- Testes automatizados (unitários e integração)
