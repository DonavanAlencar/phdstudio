const WIX_CLIENT_ID = '28da1989-550c-4cd8-966f-546ec76ba3b4';
const BLOG_BASE = 'https://www.phdstudio.blog.br';
const LIMIT = 4;
const GRID_ID = 'blog-cases-grid';

function byId(id) { return document.getElementById(id); }

function buildCard(d) {
  const image = d.image;
  const title = d.title;
  const excerpt = d.excerpt;
  const category = d.category;
  const url = d.url;
  const root = document.createElement('div');
  root.className = 'group cursor-pointer';
  root.innerHTML = `
    <div class="overflow-hidden rounded-xl mb-6 relative">
      <div class="absolute top-4 right-4 bg-brand-red text-white text-xs font-bold px-3 py-1 rounded-full z-20">${category || 'ARTIGO'}</div>
      ${image ? `<img class="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700" alt="${title}" loading="lazy" decoding="async" src="${image}">` : `<div class="w-full h-64 bg-white/10 rounded-xl"></div>`}
      <div class="absolute inset-0 bg-black/50 group-hover:bg-black/30 transition-colors"></div>
    </div>
    <div class="flex items-start justify-between mb-2">
      <h3 class="text-2xl font-bold font-heading text-white">${title}</h3>
      <span class="text-brand-red font-black text-xl">${category ? category.toUpperCase() : 'ARTIGO'}</span>
    </div>
    ${excerpt ? `<p class="text-gray-400 text-sm border-l-2 border-white/10 pl-4">${excerpt}</p>` : `<div class="h-8"></div>`}
    <a href="${url}" target="_blank" rel="noopener noreferrer" class="sr-only">Abrir artigo</a>
  `;
  root.addEventListener('click', () => { if (url) window.open(url, '_blank', 'noopener,noreferrer'); });
  return root;
}

function renderPosts(posts) {
  const grid = byId(GRID_ID);
  if (!grid) return;
  grid.innerHTML = '';
  posts.slice(0, LIMIT).forEach(p => grid.appendChild(buildCard(p)));
}

async function fetchWixRss(limit) {
  const candidates = [
    `${BLOG_BASE}/blog-feed.xml`,
    `${BLOG_BASE}/blog/blog-feed.xml`,
    `${BLOG_BASE}/feed.xml`,
    `${BLOG_BASE}/feed`
  ];
  for (const url of candidates) {
    try {
      const res = await fetch(url, { headers: { 'Accept': 'application/rss+xml, application/xml, text/xml' } });
      if (!res.ok) continue;
      const xml = await res.text();
      const doc = new DOMParser().parseFromString(xml, 'application/xml');
      const items = Array.from(doc.querySelectorAll('item')).slice(0, limit);
      if (items.length) {
        const posts = items.map(it => {
          const title = it.querySelector('title')?.textContent?.trim() || '';
          const link = it.querySelector('link')?.textContent?.trim() || BLOG_BASE;
          const desc = it.querySelector('description')?.textContent?.trim() || '';
          let img = null;
          const media = it.querySelector('media\\:content, content, media\\:thumbnail, thumbnail, enclosure');
          if (media) img = media.getAttribute('url') || media.textContent || null;
          return {
            image: img,
            title,
            excerpt: desc.replace(/<[^>]+>/g, '').trim(),
            category: 'PHD Insights',
            url: link
          };
        });
        return posts;
      }
    } catch {}
  }
  return [];
}

async function fetchWixHeadless(limit) {
  const sdkUrl = 'https://cdn.jsdelivr.net/npm/@wix/sdk/dist/web/index.mjs';
  const { createClient, OAuthStrategy } = await import(sdkUrl);
  const wixClient = createClient({ auth: OAuthStrategy({ clientId: WIX_CLIENT_ID }) });
  const tokens = await wixClient.auth.generateVisitorTokens();
  wixClient.auth.setTokens(tokens);
  const resp = await fetch(`https://www.wixapis.com/blog/v3/posts?limit=${limit}&visibility=PUBLISHED&sort=publishedDate%20desc`, {
    headers: { 'Authorization': `Bearer ${tokens.accessToken.value}`, 'Content-Type': 'application/json' }
  });
  if (!resp.ok) throw new Error('wix');
  const json = await resp.json();
  const posts = (json.posts || []).map(p => {
    const img = p.coverMedia?.image?.url || p.coverImage || null;
    const cats = Array.isArray(p.categories) && p.categories.length ? p.categories[0].name : 'PHD Insights';
    const slug = p.slug || p._id || '';
    return {
      image: img,
      title: p.title || 'Sem título',
      excerpt: (p.excerpt || '').trim(),
      category: cats,
      url: slug ? `${BLOG_BASE}/post/${slug}` : (p.link || `${BLOG_BASE}/blog`)
    };
  });
  return posts;
}

function attachNav() {
  const prev = document.querySelector('#blog-prev');
  const next = document.querySelector('#blog-next');
  if (!prev && !next) return;
  const grid = byId(GRID_ID);
  const scroller = grid?.parentElement;
  if (!scroller) return;
  const cardWidth = 392;
  prev?.addEventListener('click', () => scroller.scrollBy({ left: -cardWidth, behavior: 'smooth' }));
  next?.addEventListener('click', () => scroller.scrollBy({ left: cardWidth, behavior: 'smooth' }));
}

async function init() {
  attachNav();
  try {
    const posts = await fetchWixHeadless(LIMIT);
    if (posts && posts.length) { renderPosts(posts); return; }
    const rss = await fetchWixRss(LIMIT);
    renderPosts(rss);
  } catch {
    const rss = await fetchWixRss(LIMIT);
    renderPosts(rss);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

