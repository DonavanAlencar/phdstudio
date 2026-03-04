import express from 'express';
import axios from 'axios';
import dns from 'dns';

dns.setDefaultResultOrder('ipv4first');

const router = express.Router();

const DEFAULT_LIMIT = 9;
const CACHE_TTL_MS = parseInt(process.env.YOUTUBE_CACHE_TTL || '600000', 10);
const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID || 'UC_s3s_4pA_p-yQY_k_E8B_w';

let cache = { ts: 0, data: null };

const mapRssItem = (item) => {
  const get = (tag) => {
    const m = item.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, 'i'));
    return m ? m[1] : '';
  };
  const title = get('title').replace(/<!\[CDATA\[|\]\]>/g, '').trim();
  const link = get('link').trim();
  const published = get('published').trim();
  const idMatch = item.match(/<yt:videoId>([^<]+)<\/yt:videoId>/i);
  const thumbMatch = item.match(/<media:thumbnail[^>]*url="([^"]+)"/i);
  const videoId = idMatch ? idMatch[1] : '';
  const thumbnail = thumbMatch ? thumbMatch[1] : `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  return {
    id: videoId,
    title,
    thumbnail,
    duration: '',
    publishedAt: published || new Date().toISOString(),
  };
};

router.get('/videos', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || DEFAULT_LIMIT, 12);
    const now = Date.now();
    if (req.query.force !== '1' && cache.data && now - cache.ts < CACHE_TTL_MS) {
      return res.json({ success: true, count: cache.data.length, data: cache.data.slice(0, limit) });
    }
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;
    const resp = await axios.get(rssUrl, {
      timeout: 15000,
      headers: { Accept: 'application/rss+xml, application/xml' },
      responseType: 'text',
      validateStatus: (s) => s >= 200 && s < 500,
      family: 4,
      lookup: dns.lookup,
    });
    if (resp.status === 200 && typeof resp.data === 'string') {
      const xml = resp.data;
      const entries = Array.from(xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)).slice(0, limit);
      const videos = entries.map((m) => mapRssItem(m[1]));
      cache = { ts: now, data: videos };
      return res.json({ success: true, count: videos.length, data: videos });
    }
    return res.status(502).json({ success: false, error: 'Falha ao obter vídeos' });
  } catch (e) {
    return res.status(503).json({ success: false, error: 'Serviço YouTube indisponível', message: e.message });
  }
});

export default router;
