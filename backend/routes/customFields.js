/**
 * Rotas de Campos Customizados
 */

import express from 'express';
import { queryCRM } from '../utils/db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { validateCustomField, validateId, validateListQuery } from '../middleware/validation.js';

const router = express.Router();

/**
 * GET /api/crm/v1/custom-fields
 * Listar campos customizados
 */
router.get('/', authenticateToken, validateListQuery, async (req, res) => {
  try {
    const { page = 1, limit = 100, search, applies_to, is_active } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const limitNum = Math.min(parseInt(limit, 10), 100);

    let query = 'SELECT * FROM custom_fields WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (search) {
      query += ` AND (label ILIKE $${paramIndex} OR field_key ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex += 1;
    }

    if (applies_to) {
      query += ` AND applies_to = $${paramIndex++}`;
      params.push(applies_to);
    }

    if (is_active !== undefined) {
      query += ` AND is_active = $${paramIndex++}`;
      params.push(is_active === 'true');
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limitNum, offset);

    const result = await queryCRM(query, params);

    const countResult = await queryCRM(
      'SELECT COUNT(*) as total FROM custom_fields',
      []
    );
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
    console.error('Erro ao listar campos customizados:', error);
    res.status(500).json({
      error: 'Erro ao listar campos customizados',
      message: error.message
    });
  }
});

/**
 * GET /api/crm/v1/custom-fields/:id
 */
router.get('/:id', authenticateToken, validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await queryCRM('SELECT * FROM custom_fields WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Campo não encontrado'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao obter campo customizado:', error);
    res.status(500).json({
      error: 'Erro ao obter campo customizado',
      message: error.message
    });
  }
});

/**
 * POST /api/crm/v1/custom-fields
 */
router.post('/', authenticateToken, requireRole('admin'), validateCustomField, async (req, res) => {
  try {
    const {
      field_key,
      label,
      field_type,
      options = [],
      applies_to,
      is_required = false,
      is_active = true
    } = req.body;

    const result = await queryCRM(
      `INSERT INTO custom_fields (field_key, label, field_type, options, applies_to, is_required, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [field_key, label, field_type, options, applies_to, is_required, is_active]
    );

    res.status(201).json({
      success: true,
      message: 'Campo customizado criado com sucesso',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao criar campo customizado:', error);
    res.status(500).json({
      error: 'Erro ao criar campo customizado',
      message: error.message
    });
  }
});

/**
 * PUT /api/crm/v1/custom-fields/:id
 */
router.put('/:id', authenticateToken, requireRole('admin'), validateId, validateCustomField, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      label,
      field_type,
      options = [],
      applies_to,
      is_required,
      is_active
    } = req.body;

    const existing = await queryCRM('SELECT id FROM custom_fields WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({
        error: 'Campo não encontrado'
      });
    }

    const result = await queryCRM(
      `UPDATE custom_fields SET
        label = $1,
        field_type = $2,
        options = $3,
        applies_to = $4,
        is_required = $5,
        is_active = $6,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING *`,
      [label, field_type, options, applies_to, is_required, is_active, id]
    );

    res.json({
      success: true,
      message: 'Campo customizado atualizado com sucesso',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao atualizar campo customizado:', error);
    res.status(500).json({
      error: 'Erro ao atualizar campo customizado',
      message: error.message
    });
  }
});

/**
 * DELETE /api/crm/v1/custom-fields/:id
 */
router.delete('/:id', authenticateToken, requireRole('admin'), validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await queryCRM('SELECT id FROM custom_fields WHERE id = $1', [id]);

    if (existing.rows.length === 0) {
      return res.status(404).json({
        error: 'Campo não encontrado'
      });
    }

    await queryCRM('UPDATE custom_fields SET is_active = false WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Campo desativado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao desativar campo customizado:', error);
    res.status(500).json({
      error: 'Erro ao desativar campo customizado',
      message: error.message
    });
  }
});

export default router;
