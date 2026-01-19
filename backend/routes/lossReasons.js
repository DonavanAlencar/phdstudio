/**
 * Rotas de Motivos de Perda
 */

import express from 'express';
import { queryCRM } from '../utils/db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { validateLossReason, validateId, validateListQuery } from '../middleware/validation.js';

const router = express.Router();

router.get('/', authenticateToken, validateListQuery, async (req, res) => {
  try {
    const { page = 1, limit = 100, search } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const limitNum = Math.min(parseInt(limit, 10), 100);

    let query = 'SELECT * FROM loss_reasons WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (search) {
      query += ` AND name ILIKE $${paramIndex++}`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limitNum, offset);

    const result = await queryCRM(query, params);
    const countResult = await queryCRM('SELECT COUNT(*) as total FROM loss_reasons', []);
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
    console.error('Erro ao listar motivos de perda:', error);
    res.status(500).json({
      error: 'Erro ao listar motivos de perda',
      message: error.message
    });
  }
});

router.post('/', authenticateToken, requireRole('admin', 'manager'), validateLossReason, async (req, res) => {
  try {
    const { name, description, is_active = true } = req.body;
    const result = await queryCRM(
      `INSERT INTO loss_reasons (name, description, is_active)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, description || null, is_active]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao criar motivo:', error);
    res.status(500).json({
      error: 'Erro ao criar motivo',
      message: error.message
    });
  }
});

router.put('/:id', authenticateToken, requireRole('admin', 'manager'), validateId, validateLossReason, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, is_active } = req.body;

    const existing = await queryCRM('SELECT id FROM loss_reasons WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({
        error: 'Motivo não encontrado'
      });
    }

    const result = await queryCRM(
      `UPDATE loss_reasons SET name = $1, description = $2, is_active = $3, updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING *`,
      [name, description || null, is_active, id]
    );

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao atualizar motivo:', error);
    res.status(500).json({
      error: 'Erro ao atualizar motivo',
      message: error.message
    });
  }
});

router.delete('/:id', authenticateToken, requireRole('admin'), validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await queryCRM('SELECT id FROM loss_reasons WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({
        error: 'Motivo não encontrado'
      });
    }

    await queryCRM('UPDATE loss_reasons SET is_active = false WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Motivo desativado'
    });
  } catch (error) {
    console.error('Erro ao desativar motivo:', error);
    res.status(500).json({
      error: 'Erro ao desativar motivo',
      message: error.message
    });
  }
});

export default router;
