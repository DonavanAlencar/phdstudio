import React, { useRef, useState, useEffect } from 'react';
import { Heart, MessageCircle, ChevronLeft, ChevronRight, Instagram, ExternalLink, Loader2 } from 'lucide-react';

// URL da API do Instagram (configurada via variável de ambiente)
// Se não tiver VITE_INSTAGRAM_API_URL, usa VITE_API_URL + /instagram
const getInstagramApiUrl = () => {
  if (import.meta.env.VITE_INSTAGRAM_API_URL) {
    return import.meta.env.VITE_INSTAGRAM_API_URL;
  }
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
  // Remove /api duplicado se já estiver na URL
  const baseUrl = apiUrl.endsWith('/api') ? apiUrl : `${apiUrl}/api`;
  return `${baseUrl}/instagram`;
};

const INSTAGRAM_API_URL = getInstagramApiUrl();

interface InstagramPost {
  id: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_url: string;
  thumbnail_url?: string;
  caption?: string;
  permalink: string;
  like_count?: number;
  comments_count?: number;
}

const FALLBACK_POSTS = [
  {
    id: '1',
    media_url: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=600&auto=format&fit=crop",
    like_count: 124,
    comments_count: 18,
    caption: "Estratégia e dados: a combinação perfeita para escalar resultados. 🚀 #MarketingDigital #Growth",
    permalink: "https://www.instagram.com/phdstudiooficial"
  },
  {
    id: '2',
    media_url: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=600&auto=format&fit=crop",
    like_count: 89,
    comments_count: 12,
    caption: "Bastidores do nosso time de performance em ação. Aqui o ROI é lei! 💼 #TeamEffort #Performance",
    permalink: "https://www.instagram.com/phdstudiooficial"
  },
  {
    id: '3',
    media_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600&auto=format&fit=crop",
    like_count: 256,
    comments_count: 34,
    caption: "Dashboards que contam histórias de sucesso. Transformando números em insights. 📊 #DataDriven",
    permalink: "https://www.instagram.com/phdstudiooficial"
  },
  {
    id: '4',
    media_url: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=600&auto=format&fit=crop",
    like_count: 156,
    comments_count: 21,
    caption: "A tecnologia impulsionando o marketing. Inovação constante no nosso DNA. 💡 #Tech & #Marketing",
    permalink: "https://www.instagram.com/phdstudiooficial"
  },
  {
    id: '5',
    media_url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=600&auto=format&fit=crop",
    like_count: 198,
    comments_count: 25,
    caption: "Conexões reais criam resultados reais. Networking e aprendizado sempre. 🤝 #Business",
    permalink: "https://www.instagram.com/phdstudiooficial"
  },
  {
    id: '6',
    media_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=600&auto=format&fit=crop",
    like_count: 312,
    comments_count: 42,
    caption: "Otimização contínua. Porque o bom é inimigo do ótimo. 🔥 #NextLevel",
    permalink: "https://www.instagram.com/phdstudiooficial"
  }
];

