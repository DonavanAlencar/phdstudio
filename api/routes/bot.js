/**
 * Rotas do bot inteligente
 */

import express from 'express';
import { queryCRM } from '../utils/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/suggestion', authenticateToken, async (req, res) => {
  try {
    const leadId = parseInt(req.query.lead_id, 10);
    if (!leadId) {
      return res.status(400).json({
        error: 'lead_id obrigatorio'
      });
    }

    const lastActivityResult = await queryCRM(
      'SELECT * FROM activities WHERE lead_id = $1 ORDER BY created_at DESC LIMIT 1',
      [leadId]
    );

    let suggestion = 'Registrar proxima atividade e atualizar o status do lead.';

    if (lastActivityResult.rows.length === 0) {
      suggestion = 'Agende uma tarefa de primeiro contato para hoje.';
    } else {
      const lastActivity = lastActivityResult.rows[0];
      if (lastActivity.type === 'email') {
        suggestion = 'Agende uma ligacao de follow-up nas proximas 24h.';
      } else if (lastActivity.type === 'call') {
        suggestion = 'Enviar um email com resumo da conversa e proximos passos.';
      } else if (lastActivity.type === 'meeting') {
        suggestion = 'Criar proposta e estimativa de fechamento.';
      }
    }

    res.json({
      success: true,
      data: {
        suggestion
      }
    });
  } catch (error) {
    console.error('Erro ao gerar sugestao:', error);
    res.status(500).json({
      error: 'Erro ao gerar sugestao',
      message: error.message
    });
  }
});

export default router;
