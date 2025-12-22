/**
 * Rotas de Kanban
 */

import express from 'express';
import { queryCRM } from '../utils/db.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateId, validateListQuery } from '../middleware/validation.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

/**
 * Middleware de validação customizado
 */
function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Dados inválidos',
      errors: errors.array()
    });
  }
  next();
}

/**
 * GET /api/crm/v1/kanban/boards
 * Listar boards
 */
router.get('/boards', authenticateToken, validateListQuery, async (req, res) => {
  try {
    const { user_id } = req.query;
    const userId = user_id || req.user.id;

    let query = 'SELECT * FROM kanban_boards WHERE user_id = $1 OR user_id IS NULL';
    const params = [userId];

    if (req.user.role === 'admin') {
      query = 'SELECT * FROM kanban_boards';
      params.length = 0;
    }

    query += ' ORDER BY is_default DESC, created_at DESC';

    const result = await queryCRM(query, params);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Erro ao listar boards:', error);
    res.status(500).json({
      error: 'Erro ao listar boards',
      message: error.message
    });
  }
});

/**
 * GET /api/crm/v1/kanban/boards/:id
 * Obter board com colunas e cards
 */
router.get('/boards/:id', authenticateToken, validateId, async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar board
    const boardResult = await queryCRM(
      'SELECT * FROM kanban_boards WHERE id = $1',
      [id]
    );

    if (boardResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Board não encontrado'
      });
    }

    const board = boardResult.rows[0];

    // Buscar colunas ordenadas por position
    const columnsResult = await queryCRM(
      `SELECT * FROM kanban_columns 
       WHERE board_id = $1 
       ORDER BY position ASC`,
      [id]
    );

    // Buscar cards para cada coluna
    const columns = await Promise.all(
      columnsResult.rows.map(async (column) => {
        const cardsResult = await queryCRM(
          `SELECT 
            c.*,
            l.id as lead_id,
            l.email as lead_email,
            l.first_name as lead_first_name,
            l.last_name as lead_last_name,
            l.status as lead_status,
            l.stage as lead_stage
           FROM kanban_cards c
           LEFT JOIN leads l ON c.lead_id = l.id AND l.deleted_at IS NULL
           WHERE c.column_id = $1
           ORDER BY c.position ASC`,
          [column.id]
        );

        return {
          ...column,
          cards: cardsResult.rows
        };
      })
    );

    res.json({
      success: true,
      data: {
        ...board,
        columns
      }
    });
  } catch (error) {
    console.error('Erro ao obter board:', error);
    res.status(500).json({
      error: 'Erro ao obter board',
      message: error.message
    });
  }
});

/**
 * POST /api/crm/v1/kanban/boards
 * Criar board
 */
