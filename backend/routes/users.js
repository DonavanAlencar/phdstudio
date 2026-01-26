/**
 * Rotas de gerenciamento de usuários
 */

import express from 'express';
import bcrypt from 'bcryptjs';
import { queryCRM } from '../utils/db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { validateId } from '../middleware/validation.js';

const router = express.Router();
const ALLOWED_ROLES = ['admin', 'manager', 'user', 'client'];

/**
 * GET /api/crm/v1/users
 * Listar todos os usuários (apenas admin)
 */
router.get('/', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const result = await queryCRM(
      `SELECT u.id, u.email, u.first_name, u.last_name, u.role, u.is_active, u.last_login, u.created_at,
              c.id AS client_id, c.name AS client_name
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

    if (!ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({
        error: 'Role inválida'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'Senha muito curta',
        message: 'A senha deve ter no mínimo 6 caracteres'
      });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const userResult = await queryCRM(
      `INSERT INTO users (email, password_hash, first_name, last_name, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, first_name, last_name, role, is_active, created_at`,
      [email, password_hash, first_name || null, last_name || null, role]
    );

    const userId = userResult.rows[0].id;

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
    if (error.code === '23505') {
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

    if (role && !ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({
        error: 'Role inválida'
      });
    }

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

    const updatedUser = result.rows[0];

    // Atualizar associação com cliente se necessário
    if (client_id !== undefined || updatedUser.role !== 'client') {
      await queryCRM('DELETE FROM user_clients WHERE user_id = $1', [id]);
    }

    if (client_id && updatedUser.role === 'client') {
      await queryCRM(
        'INSERT INTO user_clients (user_id, client_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [id, client_id]
      );
    }

    res.json({
      success: true,
      message: 'Usuário atualizado com sucesso',
      data: updatedUser
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
