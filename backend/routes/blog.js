import express from 'express';
import axios from 'axios';
import dns from 'dns';

dns.setDefaultResultOrder('ipv4first');

const router = express.Router();

// Fonte dos posts: API do blog em React (padrão); para usar WordPress, defina WP_URL e deixe BLOG_API_URL vazia
const BLOG_API_URL = process.env.BLOG_API_URL ?? 'https://www.phdstudio.blog.br/api/posts';
const WP_BASE = process.env.WP_URL || 'https://www.phdstudio.blog.br';
const BLOG_RSS_URL = process.env.BLOG_RSS_URL || 'https://www.phdstudio.blog.br/blog-feed.xml';
const POSTS_LIMIT_DEFAULT = 6;
const CACHE_TTL_MS = parseInt(process.env.BLOG_CACHE_TTL || '600000', 10); // 10 minutos

// Cache em memória simples
let cache = {
  ts: 0,
  data: null
};

// Normaliza um post vindo de API genérica (React, CMS, etc.): { id, title, excerpt, url, featured_image, publish_date }
const mapGenericPost = (p) => ({
  id: p.id ?? p.slug ?? p.link,
  title: (typeof p.title === 'string' ? p.title : p.title?.rendered) || '',
  excerpt: (typeof p.excerpt === 'string' ? p.excerpt.replace(/<[^>]+>/g, '').trim() : (p.excerpt?.rendered || '').replace(/<[^>]+>/g, '').trim()) || '',
  url: p.url || p.link || p.permalink || '#',
  featured_image: p.featured_image ?? p.featuredImage ?? p.image ?? null,
  publish_date: p.publish_date || p.date || p.publishedAt || (p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString()),
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
    excerpt: p.excerpt?.rendered ? p.excerpt.rendered.replace(/<[^>]+>/g, '').trim() : '',
    url: p.link || `${WP_BASE}/?p=${p.id}`,
    featured_image: image,
    publish_date: p.date,
  };
};

router.get('/posts', async (req, res) => {
  try {
    let wpUrl;
    let rssUrl;

    const limit = Math.min(parseInt(req.query.limit, 10) || POSTS_LIMIT_DEFAULT, 12);
    const now = Date.now();

    if (req.query.force !== '1' && cache.data && now - cache.ts < CACHE_TTL_MS) {
      return res.json({ success: true, count: cache.data.length, data: cache.data.slice(0, limit) });
    }

    // 1) Se BLOG_API_URL está definida (blog em React, CMS, etc.), usar só essa API
    if (BLOG_API_URL) {
      const apiUrl = BLOG_API_URL.includes('?') ? `${BLOG_API_URL}&limit=${limit}` : `${BLOG_API_URL}?limit=${limit}`;
      const apiResp = await axios.get(apiUrl, {
        timeout: 15000,
        headers: { Accept: 'application/json' },
        validateStatus: (s) => s >= 200 && s < 500,
        family: 4,
        lookup: dns.lookup,
      });
      if (apiResp.status === 200 && apiResp.data) {
        const raw = Array.isArray(apiResp.data) ? apiResp.data : (apiResp.data.data || apiResp.data.posts || []);
        const posts = raw.map(mapGenericPost).filter((p) => p.title && p.url).slice(0, limit);
        if (posts.length > 0) {
          cache = { ts: now, data: posts };
          return res.json({ success: true, count: posts.length, data: posts });
        }
      }
    }

    // 2) Tentar via WP REST API (apenas se não usou BLOG_API_URL)
    wpUrl = `${WP_BASE.replace(/\/$/, '')}/wp-json/wp/v2/posts?per_page=${limit}&_embed=1&orderby=date&order=desc`;
    const wpResp = await axios.get(wpUrl, {
      timeout: 15000,
      headers: { 'Accept': 'application/json' },
      validateStatus: s => s >= 200 && s < 500,
      family: 4,
      lookup: dns.lookup
    });

    if (wpResp.status === 200 && Array.isArray(wpResp.data)) {
      const posts = wpResp.data.map(mapWpPost).filter(p => p.title && p.url);
      cache = { ts: now, data: posts };
      return res.json({ success: true, count: posts.length, data: posts });
    }

    // 3) Fallback: RSS (BLOG_RSS_URL ou feed do WP_BASE)
    rssUrl = BLOG_RSS_URL || `${WP_BASE.replace(/\/$/, '')}/feed/`;
    const rssResp = await axios.get(rssUrl, {
      timeout: 15000,
      headers: { 'Accept': 'application/rss+xml, application/xml' },
      validateStatus: s => s >= 200 && s < 500,
      responseType: 'text',
      family: 4,
      lookup: dns.lookup
    });

    if (rssResp.status === 200 && typeof rssResp.data === 'string') {
      const xml = rssResp.data;
      const items = Array.from(xml.matchAll(/<item>([\s\S]*?)<\/item>/g)).slice(0, limit);
      const posts = items.map(match => {
        const item = match[1];
        const get = (tag) => {
          const m = item.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, 'i'));
          return m ? m[1] : '';
        };
        const title = get('title').replace(/<!\[CDATA\[|\]\]>/g, '').trim();
        const link = get('link').trim();
        const pubDate = get('pubDate').trim();
        const description = get('description').replace(/<!\[CDATA\[|\]\]>/g, '').replace(/<[^>]+>/g, '').trim();
        let image = null;
        const mediaContent = item.match(/<media:content[^>]*url="([^"]+)"[^>]*>/i);
        if (mediaContent) image = mediaContent[1];
        const enclosure = item.match(/<enclosure[^>]*url="([^"]+)"[^>]*>/i);
        if (!image && enclosure) image = enclosure[1];
        return {
          id: link || pubDate || title,
          title,
          excerpt: description,
          url: link,
          featured_image: image,
          publish_date: new Date(pubDate).toISOString()
        };
      }).filter(p => p.title && p.url);

      posts.sort((a, b) => new Date(b.publish_date).getTime() - new Date(a.publish_date).getTime());
      cache = { ts: now, data: posts };
      return res.json({ success: true, count: posts.length, data: posts });
    }

    // Log detalhado antes de retornar 502 para facilitar diagnóstico em produção
    console.error('❌ [Blog] Falha ao obter posts', {
      blogApiUrl: BLOG_API_URL || '(não definida)',
      wpBase: WP_BASE,
      wpUrl,
      rssUrl,
      wpStatus: typeof wpResp !== 'undefined' ? wpResp.status : undefined,
      rssStatus: typeof rssResp !== 'undefined' ? rssResp.status : undefined
    });

    return res.status(502).json({ success: false, error: 'Falha ao obter posts do blog' });
  } catch (err) {
    // Logar exatamente qual URL foi tentada e o erro de rede específico
    console.error('❌ [Blog] Erro ao acessar fonte do blog', {
      blogApiUrl: BLOG_API_URL || '(não definida)',
      wpBase: WP_BASE,
      wpUrl,
      rssUrl,
      code: err.code,
      errno: err.errno,
      syscall: err.syscall,
      message: err.message,
      stack: err.stack?.substring(0, 500)
    });

    return res.status(503).json({ success: false, error: 'Serviço de blog indisponível', message: err.message });
  }
});

export default router;