router.post('/boards', authenticateToken, [
  body('name')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Nome do board deve ter entre 1 e 255 caracteres'),
  body('description')
    .optional()
    .trim(),
  body('is_default')
    .optional()
    .isBoolean()
    .withMessage('is_default deve ser um boolean'),
  validateRequest
], async (req, res) => {
  try {
    const { name, description, is_default = false } = req.body;

    // Se for default, remover default de outros boards do usuário
    if (is_default) {
      await queryCRM(
        'UPDATE kanban_boards SET is_default = false WHERE user_id = $1',
        [req.user.id]
      );
    }

    const result = await queryCRM(
      `INSERT INTO kanban_boards (name, description, user_id, is_default)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, description || null, req.user.id, is_default]
    );

    const board = result.rows[0];

    // Criar colunas padrão
    const defaultColumns = [
      { name: 'Novos Leads', position: 0, color: '#3B82F6' },
      { name: 'Em Contato', position: 1, color: '#F59E0B' },
      { name: 'Qualificados', position: 2, color: '#10B981' },
      { name: 'Convertidos', position: 3, color: '#8B5CF6' }
    ];

    for (const col of defaultColumns) {
      await queryCRM(
        `INSERT INTO kanban_columns (board_id, name, position, color)
         VALUES ($1, $2, $3, $4)`,
        [board.id, col.name, col.position, col.color]
      );
    }

    res.status(201).json({
      success: true,
      message: 'Board criado com sucesso',
      data: board
    });
  } catch (error) {
    console.error('Erro ao criar board:', error);
    res.status(500).json({
      error: 'Erro ao criar board',
      message: error.message
    });
  }
});

/**
 * PUT /api/crm/v1/kanban/boards/:id
 * Atualizar board
 */
router.put('/boards/:id', authenticateToken, validateId, [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Nome do board deve ter entre 1 e 255 caracteres'),
  body('description')
    .optional()
    .trim(),
  body('is_default')
    .optional()
    .isBoolean(),
  validateRequest
], async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, is_default } = req.body;

    // Verificar se board existe e usuário tem permissão
    const boardResult = await queryCRM(
      'SELECT * FROM kanban_boards WHERE id = $1',
      [id]
    );

    if (boardResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Board não encontrado'
      });
    }

    const board = boardResult.rows[0];

    // Verificar permissão (admin pode editar qualquer board)
    if (req.user.role !== 'admin' && board.user_id !== req.user.id) {
      return res.status(403).json({
        error: 'Sem permissão para editar este board'
      });
    }

    // Se for default, remover default de outros boards
    if (is_default) {
      await queryCRM(
        'UPDATE kanban_boards SET is_default = false WHERE user_id = $1 AND id != $2',
        [req.user.id, id]
      );
    }

    const result = await queryCRM(
      `UPDATE kanban_boards SET
        name = COALESCE($1, name),
        description = $2,
        is_default = COALESCE($3, is_default),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING *`,
      [name, description !== undefined ? description : null, is_default, id]
    );

    res.json({
      success: true,
      message: 'Board atualizado com sucesso',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao atualizar board:', error);
    res.status(500).json({
      error: 'Erro ao atualizar board',
      message: error.message
    });
  }
});

/**
 * DELETE /api/crm/v1/kanban/boards/:id
 * Deletar board
 */
router.delete('/boards/:id', authenticateToken, validateId, async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se board existe e usuário tem permissão
    const boardResult = await queryCRM(
      'SELECT * FROM kanban_boards WHERE id = $1',
      [id]
    );

    if (boardResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Board não encontrado'
      });
    }

    const board = boardResult.rows[0];

    // Verificar permissão
    if (req.user.role !== 'admin' && board.user_id !== req.user.id) {
      return res.status(403).json({
        error: 'Sem permissão para deletar este board'
      });
    }

    // Deletar board (cascade vai deletar colunas e cards)
    await queryCRM(
      'DELETE FROM kanban_boards WHERE id = $1',
      [id]
    );

    res.json({
      success: true,
      message: 'Board deletado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar board:', error);
    res.status(500).json({
      error: 'Erro ao deletar board',
      message: error.message
    });
  }
});

/**
 * POST /api/crm/v1/kanban/columns
 * Criar coluna
 */
router.post('/columns', authenticateToken, [
  body('board_id')
    .isInt({ min: 1 })
    .withMessage('board_id é obrigatório e deve ser um número válido'),
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Nome da coluna deve ter entre 1 e 100 caracteres'),
  body('position')
    .optional()
    .isInt({ min: 0 }),
  body('color')
    .optional()
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage('Cor deve ser um código hexadecimal válido'),
  validateRequest
], async (req, res) => {
  try {
    const { board_id, name, position, color = '#3B82F6' } = req.body;

    // Verificar se board existe
    const boardResult = await queryCRM(
      'SELECT * FROM kanban_boards WHERE id = $1',
      [board_id]
    );

    if (boardResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Board não encontrado'
      });
    }

    // Se position não fornecido, pegar último position + 1
    let finalPosition = position;
    if (finalPosition === undefined) {
      const maxPositionResult = await queryCRM(
        'SELECT MAX(position) as max_position FROM kanban_columns WHERE board_id = $1',
        [board_id]
      );
      finalPosition = (maxPositionResult.rows[0].max_position || -1) + 1;
    }

    const result = await queryCRM(
      `INSERT INTO kanban_columns (board_id, name, position, color)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [board_id, name, finalPosition, color]
    );

    res.status(201).json({
      success: true,
      message: 'Coluna criada com sucesso',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao criar coluna:', error);
    res.status(500).json({
      error: 'Erro ao criar coluna',
      message: error.message
    });
  }
});

/**
 * PUT /api/crm/v1/kanban/columns/:id
 * Atualizar coluna
 */
router.put('/columns/:id', authenticateToken, validateId, [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 }),
  body('position')
    .optional()
    .isInt({ min: 0 }),
  body('color')
    .optional()
    .matches(/^#[0-9A-Fa-f]{6}$/),
  validateRequest
], async (req, res) => {
  try {
    const { id } = req.params;
    const { name, position, color } = req.body;

    // Verificar se coluna existe
    const columnResult = await queryCRM(
      'SELECT * FROM kanban_columns WHERE id = $1',
      [id]
    );

    if (columnResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Coluna não encontrada'
      });
    }

    const result = await queryCRM(
      `UPDATE kanban_columns SET
        name = COALESCE($1, name),
        position = COALESCE($2, position),
        color = COALESCE($3, color),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING *`,
      [name, position, color, id]
    );

    res.json({
      success: true,
      message: 'Coluna atualizada com sucesso',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao atualizar coluna:', error);
    res.status(500).json({
      error: 'Erro ao atualizar coluna',
      message: error.message
    });
  }
});

/**
 * DELETE /api/crm/v1/kanban/columns/:id
 * Deletar coluna
 */
router.delete('/columns/:id', authenticateToken, validateId, async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se coluna existe
    const columnResult = await queryCRM(
      'SELECT * FROM kanban_columns WHERE id = $1',
      [id]
    );

    if (columnResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Coluna não encontrada'
      });
    }

    // Deletar coluna (cascade vai deletar cards)
    await queryCRM(
      'DELETE FROM kanban_columns WHERE id = $1',
      [id]
    );

    res.json({
      success: true,
      message: 'Coluna deletada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar coluna:', error);
    res.status(500).json({
      error: 'Erro ao deletar coluna',
      message: error.message
    });
  }
});

