/**
 * Rotas de autenticação
 */

import express from 'express';
import bcrypt from 'bcryptjs';
import { queryCRM } from '../utils/db.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { validateLogin } from '../middleware/validation.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/crm/v1/auth/login
 * Login de usuário
 */
router.post('/login', validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuário
    const userResult = await queryCRM(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        error: 'Credenciais inválidas',
        message: 'Email ou senha incorretos'
      });
    }

    const user = userResult.rows[0];

    // Verificar se usuário está ativo
    if (!user.is_active) {
      return res.status(403).json({
        error: 'Conta desativada',
        message: 'Sua conta foi desativada. Entre em contato com o administrador.'
      });
    }

    // Verificar senha
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({
        error: 'Credenciais inválidas',
        message: 'Email ou senha incorretos'
      });
    }

    // Gerar tokens
    const accessToken = generateAccessToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

    // Calcular datas de expiração
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hora

    const refreshExpiresAt = new Date();
    refreshExpiresAt.setDate(refreshExpiresAt.getDate() + 7); // 7 dias

    // Salvar sessão no banco
    await queryCRM(
      `INSERT INTO sessions (user_id, token, refresh_token, expires_at, refresh_expires_at, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        user.id,
        accessToken,
        refreshToken,
        expiresAt,
        refreshExpiresAt,
        req.ip || req.connection.remoteAddress,
        req.get('user-agent')
      ]
    );

    // Atualizar último login
    await queryCRM(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    // Retornar dados do usuário (sem senha)
    const { password_hash, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        user: userWithoutPassword,
        accessToken,
        refreshToken,
        expiresAt: expiresAt.toISOString()
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Não foi possível realizar o login'
    });
  }
});

/**
 * POST /api/crm/v1/auth/logout
 * Logout de usuário
 */
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // Remover sessão do banco
    await queryCRM(
      'DELETE FROM sessions WHERE token = $1',
      [req.token]
    );

    res.json({
      success: true,
      message: 'Logout realizado com sucesso'
    });
  } catch (error) {
    console.error('Erro no logout:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * POST /api/crm/v1/auth/refresh
 * Renovar token de acesso usando refresh token
 */
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: 'Refresh token não fornecido'
      });
    }

    // Verificar refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Verificar se a sessão existe e é válida
    const sessionResult = await queryCRM(
      'SELECT * FROM sessions WHERE refresh_token = $1 AND refresh_expires_at > NOW()',
      [refreshToken]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(401).json({
        error: 'Refresh token inválido ou expirado'
      });
    }

    // Gerar novo access token
    const newAccessToken = generateAccessToken({
      userId: decoded.userId,
      email: decoded.email
    });

    // Atualizar sessão
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    await queryCRM(
      'UPDATE sessions SET token = $1, expires_at = $2 WHERE refresh_token = $3',
      [newAccessToken, expiresAt, refreshToken]
    );

    res.json({
      success: true,
      data: {
        accessToken: newAccessToken,
        expiresAt: expiresAt.toISOString()
      }
    });
  } catch (error) {
    if (error.message === 'Refresh token inválido ou expirado') {
      return res.status(401).json({
        error: 'Refresh token inválido ou expirado'
      });
    }

    console.error('Erro ao renovar token:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * GET /api/crm/v1/auth/me
 * Obter dados do usuário autenticado
 */
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const { password_hash, ...userWithoutPassword } = req.user;
    res.json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    console.error('Erro ao obter dados do usuário:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

export default router;

