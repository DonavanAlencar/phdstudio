/**
 * Rotas do Instagram Feed
 * Busca posts do Instagram via Facebook Graph API com resiliência,
 * fallback para cache stale e payload de erro consistente.
 */

import express from 'express';
import { resilientGet, classifyError } from '../utils/resilientFetch.js';

const router = express.Router();

const IG_USER_ID = process.env.INSTAGRAM_USER_ID || '17841403453191047';

// Configuração de resiliência — sobrescrevível via variáveis de ambiente
const CACHE_TTL_MS  = parseInt(process.env.INSTAGRAM_CACHE_TTL        || '300000', 10); // 5 min
const FETCH_TIMEOUT = parseInt(process.env.INSTAGRAM_FETCH_TIMEOUT_MS  || '5000',  10); // 5 s
const FETCH_RETRIES = parseInt(process.env.INSTAGRAM_FETCH_RETRIES     || '1',     10); // 1 retry
const FETCH_BACKOFF = parseInt(process.env.INSTAGRAM_FETCH_BACKOFF_MS  || '1000',  10); // 1 s

// Cache em memória — mutado in-place para preservar referência entre resets de teste
const cache = { ts: 0, data: null };

/** Reseta o cache — usado apenas em testes. */
export function _resetCache() {
  cache.ts   = 0;
  cache.data = null;
}

/**
 * GET /api/instagram/posts
 * Público — sem autenticação necessária no frontend.
 */
router.get('/posts', async (req, res) => {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;

  if (!accessToken) {
    return res.status(503).json({
      success: false,
      data:    [],
      message: 'Instagram feed não configurado: token de acesso ausente.',
      meta:    { reason: 'MISSING_TOKEN' },
    });
  }

  const apiVersion = process.env.INSTAGRAM_API_VERSION || 'v22.0';
  const limit      = Math.min(parseInt(req.query.limit) || 8, 12);
  const now        = Date.now();

  // ── Hot cache ──────────────────────────────────────────────────────────────
  if (req.query.force !== '1' && cache.data && now - cache.ts < CACHE_TTL_MS) {
    const sliced = cache.data.slice(0, limit);
    return res.json({
      success: true,
      count:   sliced.length,
      data:    sliced,
      meta:    { source: 'cache' },
    });
  }

  // access_token é incluído na URL — sanitizeUrl no resilientFetch esconde nos logs
  const url =
    `https://graph.facebook.com/${apiVersion}/${IG_USER_ID}/media` +
    `?fields=id,caption,media_type,media_url,thumbnail_url,permalink,like_count,comments_count,timestamp` +
    `&access_token=${accessToken}&limit=${limit}`;

  console.info('[instagram/posts] buscando na Graph API', { userId: IG_USER_ID, limit });

  let posts      = null;
  let lastReason = 'UNKNOWN_ERROR';

  try {
    const { data } = await resilientGet(url, {
      timeout:        FETCH_TIMEOUT,
      retries:        FETCH_RETRIES,
      retryBackoffMs: FETCH_BACKOFF,
      headers: {
        'User-Agent':       'phdstudio-instagram-feed/1.0',
        'Accept-Encoding':  'gzip, deflate',
      },
      endpointName: 'instagram/posts',
    });

    // HTTP 4xx da Graph API significa erro de autenticação ou parâmetros inválidos
    if (status >= 400) {
      const apiError = data?.error;
      lastReason = (status === 400 || status === 401 || status === 403)
        ? 'AUTH_ERROR'
        : `HTTP_${status}`;
      console.error('[instagram/posts] Graph API retornou erro HTTP', {
        status,
        errorType:    apiError?.type || '',
        errorCode:    apiError?.code || '',
        errorMessage: apiError?.message || '',
      });
      throw Object.assign(
        new Error(apiError?.message || `Graph API retornou HTTP ${status}`),
        { reason: lastReason }
      );
    }

    if (!data.data || !Array.isArray(data.data)) {
      lastReason = 'INVALID_RESPONSE';
      throw Object.assign(
        new Error('Formato de resposta inesperado da Graph API'),
        { reason: lastReason }
      );
    }

    posts = data.data
      .map((post) => ({
        id:             post.id,
        media_type:     post.media_type || 'IMAGE',
        media_url:      post.media_url || '',
        thumbnail_url:  post.thumbnail_url || post.media_url || '',
        caption:        post.caption || '',
        permalink:      post.permalink || 'https://www.instagram.com/phdstudiooficial',
        like_count:     post.like_count || 0,
        comments_count: post.comments_count || 0,
        timestamp:      post.timestamp || null,
      }))
      .sort((a, b) => {
        const ta = a.timestamp ? new Date(a.timestamp).getTime() : 0;
        const tb = b.timestamp ? new Date(b.timestamp).getTime() : 0;
        return tb - ta;
      });
  } catch (err) {
    lastReason = err.reason || classifyError(err);
    console.error('[instagram/posts] upstream falhou', {
      reason:  lastReason,
      code:    err.code || '',
      message: err.message,
    });
  }

  // ── Upstream OK → atualiza cache e responde ───────────────────────────────
  if (posts) {
    cache.ts   = now;
    cache.data = posts;
    return res.json({
      success: true,
      count:   posts.length,
      data:    posts,
      meta:    { source: 'upstream' },
    });
  }

  // ── Stale cache fallback ──────────────────────────────────────────────────
  if (cache.data) {
    const sliced = cache.data.slice(0, limit);
    console.warn('[instagram/posts] servindo cache stale', {
      cacheAgeMs: now - cache.ts,
      count:      sliced.length,
      reason:     lastReason,
    });
    return res.json({
      success: true,
      count:   sliced.length,
      data:    sliced,
      meta:    { source: 'cache', stale: true },
    });
  }

  // ── Falha total ───────────────────────────────────────────────────────────
  console.error('[instagram/posts] upstream falhou, sem cache disponível', {
    reason: lastReason,
  });
  return res.status(503).json({
    success: false,
    data:    [],
    message: 'O feed do Instagram está temporariamente indisponível. Tente novamente em alguns instantes.',
    meta:    { reason: lastReason },
  });
});

export default router;
