/**
 * Rotas de Tags
 */

import express from 'express';
import { queryCRM } from '../utils/db.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateTag, validateId, validateListQuery } from '../middleware/validation.js';

const router = express.Router();

/**
 * GET /api/crm/v1/tags
 * Listar tags
 */
router.get('/', authenticateToken, validateListQuery, async (req, res) => {
  try {
    const { page = 1, limit = 100, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = Math.min(parseInt(limit), 100);

    let query = 'SELECT * FROM tags WHERE deleted_at IS NULL';
    const params = [];
    let paramIndex = 1;

    if (search) {
      query += ` AND name ILIKE $${paramIndex++}`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY name ASC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limitNum, offset);

    const result = await queryCRM(query, params);

    // Contar total
    let countQuery = 'SELECT COUNT(*) as total FROM tags WHERE deleted_at IS NULL';
    const countParams = [];
    if (search) {
      countQuery += ` AND name ILIKE $1`;
      countParams.push(`%${search}%`);
    }
    const countResult = await queryCRM(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);

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
    console.error('Erro ao listar tags:', error);
    res.status(500).json({
      error: 'Erro ao listar tags',
      message: error.message
    });
  }
});

/**
 * GET /api/crm/v1/tags/:id
 * Obter tag por ID
 */
router.get('/:id', authenticateToken, validateId, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await queryCRM(
      'SELECT * FROM tags WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Tag não encontrada'
      });
    }

    // Contar quantos leads usam esta tag
    const countResult = await queryCRM(
      'SELECT COUNT(*) as count FROM lead_tags WHERE tag_id = $1',
      [id]
    );

    res.json({
      success: true,
      data: {
        ...result.rows[0],
        leads_count: parseInt(countResult.rows[0].count)
      }
    });
  } catch (error) {
    console.error('Erro ao obter tag:', error);
    res.status(500).json({
      error: 'Erro ao obter tag',
      message: error.message
    });
  }
});

/**
 * POST /api/crm/v1/tags
 * Criar tag
 */
router.post('/', authenticateToken, validateTag, async (req, res) => {
  try {
    const { name, color = '#3B82F6', description } = req.body;

    const result = await queryCRM(
      `INSERT INTO tags (name, color, description)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, color, description || null]
    );

    res.status(201).json({
      success: true,
      message: 'Tag criada com sucesso',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao criar tag:', error);
    
    if (error.code === '23505') { // Unique violation
      return res.status(409).json({
        error: 'Tag já existe',
        message: 'Já existe uma tag com este nome'
      });
    }

    res.status(500).json({
      error: 'Erro ao criar tag',
      message: error.message
    });
  }
});

/**
 * PUT /api/crm/v1/tags/:id
 * Atualizar tag
 */
router.put('/:id', authenticateToken, validateId, validateTag, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, color, description } = req.body;

    // Verificar se tag existe
    const existingResult = await queryCRM(
      'SELECT id FROM tags WHERE id = $1',
      [id]
    );

    if (existingResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Tag não encontrada'
      });
    }

    const result = await queryCRM(
      `UPDATE tags SET
        name = COALESCE($1, name),
        color = COALESCE($2, color),
        description = $3,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING *`,
      [name, color, description || null, id]
    );

    res.json({
      success: true,
      message: 'Tag atualizada com sucesso',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao atualizar tag:', error);
    
    if (error.code === '23505') { // Unique violation
      return res.status(409).json({
        error: 'Tag já existe',
        message: 'Já existe uma tag com este nome'
      });
    }

    res.status(500).json({
      error: 'Erro ao atualizar tag',
      message: error.message
    });
  }
});

/**
 * DELETE /api/crm/v1/tags/:id
 * Deletar tag
 */
router.delete('/:id', authenticateToken, validateId, async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se tag existe
    const existingResult = await queryCRM(
      'SELECT id FROM tags WHERE id = $1',
      [id]
    );

    if (existingResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Tag não encontrada'
      });
    }

    // Verificar se há leads usando esta tag
    const leadsCountResult = await queryCRM(
      'SELECT COUNT(*) as count FROM lead_tags WHERE tag_id = $1',
      [id]
    );

    const leadsCount = parseInt(leadsCountResult.rows[0].count);

    // Deletar tag (cascata vai remover os relacionamentos)
    await queryCRM(
      'DELETE FROM tags WHERE id = $1',
      [id]
    );

    res.json({
      success: true,
      message: 'Tag deletada com sucesso',
      data: {
        removed_from_leads: leadsCount
      }
    });
  } catch (error) {
    console.error('Erro ao deletar tag:', error);
    res.status(500).json({
      error: 'Erro ao deletar tag',
      message: error.message
    });
  }
});

export default router;

