import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Instagram, ExternalLink } from 'lucide-react';

type InstagramMediaType = 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';

interface InstagramPost {
  id: string;
  media_type: InstagramMediaType;
  media_url: string;
  thumbnail_url?: string;
  caption?: string;
  permalink: string;
}

const getInstagramApiUrl = () => {
  if (import.meta.env.VITE_INSTAGRAM_API_URL) {
    return import.meta.env.VITE_INSTAGRAM_API_URL;
  }
  const apiUrl = import.meta.env.VITE_API_URL || 'https://phdstudio.com.br/api';
  const baseUrl = apiUrl.endsWith('/api') ? apiUrl : `${apiUrl}/api`;
  return `${baseUrl}/instagram`;
};

const INSTAGRAM_API_URL = getInstagramApiUrl();

const buildContentFromCaption = (caption?: string) => {
  const clean = (caption || '').trim();
  if (!clean) {
    return {
      title: 'Post recente do Instagram',
      summary: 'Conteúdo em tempo real do perfil @phdstudiooficial.',
    };
  }

  const firstDot = clean.indexOf('.');
  const cutoff =
    firstDot !== -1 && firstDot < 120 ? firstDot + 1 : Math.min(100, clean.length);

  const title = clean.slice(0, cutoff).trim();
  const summary = clean.slice(cutoff).trim();

  return {
    title,
    summary:
      summary ||
      'Acompanhe o perfil @phdstudiooficial para ver o conteúdo completo desse post.',
  };
};

const FALLBACK_POSTS: InstagramPost[] = [
  {
    id: 'fallback-1',
    media_type: 'IMAGE',
    media_url:
      'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?q=80&w=800&auto=format&fit=crop',
    caption:
      'Conteúdo estratégico em marketing digital, automação e IA diretamente do Instagram da PHD Studio.',
    permalink: 'https://www.instagram.com/phdstudiooficial',
  },
  {
    id: 'fallback-2',
    media_type: 'IMAGE',
    media_url:
      'https://images.unsplash.com/photo-1526491109672-74740652b963?q=80&w=800&auto=format&fit=crop',
    caption:
      'Cases reais, bastidores e insights diários sobre performance e crescimento de negócios.',
    permalink: 'https://www.instagram.com/phdstudiooficial',
  },
];

