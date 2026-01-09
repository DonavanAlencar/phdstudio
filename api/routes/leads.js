/**
 * Rotas de Leads
 */

import express from 'express';
import { queryCRM, getCRMClient } from '../utils/db.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';
import { validateLead, validateId, validateListQuery } from '../middleware/validation.js';

const router = express.Router();

async function runStageWorkflows(leadId, newStage, userId) {
  const workflows = await queryCRM(
    `SELECT w.id, t.trigger_config, a.action_type, a.action_config
     FROM workflows w
     INNER JOIN workflow_triggers t ON t.workflow_id = w.id
     INNER JOIN workflow_actions a ON a.workflow_id = w.id
     WHERE w.is_active = true
       AND t.trigger_type = 'lead_stage_changed'
       AND t.trigger_config->>'stage' = $1`,
    [newStage]
  );

  for (const row of workflows.rows) {
    if (row.action_type === 'send_message') {
      const channel = row.action_config?.channel || 'email';
      const body = row.action_config?.body || 'Mensagem automatica';
      await queryCRM(
        `INSERT INTO messages (lead_id, channel, direction, subject, body, status, metadata, created_by)
         VALUES ($1, $2, 'outbound', $3, $4, 'queued', $5, $6)`,
        [leadId, channel, row.action_config?.subject || null, body, row.action_config || {}, userId]
      );
    }

    if (row.action_type === 'add_tag' && row.action_config?.tag_id) {
      await queryCRM(
        'INSERT INTO lead_tags (lead_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [leadId, row.action_config.tag_id]
      );
    }
  }
}

/**
 * GET /api/crm/v1/leads
 * Listar leads com filtros e paginação
 */
