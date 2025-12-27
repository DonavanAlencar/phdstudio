/**
 * Rotas de Mensageria
 */

import express from 'express';
import { queryCRM } from '../utils/db.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateMessage, validateId, validateListQuery } from '../middleware/validation.js';

const router = express.Router();

/**
 * GET /api/crm/v1/messages
 */
router.get('/', authenticateToken, validateListQuery, async (req, res) => {
  try {
    const { page = 1, limit = 100, lead_id, channel, status } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const limitNum = Math.min(parseInt(limit, 10), 100);

    let query = 'SELECT * FROM messages WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (lead_id) {
      query += ` AND lead_id = $${paramIndex++}`;
      params.push(lead_id);
    }

    if (channel) {
      query += ` AND channel = $${paramIndex++}`;
      params.push(channel);
    }

    if (status) {
      query += ` AND status = $${paramIndex++}`;
      params.push(status);
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limitNum, offset);

    const result = await queryCRM(query, params);

    const countResult = await queryCRM('SELECT COUNT(*) as total FROM messages', []);
    const total = parseInt(countResult.rows[0].total, 10);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page: parseInt(page, 10),
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Erro ao listar mensagens:', error);
    res.status(500).json({
      error: 'Erro ao listar mensagens',
      message: error.message
    });
  }
});

/**
 * POST /api/crm/v1/messages
 */
router.post('/', authenticateToken, validateMessage, async (req, res) => {
  try {
    const {
      lead_id,
      deal_id,
      channel,
      direction,
      subject,
      body,
      metadata = {}
    } = req.body;

    const result = await queryCRM(
      `INSERT INTO messages (lead_id, deal_id, channel, direction, subject, body, status, metadata, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        lead_id || null,
        deal_id || null,
        channel,
        direction,
        subject || null,
        body,
        'queued',
        metadata,
        req.user?.id || null
      ]
    );

    if (lead_id) {
      await queryCRM(
        `INSERT INTO lead_events (lead_id, deal_id, event_type, title, description, metadata, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          lead_id,
          deal_id || null,
          'message',
          `Mensagem ${direction === 'outbound' ? 'enviada' : 'recebida'} (${channel})`,
          body,
          metadata,
          req.user?.id || null
        ]
      );
    }

    res.status(201).json({
      success: true,
      message: 'Mensagem registrada com sucesso',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao criar mensagem:', error);
    res.status(500).json({
      error: 'Erro ao criar mensagem',
      message: error.message
    });
  }
});

/**
 * PATCH /api/crm/v1/messages/:id/status
 */
router.patch('/:id/status', authenticateToken, validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['queued', 'sent', 'failed'].includes(status)) {
      return res.status(400).json({
        error: 'Status inválido'
      });
    }

    const result = await queryCRM(
      `UPDATE messages SET status = $1, sent_at = CASE WHEN $1 = 'sent' THEN CURRENT_TIMESTAMP ELSE sent_at END
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Mensagem não encontrada'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao atualizar status da mensagem:', error);
    res.status(500).json({
      error: 'Erro ao atualizar mensagem',
      message: error.message
    });
  }
});

export default router;