const InstagramLeadCarousel: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const CACHE_KEY = 'instagram_leads_carousel_cache';
    const CACHE_MAX_AGE = 5 * 60 * 1000; // 5 minutos

    const clearCache = () => {
      try {
        localStorage.removeItem(CACHE_KEY);
      } catch {
        // ignore
      }
    };

    const fetchWithRetry = async (url: string, retries = 2): Promise<Response> => {
      const cacheBustingUrl = `${url}${url.includes('?') ? '&' : '?'}v=${Date.now()}`;
      for (let attempt = 0; attempt < retries; attempt++) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(
            () => controller.abort(new DOMException(`Timeout (tentativa ${attempt + 1}/${retries})`, 'AbortError')),
            25000
          );
          const response = await fetch(cacheBustingUrl, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
          });
          clearTimeout(timeoutId);
          if (response.ok) return response;
          if (response.status === 404) throw new Error(`Endpoint não encontrado: ${url}`);
          if (attempt < retries - 1) {
            await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
            continue;
          }
          return response;
        } catch (err) {
          if (attempt === retries - 1) throw err;
          await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
        }
      }
      throw new Error('Todas as tentativas falharam');
    };

    const fetchPosts = async () => {
      try {
        setLoading(true);

        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          try {
            const { data, timestamp } = JSON.parse(cached);
            const isStale = Date.now() - timestamp >= CACHE_MAX_AGE;
            const isValid = Array.isArray(data) && data.length > 0 && !data.some((p: InstagramPost) => p.id?.startsWith('fallback-'));
            if (!isStale && isValid && mounted) {
              setPosts(data);
              setLoading(false);
              return;
            }
          } catch {
            // ignora cache inválido
          }
        }

        const endpoint = `${INSTAGRAM_API_URL}/posts?limit=8&force=1`;
        const response = await fetchWithRetry(endpoint);

        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          if (response.status === 503) clearCache();
          throw new Error((body as { message?: string })?.message || `Erro ${response.status}`);
        }

        const result = await response.json();
        if (
          result &&
          result.success &&
          Array.isArray(result.data) &&
          result.data.length > 0
        ) {
          if (mounted) setPosts(result.data);
          localStorage.setItem(
            CACHE_KEY,
            JSON.stringify({ data: result.data, timestamp: Date.now() }),
          );
        } else if (mounted) {
          setPosts(FALLBACK_POSTS);
        }
      } catch {
        clearCache();
        if (mounted) setPosts(FALLBACK_POSTS);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchPosts();

    return () => {
      mounted = false;
    };
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const width = scrollRef.current.clientWidth;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -width : width,
      behavior: 'smooth',
    });
  };

  return (
    <section
      className="py-20 bg-brand-dark relative overflow-hidden border-t border-white/5"
      aria-labelledby="instagram-leads-title"
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-brand-red/10 p-2 rounded-lg border border-brand-red/20">
                <Instagram className="text-brand-red" size={24} />
              </div>
              <h2
                id="instagram-leads-title"
                className="text-3xl md:text-4xl font-black font-heading tracking-tight"
              >
                Siga a PHD Studio no Instagram
              </h2>
            </div>
            <p className="text-gray-400 text-lg font-light">
              Veja como pensamos estratégia, marketing e automação na prática. Explore os últimos
              posts do nosso Instagram e descubra insights que podem acelerar o seu negócio.
            </p>
          </div>

          <a
            href="https://www.instagram.com/phdstudiooficial"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 text-white font-bold bg-brand-gray border border-white/10 px-6 py-3 rounded-lg hover:bg-brand-red hover:border-brand-red transition-all shadow-lg hover:shadow-brand-red/20 text-sm uppercase tracking-wide"
          >
            <span className="hidden sm:inline">Ver perfil no Instagram</span>
            <span className="sm:hidden">@phdstudiooficial</span>
            <ExternalLink size={18} className="group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        <div className="relative group/nav">
          {!loading && posts.length > 0 && (
            <>
              <button
                onClick={() => scroll('left')}
                className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 bg-black/80 border border-white/10 p-3 rounded-full text-white shadow-xl hover:bg-brand-red hover:border-brand-red transition-all opacity-0 group-hover/nav:opacity-100 backdrop-blur-sm"
                aria-label="Post anterior do Instagram"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={() => scroll('right')}
                className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 bg-black/80 border border-white/10 p-3 rounded-full text-white shadow-xl hover:bg-brand-red hover:border-brand-red transition-all opacity-0 group-hover/nav:opacity-100 backdrop-blur-sm"
                aria-label="Próximo post do Instagram"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}

          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-hide px-4 md:px-0 -mx-4 md:mx-0"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            role="list"
            aria-label="Posts recentes do Instagram da PHD Studio para geração de leads"
          >
            {loading
              ? Array(4)
                  .fill(0)
                  .map((_, i) => (
                    <div
                      key={i}
                      className="flex-shrink-0 w-[280px] sm:w-[320px] lg:w-[360px] aspect-[4/5] rounded-2xl bg-white/5 animate-pulse border border-white/10"
                    />
                  ))
              : posts.map((post) => {
                  const { title, summary } = buildContentFromCaption(post.caption);
                  const image =
                    post.media_type === 'VIDEO'
                      ? post.thumbnail_url || post.media_url
                      : post.media_url;

                  return (
                    <article
                      key={post.id}
                      className="flex-shrink-0 w-[280px] sm:w-[320px] lg:w-[360px] snap-center rounded-2xl overflow-hidden border border-white/10 bg-brand-gray shadow-lg hover:shadow-brand-red/20 transition-shadow duration-300"
                      role="listitem"
                    >
                      <a
                        href={post.permalink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block h-full"
                      >
                        <div className="relative aspect-[4/3] overflow-hidden">
                          <img
                            src={image}
                            alt={title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover/nav:scale-110"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                          <div className="absolute top-3 left-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/70 border border-white/10 text-[11px] font-bold uppercase tracking-wide text-white/90">
                            <Instagram size={14} />
                            <span>@phdstudiooficial</span>
                          </div>
                        </div>

                        <div className="p-5 flex flex-col h-full">
                          <h3 className="text-white font-semibold text-base md:text-lg leading-snug mb-2 line-clamp-2">
                            {title}
                          </h3>
                          <p className="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-3">
                            {summary}
                          </p>
                          <div className="mt-auto pt-2 flex items-center justify-between text-xs text-gray-400">
                            <span>Ver post completo no Instagram</span>
                            <ExternalLink size={14} />
                          </div>
                        </div>
                      </a>
                    </article>
                  );
                })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default InstagramLeadCarousel;

