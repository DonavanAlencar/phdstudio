/**
 * Rotas de Atividades
 */

import express from 'express';
import { queryCRM } from '../utils/db.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateActivity, validateId, validateListQuery } from '../middleware/validation.js';

const router = express.Router();

/**
 * GET /api/crm/v1/activities
 * Listar atividades com filtros
 */
router.get('/', authenticateToken, validateListQuery, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      lead_id,
      user_id,
      type,
      completed
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = Math.min(parseInt(limit), 100);

    // Construir query dinâmica
    let whereConditions = [];
    const queryParams = [];
    let paramIndex = 1;

    if (lead_id) {
      whereConditions.push(`a.lead_id = $${paramIndex++}`);
      queryParams.push(parseInt(lead_id));
    }

    if (user_id) {
      whereConditions.push(`a.user_id = $${paramIndex++}`);
      queryParams.push(parseInt(user_id));
    }

    if (type) {
      whereConditions.push(`a.type = $${paramIndex++}`);
      queryParams.push(type);
    }

    if (completed !== undefined) {
      if (completed === 'true' || completed === true) {
        whereConditions.push(`a.completed_at IS NOT NULL`);
      } else {
        whereConditions.push(`a.completed_at IS NULL`);
      }
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';

    // Query para contar total
    const countQuery = `
      SELECT COUNT(*) as total
      FROM activities a
      ${whereClause}
    `;
    const countResult = await queryCRM(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].total);

    // Query para buscar atividades
    const dataQuery = `
      SELECT 
        a.*,
        l.email as lead_email,
        l.first_name as lead_first_name,
        l.last_name as lead_last_name,
        u.first_name as user_first_name,
        u.last_name as user_last_name,
        u.email as user_email
      FROM activities a
      LEFT JOIN leads l ON a.lead_id = l.id
      LEFT JOIN users u ON a.user_id = u.id
      ${whereClause}
      ORDER BY 
        CASE WHEN a.completed_at IS NULL THEN 0 ELSE 1 END,
        a.due_date ASC NULLS LAST,
        a.created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

    queryParams.push(limitNum, offset);
    const result = await queryCRM(dataQuery, queryParams);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Erro ao listar atividades:', error);
    res.status(500).json({
      error: 'Erro ao listar atividades',
      message: error.message
    });
  }
});

/**
 * GET /api/crm/v1/activities/:id
 * Obter atividade por ID
 */
router.get('/:id', authenticateToken, validateId, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await queryCRM(
      `SELECT 
        a.*,
        l.email as lead_email,
        l.first_name as lead_first_name,
        l.last_name as lead_last_name,
        u.first_name as user_first_name,
        u.last_name as user_last_name,
        u.email as user_email
       FROM activities a
       LEFT JOIN leads l ON a.lead_id = l.id
       LEFT JOIN users u ON a.user_id = u.id
       WHERE a.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Atividade não encontrada'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao obter atividade:', error);
    res.status(500).json({
      error: 'Erro ao obter atividade',
      message: error.message
    });
  }
});

/**
 * POST /api/crm/v1/activities
 * Criar atividade
 */
router.post('/', authenticateToken, validateActivity, async (req, res) => {
  try {
    const {
      lead_id,
      type,
      title,
      description,
      due_date,
      user_id
    } = req.body;

    // Verificar se lead existe
    const leadResult = await queryCRM(
      'SELECT id FROM leads WHERE id = $1 AND deleted_at IS NULL',
      [lead_id]
    );

    if (leadResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Lead não encontrado'
      });
    }

    // Usar user_id da requisição ou do usuário autenticado
    const activityUserId = user_id || req.user.id;

    const result = await queryCRM(
      `INSERT INTO activities 
       (lead_id, user_id, type, title, description, due_date)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        lead_id,
        activityUserId,
        type,
        title,
        description || null,
        due_date ? new Date(due_date) : null
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Atividade criada com sucesso',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao criar atividade:', error);
    res.status(500).json({
      error: 'Erro ao criar atividade',
      message: error.message
    });
  }
});

/**
 * PUT /api/crm/v1/activities/:id
 * Atualizar atividade
 */
router.put('/:id', authenticateToken, validateId, validateActivity, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      lead_id,
      type,
      title,
      description,
      due_date,
      user_id
    } = req.body;

    // Verificar se atividade existe
    const existingResult = await queryCRM(
      'SELECT id FROM activities WHERE id = $1',
      [id]
    );

    if (existingResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Atividade não encontrada'
      });
    }

    // Verificar se lead existe (se fornecido)
    if (lead_id) {
      const leadResult = await queryCRM(
        'SELECT id FROM leads WHERE id = $1 AND deleted_at IS NULL',
        [lead_id]
      );

      if (leadResult.rows.length === 0) {
        return res.status(404).json({
          error: 'Lead não encontrado'
        });
      }
    }

    const result = await queryCRM(
      `UPDATE activities SET
        lead_id = COALESCE($1, lead_id),
        type = COALESCE($2, type),
        title = COALESCE($3, title),
        description = $4,
        due_date = $5,
        user_id = COALESCE($6, user_id),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING *`,
      [
        lead_id || null,
        type || null,
        title || null,
        description !== undefined ? description : null,
        due_date ? new Date(due_date) : null,
        user_id || null,
        id
      ]
    );

    res.json({
      success: true,
      message: 'Atividade atualizada com sucesso',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao atualizar atividade:', error);
    res.status(500).json({
      error: 'Erro ao atualizar atividade',
      message: error.message
    });
  }
});

/**
 * PATCH /api/crm/v1/activities/:id/complete
 * Completar atividade
 */
router.patch('/:id/complete', authenticateToken, validateId, async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se atividade existe
    const existingResult = await queryCRM(
      'SELECT id, completed_at FROM activities WHERE id = $1',
      [id]
    );

    if (existingResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Atividade não encontrada'
      });
    }

    const activity = existingResult.rows[0];
    const isAlreadyCompleted = activity.completed_at !== null;

    // Alternar status de completado
    const completedAt = isAlreadyCompleted ? null : new Date();

    const result = await queryCRM(
      `UPDATE activities SET
        completed_at = $1,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [completedAt, id]
    );

    res.json({
      success: true,
      message: isAlreadyCompleted 
        ? 'Atividade marcada como não completada' 
        : 'Atividade completada com sucesso',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao completar atividade:', error);
    res.status(500).json({
      error: 'Erro ao completar atividade',
      message: error.message
    });
  }
});

/**
 * DELETE /api/crm/v1/activities/:id
 * Deletar atividade
 */
router.delete('/:id', authenticateToken, validateId, async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se atividade existe
    const existingResult = await queryCRM(
      'SELECT id FROM activities WHERE id = $1',
      [id]
    );

    if (existingResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Atividade não encontrada'
      });
    }

    await queryCRM(
      'DELETE FROM activities WHERE id = $1',
      [id]
    );

    res.json({
      success: true,
      message: 'Atividade deletada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar atividade:', error);
    res.status(500).json({
      error: 'Erro ao deletar atividade',
      message: error.message
    });
  }
});

export default router;