router.get('/', authenticateToken, validateListQuery, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      stage,
      search,
      assigned_to,
      tags,
      nlp
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = Math.min(parseInt(limit), 100);

    // Construir query dinâmica
    let whereConditions = ['l.deleted_at IS NULL'];
    const queryParams = [];
    let paramIndex = 1;

    // Filtro por status
    if (status) {
      whereConditions.push(`l.status = $${paramIndex++}`);
      queryParams.push(status);
    }

    // Filtro por stage
    if (stage) {
      whereConditions.push(`l.stage = $${paramIndex++}`);
      queryParams.push(stage);
    }

    // Filtro por usuário atribuído
    if (assigned_to) {
      whereConditions.push(`l.assigned_to = $${paramIndex++}`);
      queryParams.push(parseInt(assigned_to));
    }

    // Busca por nome/email
    if (search) {
      whereConditions.push(`(
        l.first_name ILIKE $${paramIndex} OR 
        l.last_name ILIKE $${paramIndex} OR 
        l.email ILIKE $${paramIndex}
      )`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    // Filtro por linguagem natural (simples)
    if (nlp) {
      const nlpText = String(nlp).toLowerCase();

      const daysMatch = nlpText.match(/nao contatad[oa]s? ha (\\d+) dias/);
      if (daysMatch) {
        const days = parseInt(daysMatch[1], 10);
        if (!isNaN(days)) {
          whereConditions.push(`l.id IN (\n            SELECT l2.id\n            FROM leads l2\n            LEFT JOIN activities a ON l2.id = a.lead_id\n            GROUP BY l2.id\n            HAVING MAX(a.created_at) IS NULL OR MAX(a.created_at) < NOW() - INTERVAL '${days} days'\n          )`);
        }
      }

      const cityMatch = nlpText.match(/leads de ([^,]+)/);
      if (cityMatch) {
        whereConditions.push(`l.id IN (\n          SELECT lead_id FROM lead_custom_fields\n          WHERE field_key IN ('cidade','city','estado','state')\n            AND field_value ILIKE $${paramIndex++}\n        )`);
        queryParams.push(`%${cityMatch[1].trim()}%`);
      }
    }

    // Filtro por tags
    if (tags) {
      const tagIds = Array.isArray(tags) ? tags.map(t => parseInt(t)) : [parseInt(tags)];
      const tagPlaceholders = tagIds.map((_, i) => `$${paramIndex + i}`).join(',');
      whereConditions.push(`l.id IN (
        SELECT DISTINCT lead_id FROM lead_tags WHERE tag_id IN (${tagPlaceholders})
      )`);
      queryParams.push(...tagIds);
      paramIndex += tagIds.length;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Query para contar total
    const countQuery = `
      SELECT COUNT(DISTINCT l.id) as total
      FROM leads l
      ${whereClause}
    `;
    const countResult = await queryCRM(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].total);

    // Query para buscar leads
    const dataQuery = `
      SELECT 
        l.*,
        u.first_name as assigned_first_name,
        u.last_name as assigned_last_name,
        u.email as assigned_email,
        COALESCE(
          json_agg(DISTINCT jsonb_build_object(
            'id', t.id,
            'name', t.name,
            'color', t.color
          )) FILTER (WHERE t.id IS NOT NULL),
          '[]'
        ) as tags
      FROM leads l
      LEFT JOIN users u ON l.assigned_to = u.id
      LEFT JOIN lead_tags lt ON l.id = lt.lead_id
      LEFT JOIN tags t ON lt.tag_id = t.id
      ${whereClause}
      GROUP BY l.id, u.id
      ORDER BY l.created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

    queryParams.push(limitNum, offset);
    const result = await queryCRM(dataQuery, queryParams);

    // Buscar todos os campos customizados de uma vez (otimização N+1)
    const leadIds = result.rows.map(lead => lead.id);
    let customFieldsMap = {};
    
    if (leadIds.length > 0) {
      const placeholders = leadIds.map((_, i) => `$${i + 1}`).join(',');
      const customFieldsResult = await queryCRM(
        `SELECT lead_id, field_key, field_value 
         FROM lead_custom_fields 
         WHERE lead_id IN (${placeholders})`,
        leadIds
      );

      // Agrupar campos customizados por lead_id
      customFieldsResult.rows.forEach(row => {
        if (!customFieldsMap[row.lead_id]) {
          customFieldsMap[row.lead_id] = {};
        }
        customFieldsMap[row.lead_id][row.field_key] = row.field_value;
      });
    }

    // Mapear leads com seus campos customizados
    const leads = result.rows.map(lead => ({
      ...lead,
      tags: lead.tags || [],
      custom_fields: customFieldsMap[lead.id] || {}
    }));

    res.json({
      success: true,
      data: leads,
      pagination: {
        page: parseInt(page),
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Erro ao listar leads:', error);
    res.status(500).json({
      error: 'Erro ao listar leads',
      message: error.message
    });
  }
});

/**
 * GET /api/crm/v1/leads/:id
 * Obter lead por ID
 */
router.get('/:id', authenticateToken, validateId, async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar lead
    const leadResult = await queryCRM(
      `SELECT 
        l.*,
        u.first_name as assigned_first_name,
        u.last_name as assigned_last_name,
        u.email as assigned_email
       FROM leads l
       LEFT JOIN users u ON l.assigned_to = u.id
       WHERE l.id = $1 AND l.deleted_at IS NULL`,
      [id]
    );

    if (leadResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Lead não encontrado'
      });
    }

    const lead = leadResult.rows[0];

    // Buscar tags
    const tagsResult = await queryCRM(
      `SELECT t.id, t.name, t.color
       FROM tags t
       INNER JOIN lead_tags lt ON t.id = lt.tag_id
       WHERE lt.lead_id = $1`,
      [id]
    );

    // Buscar campos customizados
    const customFieldsResult = await queryCRM(
      'SELECT field_key, field_value FROM lead_custom_fields WHERE lead_id = $1',
      [id]
    );

    const customFields = {};
    customFieldsResult.rows.forEach(row => {
      customFields[row.field_key] = row.field_value;
    });

    res.json({
      success: true,
      data: {
        ...lead,
        tags: tagsResult.rows,
        custom_fields: customFields
      }
    });
  } catch (error) {
    console.error('Erro ao obter lead:', error);
    res.status(500).json({
      error: 'Erro ao obter lead',
      message: error.message
    });
  }
});

/**
 * GET /api/crm/v1/leads/check/:email
 * Verificar lead por email
 */
router.get('/check/:email', optionalAuth, async (req, res) => {
  try {
    const email = decodeURIComponent(req.params.email);

    const result = await queryCRM(
      'SELECT * FROM leads WHERE email = $1 AND deleted_at IS NULL',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        code: 'not_found',
        message: 'Contato não encontrado',
        data: {
          status: 404
        }
      });
    }

    const lead = result.rows[0];

    // Buscar tags e campos customizados se autenticado
    let tags = [];
    let customFields = {};

    if (req.user) {
      const tagsResult = await queryCRM(
        `SELECT t.id, t.name, t.color
         FROM tags t
         INNER JOIN lead_tags lt ON t.id = lt.tag_id
         WHERE lt.lead_id = $1`,
        [lead.id]
      );
      tags = tagsResult.rows;

      const customFieldsResult = await queryCRM(
        'SELECT field_key, field_value FROM lead_custom_fields WHERE lead_id = $1',
        [lead.id]
      );
      customFieldsResult.rows.forEach(row => {
        customFields[row.field_key] = row.field_value;
      });
    }

    res.json({
      success: true,
      data: {
        id: lead.id,
        email: lead.email,
        first_name: lead.first_name,
        last_name: lead.last_name,
        status: lead.status,
        phone: lead.phone,
        source: lead.source,
        stage: lead.stage,
        pain_point: lead.pain_point,
        custom_fields: customFields,
        tags: tags,
        created_at: lead.created_at
      }
    });
  } catch (error) {
    console.error('Erro ao verificar lead:', error);
    res.status(500).json({
      error: 'Erro ao verificar lead',
      message: error.message
    });
  }
});

/**
 * POST /api/crm/v1/leads
 * Criar ou atualizar lead (UPSERT)
 * Se o lead com o email já existe (não deletado), atualiza. Caso contrário, cria.
 */
router.post('/', authenticateToken, validateLead, async (req, res) => {
  const startTime = Date.now();
  try {
    console.log(`📥 [LEADS] POST /leads iniciado`);
    const {
      email,
      first_name,
      last_name,
      phone,
      status = 'new',
      stage = 'Curioso',
      source,
      pain_point,
      assigned_to,
      custom_fields = {},
      tags = []
    } = req.body;

    // UPSERT: Verificar se lead existe e atualizar ou criar
    console.log(`🔍 [LEADS] Verificando/inserindo lead para: ${email}`);
    const upsertStart = Date.now();
    
    // Verificar se lead já existe (não deletado)
    const existingLead = await queryCRM(
      `SELECT id, created_at, updated_at FROM leads WHERE email = $1 AND deleted_at IS NULL`,
      [email]
    );
    
    let lead;
    let leadId;
    let isUpdate = false;
    
    if (existingLead.rows.length > 0) {
      // Lead existe: fazer UPDATE
      console.log(`📝 [LEADS] Lead existente encontrado, atualizando...`);
      isUpdate = true;
      leadId = existingLead.rows[0].id;
      
      const updateResult = await queryCRM(
        `UPDATE leads SET
          first_name = COALESCE($1, first_name),
          last_name = COALESCE($2, last_name),
          phone = COALESCE($3, phone),
          status = COALESCE($4, status),
          stage = COALESCE($5, stage),
          source = COALESCE($6, source),
          pain_point = COALESCE($7, pain_point),
          assigned_to = COALESCE($8, assigned_to),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $9
        RETURNING *`,
        [first_name || null, last_name || null, phone || null, status, stage, source || null, pain_point || null, assigned_to || null, leadId]
      );
      
      lead = updateResult.rows[0];
    } else {
      // Lead não existe: fazer INSERT
      console.log(`➕ [LEADS] Lead novo, criando...`);
      const insertResult = await queryCRM(
        `INSERT INTO leads 
         (email, first_name, last_name, phone, status, stage, source, pain_point, assigned_to, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
         RETURNING *`,
        [email, first_name || null, last_name || null, phone || null, status, stage, source || null, pain_point || null, assigned_to || null]
      );
      
      lead = insertResult.rows[0];
      leadId = lead.id;
    }
    
    console.log(`✅ [LEADS] UPSERT concluído em ${Date.now() - upsertStart}ms (${isUpdate ? 'atualizado' : 'criado'})`);

    // OTIMIZAÇÃO: Atualizar campos customizados em batch usando transação
    if (Object.keys(custom_fields).length > 0) {
      console.log(`📝 [LEADS] Atualizando ${Object.keys(custom_fields).length} campos customizados`);
      const customStart = Date.now();
      
      // Usar transação para inserir todos de uma vez
      const client = await getCRMClient();
      try {
        await client.query('BEGIN');
        
        // Remover campos antigos (opcional - ou manter e atualizar)
        // await client.query('DELETE FROM lead_custom_fields WHERE lead_id = $1', [leadId]);
        
        // Inserir/atualizar todos os campos
        for (const [key, value] of Object.entries(custom_fields)) {
          await client.query(
            `INSERT INTO lead_custom_fields (lead_id, field_key, field_value)
             VALUES ($1, $2, $3)
             ON CONFLICT (lead_id, field_key) 
             DO UPDATE SET field_value = $3, updated_at = CURRENT_TIMESTAMP`,
            [leadId, key, String(value)]
          );
        }
        
        await client.query('COMMIT');
        console.log(`✅ [LEADS] Campos customizados atualizados em ${Date.now() - customStart}ms`);
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    }

    // OTIMIZAÇÃO: Atualizar tags em batch
    if (Array.isArray(tags) && tags.length > 0) {
      console.log(`🏷️ [LEADS] Atualizando ${tags.length} tags`);
      const tagsStart = Date.now();
      
      const client = await getCRMClient();
      try {
        await client.query('BEGIN');
        
        // Remover tags antigas
        await client.query('DELETE FROM lead_tags WHERE lead_id = $1', [leadId]);

        // Adicionar novas tags em batch
        const tagIds = tags.map(t => parseInt(t)).filter(id => !isNaN(id));
        if (tagIds.length > 0) {
          const values = tagIds.map((_, i) => `($1, $${i + 2})`).join(', ');
          const params = [leadId, ...tagIds];
          await client.query(
            `INSERT INTO lead_tags (lead_id, tag_id) VALUES ${values} ON CONFLICT DO NOTHING`,
            params
          );
        }
        
        await client.query('COMMIT');
        console.log(`✅ [LEADS] Tags atualizadas em ${Date.now() - tagsStart}ms`);
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    }

    const totalTime = Date.now() - startTime;
    console.log(`✅ [LEADS] POST /leads concluído em ${totalTime}ms (${isUpdate ? 'atualizado' : 'criado'})`);

    res.status(isUpdate ? 200 : 201).json({
      success: true,
      message: isUpdate ? 'Lead atualizado com sucesso' : 'Lead criado com sucesso',
      data: {
        id: lead.id,
        email: lead.email,
        first_name: lead.first_name,
        last_name: lead.last_name,
        status: lead.status,
        stage: lead.stage,
        phone: lead.phone,
        source: lead.source,
        pain_point: lead.pain_point,
        custom_fields: custom_fields,
        created_at: lead.created_at,
        updated_at: lead.updated_at
      }
    });
  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error(`❌ [LEADS] Erro após ${totalTime}ms:`, error.message);
    console.error('Stack:', error.stack);
    
    // Tratamento específico para timeouts
    if (error.message.includes('timeout') || error.code === 'ETIMEDOUT' || error.code === 'ECONNRESET') {
      console.error('   → Timeout detectado - possível problema de conexão com banco');
      return res.status(504).json({
        error: 'Gateway Timeout',
        message: 'A operação demorou muito para ser concluída. Tente novamente.'
      });
    }

    res.status(500).json({
      error: 'Erro ao criar/atualizar lead',
      message: error.message
    });
  }
});

/**
 * PUT /api/crm/v1/leads/:id
 * Atualizar lead
 */
router.put('/:id', authenticateToken, validateId, validateLead, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      email,
      first_name,
      last_name,
      phone,
      status,
      stage,
      source,
      pain_point,
      assigned_to,
      custom_fields,
      tags
    } = req.body;

    // Verificar se lead existe
    const existingResult = await queryCRM(
      'SELECT id, stage FROM leads WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );

    if (existingResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Lead não encontrado'
      });
    }

    const previousStage = existingResult.rows[0].stage;

    // Atualizar lead
    await queryCRM(
      `UPDATE leads SET
        email = COALESCE($1, email),
        first_name = $2,
        last_name = $3,
        phone = $4,
        status = COALESCE($5, status),
        stage = COALESCE($6, stage),
        source = $7,
        pain_point = $8,
        assigned_to = $9,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $10`,
      [email, first_name || null, last_name || null, phone || null, status, stage, source || null, pain_point || null, assigned_to || null, id]
    );

    // Atualizar campos customizados se fornecidos
    if (custom_fields !== undefined) {
      // Remover todos os campos customizados
      await queryCRM(
        'DELETE FROM lead_custom_fields WHERE lead_id = $1',
        [id]
      );

      // Adicionar novos campos
      if (Object.keys(custom_fields).length > 0) {
        for (const [key, value] of Object.entries(custom_fields)) {
          await queryCRM(
            'INSERT INTO lead_custom_fields (lead_id, field_key, field_value) VALUES ($1, $2, $3)',
            [id, key, String(value)]
          );
        }
      }
    }

    // Atualizar tags se fornecidas
    if (tags !== undefined) {
      // Remover tags antigas
      await queryCRM(
        'DELETE FROM lead_tags WHERE lead_id = $1',
        [id]
      );

      // Adicionar novas tags
      if (Array.isArray(tags) && tags.length > 0) {
        const tagIds = tags.map(t => parseInt(t)).filter(id => !isNaN(id));
        for (const tagId of tagIds) {
          await queryCRM(
            'INSERT INTO lead_tags (lead_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [id, tagId]
          );
        }
      }
    }

    // Buscar lead atualizado
    const leadResult = await queryCRM(
      'SELECT * FROM leads WHERE id = $1',
      [id]
    );

    if (stage && stage !== previousStage) {
      await runStageWorkflows(id, stage, req.user?.id || null);
    }

    res.json({
      success: true,
      message: 'Lead atualizado com sucesso',
      data: leadResult.rows[0]
    });
  } catch (error) {
    console.error('Erro ao atualizar lead:', error);
    res.status(500).json({
      error: 'Erro ao atualizar lead',
      message: error.message
    });
  }
});

/**
 * DELETE /api/crm/v1/leads/:id
 * Deletar lead (soft delete)
 */
router.delete('/:id', authenticateToken, validateId, async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se lead existe
    const existingResult = await queryCRM(
      'SELECT id FROM leads WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );

    if (existingResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Lead não encontrado'
      });
    }

    // Soft delete
    await queryCRM(
      'UPDATE leads SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );

    res.json({
      success: true,
      message: 'Lead deletado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar lead:', error);
    res.status(500).json({
      error: 'Erro ao deletar lead',
      message: error.message
    });
  }
});

export default router;
