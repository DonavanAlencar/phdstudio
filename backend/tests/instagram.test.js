/**
 * Testes da rota GET /api/instagram/posts
 *
 * Cobre 3 cenários:
 *  1. Upstream OK  → success: true, meta.source: "upstream"
 *  2. Upstream falhou + cache disponível → success: true, meta.source: "cache", meta.stale: true
 *  3. Upstream falhou + sem cache        → success: false, data: [], meta.reason
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../utils/resilientFetch.js', () => ({
  resilientGet: vi.fn(),
  classifyError: vi.fn((err) => err?.reason || 'UNKNOWN_ERROR'),
}));

import express from 'express';
import request from 'supertest';
import instagramRouter, { _resetCache } from '../routes/instagram.js';
import * as rf from '../utils/resilientFetch.js';

// ─── App de teste ────────────────────────────────────────────────────────────
const app = express();
app.use('/api/instagram', instagramRouter);

// ─── Fixtures ────────────────────────────────────────────────────────────────
const mockGraphResponse = {
  data: [
    {
      id:             '17865012345678901',
      media_type:     'IMAGE',
      media_url:      'https://cdn.instagram.com/img/post1.jpg',
      thumbnail_url:  '',
      caption:        'Legenda do post 1 #phdstudio',
      permalink:      'https://www.instagram.com/p/ABC123/',
      like_count:     42,
      comments_count: 3,
      timestamp:      '2025-03-01T12:00:00+0000',
    },
    {
      id:             '17865012345678902',
      media_type:     'VIDEO',
      media_url:      '',
      thumbnail_url:  'https://cdn.instagram.com/img/post2_thumb.jpg',
      caption:        'Legenda do post 2',
      permalink:      'https://www.instagram.com/p/DEF456/',
      like_count:     18,
      comments_count: 1,
      timestamp:      '2025-02-28T10:00:00+0000',
    },
  ],
};

const networkError = Object.assign(new Error('getaddrinfo ENOTFOUND graph.facebook.com'), {
  code:   'ENOTFOUND',
  reason: 'DNS_ERROR',
});

const timeoutError = Object.assign(new Error('timeout of 5000ms exceeded'), {
  code:   'ECONNABORTED',
  reason: 'UPSTREAM_TIMEOUT',
});

const upstreamOk = { data: mockGraphResponse, status: 200, durationMs: 210 };

// ─── Setup ───────────────────────────────────────────────────────────────────
beforeEach(() => {
  _resetCache();
  vi.clearAllMocks();
  process.env.INSTAGRAM_ACCESS_TOKEN = 'test-token-123';
});

// ─── Testes ──────────────────────────────────────────────────────────────────
describe('GET /api/instagram/posts', () => {
  // ── Cenário 1: Upstream OK ─────────────────────────────────────────────────
  describe('Cenário 1 — Upstream OK', () => {
    it('retorna success:true, data com posts e meta.source:"upstream"', async () => {
      rf.resilientGet.mockResolvedValueOnce(upstreamOk);

      const res = await request(app).get('/api/instagram/posts?limit=8');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.count).toBe(res.body.data.length);
      expect(res.body.meta).toMatchObject({ source: 'upstream' });
    });

    it('cada post tem os campos obrigatórios do contrato', async () => {
      rf.resilientGet.mockResolvedValueOnce(upstreamOk);

      const res = await request(app).get('/api/instagram/posts');

      expect(res.status).toBe(200);
      for (const post of res.body.data) {
        expect(post).toHaveProperty('id');
        expect(post).toHaveProperty('media_type');
        expect(post).toHaveProperty('media_url');
        expect(post).toHaveProperty('permalink');
        expect(post).toHaveProperty('caption');
        expect(post).toHaveProperty('like_count');
        expect(post).toHaveProperty('comments_count');
        expect(post).toHaveProperty('timestamp');
      }
    });

    it('posts são ordenados do mais recente para o mais antigo', async () => {
      rf.resilientGet.mockResolvedValueOnce(upstreamOk);

      const res = await request(app).get('/api/instagram/posts');

      const timestamps = res.body.data.map((p) => new Date(p.timestamp).getTime());
      for (let i = 0; i < timestamps.length - 1; i++) {
        expect(timestamps[i]).toBeGreaterThanOrEqual(timestamps[i + 1]);
      }
    });
  });

  // ── Cenário 2: Upstream falhou + cache disponível ──────────────────────────
  describe('Cenário 2 — Upstream falhou + cache disponível', () => {
    it('retorna cache stale com meta.source:"cache" e meta.stale:true', async () => {
      // Popula o cache com um request bem-sucedido
      rf.resilientGet.mockResolvedValueOnce(upstreamOk);
      await request(app).get('/api/instagram/posts');

      // Agora o upstream falha; force=1 bypassa o hot cache e cai no stale
      rf.resilientGet.mockRejectedValue(networkError);
      const res = await request(app).get('/api/instagram/posts?force=1');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.meta).toMatchObject({ source: 'cache', stale: true });
    });

    it('hot cache (dentro do TTL) responde com meta.source:"cache" sem stale', async () => {
      // Popula o cache
      rf.resilientGet.mockResolvedValueOnce(upstreamOk);
      await request(app).get('/api/instagram/posts');
      vi.clearAllMocks();

      // Segunda chamada dentro do TTL → hot cache, sem chamar upstream
      const res = await request(app).get('/api/instagram/posts');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.meta.source).toBe('cache');
      expect(res.body.meta.stale).toBeUndefined();
      expect(rf.resilientGet).not.toHaveBeenCalled();
    });
  });

  // ── Cenário 3: Upstream falhou + sem cache ─────────────────────────────────
  describe('Cenário 3 — Upstream falhou + sem cache', () => {
    it('retorna 503 com success:false, data:[] e meta.reason', async () => {
      rf.resilientGet.mockRejectedValue(networkError);

      const res = await request(app).get('/api/instagram/posts');

      expect(res.status).toBe(503);
      expect(res.body.success).toBe(false);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data).toHaveLength(0);
      expect(typeof res.body.message).toBe('string');
      expect(res.body.message.length).toBeGreaterThan(0);
      expect(res.body.meta).toHaveProperty('reason');
    });

    it('meta.reason é "DNS_ERROR" quando erro de DNS', async () => {
      rf.resilientGet.mockRejectedValue(networkError);

      const res = await request(app).get('/api/instagram/posts');

      expect(res.body.meta.reason).toBe('DNS_ERROR');
    });

    it('meta.reason é "UPSTREAM_TIMEOUT" quando timeout', async () => {
      rf.resilientGet.mockRejectedValue(timeoutError);

      const res = await request(app).get('/api/instagram/posts');

      expect(res.body.meta.reason).toBe('UPSTREAM_TIMEOUT');
    });

    it('retorna 503 com reason:MISSING_TOKEN quando token ausente', async () => {
      delete process.env.INSTAGRAM_ACCESS_TOKEN;

      const res = await request(app).get('/api/instagram/posts');

      expect(res.status).toBe(503);
      expect(res.body.success).toBe(false);
      expect(res.body.meta.reason).toBe('MISSING_TOKEN');
    });
  });
});
