/**
 * Rotas de perfil do usuario
 */

import express from 'express';
import bcrypt from 'bcryptjs';
import { queryCRM } from '../utils/db.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateProfile, validatePasswordChange } from '../middleware/validation.js';

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await queryCRM(
      'SELECT id, email, first_name, last_name, role, avatar_url, notification_prefs FROM users WHERE id = $1',
      [req.user.id]
    );

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao carregar perfil:', error);
    res.status(500).json({
      error: 'Erro ao carregar perfil',
      message: error.message
    });
  }
});

router.put('/', authenticateToken, validateProfile, async (req, res) => {
  try {
    const { first_name, last_name, avatar_url, notification_prefs } = req.body;

    const result = await queryCRM(
      `UPDATE users SET first_name = $1, last_name = $2, avatar_url = $3, notification_prefs = $4, updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING id, email, first_name, last_name, role, avatar_url, notification_prefs`,
      [first_name || null, last_name || null, avatar_url || null, notification_prefs || {}, req.user.id]
    );

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({
      error: 'Erro ao atualizar perfil',
      message: error.message
    });
  }
});

router.patch('/password', authenticateToken, validatePasswordChange, async (req, res) => {
  try {
    const { current_password, new_password } = req.body;

    const userResult = await queryCRM('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
    const user = userResult.rows[0];

    const match = await bcrypt.compare(current_password, user.password_hash);
    if (!match) {
      return res.status(400).json({
        error: 'Senha atual incorreta'
      });
    }

    const newHash = await bcrypt.hash(new_password, 10);
    await queryCRM('UPDATE users SET password_hash = $1 WHERE id = $2', [newHash, req.user.id]);

    res.json({
      success: true,
      message: 'Senha atualizada'
    });
  } catch (error) {
    console.error('Erro ao trocar senha:', error);
    res.status(500).json({
      error: 'Erro ao trocar senha',
      message: error.message
    });
  }
});

export default router;
