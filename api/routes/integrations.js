/**
 * Rotas de Integracoes
 */

import express from 'express';
import { queryCRM } from '../utils/db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { validateIntegration, validateId, validateListQuery } from '../middleware/validation.js';

const router = express.Router();

router.get('/', authenticateToken, validateListQuery, async (req, res) => {
  try {
    const { page = 1, limit = 100 } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const limitNum = Math.min(parseInt(limit, 10), 100);

    const result = await queryCRM(
      'SELECT * FROM integrations ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limitNum, offset]
    );
    const countResult = await queryCRM('SELECT COUNT(*) as total FROM integrations', []);
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
    console.error('Erro ao listar integracoes:', error);
    res.status(500).json({
      error: 'Erro ao listar integracoes',
      message: error.message
    });
  }
});

router.post('/', authenticateToken, requireRole('admin', 'manager'), validateIntegration, async (req, res) => {
  try {
    const { integration_type, name, status = 'inactive', settings = {} } = req.body;

    const result = await queryCRM(
      `INSERT INTO integrations (integration_type, name, status, settings, created_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [integration_type, name, status, settings, req.user?.id || null]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao criar integracao:', error);
    res.status(500).json({
      error: 'Erro ao criar integracao',
      message: error.message
    });
  }
});

router.put('/:id', authenticateToken, requireRole('admin', 'manager'), validateId, validateIntegration, async (req, res) => {
  try {
    const { id } = req.params;
    const { integration_type, name, status, settings = {} } = req.body;

    const existing = await queryCRM('SELECT id FROM integrations WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({
        error: 'Integracao nao encontrada'
      });
    }

    const result = await queryCRM(
      `UPDATE integrations SET integration_type = $1, name = $2, status = $3, settings = $4, updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING *`,
      [integration_type, name, status, settings, id]
    );

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao atualizar integracao:', error);
    res.status(500).json({
      error: 'Erro ao atualizar integracao',
      message: error.message
    });
  }
});

router.delete('/:id', authenticateToken, requireRole('admin'), validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await queryCRM('SELECT id FROM integrations WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({
        error: 'Integracao nao encontrada'
      });
    }

    await queryCRM('DELETE FROM integrations WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Integracao removida'
    });
  } catch (error) {
    console.error('Erro ao remover integracao:', error);
    res.status(500).json({
      error: 'Erro ao remover integracao',
      message: error.message
    });
  }
});

export default router;
