/**
 * Middleware de autenticação JWT
 */

import { verifyAccessToken } from '../utils/jwt.js';
import { queryCRM } from '../utils/db.js';

/**
 * Middleware para verificar token JWT
 */
export async function authenticateToken(req, res, next) {
  const startTime = Date.now();
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
    const verifyStart = Date.now();
    let decoded;
    try {
      decoded = verifyAccessToken(token);
      console.log(`🔐 [AUTH] Token verificado em ${Date.now() - verifyStart}ms`);
    } catch (error) {
      console.log(`❌ [AUTH] Token inválido após ${Date.now() - verifyStart}ms: ${error.message}`);
      return res.status(401).json({
        error: 'Token inválido ou expirado',
        message: 'Faça login novamente'
      });
    }

    // OTIMIZAÇÃO: Fazer JOIN para buscar sessão e usuário em uma única query
    const authStart = Date.now();
    const authResult = await queryCRM(
      `SELECT 
        s.user_id,
        s.expires_at,
        u.id,
        u.email,
        u.first_name,
        u.last_name,
        u.role,
        u.is_active
       FROM sessions s
       INNER JOIN users u ON s.user_id = u.id
       WHERE s.token = $1 
         AND s.expires_at > NOW()
         AND u.is_active = true
       LIMIT 1`,
      [token]
    );
    console.log(`🔐 [AUTH] Query autenticação concluída em ${Date.now() - authStart}ms`);

    if (authResult.rows.length === 0) {
      return res.status(401).json({
        error: 'Sessão inválida ou expirada',
        message: 'Faça login novamente'
      });
    }

    const user = authResult.rows[0];

    // Usuário já foi validado na query JOIN (is_active = true)
    // Adicionar usuário à requisição
    req.user = {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      is_active: user.is_active
    };
    req.token = token;

    const totalTime = Date.now() - startTime;
    console.log(`✅ [AUTH] Autenticação completa em ${totalTime}ms para ${user.email}`);

    next();
  } catch (error) {
    const totalTime = Date.now() - startTime;
    if (error.message === 'Token inválido ou expirado') {
      console.log(`❌ [AUTH] Token inválido após ${totalTime}ms`);
      return res.status(401).json({
        error: 'Token inválido ou expirado',
        message: 'Faça login novamente'
      });
    }

    console.error(`❌ [AUTH] Erro após ${totalTime}ms:`, error);
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

