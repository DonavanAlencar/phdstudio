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
              COUNT(DISTINCT uc.user_id) AS user_count,
              cmc.n8n_webhook_url,
              cmc.is_active AS mobilechat_active
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
              cmc.is_active AS mobilechat_active
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
    if (error.code === '23505') {
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
