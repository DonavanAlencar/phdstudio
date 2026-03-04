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
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
  const baseUrl = apiUrl.endsWith('/api') ? apiUrl : `${apiUrl}/api`;
  return `${baseUrl}/blog`;
};

const BLOG_API = getBlogApiBase();

export const fetchLatestPosts = async (limit = 6): Promise<BlogPost[]> => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const force = import.meta.env.DEV ? '&force=1' : '';
    const resp = await fetch(`${BLOG_API}/posts?limit=${limit}&v=${Date.now()}${force}`, { signal: controller.signal });
    clearTimeout(timeout);
    if (!resp.ok) return [];
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
      return posts;
    }
    return [];
  } catch {
    return [];
  }
};
