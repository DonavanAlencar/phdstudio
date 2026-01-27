/**
 * Rotas de configurações globais do chat
 * GET /api/crm/v1/chat-settings - Obter configuração global do chat
 * PUT /api/crm/v1/chat-settings - Atualizar configuração global do chat (apenas admin)
 */

import express from 'express';
import { queryCRM } from '../utils/db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/crm/v1/chat-settings
 * Obter configuração global de visibilidade do chat
 * Público (não requer autenticação para leitura)
 */
router.get('/', async (req, res) => {
  try {
    const result = await queryCRM(
      `SELECT setting_value 
       FROM global_settings 
       WHERE setting_key = 'chat_visibility'
       LIMIT 1`
    );

    if (result.rows.length === 0) {
      // Se não existir, retornar padrão (habilitado)
      return res.json({
        success: true,
        data: {
          enabled: true
        }
      });
    }

    const settings = result.rows[0].setting_value;
    
    res.json({
      success: true,
      data: {
        enabled: settings.enabled !== false // Default true se não especificado
      }
    });
  } catch (error) {
    console.error('Erro ao obter configuração do chat:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao obter configuração do chat',
      message: error.message
    });
  }
});

/**
 * PUT /api/crm/v1/chat-settings
 * Atualizar configuração global de visibilidade do chat
 * Requer autenticação e role admin
 */
router.put('/', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { enabled } = req.body;

    if (typeof enabled !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'Parâmetro inválido',
        message: 'O campo "enabled" deve ser um booleano (true/false)'
      });
    }

    // Inserir ou atualizar configuração
    await queryCRM(
      `INSERT INTO global_settings (setting_key, setting_value)
       VALUES ('chat_visibility', $1::jsonb)
       ON CONFLICT (setting_key) 
       DO UPDATE SET 
         setting_value = $1::jsonb,
         updated_at = CURRENT_TIMESTAMP`,
      [JSON.stringify({ enabled })]
    );

    res.json({
      success: true,
      message: 'Configuração do chat atualizada com sucesso',
      data: {
        enabled
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar configuração do chat:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao atualizar configuração do chat',
      message: error.message
    });
  }
});

export default router;
