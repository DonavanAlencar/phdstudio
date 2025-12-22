/**
 * Middleware de autenticação JWT
 */

import { verifyAccessToken } from '../utils/jwt.js';
import { queryCRM } from '../utils/db.js';

/**
 * Middleware para verificar token JWT
 */
export async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: 'Token não fornecido',
        message: 'Envie o token no header Authorization: Bearer <token>'
      });
    }

    // Verificar token
    const decoded = verifyAccessToken(token);

    // Verificar se a sessão ainda existe e é válida
    const sessionResult = await queryCRM(
      'SELECT * FROM sessions WHERE token = $1 AND expires_at > NOW()',
      [token]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(401).json({
        error: 'Sessão inválida ou expirada',
        message: 'Faça login novamente'
      });
    }

    // Buscar dados do usuário
    const userResult = await queryCRM(
      'SELECT id, email, first_name, last_name, role, is_active FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        error: 'Usuário não encontrado'
      });
    }

    const user = userResult.rows[0];

    if (!user.is_active) {
      return res.status(403).json({
        error: 'Usuário inativo',
        message: 'Sua conta foi desativada'
      });
    }

    // Adicionar usuário à requisição
    req.user = user;
    req.token = token;

    next();
  } catch (error) {
    if (error.message === 'Token inválido ou expirado') {
      return res.status(401).json({
        error: 'Token inválido ou expirado',
        message: 'Faça login novamente'
      });
    }

    console.error('Erro na autenticação:', error);
    return res.status(500).json({
      error: 'Erro interno na autenticação'
    });
  }
}

/**
 * Middleware para verificar roles (admin, manager, user)
 */
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Não autenticado'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Acesso negado',
        message: `Esta operação requer uma das seguintes roles: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
}

/**
 * Middleware opcional - adiciona usuário se token válido, mas não bloqueia se inválido
 */
export async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = verifyAccessToken(token);
      const userResult = await queryCRM(
        'SELECT id, email, first_name, last_name, role, is_active FROM users WHERE id = $1 AND is_active = true',
        [decoded.userId]
      );

      if (userResult.rows.length > 0) {
        req.user = userResult.rows[0];
      }
    }
  } catch (error) {
    // Ignorar erros de autenticação opcional
  }

  next();
}

