/**
 * Rotas de arquivos do Lead
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { queryCRM } from '../utils/db.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateId } from '../middleware/validation.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.resolve(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}_${safeName}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }
});

const router = express.Router();

/**
 * GET /api/crm/v1/leads/:id/files
 */
router.get('/leads/:id/files', authenticateToken, validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const leadResult = await queryCRM('SELECT id FROM leads WHERE id = $1 AND deleted_at IS NULL', [id]);
    if (leadResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Lead não encontrado'
      });
    }

    const result = await queryCRM(
      'SELECT * FROM lead_files WHERE lead_id = $1 ORDER BY created_at DESC',
      [id]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Erro ao listar arquivos:', error);
    res.status(500).json({
      error: 'Erro ao listar arquivos',
      message: error.message
    });
  }
});

/**
 * POST /api/crm/v1/leads/:id/files
 */
router.post('/leads/:id/files', authenticateToken, validateId, upload.single('file'), async (req, res) => {
  try {
    const { id } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        error: 'Arquivo não enviado'
      });
    }

    const leadResult = await queryCRM('SELECT id FROM leads WHERE id = $1 AND deleted_at IS NULL', [id]);
    if (leadResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Lead não encontrado'
      });
    }

    const result = await queryCRM(
      `INSERT INTO lead_files (lead_id, filename, stored_filename, mime_type, file_size, storage_path, uploaded_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        id,
        file.originalname,
        file.filename,
        file.mimetype,
        file.size,
        file.path,
        req.user?.id || null
      ]
    );

    await queryCRM(
      `INSERT INTO lead_events (lead_id, event_type, title, description, metadata, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        id,
        'file',
        'Arquivo anexado',
        file.originalname,
        { mime_type: file.mimetype, size: file.size },
        req.user?.id || null
      ]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao enviar arquivo:', error);
    res.status(500).json({
      error: 'Erro ao enviar arquivo',
      message: error.message
    });
  }
});

/**
 * GET /api/crm/v1/files/:id
 */
router.get('/files/:id', authenticateToken, validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await queryCRM('SELECT * FROM lead_files WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Arquivo não encontrado'
      });
    }

    const file = result.rows[0];
    if (!fs.existsSync(file.storage_path)) {
      return res.status(404).json({
        error: 'Arquivo não encontrado no storage'
      });
    }

    res.setHeader('Content-Type', file.mime_type);
    res.setHeader('Content-Disposition', `inline; filename="${file.filename}"`);

    fs.createReadStream(file.storage_path).pipe(res);
  } catch (error) {
    console.error('Erro ao baixar arquivo:', error);
    res.status(500).json({
      error: 'Erro ao baixar arquivo',
      message: error.message
    });
  }
});

export default router;
