import React, { useRef, useState, useEffect } from 'react';
import { Heart, MessageCircle, ChevronLeft, ChevronRight, Instagram, ExternalLink, Loader2 } from 'lucide-react';

// URL da API do Instagram (configurada via variável de ambiente)
// Se não tiver VITE_INSTAGRAM_API_URL, usa VITE_API_URL + /instagram
const getInstagramApiUrl = () => {
  if (import.meta.env.VITE_INSTAGRAM_API_URL) {
    return import.meta.env.VITE_INSTAGRAM_API_URL;
  }
  const apiUrl = import.meta.env.VITE_API_URL || 'https://phdstudio.com.br/api';
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
  timestamp?: string;
}

const InstagramCarousel: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const CACHE_KEY = 'instagram_posts_cache';
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
    
    // Função para buscar posts com retry
    const fetchWithRetry = async (url: string, retries = 2): Promise<Response> => {
      const cacheBustingUrl = `${url}${url.includes('?') ? '&' : '?'}v=${Date.now()}`;
      for (let attempt = 0; attempt < retries; attempt++) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => {
            controller.abort(new DOMException(`Request timeout after 25 seconds (attempt ${attempt + 1}/${retries})`, 'AbortError'));
          }, 25000);
          
          const response = await fetch(cacheBustingUrl, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            signal: controller.signal,
          });
          
          clearTimeout(timeoutId);
          
          if (response.ok) {
            return response;
          }
          
          // Se for 404, não tentar novamente
          if (response.status === 404) {
            throw new Error(`Endpoint não encontrado (404): ${url}`);
          }
          
          // Se não for último attempt, esperar antes de tentar novamente
          if (attempt < retries - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
            continue;
          }
          
          return response;
        } catch (err: any) {
          if (attempt === retries - 1) {
            throw err;
          }
          // Esperar antes de tentar novamente
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }
      throw new Error('Todas as tentativas falharam');
    };

    const fetchInstagramPosts = async () => {
      try {
        // Verificar cache primeiro
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          try {
            const { data, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp < CACHE_DURATION) {
              // console.log('📸 [Instagram] Usando posts do cache');
              setPosts(data);
              setError(false);
              setLoading(false);
              return;
            }
          } catch (e) {
            // Cache inválido, continuar com fetch
          }
        }

        // Força o backend a sempre tentar buscar os posts mais recentes
        const apiUrl = `${INSTAGRAM_API_URL}/posts?limit=8&force=1`;
        // console.log('📸 [Instagram] Buscando posts de:', apiUrl);
        
        const response = await fetchWithRetry(apiUrl);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          // console.error('❌ [Instagram] Erro na resposta:', response.status, errorData);
          
          // Em erros conhecidos, exibir estado vazio elegante
          if (response.status === 503 || response.status === 504 || response.status === 404) {
            setPosts([]);
            setError(true);
            setLoading(false);
            return;
          }
          throw new Error(errorData.message || `Erro ${response.status}: Failed to fetch instagram posts`);
        }

        const result = await response.json();
        // console.log('✅ [Instagram] Resposta recebida:', { success: result.success, count: result.data?.length || 0 });
        
        if (result.success && result.data && Array.isArray(result.data) && result.data.length > 0) {
          // Salvar no cache
          localStorage.setItem(CACHE_KEY, JSON.stringify({
            data: result.data,
            timestamp: Date.now()
          }));
          
          setPosts(result.data);
          setError(false);
          // console.log('✅ [Instagram] Posts carregados com sucesso:', result.data.length);
        } else {
          setPosts([]);
          setError(true);
        }
        
        setLoading(false);
      } catch (err: any) {
        // console.error('❌ [Instagram] Erro ao buscar posts:', err.message || err);
        setError(true);
        setPosts([]);
        setLoading(false);
      }
    };

    fetchInstagramPosts();
  }, []);

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

        {/* Carrossel do Instagram removido: mantemos apenas título e CTA */}
      </div>
    </section>
  );
};

export default InstagramCarousel;
