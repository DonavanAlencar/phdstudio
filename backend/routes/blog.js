import express from 'express';
import { resilientGet, classifyError } from '../utils/resilientFetch.js';

const router = express.Router();

// Fonte dos posts: API do blog em React (padrão); para usar WordPress, defina WP_URL e deixe BLOG_API_URL vazia
const BLOG_API_URL = process.env.BLOG_API_URL ?? 'https://www.phdstudio.blog.br/api/posts';
const WP_BASE = process.env.WP_URL || 'https://www.phdstudio.blog.br';
const BLOG_RSS_URL = process.env.BLOG_RSS_URL || 'https://www.phdstudio.blog.br/blog-feed.xml';
const POSTS_LIMIT_DEFAULT = 6;

// Configuração de resiliência — sobrescrevível via variáveis de ambiente
const CACHE_TTL_MS    = parseInt(process.env.BLOG_CACHE_TTL        || '600000', 10); // 10 min
const FETCH_TIMEOUT   = parseInt(process.env.BLOG_FETCH_TIMEOUT_MS  || '5000',  10); // 5 s
const FETCH_RETRIES   = parseInt(process.env.BLOG_FETCH_RETRIES     || '1',     10); // 1 retry
const FETCH_BACKOFF   = parseInt(process.env.BLOG_FETCH_BACKOFF_MS  || '1000',  10); // 1 s

// Cache em memória — mutado in-place para preservar referência entre resets de teste
const cache = { ts: 0, data: null };

/** Reseta o cache — usado apenas em testes. */
export function _resetCache() {
  cache.ts   = 0;
  cache.data = null;
}

// ---------------------------------------------------------------------------
// Normalizadores de posts
// ---------------------------------------------------------------------------

const mapGenericPost = (p) => ({
  id: p.id ?? p.slug ?? p.link,
  title:
    (typeof p.title === 'string' ? p.title : p.title?.rendered) || '',
  excerpt:
    (typeof p.excerpt === 'string'
      ? p.excerpt.replace(/<[^>]+>/g, '').trim()
      : (p.excerpt?.rendered || '').replace(/<[^>]+>/g, '').trim()) || '',
  url: p.url || p.link || p.permalink || '#',
  featured_image: p.featured_image ?? p.featuredImage ?? p.image ?? null,
  publish_date:
    p.publish_date ||
    p.date ||
    p.publishedAt ||
    (p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString()),
});

const mapWpPost = (p) => {
  const embedded = p._embedded || {};
  const media = embedded['wp:featuredmedia']?.[0];
  const image =
    media?.media_details?.sizes?.medium_large?.source_url ||
    media?.media_details?.sizes?.large?.source_url ||
    media?.media_details?.sizes?.medium?.source_url ||
    media?.source_url ||
    null;
  return {
    id: p.id,
    title: p.title?.rendered || '',
    excerpt: p.excerpt?.rendered
      ? p.excerpt.rendered.replace(/<[^>]+>/g, '').trim()
      : '',
    url: p.link || `${WP_BASE}/?p=${p.id}`,
    featured_image: image,
    publish_date: p.date,
  };
};

function parseRss(xml, limit) {
  const items = Array.from(xml.matchAll(/<item>([\s\S]*?)<\/item>/g)).slice(0, limit);
  const posts = items
    .map((match) => {
      const item = match[1];
      const get = (tag) => {
        const m = item.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, 'i'));
        return m ? m[1] : '';
      };
      const title       = get('title').replace(/<!\[CDATA\[|\]\]>/g, '').trim();
      const link        = get('link').trim();
      const pubDate     = get('pubDate').trim();
      const description = get('description')
        .replace(/<!\[CDATA\[|\]\]>/g, '')
        .replace(/<[^>]+>/g, '')
        .trim();
      let image = null;
      const mc = item.match(/<media:content[^>]*url="([^"]+)"[^>]*>/i);
      if (mc) image = mc[1];
      const enc = item.match(/<enclosure[^>]*url="([^"]+)"[^>]*>/i);
      if (!image && enc) image = enc[1];
      return {
        id: link || pubDate || title,
        title,
        excerpt: description,
        url: link,
        featured_image: image,
        publish_date: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
      };
    })
    .filter((p) => p.title && p.url);
  posts.sort((a, b) => new Date(b.publish_date).getTime() - new Date(a.publish_date).getTime());
  return posts;
}