const InstagramCarousel: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchInstagramPosts = async () => {
      try {
        const apiUrl = `${INSTAGRAM_API_URL}/posts?limit=9`;
        console.log('📸 Buscando posts do Instagram de:', apiUrl);
        
        // Buscar posts do Instagram via endpoint da API (mais seguro - token não exposto no frontend)
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('❌ Erro na resposta da API:', {
            status: response.status,
            statusText: response.statusText,
            error: errorData
          });
          throw new Error(errorData.message || `Erro ${response.status}: Failed to fetch instagram posts`);
        }

        const result = await response.json();
        console.log('✅ Resposta da API do Instagram:', result);
        
        if (result.success && result.data && Array.isArray(result.data) && result.data.length > 0) {
          setPosts(result.data);
          setError(false);
          console.log(`✅ ${result.data.length} posts do Instagram carregados com sucesso`);
        } else {
          console.warn('⚠️ Nenhum post encontrado ou formato inválido, usando fallback');
          throw new Error('Nenhum post encontrado');
        }
        
        setLoading(false);
      } catch (err: any) {
        console.error('❌ Erro ao buscar posts do Instagram:', err);
        console.warn('⚠️ Usando posts de fallback (imagens do Unsplash)');
        setError(true);
        // Fallback to mock data on error
        setPosts(FALLBACK_POSTS as any);
        setLoading(false);
      }
    };

    fetchInstagramPosts();
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300; // Adjust based on card width + gap
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="py-20 bg-brand-dark border-t border-white/5 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-brand-red/10 p-2 rounded-lg border border-brand-red/20">
                <Instagram className="text-brand-red" size={24} />
              </div>
              <h2 className="text-3xl md:text-4xl font-black font-heading tracking-tight">Siga a PHD</h2>
            </div>
            <p className="text-gray-400 text-lg font-light">
              Bastidores, insights e resultados diários. Acompanhe nossa rotina no Instagram <a href="https://www.instagram.com/phdstudiooficial" target="_blank" rel="noopener noreferrer" className="text-white hover:text-brand-red font-medium transition-colors">@phdstudiooficial</a>.
            </p>
          </div>

          <a
            href="https://www.instagram.com/phdstudiooficial"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 text-white font-bold bg-brand-gray border border-white/10 px-6 py-3 rounded-lg hover:bg-brand-red hover:border-brand-red transition-all shadow-lg hover:shadow-brand-red/20 text-sm uppercase tracking-wide"
          >
            <span className="hidden sm:inline">Ver perfil completo</span>
            <span className="sm:hidden">Ver no Instagram</span>
            <ExternalLink size={18} className="group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        <div className="relative group/nav">
          {/* Navigation Arrows (Desktop) */}
          {!loading && posts.length > 0 && (
            <>
              <button
                onClick={() => scroll('left')}
                className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 bg-black/80 border border-white/10 p-3 rounded-full text-white shadow-xl hover:bg-brand-red hover:border-brand-red transition-all opacity-0 group-hover/nav:opacity-100 backdrop-blur-sm"
                aria-label="Anterior"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={() => scroll('right')}
                className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 bg-black/80 border border-white/10 p-3 rounded-full text-white shadow-xl hover:bg-brand-red hover:border-brand-red transition-all opacity-0 group-hover/nav:opacity-100 backdrop-blur-sm"
                aria-label="Próximo"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}

          {/* Scroll Container */}
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-hide px-4 md:px-0 -mx-4 md:mx-0 min-h-[300px]"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {loading ? (
              // Skeleton Loaders
              Array(5).fill(0).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-[280px] aspect-[4/5] rounded-xl bg-white/5 animate-pulse border border-white/10" />
              ))
            ) : (
              posts.map(post => (
                <a
                  key={post.id}
                  href={post.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative flex-shrink-0 snap-center group w-[280px] aspect-[4/5] rounded-xl overflow-hidden border border-white/10 bg-brand-gray"
                >
                  {/* Image - Handle Video type */}
                  <img
                    src={post.media_type === 'VIDEO' ? post.thumbnail_url : post.media_url}
                    alt={post.caption || 'Instagram Post'}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center gap-4 p-6">
                    {(post.like_count !== undefined || post.comments_count !== undefined) && (
                      <div className="flex items-center gap-8 text-white font-bold">
                        {post.like_count !== undefined && (
                          <div className="flex items-center gap-2">
                            <Heart className="fill-white" size={24} />
                            <span>{post.like_count}</span>
                          </div>
                        )}
                        {post.comments_count !== undefined && (
                          <div className="flex items-center gap-2">
                            <MessageCircle className="fill-white" size={24} />
                            <span>{post.comments_count}</span>
                          </div>
                        )}
                      </div>
                    )}
                    {post.caption && (
                      <p className="text-white text-xs text-center line-clamp-3 font-medium opacity-90">
                        {post.caption}
                      </p>
                    )}
                    <div className="mt-4 text-brand-red text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                      Ver no Instagram <ExternalLink size={12} />
                    </div>
                  </div>

                  {/* Instagram Icon Corner */}
                  <div className="absolute top-3 right-3 bg-black/50 backdrop-blur rounded-full p-1.5 border border-white/10 opacity-70 group-hover:opacity-0 transition-opacity">
                    <Instagram size={16} className="text-white" />
                  </div>
                </a>
              ))
            )}
          </div>
        </div>

        {/* Mobile Swipe Hint */}
        <div className="md:hidden flex justify-center mt-2 gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-white/40"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-white/40"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-white/40"></div>
        </div>
      </div>
    </section>
  );
};

export default InstagramCarousel;
