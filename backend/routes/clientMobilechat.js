/**
 * Rotas de configuração de mobilechat por cliente
 */

import express from 'express';
import { queryCRM } from '../utils/db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { validateClientId } from '../middleware/validation.js';

const router = express.Router();

/**
 * GET /api/crm/v1/client-mobilechat/my-config
 * Cliente obter sua própria configuração
 * Importante: rota definida antes de /:clientId para evitar conflitos
 */
router.get('/my-config', authenticateToken, requireRole('client'), async (req, res) => {
  try {
    const userId = req.user.id;

    // Buscar cliente associado ao usuário
    const clientResult = await queryCRM(
      `SELECT c.id AS client_id
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

/**
 * GET /api/crm/v1/client-mobilechat/:clientId
 * Obter configuração de mobilechat de um cliente
 */
router.get('/:clientId', authenticateToken, requireRole('admin', 'manager'), validateClientId, async (req, res) => {
  try {
    const { clientId } = req.params;

    const result = await queryCRM(
      `SELECT cmc.*, c.name AS client_name, c.email AS client_email
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

export default router;
