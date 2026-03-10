/**
 * Testes da rota GET /api/blog/posts
 *
 * Cobre 3 cenários:
 *  1. Upstream OK  → success: true, meta.source: "upstream"
 *  2. Upstream falhou + cache disponível → success: true, meta.source: "cache", meta.stale: true
 *  3. Upstream falhou + sem cache        → success: false, data: [], meta.reason
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// vi.mock é içado (hoisted) — é executado antes de qualquer import
vi.mock('../utils/resilientFetch.js', () => ({
  resilientGet: vi.fn(),
  classifyError: vi.fn((err) => err?.reason || 'UNKNOWN_ERROR'),
}));

import express from 'express';
import request from 'supertest';
import blogRouter, { _resetCache } from '../routes/blog.js';
import * as rf from '../utils/resilientFetch.js';

// ─── App de teste ────────────────────────────────────────────────────────────
const app = express();
app.use('/api/blog', blogRouter);

// ─── Fixtures ────────────────────────────────────────────────────────────────
const mockApiResponse = {
  data: [
    {
      id: '1',
      title: 'Post de Teste',
      excerpt: 'Resumo do post de teste',
      url: 'https://blog.example.com/post-1',
      featured_image: null,
      publish_date: '2025-01-01T00:00:00.000Z',
    },
    {
      id: '2',
      title: 'Segundo Post',
      excerpt: 'Resumo do segundo post',
      url: 'https://blog.example.com/post-2',
      featured_image: 'https://blog.example.com/img/2.jpg',
      publish_date: '2025-01-02T00:00:00.000Z',
    },
  ],
};

const networkError = Object.assign(new Error('getaddrinfo ENOTFOUND www.phdstudio.blog.br'), {
  code:   'ENOTFOUND',
  reason: 'DNS_ERROR',
});

const timeoutError = Object.assign(new Error('timeout of 5000ms exceeded'), {
  code:   'ECONNABORTED',
  reason: 'UPSTREAM_TIMEOUT',
});

// ─── Setup ───────────────────────────────────────────────────────────────────
beforeEach(() => {
  _resetCache();
  vi.clearAllMocks();
});

// ─── Testes ──────────────────────────────────────────────────────────────────
describe('GET /api/blog/posts', () => {
  // ── Cenário 1: Upstream OK ─────────────────────────────────────────────────
  describe('Cenário 1 — Upstream OK', () => {
    it('retorna success:true, data com posts e meta.source:"upstream"', async () => {
      rf.resilientGet.mockResolvedValueOnce({
        data:       mockApiResponse,
        status:     200,
        durationMs: 120,
      });

      const res = await request(app).get('/api/blog/posts?limit=4');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.count).toBe(res.body.data.length);
      expect(res.body.meta).toMatchObject({ source: 'upstream' });
    });

    it('respeita o parâmetro limit', async () => {
      rf.resilientGet.mockResolvedValueOnce({
        data:       mockApiResponse,
        status:     200,
        durationMs: 80,
      });

      const res = await request(app).get('/api/blog/posts?limit=1');

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeLessThanOrEqual(1);
    });

    it('cada post tem os campos obrigatórios do contrato', async () => {
      rf.resilientGet.mockResolvedValueOnce({
        data:       mockApiResponse,
        status:     200,
        durationMs: 90,
      });

      const res = await request(app).get('/api/blog/posts');

      expect(res.status).toBe(200);
      for (const post of res.body.data) {
        expect(post).toHaveProperty('id');
        expect(post).toHaveProperty('title');
        expect(post).toHaveProperty('excerpt');
        expect(post).toHaveProperty('url');
        expect(post).toHaveProperty('publish_date');
      }
    });
  });

  // ── Cenário 2: Upstream falhou + cache disponível ──────────────────────────
  describe('Cenário 2 — Upstream falhou + cache disponível', () => {
    it('retorna cache stale com meta.source:"cache" e meta.stale:true', async () => {
      // Primeiro request popula o cache
      rf.resilientGet.mockResolvedValueOnce({
        data:       mockApiResponse,
        status:     200,
        durationMs: 50,
      });
      await request(app).get('/api/blog/posts');

      // Agora todos os upstreams falham
      rf.resilientGet.mockRejectedValue(networkError);

      // force=1 força bypass do hot cache para testar o fallback stale
      const res = await request(app).get('/api/blog/posts?force=1');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.meta).toMatchObject({ source: 'cache', stale: true });
    });

    it('hot cache (sem force) responde com meta.source:"cache" sem stale', async () => {
      // Popula o cache
      rf.resilientGet.mockResolvedValueOnce({
        data:       mockApiResponse,
        status:     200,
        durationMs: 50,
      });
      await request(app).get('/api/blog/posts');
      vi.clearAllMocks();

      // Segunda chamada dentro do TTL → hot cache
      const res = await request(app).get('/api/blog/posts');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.meta.source).toBe('cache');
      expect(res.body.meta.stale).toBeUndefined();
      // resilientGet não deve ter sido chamado
      expect(rf.resilientGet).not.toHaveBeenCalled();
    });
  });

  // ── Cenário 3: Upstream falhou + sem cache ─────────────────────────────────
  describe('Cenário 3 — Upstream falhou + sem cache', () => {
    it('retorna 503 com success:false, data:[] e meta.reason', async () => {
      rf.resilientGet.mockRejectedValue(networkError);

      const res = await request(app).get('/api/blog/posts');

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

      const res = await request(app).get('/api/blog/posts');

      expect(res.body.meta.reason).toBe('DNS_ERROR');
    });

    it('meta.reason é "UPSTREAM_TIMEOUT" quando timeout', async () => {
      rf.resilientGet.mockRejectedValue(timeoutError);

      const res = await request(app).get('/api/blog/posts');

      expect(res.body.meta.reason).toBe('UPSTREAM_TIMEOUT');
    });
  });
});
