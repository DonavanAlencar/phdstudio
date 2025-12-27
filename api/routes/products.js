/**
 * Rotas de Produtos (CRM)
 */

import express from 'express';
import { queryCRM } from '../utils/db.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateProduct, validateId, validateListQuery } from '../middleware/validation.js';

const router = express.Router();

/**
 * @swagger
 * /api/crm/v1/products:
 *   get:
 *     summary: Listar produtos
 *     tags: [Produtos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Página da listagem
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Itens por página
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Busca por nome ou categoria
 *     responses:
 *       200:
 *         description: Lista de produtos
 *       401:
 *         description: Não autenticado
 *       500:
 *         description: Erro interno
 */
/**
 * GET /api/crm/v1/products
 * Listar produtos
 */
router.get('/', authenticateToken, validateListQuery, async (req, res) => {
  try {
    const { page = 1, limit = 100, search } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const limitNum = Math.min(parseInt(limit, 10), 100);

    let query = 'SELECT * FROM products WHERE deleted_at IS NULL';
    const params = [];
    let paramIndex = 1;

    if (search) {
      query += ` AND (nome ILIKE $${paramIndex} OR categoria ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex += 1;
    }

    query += ` ORDER BY categoria ASC, nome ASC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limitNum, offset);

    const result = await queryCRM(query, params);

    let countQuery = 'SELECT COUNT(*) as total FROM products WHERE deleted_at IS NULL';
    const countParams = [];
    if (search) {
      countQuery += ' AND (nome ILIKE $1 OR categoria ILIKE $1)';
      countParams.push(`%${search}%`);
    }

    const countResult = await queryCRM(countQuery, countParams);
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
    console.error('Erro ao listar produtos:', error);
    res.status(500).json({
      error: 'Erro ao listar produtos',
      message: error.message
    });
  }
});

/**
 * @swagger
 * /api/crm/v1/products/{id}:
 *   get:
 *     summary: Obter produto por ID
 *     tags: [Produtos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Produto encontrado
 *       401:
 *         description: Não autenticado
 *       404:
 *         description: Produto não encontrado
 */
/**
 * GET /api/crm/v1/products/:id
 * Obter produto por ID
 */
router.get('/:id', authenticateToken, validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await queryCRM(
      'SELECT * FROM products WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Produto não encontrado'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao obter produto:', error);
    res.status(500).json({
      error: 'Erro ao obter produto',
      message: error.message
    });
  }
});

/**
 * @swagger
 * /api/crm/v1/products:
 *   post:
 *     summary: Criar produto
 *     tags: [Produtos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - categoria
 *             properties:
 *               nome:
 *                 type: string
 *               categoria:
 *                 type: string
 *               atributos:
 *                 type: object
 *               preco_estimado:
 *                 type: string
 *               foto_url:
 *                 type: string
 *     responses:
 *       201:
 *         description: Produto criado
 *       401:
 *         description: Não autenticado
 */
/**
 * POST /api/crm/v1/products
 * Criar produto
 */
router.post('/', authenticateToken, validateProduct, async (req, res) => {
  try {
    const {
      nome,
      categoria,
      atributos = {},
      preco_estimado,
      foto_url
    } = req.body;

    const result = await queryCRM(
      `INSERT INTO products (nome, categoria, atributos, preco_estimado, foto_url)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        nome,
        categoria,
        atributos,
        preco_estimado || null,
        foto_url || null
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Produto criado com sucesso',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    res.status(500).json({
      error: 'Erro ao criar produto',
      message: error.message
    });
  }
});

/**
 * @swagger
 * /api/crm/v1/products/{id}:
 *   put:
 *     summary: Atualizar produto
 *     tags: [Produtos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - categoria
 *             properties:
 *               nome:
 *                 type: string
 *               categoria:
 *                 type: string
 *               atributos:
 *                 type: object
 *               preco_estimado:
 *                 type: string
 *               foto_url:
 *                 type: string
 *     responses:
 *       200:
 *         description: Produto atualizado
 *       401:
 *         description: Não autenticado
 *       404:
 *         description: Produto não encontrado
 */
/**
 * PUT /api/crm/v1/products/:id
 * Atualizar produto
 */
router.put('/:id', authenticateToken, validateId, validateProduct, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nome,
      categoria,
      atributos = {},
      preco_estimado,
      foto_url
    } = req.body;

    const existing = await queryCRM(
      'SELECT id FROM products WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        error: 'Produto não encontrado'
      });
    }

    const result = await queryCRM(
      `UPDATE products SET
        nome = $1,
        categoria = $2,
        atributos = $3,
        preco_estimado = $4,
        foto_url = $5,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING *`,
      [
        nome,
        categoria,
        atributos,
        preco_estimado || null,
        foto_url || null,
        id
      ]
    );

    res.json({
      success: true,
      message: 'Produto atualizado com sucesso',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    res.status(500).json({
      error: 'Erro ao atualizar produto',
      message: error.message
    });
  }
});

/**
 * @swagger
 * /api/crm/v1/products/{id}:
 *   delete:
 *     summary: Remover produto
 *     tags: [Produtos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Produto removido
 *       401:
 *         description: Não autenticado
 *       404:
 *         description: Produto não encontrado
 */
/**
 * DELETE /api/crm/v1/products/:id
 * Excluir produto (soft delete)
 */
router.delete('/:id', authenticateToken, validateId, async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await queryCRM(
      'SELECT id FROM products WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        error: 'Produto não encontrado'
      });
    }

    await queryCRM(
      'UPDATE products SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );

    res.json({
      success: true,
      message: 'Produto removido com sucesso'
    });
  } catch (error) {
    console.error('Erro ao remover produto:', error);
    res.status(500).json({
      error: 'Erro ao remover produto',
      message: error.message
    });
  }
});

export default router;
