import React from 'react';
import { ExternalLink, Clock } from 'lucide-react';
import type { BlogPost } from '../utils/blog';

const formatDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {
    return '';
  }
};

type Props = {
  post: BlogPost;
};

const BlogCard: React.FC<Props> = ({ post }) => {
  return (
    <a
      href={post.url}
      target="_blank"
      rel="noopener noreferrer"
      className="relative flex-shrink-0 snap-center group w-[320px]"
      aria-label={`Abrir post: ${post.title}`}
    >
      <div className="relative aspect-[16/10] rounded-xl overflow-hidden border border-white/10 bg-brand-gray shadow-lg mb-4">
        {post.featured_image ? (
          <img
            src={post.featured_image}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="w-full h-full bg-white/5" />
        )}

        <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 border border-white/10">
          <Clock size={10} />
          {formatDate(post.publish_date)}
        </div>
      </div>

      <h3 className="text-white font-bold text-sm line-clamp-2 leading-relaxed group-hover:text-brand-red transition-colors">
        {post.title}
      </h3>
      {post.excerpt && (
        <p className="text-gray-400 text-xs mt-1 line-clamp-2">{post.excerpt}</p>
      )}

      <div className="mt-2 text-brand-red text-xs font-bold uppercase tracking-wider flex items-center gap-1">
        Ler matéria <ExternalLink size={12} />
      </div>
    </a>
  );
};

export default BlogCard;

