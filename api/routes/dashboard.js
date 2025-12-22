/**
 * Rotas de Dashboard e Estatísticas
 */

import express from 'express';
import { queryCRM } from '../utils/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/crm/v1/dashboard/stats
 * Obter estatísticas gerais
 */
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    // Filtro por usuário (se não for admin)
    const userFilter = isAdmin ? '' : 'AND (assigned_to = $1 OR assigned_to IS NULL)';
    const params = isAdmin ? [] : [userId];

    // Total de leads
    const leadsTotalResult = await queryCRM(
      `SELECT COUNT(*) as total FROM leads WHERE deleted_at IS NULL ${userFilter}`,
      params
    );
    const leadsTotal = parseInt(leadsTotalResult.rows[0].total);

    // Leads por status
    const leadsByStatusResult = await queryCRM(
      `SELECT status, COUNT(*) as count 
       FROM leads 
       WHERE deleted_at IS NULL ${userFilter}
       GROUP BY status
       ORDER BY status`,
      params
    );

    // Leads por stage
    const leadsByStageResult = await queryCRM(
      `SELECT stage, COUNT(*) as count 
       FROM leads 
       WHERE deleted_at IS NULL ${userFilter}
       GROUP BY stage
       ORDER BY stage`,
      params
    );

    // Atividades pendentes
    const activitiesPendingResult = await queryCRM(
      `SELECT COUNT(*) as total 
       FROM activities 
       WHERE completed_at IS NULL 
       ${isAdmin ? '' : 'AND user_id = $1'}`,
      params
    );
    const activitiesPending = parseInt(activitiesPendingResult.rows[0].total);

    // Atividades por tipo
    const activitiesByTypeResult = await queryCRM(
      `SELECT type, COUNT(*) as count 
       FROM activities 
       WHERE completed_at IS NULL
       ${isAdmin ? '' : 'AND user_id = $1'}
       GROUP BY type
       ORDER BY type`,
      params
    );

    // Leads criados nos últimos 30 dias
    const leadsLast30DaysResult = await queryCRM(
      `SELECT DATE(created_at) as date, COUNT(*) as count
       FROM leads 
       WHERE deleted_at IS NULL 
       AND created_at >= NOW() - INTERVAL '30 days'
       ${userFilter}
       GROUP BY DATE(created_at)
       ORDER BY date ASC`,
      params
    );

    // Top tags
    const topTagsResult = await queryCRM(
      `SELECT t.id, t.name, t.color, COUNT(lt.lead_id) as count
       FROM tags t
       INNER JOIN lead_tags lt ON t.id = lt.tag_id
       INNER JOIN leads l ON lt.lead_id = l.id AND l.deleted_at IS NULL
       ${isAdmin ? '' : 'WHERE l.assigned_to = $1 OR l.assigned_to IS NULL'}
       GROUP BY t.id, t.name, t.color
       ORDER BY count DESC
       LIMIT 10`,
      params
    );

    // Leads por fonte
    const leadsBySourceResult = await queryCRM(
      `SELECT source, COUNT(*) as count 
       FROM leads 
       WHERE deleted_at IS NULL 
       AND source IS NOT NULL
       ${userFilter}
       GROUP BY source
       ORDER BY count DESC
       LIMIT 10`,
      params
    );

    res.json({
      success: true,
      data: {
        leads: {
          total: leadsTotal,
          by_status: leadsByStatusResult.rows,
          by_stage: leadsByStageResult.rows,
          by_source: leadsBySourceResult.rows,
          last_30_days: leadsLast30DaysResult.rows
        },
        activities: {
          pending: activitiesPending,
          by_type: activitiesByTypeResult.rows
        },
        tags: {
          top: topTagsResult.rows
        }
      }
    });
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({
      error: 'Erro ao obter estatísticas',
      message: error.message
    });
  }
});

/**
 * GET /api/crm/v1/dashboard/my-stats
 * Obter estatísticas do usuário logado
 */
router.get('/my-stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Leads atribuídos
    const myLeadsResult = await queryCRM(
      'SELECT COUNT(*) as total FROM leads WHERE assigned_to = $1 AND deleted_at IS NULL',
      [userId]
    );
    const myLeads = parseInt(myLeadsResult.rows[0].total);

    // Atividades pendentes
    const myActivitiesResult = await queryCRM(
      `SELECT COUNT(*) as total 
       FROM activities 
       WHERE user_id = $1 AND completed_at IS NULL`,
      [userId]
    );
    const myActivities = parseInt(myActivitiesResult.rows[0].total);

    // Atividades com vencimento próximo (próximos 7 dias)
    const upcomingActivitiesResult = await queryCRM(
      `SELECT COUNT(*) as total 
       FROM activities 
       WHERE user_id = $1 
       AND completed_at IS NULL 
       AND due_date IS NOT NULL 
       AND due_date BETWEEN NOW() AND NOW() + INTERVAL '7 days'`,
      [userId]
    );
    const upcomingActivities = parseInt(upcomingActivitiesResult.rows[0].total);

    // Atividades atrasadas
    const overdueActivitiesResult = await queryCRM(
      `SELECT COUNT(*) as total 
       FROM activities 
       WHERE user_id = $1 
       AND completed_at IS NULL 
       AND due_date IS NOT NULL 
       AND due_date < NOW()`,
      [userId]
    );
    const overdueActivities = parseInt(overdueActivitiesResult.rows[0].total);

    // Leads convertidos este mês
    const convertedThisMonthResult = await queryCRM(
      `SELECT COUNT(*) as total 
       FROM leads 
       WHERE assigned_to = $1 
       AND status = 'converted'
       AND deleted_at IS NULL
       AND DATE_TRUNC('month', updated_at) = DATE_TRUNC('month', CURRENT_DATE)`,
      [userId]
    );
    const convertedThisMonth = parseInt(convertedThisMonthResult.rows[0].total);

    res.json({
      success: true,
      data: {
        leads: {
          total: myLeads,
          converted_this_month: convertedThisMonth
        },
        activities: {
          pending: myActivities,
          upcoming: upcomingActivities,
          overdue: overdueActivities
        }
      }
    });
  } catch (error) {
    console.error('Erro ao obter estatísticas do usuário:', error);
    res.status(500).json({
      error: 'Erro ao obter estatísticas',
      message: error.message
    });
  }
});

export default router;

