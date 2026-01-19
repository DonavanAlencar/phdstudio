/**
 * Rotas de automacao/workflows
 */

import express from 'express';
import { queryCRM } from '../utils/db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { validateWorkflow, validateId } from '../middleware/validation.js';

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const workflows = await queryCRM('SELECT * FROM workflows ORDER BY created_at DESC', []);
    const triggers = await queryCRM('SELECT * FROM workflow_triggers', []);
    const actions = await queryCRM('SELECT * FROM workflow_actions', []);

    const triggersByWorkflow = triggers.rows.reduce((acc, trigger) => {
      if (!acc[trigger.workflow_id]) acc[trigger.workflow_id] = [];
      acc[trigger.workflow_id].push(trigger);
      return acc;
    }, {});

    const actionsByWorkflow = actions.rows.reduce((acc, action) => {
      if (!acc[action.workflow_id]) acc[action.workflow_id] = [];
      acc[action.workflow_id].push(action);
      return acc;
    }, {});

    const data = workflows.rows.map((workflow) => ({
      ...workflow,
      triggers: triggersByWorkflow[workflow.id] || [],
      actions: actionsByWorkflow[workflow.id] || []
    }));

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Erro ao listar workflows:', error);
    res.status(500).json({
      error: 'Erro ao listar workflows',
      message: error.message
    });
  }
});

router.post('/', authenticateToken, requireRole('admin', 'manager'), validateWorkflow, async (req, res) => {
  try {
    const { name, is_active = true, triggers = [], actions = [] } = req.body;

    const workflowResult = await queryCRM(
      `INSERT INTO workflows (name, is_active, created_by)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, is_active, req.user?.id || null]
    );

    const workflow = workflowResult.rows[0];

    for (const trigger of triggers) {
      await queryCRM(
        `INSERT INTO workflow_triggers (workflow_id, trigger_type, trigger_config)
         VALUES ($1, $2, $3)`,
        [workflow.id, trigger.trigger_type, trigger.trigger_config || {}]
      );
    }

    for (const action of actions) {
      await queryCRM(
        `INSERT INTO workflow_actions (workflow_id, action_type, action_config)
         VALUES ($1, $2, $3)`,
        [workflow.id, action.action_type, action.action_config || {}]
      );
    }

    res.status(201).json({
      success: true,
      data: workflow
    });
  } catch (error) {
    console.error('Erro ao criar workflow:', error);
    res.status(500).json({
      error: 'Erro ao criar workflow',
      message: error.message
    });
  }
});

router.put('/:id', authenticateToken, requireRole('admin', 'manager'), validateId, validateWorkflow, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, is_active = true, triggers = [], actions = [] } = req.body;

    const existing = await queryCRM('SELECT id FROM workflows WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({
        error: 'Workflow nao encontrado'
      });
    }

    const workflowResult = await queryCRM(
      `UPDATE workflows SET name = $1, is_active = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [name, is_active, id]
    );

    await queryCRM('DELETE FROM workflow_triggers WHERE workflow_id = $1', [id]);
    await queryCRM('DELETE FROM workflow_actions WHERE workflow_id = $1', [id]);

    for (const trigger of triggers) {
      await queryCRM(
        `INSERT INTO workflow_triggers (workflow_id, trigger_type, trigger_config)
         VALUES ($1, $2, $3)`,
        [id, trigger.trigger_type, trigger.trigger_config || {}]
      );
    }

    for (const action of actions) {
      await queryCRM(
        `INSERT INTO workflow_actions (workflow_id, action_type, action_config)
         VALUES ($1, $2, $3)`,
        [id, action.action_type, action.action_config || {}]
      );
    }

    res.json({
      success: true,
      data: workflowResult.rows[0]
    });
  } catch (error) {
    console.error('Erro ao atualizar workflow:', error);
    res.status(500).json({
      error: 'Erro ao atualizar workflow',
      message: error.message
    });
  }
});

router.delete('/:id', authenticateToken, requireRole('admin'), validateId, async (req, res) => {
  try {
    const { id } = req.params;
    await queryCRM('DELETE FROM workflows WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Workflow removido'
    });
  } catch (error) {
    console.error('Erro ao remover workflow:', error);
    res.status(500).json({
      error: 'Erro ao remover workflow',
      message: error.message
    });
  }
});

router.post('/round-robin/assign', authenticateToken, requireRole('admin', 'manager'), async (req, res) => {
  try {
    const { lead_id } = req.body;
    if (!lead_id) {
      return res.status(400).json({
        error: 'lead_id obrigatorio'
      });
    }

    const usersResult = await queryCRM(
      "SELECT id FROM users WHERE is_active = true AND role IN ('admin','manager') ORDER BY id ASC",
      []
    );
    if (usersResult.rows.length === 0) {
      return res.status(400).json({
        error: 'Nenhum usuario disponivel'
      });
    }

    const stateResult = await queryCRM('SELECT * FROM round_robin_state WHERE key = $1', ['lead_assign']);
    let nextUser = usersResult.rows[0];

    if (stateResult.rows.length > 0) {
      const lastUserId = stateResult.rows[0].last_user_id;
      const index = usersResult.rows.findIndex((u) => u.id === lastUserId);
      nextUser = usersResult.rows[(index + 1) % usersResult.rows.length];
      await queryCRM('UPDATE round_robin_state SET last_user_id = $1, updated_at = CURRENT_TIMESTAMP WHERE key = $2', [nextUser.id, 'lead_assign']);
    } else {
      await queryCRM('INSERT INTO round_robin_state (key, last_user_id) VALUES ($1, $2)', ['lead_assign', nextUser.id]);
    }

    await queryCRM('UPDATE leads SET assigned_to = $1 WHERE id = $2', [nextUser.id, lead_id]);

    res.json({
      success: true,
      data: { assigned_to: nextUser.id }
    });
  } catch (error) {
    console.error('Erro no round robin:', error);
    res.status(500).json({
      error: 'Erro no round robin',
      message: error.message
    });
  }
});

export default router;
