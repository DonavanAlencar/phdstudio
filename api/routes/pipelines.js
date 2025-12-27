/**
 * Rotas de Pipelines
 */

import express from 'express';
import { queryCRM } from '../utils/db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { validatePipeline, validatePipelineStage, validateId } from '../middleware/validation.js';

const router = express.Router();

/**
 * GET /api/crm/v1/pipelines
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const pipelinesResult = await queryCRM('SELECT * FROM pipelines ORDER BY created_at ASC', []);
    const stagesResult = await queryCRM('SELECT * FROM pipeline_stages ORDER BY position ASC', []);

    const stagesByPipeline = stagesResult.rows.reduce((acc, stage) => {
      if (!acc[stage.pipeline_id]) {
        acc[stage.pipeline_id] = [];
      }
      acc[stage.pipeline_id].push(stage);
      return acc;
    }, {});

    const pipelines = pipelinesResult.rows.map((pipeline) => ({
      ...pipeline,
      stages: stagesByPipeline[pipeline.id] || []
    }));

    res.json({
      success: true,
      data: pipelines
    });
  } catch (error) {
    console.error('Erro ao listar pipelines:', error);
    res.status(500).json({
      error: 'Erro ao listar pipelines',
      message: error.message
    });
  }
});

/**
 * POST /api/crm/v1/pipelines
 */
router.post('/', authenticateToken, requireRole('admin', 'manager'), validatePipeline, async (req, res) => {
  try {
    const { name, pipeline_type, is_default = false } = req.body;

    if (is_default) {
      await queryCRM('UPDATE pipelines SET is_default = false WHERE pipeline_type = $1', [pipeline_type]);
    }

    const result = await queryCRM(
      `INSERT INTO pipelines (name, pipeline_type, is_default)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, pipeline_type, is_default]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao criar pipeline:', error);
    res.status(500).json({
      error: 'Erro ao criar pipeline',
      message: error.message
    });
  }
});

/**
 * PUT /api/crm/v1/pipelines/:id
 */
router.put('/:id', authenticateToken, requireRole('admin', 'manager'), validateId, validatePipeline, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, pipeline_type, is_default = false } = req.body;

    const existing = await queryCRM('SELECT * FROM pipelines WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({
        error: 'Pipeline não encontrado'
      });
    }

    if (is_default) {
      await queryCRM('UPDATE pipelines SET is_default = false WHERE pipeline_type = $1 AND id != $2', [pipeline_type, id]);
    }

    const result = await queryCRM(
      `UPDATE pipelines SET name = $1, pipeline_type = $2, is_default = $3, updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING *`,
      [name, pipeline_type, is_default, id]
    );

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao atualizar pipeline:', error);
    res.status(500).json({
      error: 'Erro ao atualizar pipeline',
      message: error.message
    });
  }
});

/**
 * DELETE /api/crm/v1/pipelines/:id
 */
router.delete('/:id', authenticateToken, requireRole('admin'), validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await queryCRM('SELECT id FROM pipelines WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({
        error: 'Pipeline não encontrado'
      });
    }

    await queryCRM('DELETE FROM pipelines WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Pipeline removido com sucesso'
    });
  } catch (error) {
    console.error('Erro ao remover pipeline:', error);
    res.status(500).json({
      error: 'Erro ao remover pipeline',
      message: error.message
    });
  }
});

/**
 * POST /api/crm/v1/pipelines/:id/stages
 */
router.post('/:id/stages', authenticateToken, requireRole('admin', 'manager'), validateId, validatePipelineStage, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, position, color, is_won = false, is_lost = false } = req.body;

    const pipeline = await queryCRM('SELECT id FROM pipelines WHERE id = $1', [id]);
    if (pipeline.rows.length === 0) {
      return res.status(404).json({
        error: 'Pipeline não encontrado'
      });
    }

    const result = await queryCRM(
      `INSERT INTO pipeline_stages (pipeline_id, name, position, color, is_won, is_lost)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [id, name, position, color || '#3B82F6', is_won, is_lost]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao criar etapa:', error);
    res.status(500).json({
      error: 'Erro ao criar etapa',
      message: error.message
    });
  }
});

/**
 * PUT /api/crm/v1/pipelines/stages/:id
 */
router.put('/stages/:id', authenticateToken, requireRole('admin', 'manager'), validateId, validatePipelineStage, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, position, color, is_won = false, is_lost = false } = req.body;

    const existing = await queryCRM('SELECT id FROM pipeline_stages WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({
        error: 'Etapa não encontrada'
      });
    }

    const result = await queryCRM(
      `UPDATE pipeline_stages SET name = $1, position = $2, color = $3, is_won = $4, is_lost = $5, updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING *`,
      [name, position, color || '#3B82F6', is_won, is_lost, id]
    );

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao atualizar etapa:', error);
    res.status(500).json({
      error: 'Erro ao atualizar etapa',
      message: error.message
    });
  }
});

/**
 * DELETE /api/crm/v1/pipelines/stages/:id
 */
router.delete('/stages/:id', authenticateToken, requireRole('admin'), validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await queryCRM('SELECT id FROM pipeline_stages WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({
        error: 'Etapa não encontrada'
      });
    }

    await queryCRM('DELETE FROM pipeline_stages WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Etapa removida'
    });
  } catch (error) {
    console.error('Erro ao remover etapa:', error);
    res.status(500).json({
      error: 'Erro ao remover etapa',
      message: error.message
    });
  }
});

export default router;