// ---------------------------------------------------------------------------
// Rota principal
// ---------------------------------------------------------------------------

router.get('/posts', async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || POSTS_LIMIT_DEFAULT, 12);
  const now   = Date.now();

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

  let posts      = null;
  let lastReason = 'UNKNOWN_ERROR';

  // ── 1) API JSON do blog (BLOG_API_URL) ────────────────────────────────────
  if (BLOG_API_URL) {
    try {
      const apiUrl = BLOG_API_URL.includes('?')
        ? `${BLOG_API_URL}&limit=${limit}`
        : `${BLOG_API_URL}?limit=${limit}`;
      const { data } = await resilientGet(apiUrl, {
        timeout:        FETCH_TIMEOUT,
        retries:        FETCH_RETRIES,
        retryBackoffMs: FETCH_BACKOFF,
        endpointName:   'blog/api',
      });
      const raw    = Array.isArray(data) ? data : data.data || data.posts || [];
      const mapped = raw.map(mapGenericPost).filter((p) => p.title && p.url).slice(0, limit);
      if (mapped.length > 0) posts = mapped;
    } catch (err) {
      lastReason = err.reason || classifyError(err);
      console.error('[blog/posts] BLOG_API_URL falhou', { reason: lastReason, url: BLOG_API_URL });
    }
  }

  // ── 2) WordPress REST API ─────────────────────────────────────────────────
  if (!posts) {
    const wpUrl = `${WP_BASE.replace(/\/$/, '')}/wp-json/wp/v2/posts?per_page=${limit}&_embed=1&orderby=date&order=desc`;
    try {
      const { data } = await resilientGet(wpUrl, {
        timeout:        FETCH_TIMEOUT,
        retries:        FETCH_RETRIES,
        retryBackoffMs: FETCH_BACKOFF,
        endpointName:   'blog/wp',
      });
      if (Array.isArray(data)) {
        posts = data.map(mapWpPost).filter((p) => p.title && p.url);
      }
    } catch (err) {
      lastReason = err.reason || classifyError(err);
      console.error('[blog/posts] WP REST API falhou', { reason: lastReason });
    }
  }

  // ── 3) RSS feed ───────────────────────────────────────────────────────────
  if (!posts) {
    const rssUrl = BLOG_RSS_URL || `${WP_BASE.replace(/\/$/, '')}/feed/`;
    try {
      const { data: xml } = await resilientGet(rssUrl, {
        timeout:        FETCH_TIMEOUT,
        retries:        FETCH_RETRIES,
        retryBackoffMs: FETCH_BACKOFF,
        headers:        { Accept: 'application/rss+xml, application/xml' },
        responseType:   'text',
        endpointName:   'blog/rss',
      });
      if (typeof xml === 'string') {
        const rssItems = parseRss(xml, limit);
        if (rssItems.length > 0) posts = rssItems;
      }
    } catch (err) {
      lastReason = err.reason || classifyError(err);
      console.error('[blog/posts] RSS falhou', { reason: lastReason });
    }
  }

  // ── Upstream OK → atualiza cache e responde ───────────────────────────────
  if (posts && posts.length > 0) {
    cache.ts   = now;
    cache.data = posts;
    const sliced = posts.slice(0, limit);
    return res.json({
      success: true,
      count:   sliced.length,
      data:    sliced,
      meta:    { source: 'upstream' },
    });
  }

  // ── Stale cache fallback ──────────────────────────────────────────────────
  if (cache.data) {
    const sliced = cache.data.slice(0, limit);
    console.warn('[blog/posts] servindo cache stale', {
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
  console.error('[blog/posts] todos os upstreams falharam, sem cache disponível', {
    reason: lastReason,
  });
  return res.status(503).json({
    success: false,
    data:    [],
    message: 'O blog está temporariamente indisponível. Tente novamente em alguns instantes.',
    meta:    { reason: lastReason },
  });
});

export default router;
