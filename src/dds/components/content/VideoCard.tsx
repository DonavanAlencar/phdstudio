import React from 'react';
import { Card } from './Card';
import { cn } from '../../utils';

export interface VideoCardProps {
  youtubeId: string;
  title: string;
  description: React.ReactNode;
  featured?: boolean;
  className?: string;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  youtubeId,
  title,
  description,
  featured = false,
  className,
}) => (
  <Card
    featured={featured}
    padding="none"
    chamfer="md"
    interactive
    className={cn('overflow-hidden gap-0', className)}
    aria-label={featured ? 'Vídeo em destaque — conteúdo estruturado' : title}
  >
    <div className={cn('bg-phd-surface-obsidian', featured ? 'aspect-video md:aspect-[21/9]' : 'aspect-video')}>
      <iframe
        src={`https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1&playsinline=1`}
        title={title}
        className="w-full h-full"
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    </div>
    <div className="p-phd-default">{description}</div>
  </Card>
);

VideoCard.displayName = 'VideoCard';
