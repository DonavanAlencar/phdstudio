/**
 * Rotas de Deals (Oportunidades)
 */

import express from 'express';
import { queryCRM } from '../utils/db.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateDeal, validateId, validateListQuery } from '../middleware/validation.js';

const router = express.Router();

/**
 * GET /api/crm/v1/deals
 */
router.get('/', authenticateToken, validateListQuery, async (req, res) => {
  try {
    const { page = 1, limit = 100, status, pipeline_id, stage_id, search } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const limitNum = Math.min(parseInt(limit, 10), 100);

    let query = `
      SELECT d.*, l.email as lead_email, l.first_name as lead_first_name, l.last_name as lead_last_name
      FROM deals d
      INNER JOIN leads l ON l.id = d.lead_id
      WHERE d.deleted_at IS NULL
    `;
    const params = [];
    let paramIndex = 1;

    if (status) {
      query += ` AND d.status = $${paramIndex++}`;
      params.push(status);
    }

    if (pipeline_id) {
      query += ` AND d.pipeline_id = $${paramIndex++}`;
      params.push(pipeline_id);
    }

    if (stage_id) {
      query += ` AND d.stage_id = $${paramIndex++}`;
      params.push(stage_id);
    }

    if (search) {
      query += ` AND (d.title ILIKE $${paramIndex} OR l.email ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex += 1;
    }

    query += ` ORDER BY d.created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limitNum, offset);

    const result = await queryCRM(query, params);
    const countResult = await queryCRM('SELECT COUNT(*) as total FROM deals WHERE deleted_at IS NULL', []);
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
    console.error('Erro ao listar deals:', error);
    res.status(500).json({
      error: 'Erro ao listar deals',
      message: error.message
    });
  }
});

/**
 * GET /api/crm/v1/deals/:id
 */
router.get('/:id', authenticateToken, validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await queryCRM(
      `SELECT d.*, l.email as lead_email, l.first_name as lead_first_name, l.last_name as lead_last_name
       FROM deals d
       INNER JOIN leads l ON l.id = d.lead_id
       WHERE d.id = $1 AND d.deleted_at IS NULL`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Deal não encontrado'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao obter deal:', error);
    res.status(500).json({
      error: 'Erro ao obter deal',
      message: error.message
    });
  }
});

/**
 * POST /api/crm/v1/deals
 */
router.post('/', authenticateToken, validateDeal, async (req, res) => {
  try {
    const {
      lead_id,
      pipeline_id,
      stage_id,
      title,
      value,
      currency = 'BRL',
      expected_close_date,
      status = 'open',
      loss_reason_id,
      owner_id
    } = req.body;

    const dealResult = await queryCRM(
      `INSERT INTO deals (lead_id, pipeline_id, stage_id, title, value, currency, expected_close_date, status, loss_reason_id, owner_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        lead_id,
        pipeline_id,
        stage_id || null,
        title,
        value || 0,
        currency,
        expected_close_date || null,
        status,
        loss_reason_id || null,
        owner_id || req.user?.id || null
      ]
    );

    await queryCRM(
      `INSERT INTO lead_events (lead_id, deal_id, event_type, title, description, metadata, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        lead_id,
        dealResult.rows[0].id,
        'deal',
        'Deal criado',
        title,
        { value, status },
        req.user?.id || null
      ]
    );

    res.status(201).json({
      success: true,
      data: dealResult.rows[0]
    });
  } catch (error) {
    console.error('Erro ao criar deal:', error);
    res.status(500).json({
      error: 'Erro ao criar deal',
      message: error.message
    });
  }
});

/**
 * PUT /api/crm/v1/deals/:id
 */
router.put('/:id', authenticateToken, validateId, validateDeal, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      pipeline_id,
      stage_id,
      title,
      value,
      currency,
      expected_close_date,
      status,
      loss_reason_id,
      owner_id
    } = req.body;

    const existing = await queryCRM('SELECT * FROM deals WHERE id = $1 AND deleted_at IS NULL', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({
        error: 'Deal não encontrado'
      });
    }

    const result = await queryCRM(
      `UPDATE deals SET
        pipeline_id = $1,
        stage_id = $2,
        title = $3,
        value = $4,
        currency = $5,
        expected_close_date = $6,
        status = $7,
        loss_reason_id = $8,
        owner_id = $9,
        closed_at = CASE WHEN $7 IN ('won', 'lost') THEN CURRENT_TIMESTAMP ELSE NULL END,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $10
       RETURNING *`,
      [
        pipeline_id,
        stage_id || null,
        title,
        value || 0,
        currency || 'BRL',
        expected_close_date || null,
        status || existing.rows[0].status,
        loss_reason_id || null,
        owner_id || existing.rows[0].owner_id,
        id
      ]
    );

    await queryCRM(
      `INSERT INTO lead_events (lead_id, deal_id, event_type, title, description, metadata, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        existing.rows[0].lead_id,
        id,
        'deal_update',
        'Deal atualizado',
        title,
        { status: status || existing.rows[0].status },
        req.user?.id || null
      ]
    );

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao atualizar deal:', error);
    res.status(500).json({
      error: 'Erro ao atualizar deal',
      message: error.message
    });
  }
});

/**
 * DELETE /api/crm/v1/deals/:id
 */
router.delete('/:id', authenticateToken, validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await queryCRM('SELECT id FROM deals WHERE id = $1 AND deleted_at IS NULL', [id]);

    if (existing.rows.length === 0) {
      return res.status(404).json({
        error: 'Deal não encontrado'
      });
    }

    await queryCRM('UPDATE deals SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Deal removido'
    });
  } catch (error) {
    console.error('Erro ao remover deal:', error);
    res.status(500).json({
      error: 'Erro ao remover deal',
      message: error.message
    });
  }
});

export default router;
