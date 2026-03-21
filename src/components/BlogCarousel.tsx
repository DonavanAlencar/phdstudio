import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { fetchLatestPosts, fetchLatestPostsFromRss, type BlogPost } from '../utils/blog';
import BlogCard from './BlogCard';

const BlogCarousel: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      setLoading(true);
      setFetchError(false);

      let result = await fetchLatestPosts(8);

      // Em erro, vazio ou cache stale, tenta RSS direto para manter o carrossel atualizado.
      if (mounted && (result.posts.length === 0 || result.stale)) {
        const rssResult = await fetchLatestPostsFromRss(8);
        if (rssResult.posts.length > 0 || result.posts.length === 0) {
          result = rssResult;
        } else {
          result = { ...result, error: true };
        }
      }

      if (mounted) {
        setPosts(result.posts);
        setFetchError(result.error);
        setLoading(false);
      }
    };

    run();

    return () => {
      mounted = false;
    };
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const cardWidth = 340;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -cardWidth : cardWidth,
      behavior: 'smooth',
    });
  };

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    const cardWidth = 340;
    const idx = Math.round(el.scrollLeft / cardWidth);
    setActiveIndex(idx);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll as any);
  }, [handleScroll]);

  return (
    <section className="relative py-20 bg-black/40 overflow-hidden ">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/80"
        aria-hidden="true"
      />
      <div className="container mx-auto px-4 relative z-10 bg-black/40 rounded-2xl shadow-2xl">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-brand-red/10 p-2 rounded-lg border border-brand-red/20">
                <FileText className="text-brand-red" size={24} />
              </div>
              <h2 className="text-3xl md:text-4xl font-black font-heading tracking-tight">
                Se atualize com a PHD INSIGHTS
              </h2>
            </div>
            <p className="text-gray-400 text-lg font-light">
              Artigos, análises e ideias que guiam decisões de marketing e tecnologia.
            </p>
          </div>
          <a
            href="https://www.phdstudio.blog.br/blog"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 text-white font-bold bg-brand-gray/40 border border-white/10 px-6 py-3 rounded-lg hover:bg-brand-red hover:border-brand-red transition-all shadow-lg hover:shadow-brand-red/20 text-sm uppercase tracking-wide"
          >
            Ver Blog
          </a>
        </div>

        <div className="relative group/nav">
          {!loading && posts.length > 0 && (
            <>
              <button
                onClick={() => scroll('left')}
                className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 bg-black/80 border border-white/10 p-3 rounded-full text-white shadow-xl hover:bg-brand-red hover:border-brand-red transition-all opacity-0 group-hover/nav:opacity-100 backdrop-blur-sm"
                aria-label="Post anterior"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={() => scroll('right')}
                className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 bg-black/80 border border-white/10 p-3 rounded-full text-white shadow-xl hover:bg-brand-red hover:border-brand-red transition-all opacity-0 group-hover/nav:opacity-100 backdrop-blur-sm"
                aria-label="Próximo post"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}

          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-hide px-4 md:px-0 -mx-4 md:mx-0 min-h-[250px]"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {loading ? (
              Array(4)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="flex-shrink-0 w-[320px] aspect-[16/10] rounded-xl bg-white/5 animate-pulse border border-white/10"
                  />
                ))
            ) : posts.length > 0 ? (
              posts.map((post) => <BlogCard key={post.id} post={post} />)
            ) : (
              <div className="w-full py-12 flex flex-col items-center justify-center text-gray-500 bg-white/5 rounded-2xl border border-dashed border-white/10">
                <FileText size={48} className="mb-4 opacity-20" />
                <p>
                  {fetchError
                    ? 'Feed temporariamente indisponível. Tente mais tarde.'
                    : 'Nenhuma matéria encontrada no momento.'}
                </p>
              </div>
            )}
          </div>

          {!loading && posts.length > 0 && (
            <div className="mt-2 flex justify-center gap-2">
              {posts.map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full ${
                    i === activeIndex ? 'bg-white/80' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default BlogCarousel;
