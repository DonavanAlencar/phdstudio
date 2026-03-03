import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink, BookOpenText, Sparkles } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  description: string;
  category: string;
  image: string;
  url: string;
}

const FALLBACK_POSTS: BlogPost[] = [
  {
    id: 'seo-para-ia-geo',
    title: 'Seu site está perdendo tráfego? A culpa é do Zero-Click Search (E como o SEO para IA (GEO) muda tudo)',
    description:
      'Você já parou para olhar os dados do seu tráfego orgânico recentemente? Se as impressões seguem altas e os cliques caem, o Zero-Click Search pode ser o vilão — e o SEO para IA (GEO) a resposta.',
    category: 'SEO & Growth',
    image:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop',
    url: 'https://www.phdstudio.blog.br/blog',
  },
  {
    id: 'ia-e-ciencia',
    title: 'IA e Novas Descobertas Científicas: O Motor da Inovação',
    description:
      'Como a inteligência artificial se consolidou como parte essencial da infraestrutura da ciência moderna, acelerando pesquisas e abrindo caminhos antes inimagináveis.',
    category: 'Ciência & Inovação',
    image:
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=800&auto=format&fit=crop',
    url: 'https://www.phdstudio.blog.br/blog',
  },
  {
    id: 'ia-e-novas-geracoes',
    title: 'IA e Novas Gerações: Aceleradora ou Atrofiante?',
    description:
      'A IA pode ser uma aliada poderosa ou uma muleta perigosa para as novas gerações — tudo depende de como é ensinada e integrada ao cotidiano.',
    category: 'Sociedade & Futuro',
    image:
      'https://images.unsplash.com/photo-1516838088174-1d98506b8e28?q=80&w=800&auto=format&fit=crop',
    url: 'https://www.phdstudio.blog.br/blog',
  },
  {
    id: 'marketing-etico-2026',
    title: 'Marketing Ético em 2026: Marcas que Integram Dados, Criatividade e Responsabilidade',
    description:
      'Em um cenário onde a disputa é por confiança, marcas que equilibram performance com transparência, privacidade e inclusão saem na frente.',
    category: 'Estratégia & Ética',
    image:
      'https://images.unsplash.com/photo-1526498460520-4c246339dccb?q=80&w=800&auto=format&fit=crop',
    url: 'https://www.phdstudio.blog.br/blog',
  },
];

const BlogPostsCarousel: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [posts, setPosts] = useState<BlogPost[]>(FALLBACK_POSTS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchBlogPosts = async () => {
      try {
        setLoading(true);

        const response = await fetch('/api/blog/posts');
        if (!response.ok) {
          throw new Error(`Erro ${response.status}`);
        }

        const result = await response.json();
        if (
          result &&
          result.success &&
          Array.isArray(result.data) &&
          result.data.length > 0
        ) {
          const mapped: BlogPost[] = result.data.map((item: any, index: number) => ({
            id: item.id || item.slug || String(index),
            title: item.title,
            description: item.excerpt,
            category: item.category || 'PHD Insights',
            image: item.image,
            url: item.url,
          }));

          if (isMounted) {
            setPosts(mapped);
          }
        }
      } catch {
        // Silencioso: mantém FALLBACK_POSTS
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchBlogPosts();

    return () => {
      isMounted = false;
    };
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const visibleWidth = container.clientWidth;

    container.scrollBy({
      left: direction === 'left' ? -visibleWidth : visibleWidth,
      behavior: 'smooth',
    });
  };

  return (
    <section
      className="py-20 bg-brand-dark relative overflow-hidden border-t border-white/5"
      aria-labelledby="blog-insights-title"
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-brand-red/10 p-2 rounded-lg border border-brand-red/20">
                <Sparkles className="text-brand-red" size={24} />
              </div>
              <h2
                id="blog-insights-title"
                className="text-3xl md:text-4xl font-black font-heading tracking-tight"
              >
                PHD Insights: Inteligência e Estratégia
              </h2>
            </div>
            <p className="text-gray-400 text-lg font-light">
              Fique por dentro das últimas tendências em Marketing, Automação e IA para escalar seu
              negócio.
            </p>
          </div>

          <a
            href="https://www.phdstudio.blog.br/blog"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 text-white font-bold bg-brand-gray border border-white/10 px-6 py-3 rounded-lg hover:bg-brand-red hover:border-brand-red transition-all shadow-lg hover:shadow-brand-red/20 text-sm uppercase tracking-wide"
          >
            <span className="hidden sm:inline">Ver todos os artigos</span>
            <span className="sm:hidden">Ir para o Blog</span>
            <ExternalLink size={18} className="group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        <div className="relative group/nav">
          {/* Navigation Arrows (Desktop) */}
          {posts.length > 0 && (
            <>
              <button
                onClick={() => scroll('left')}
                className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 bg-black/80 border border-white/10 p-3 rounded-full text-white shadow-xl hover:bg-brand-red hover:border-brand-red transition-all opacity-0 group-hover/nav:opacity-100 backdrop-blur-sm"
                aria-label="Artigo anterior"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={() => scroll('right')}
                className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 bg-black/80 border border-white/10 p-3 rounded-full text-white shadow-xl hover:bg-brand-red hover:border-brand-red transition-all opacity-0 group-hover/nav:opacity-100 backdrop-blur-sm"
                aria-label="Próximo artigo"
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
            aria-label="Artigos recentes do blog PHD Insights"
          >
            {posts.map((post) => (
              <article
                key={post.id}
                className="flex-shrink-0 w-[280px] sm:w-[320px] lg:w-[360px] snap-center rounded-2xl overflow-hidden border border-white/10 bg-brand-gray shadow-lg hover:shadow-brand-red/20 transition-shadow duration-300"
                role="listitem"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover/nav:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute top-3 left-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/70 border border-white/10 text-[11px] font-bold uppercase tracking-wide text-white/90">
                    <BookOpenText size={14} />
                    <span>{post.category}</span>
                  </div>
                </div>

                <div className="p-5 flex flex-col h-full">
                  <h3 className="text-white font-semibold text-base md:text-lg leading-snug mb-2 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-3">
                    {post.description}
                  </p>
                  <div className="mt-auto pt-2">
                    <a
                      href={post.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-brand-red font-semibold text-sm hover:text-red-400 transition-colors"
                    >
                      <span>Ler artigo</span>
                      <ExternalLink size={16} />
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BlogPostsCarousel;

