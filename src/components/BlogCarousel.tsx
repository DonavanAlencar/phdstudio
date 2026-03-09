import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { fetchLatestPosts, type BlogPost } from '../utils/blog';
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
      const result = await fetchLatestPosts(6);
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

  return (
    <section className="py-20 bg-brand-dark border-t border-white/5 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-brand-red/10 p-2 rounded-lg border border-brand-red/20">
                <FileText className="text-brand-red" size={24} />
              </div>
              <h2 className="text-3xl md:text-4xl font-black font-heading tracking-tight">PHD Insights</h2>
            </div>
            <p className="text-gray-400 text-lg font-light">
              Artigos, análises e ideias que guiam decisões de marketing e tecnologia.
            </p>
          </div>
          <a
            href="https://www.phdstudio.blog.br/blog"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 text-white font-bold bg-brand-gray border border-white/10 px-6 py-3 rounded-lg hover:bg-brand-red hover:border-brand-red transition-all shadow-lg hover:shadow-brand-red/20 text-sm uppercase tracking-wide"
          >
            Ver Blog
          </a>
        </div>

        {/* Carrossel do blog removido: mantemos apenas título e CTA */}
      </div>
    </section>
  );
};

export default BlogCarousel;

