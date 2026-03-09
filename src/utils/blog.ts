export interface BlogPost {
  id: string | number;
  title: string;
  excerpt: string;
  featured_image: string | null;
  url: string;
  publish_date: string;
}

const getBlogApiBase = () => {
  if (import.meta.env.VITE_BLOG_API_URL) {
    return import.meta.env.VITE_BLOG_API_URL;
  }
  const apiUrl = import.meta.env.VITE_API_URL || 'https://phdstudio.com.br/api';
  const baseUrl = apiUrl.endsWith('/api') ? apiUrl : `${apiUrl}/api`;
  return `${baseUrl}/blog`;
};

const BLOG_API = getBlogApiBase();

export type FetchPostsResult = { posts: BlogPost[]; error: boolean };

export const fetchLatestPosts = async (limit = 6): Promise<FetchPostsResult> => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const force = import.meta.env.DEV ? '&force=1' : '';
    const resp = await fetch(`${BLOG_API}/posts?limit=${limit}&v=${Date.now()}${force}`, { signal: controller.signal });
    clearTimeout(timeout);
    if (!resp.ok) return { posts: [], error: true };
    const json = await resp.json();
    if (json?.success && Array.isArray(json.data)) {
      const posts: BlogPost[] = json.data
        .map((p: any) => ({
          id: p.id,
          title: p.title,
          excerpt: p.excerpt,
          featured_image: p.featured_image || null,
          url: p.url,
          publish_date: p.publish_date,
        }))
        .sort((a, b) => new Date(b.publish_date).getTime() - new Date(a.publish_date).getTime())
        .slice(0, limit);
      return { posts, error: false };
    }
    return { posts: [], error: false };
  } catch {
    return { posts: [], error: true };
  }
};

// --- RSS-based fetch (client-side) ---

const BLOG_RSS_URL = 'https://www.phdstudio.blog.br/blog-feed.xml';

export const fetchLatestPostsFromRss = async (limit = 8): Promise<FetchPostsResult> => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const resp = await fetch(`${BLOG_RSS_URL}?v=${Date.now()}`, { signal: controller.signal });
    clearTimeout(timeout);

    if (!resp.ok) return { posts: [], error: true };

    const xmlText = await resp.text();
    const parser = new DOMParser();
    const xml = parser.parseFromString(xmlText, 'application/xml');

    if (xml.querySelector('parsererror')) {
      return { posts: [], error: true };
    }

    const items = Array.from(xml.querySelectorAll('channel > item, item')).slice(0, limit);

    const posts: BlogPost[] = items.map((item, index) => {
      const getText = (selector: string) =>
        (item.querySelector(selector)?.textContent || '').trim();

      const title = getText('title') || 'Post sem título';
      const link = getText('link') || '#';
      const pubDateRaw = getText('pubDate');

      // Description: usado para excerpt e tentativa de extrair imagem
      const descNode = item.querySelector('description');
      let excerpt = '';
      let featured_image: string | null = null;

      if (descNode) {
        const tmp = document.createElement('div');
        tmp.innerHTML = descNode.textContent || '';

        const text = (tmp.textContent || '').replace(/\s+/g, ' ').trim();
        if (text) {
          const maxLen = 160;
          excerpt = text.length > maxLen ? text.slice(0, maxLen) + '…' : text;
        }

        const imgEl = tmp.querySelector('img');
        if (imgEl && imgEl.src) {
          featured_image = imgEl.src;
        }
      }

      // media:content ou enclosure como fallback de imagem
      if (!featured_image) {
        const mediaEl = item.querySelector('media\\:content, content');
        if (mediaEl && mediaEl.getAttribute('url')) {
          featured_image = mediaEl.getAttribute('url');
        }
      }

      if (!featured_image) {
        const enclosure = item.querySelector('enclosure[url]');
        if (enclosure) {
          featured_image = enclosure.getAttribute('url');
        }
      }

      let publish_date = new Date().toISOString();
      if (pubDateRaw) {
        const d = new Date(pubDateRaw);
        if (!Number.isNaN(d.getTime())) {
          publish_date = d.toISOString();
        }
      }

      return {
        id: getText('guid') || index,
        title,
        excerpt,
        featured_image,
        url: link,
        publish_date,
      };
    });

    return { posts, error: false };
  } catch {
    return { posts: [], error: true };
  }
};

