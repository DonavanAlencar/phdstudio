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
 * @swagger
 * /api/crm/v1/auth/login:
 *   post:
 *     summary: Autenticar usuário e obter tokens JWT
 *     description: Realiza login do usuário e retorna accessToken e refreshToken para autenticação nas demais rotas
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@phdstudio.com.br
 *                 description: Email do usuário
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 example: senha123
 *                 description: Senha do usuário (mínimo 6 caracteres)
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Login realizado com sucesso
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     accessToken:
 *                       type: string
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                       description: Token JWT para autenticação (válido por 1 hora)
 *                     refreshToken:
 *                       type: string
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                       description: Token para renovar accessToken (válido por 7 dias)
 *                     expiresAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2024-12-22T02:00:00.000Z
 *       401:
 *         description: Credenciais inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error: Credenciais inválidas
 *               message: Email ou senha incorretos
 *       403:
 *         description: Conta desativada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
/**
 * POST /api/crm/v1/auth/login
 * Login de usuário
 */
router.post('/login', validateLogin, async (req, res) => {
  const startTime = Date.now();
  const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    // Log detalhado para debug do MCP
    console.log(`🔐 [LOGIN] [${requestId}] Iniciando login`);
    console.log(`🔍 [LOGIN] [${requestId}] IP: ${req.ip || req.connection.remoteAddress}`);
    console.log(`🔍 [LOGIN] [${requestId}] User-Agent: ${req.get('user-agent') || 'N/A'}`);
    console.log(`🔍 [LOGIN] [${requestId}] Body recebido:`, JSON.stringify({
      email: req.body.email,
      password: req.body.password ? '***' : undefined,
      passwordLength: req.body.password ? req.body.password.length : 0,
      passwordType: typeof req.body.password,
      passwordHex: req.body.password ? Buffer.from(req.body.password).toString('hex') : 'null'
    }));
    
    const { email, password } = req.body;

    if (!email || !password) {
      console.log(`❌ [LOGIN] [${requestId}] Email ou senha não fornecidos`);
      return res.status(400).json({
        error: 'Dados inválidos',
        message: 'Email e senha são obrigatórios'
      });
    }

    // Buscar usuário
    console.log(`🔍 [LOGIN] [${requestId}] Buscando usuário no banco: ${email}`);
    const queryStart = Date.now();
    const userResult = await queryCRM(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    console.log(`✅ [LOGIN] [${requestId}] Query usuário concluída em ${Date.now() - queryStart}ms`);

    if (userResult.rows.length === 0) {
      console.log(`❌ [LOGIN] [${requestId}] Usuário não encontrado: ${email}`);
      return res.status(401).json({
        error: 'Credenciais inválidas',
        message: 'Email ou senha incorretos'
      });
    }

    const user = userResult.rows[0];
    console.log(`✅ [LOGIN] [${requestId}] Usuário encontrado: ${user.email} (ID: ${user.id})`);

    // Verificar se usuário está ativo
    if (!user.is_active) {
      console.log(`❌ [LOGIN] [${requestId}] Usuário inativo: ${user.email}`);
      return res.status(403).json({
        error: 'Conta desativada',
        message: 'Sua conta foi desativada. Entre em contato com o administrador.'
      });
    }

    // Verificar senha
    console.log(`🔐 [LOGIN] [${requestId}] Verificando senha...`);
    const bcryptStart = Date.now();
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    console.log(`✅ [LOGIN] [${requestId}] Bcrypt concluído em ${Date.now() - bcryptStart}ms, match: ${passwordMatch}`);
    
    if (!passwordMatch) {
      console.log(`❌ [LOGIN] [${requestId}] Senha incorreta para: ${email}`);
      return res.status(401).json({
        error: 'Credenciais inválidas',
        message: 'Email ou senha incorretos'
      });
    }

    // Gerar tokens
    console.log(`🎫 [LOGIN] [${requestId}] Gerando tokens...`);
    const tokenStart = Date.now();
    const accessToken = generateAccessToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });
    console.log(`✅ [LOGIN] [${requestId}] Tokens gerados em ${Date.now() - tokenStart}ms`);

    // Calcular datas de expiração
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hora

    const refreshExpiresAt = new Date();
    refreshExpiresAt.setDate(refreshExpiresAt.getDate() + 7); // 7 dias

    // Salvar sessão no banco
    console.log(`💾 [LOGIN] [${requestId}] Salvando sessão no banco...`);
    const sessionStart = Date.now();
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
    console.log(`✅ [LOGIN] [${requestId}] Sessão salva em ${Date.now() - sessionStart}ms`);

    // Atualizar último login
    console.log(`🔄 [LOGIN] [${requestId}] Atualizando último login...`);
    const updateStart = Date.now();
    await queryCRM(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );
    console.log(`✅ [LOGIN] [${requestId}] Último login atualizado em ${Date.now() - updateStart}ms`);

    // Retornar dados do usuário (sem senha)
    const { password_hash, ...userWithoutPassword } = user;

    const totalTime = Date.now() - startTime;
    console.log(`✅ [LOGIN] [${requestId}] Login concluído com sucesso em ${totalTime}ms`);

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
    const totalTime = Date.now() - startTime;
    console.error(`❌ [LOGIN] [${requestId}] Erro após ${totalTime}ms:`, error.message);
    console.error(`❌ [LOGIN] [${requestId}] Stack:`, error.stack);
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
