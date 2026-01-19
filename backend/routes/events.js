/**
 * Rotas de eventos do Lead (timeline)
 */

import express from 'express';
import { queryCRM } from '../utils/db.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateId } from '../middleware/validation.js';

const router = express.Router();

/**
 * GET /api/crm/v1/leads/:id/timeline
 */
router.get('/leads/:id/timeline', authenticateToken, validateId, async (req, res) => {
  try {
    const { id } = req.params;

    const leadResult = await queryCRM('SELECT id FROM leads WHERE id = $1 AND deleted_at IS NULL', [id]);
    if (leadResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Lead não encontrado'
      });
    }

    const eventsResult = await queryCRM(
      `SELECT id, lead_id, deal_id, event_type, title, description, metadata, created_by, created_at
       FROM lead_events
       WHERE lead_id = $1
       ORDER BY created_at DESC`,
      [id]
    );

    const messagesResult = await queryCRM(
      `SELECT id, lead_id, deal_id, channel, direction, subject, body, status, metadata, created_at
       FROM messages
       WHERE lead_id = $1
       ORDER BY created_at DESC`,
      [id]
    );

    res.json({
      success: true,
      data: {
        events: eventsResult.rows,
        messages: messagesResult.rows
      }
    });
  } catch (error) {
    console.error('Erro ao carregar timeline:', error);
    res.status(500).json({
      error: 'Erro ao carregar timeline',
      message: error.message
    });
  }
});

export default router;
