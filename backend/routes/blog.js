import express from 'express';
import axios from 'axios';
import dns from 'dns';

dns.setDefaultResultOrder('ipv4first');

const router = express.Router();

const WP_BASE = process.env.WP_URL || 'https://www.phdstudio.blog.br';
const POSTS_LIMIT_DEFAULT = 6;
const CACHE_TTL_MS = parseInt(process.env.BLOG_CACHE_TTL || '600000', 10);

let cache = { ts: 0, data: null };

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
    const limit = Math.min(parseInt(req.query.limit, 10) || POSTS_LIMIT_DEFAULT, 12);
    const now = Date.now();

    if (req.query.force !== '1' && cache.data && now - cache.ts < CACHE_TTL_MS) {
      return res.json({ success: true, count: cache.data.length, data: cache.data.slice(0, limit) });
    }

    const wpUrl = `${WP_BASE.replace(/\/$/, '')}/wp-json/wp/v2/posts?per_page=${limit}&_embed=1&orderby=date&order=desc`;
    const wpResp = await axios.get(wpUrl, {
      timeout: 15000,
      headers: { Accept: 'application/json' },
      validateStatus: (s) => s >= 200 && s < 500,
      family: 4,
      lookup: dns.lookup,
    });

    if (wpResp.status === 200 && Array.isArray(wpResp.data)) {
      const posts = wpResp.data.map(mapWpPost).filter((p) => p.title && p.url);
      cache = { ts: now, data: posts };
      return res.json({ success: true, count: posts.length, data: posts });
    }

    const rssUrl = `${WP_BASE.replace(/\/$/, '')}/feed/`;
    const rssResp = await axios.get(rssUrl, {
      timeout: 15000,
      headers: { Accept: 'application/rss+xml, application/xml' },
      validateStatus: (s) => s >= 200 && s < 500,
      responseType: 'text',
      family: 4,
      lookup: dns.lookup,
    });

    if (rssResp.status === 200 && typeof rssResp.data === 'string') {
      const xml = rssResp.data;
      const items = Array.from(xml.matchAll(/<item>([\s\S]*?)<\/item>/g)).slice(0, limit);
      const posts = items
        .map((match) => {
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
            publish_date: new Date(pubDate).toISOString(),
          };
        })
        .filter((p) => p.title && p.url);

      posts.sort((a, b) => new Date(b.publish_date).getTime() - new Date(a.publish_date).getTime());
      cache = { ts: now, data: posts };
      return res.json({ success: true, count: posts.length, data: posts });
    }

    return res.status(502).json({ success: false, error: 'Falha ao obter posts do blog' });
  } catch (err) {
    return res.status(503).json({ success: false, error: 'Serviço de blog indisponível', message: err.message });
  }
});

export default router;

