/**
 * Rotas de relatorios
 */

import express from 'express';
import { queryCRM } from '../utils/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/summary', authenticateToken, async (req, res) => {
  try {
    const dealsResult = await queryCRM(
      "SELECT COUNT(*) FILTER (WHERE status = 'won') as won, COUNT(*) as total, SUM(value) FILTER (WHERE status = 'won') as revenue FROM deals WHERE deleted_at IS NULL",
      []
    );

    const responseTimeResult = await queryCRM(
      `SELECT AVG(EXTRACT(EPOCH FROM (first_activity - l.created_at))/3600) as avg_hours
       FROM (
         SELECT lead_id, MIN(created_at) as first_activity
         FROM activities
         GROUP BY lead_id
       ) a
       INNER JOIN leads l ON l.id = a.lead_id`,
      []
    );

    const cohortResult = await queryCRM(
      `SELECT DATE_TRUNC('month', created_at) as period, COUNT(*) as total
       FROM leads
       GROUP BY DATE_TRUNC('month', created_at)
       ORDER BY period ASC`,
      []
    );

    const won = parseInt(dealsResult.rows[0].won || 0, 10);
    const total = parseInt(dealsResult.rows[0].total || 0, 10);
    const revenue = parseFloat(dealsResult.rows[0].revenue || 0);
    const conversionRate = total > 0 ? (won / total) * 100 : 0;

    res.json({
      success: true,
      data: {
        conversion_rate: conversionRate,
        avg_response_hours: parseFloat(responseTimeResult.rows[0].avg_hours || 0),
        revenue,
        cohort: cohortResult.rows
      }
    });
  } catch (error) {
    console.error('Erro ao gerar relatorio:', error);
    res.status(500).json({
      error: 'Erro ao gerar relatorio',
      message: error.message
    });
  }
});

export default router;