/**
 * POST /api/crm/v1/kanban/cards
 * Criar card
 */
router.post('/cards', authenticateToken, [
  body('column_id')
    .isInt({ min: 1 })
    .withMessage('column_id é obrigatório'),
  body('title')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Título deve ter entre 1 e 255 caracteres'),
  body('description')
    .optional()
    .trim(),
  body('lead_id')
    .optional()
    .isInt({ min: 1 }),
  body('position')
    .optional()
    .isInt({ min: 0 }),
  validateRequest
], async (req, res) => {
  try {
    const { column_id, title, description, lead_id, position } = req.body;

    // Verificar se coluna existe
    const columnResult = await queryCRM(
      'SELECT * FROM kanban_columns WHERE id = $1',
      [column_id]
    );

    if (columnResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Coluna não encontrada'
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

    // Se position não fornecido, pegar último position + 1
    let finalPosition = position;
    if (finalPosition === undefined) {
      const maxPositionResult = await queryCRM(
        'SELECT MAX(position) as max_position FROM kanban_cards WHERE column_id = $1',
        [column_id]
      );
      finalPosition = (maxPositionResult.rows[0].max_position || -1) + 1;
    }

    const result = await queryCRM(
      `INSERT INTO kanban_cards (column_id, lead_id, title, description, position)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [column_id, lead_id || null, title, description || null, finalPosition]
    );

    res.status(201).json({
      success: true,
      message: 'Card criado com sucesso',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao criar card:', error);
    res.status(500).json({
      error: 'Erro ao criar card',
      message: error.message
    });
  }
});

/**
 * PATCH /api/crm/v1/kanban/cards/:id/move
 * Mover card entre colunas ou reposicionar
 */
router.patch('/cards/:id/move', authenticateToken, validateId, [
  body('column_id')
    .isInt({ min: 1 })
    .withMessage('column_id é obrigatório'),
  body('position')
    .optional()
    .isInt({ min: 0 }),
  validateRequest
], async (req, res) => {
  try {
    const { id } = req.params;
    const { column_id, position } = req.body;

    // Verificar se card existe
    const cardResult = await queryCRM(
      'SELECT * FROM kanban_cards WHERE id = $1',
      [id]
    );

    if (cardResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Card não encontrado'
      });
    }

    const oldColumnId = cardResult.rows[0].column_id;
    const oldPosition = cardResult.rows[0].position;

    // Verificar se nova coluna existe
    const columnResult = await queryCRM(
      'SELECT * FROM kanban_columns WHERE id = $1',
      [column_id]
    );

    if (columnResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Coluna não encontrada'
      });
    }

    // Se position não fornecido, adicionar no final
    let finalPosition = position;
    if (finalPosition === undefined) {
      const maxPositionResult = await queryCRM(
        'SELECT MAX(position) as max_position FROM kanban_cards WHERE column_id = $1',
        [column_id]
      );
      finalPosition = (maxPositionResult.rows[0].max_position || -1) + 1;
    }

    // Se moveu para outra coluna, ajustar posições
    if (oldColumnId !== column_id) {
      // Remover da posição antiga
      await queryCRM(
        'UPDATE kanban_cards SET position = position - 1 WHERE column_id = $1 AND position > $2',
        [oldColumnId, oldPosition]
      );

      // Abrir espaço na nova coluna
      await queryCRM(
        'UPDATE kanban_cards SET position = position + 1 WHERE column_id = $1 AND position >= $2',
        [column_id, finalPosition]
      );
    } else {
      // Mesma coluna, apenas reposicionar
      if (oldPosition < finalPosition) {
        await queryCRM(
          'UPDATE kanban_cards SET position = position - 1 WHERE column_id = $1 AND position > $2 AND position <= $3',
          [column_id, oldPosition, finalPosition]
        );
      } else if (oldPosition > finalPosition) {
        await queryCRM(
          'UPDATE kanban_cards SET position = position + 1 WHERE column_id = $1 AND position >= $2 AND position < $3',
          [column_id, finalPosition, oldPosition]
        );
      }
    }

    // Atualizar card
    const result = await queryCRM(
      `UPDATE kanban_cards SET
        column_id = $1,
        position = $2,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [column_id, finalPosition, id]
    );

    res.json({
      success: true,
      message: 'Card movido com sucesso',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao mover card:', error);
    res.status(500).json({
      error: 'Erro ao mover card',
      message: error.message
    });
  }
});

/**
 * PUT /api/crm/v1/kanban/cards/:id
 * Atualizar card
 */
router.put('/cards/:id', authenticateToken, validateId, [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 }),
  body('description')
    .optional()
    .trim(),
  body('lead_id')
    .optional()
    .isInt({ min: 1 }),
  validateRequest
], async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, lead_id } = req.body;

    // Verificar se card existe
    const cardResult = await queryCRM(
      'SELECT * FROM kanban_cards WHERE id = $1',
      [id]
    );

    if (cardResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Card não encontrado'
      });
    }

    // Verificar se lead existe (se fornecido)
    if (lead_id !== undefined) {
      if (lead_id === null) {
        // Permitir remover lead_id
      } else {
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
    }

    const result = await queryCRM(
      `UPDATE kanban_cards SET
        title = COALESCE($1, title),
        description = $2,
        lead_id = COALESCE($3, lead_id),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING *`,
      [title, description !== undefined ? description : null, lead_id, id]
    );

    res.json({
      success: true,
      message: 'Card atualizado com sucesso',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao atualizar card:', error);
    res.status(500).json({
      error: 'Erro ao atualizar card',
      message: error.message
    });
  }
});

/**
 * DELETE /api/crm/v1/kanban/cards/:id
 * Deletar card
 */
router.delete('/cards/:id', authenticateToken, validateId, async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se card existe
    const cardResult = await queryCRM(
      'SELECT * FROM kanban_cards WHERE id = $1',
      [id]
    );

    if (cardResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Card não encontrado'
      });
    }

    const columnId = cardResult.rows[0].column_id;
    const position = cardResult.rows[0].position;

    // Deletar card
    await queryCRM(
      'DELETE FROM kanban_cards WHERE id = $1',
      [id]
    );

    // Ajustar posições
    await queryCRM(
      'UPDATE kanban_cards SET position = position - 1 WHERE column_id = $1 AND position > $2',
      [columnId, position]
    );

    res.json({
      success: true,
      message: 'Card deletado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar card:', error);
    res.status(500).json({
      error: 'Erro ao deletar card',
      message: error.message
    });
  }
});

export default router;

