import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Youtube, ExternalLink, Play, X, Clock } from 'lucide-react';
import { fetchPlaylistVideos, YouTubeVideo } from '../utils/youtube';

const YouTubeCarousel: React.FC = () => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [videos, setVideos] = useState<YouTubeVideo[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);

    useEffect(() => {
        const loadVideos = async () => {
            setLoading(true);
            const data = await fetchPlaylistVideos(9);
            setVideos(data);
            setLoading(false);
        };

        loadVideos();
    }, []);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = 340; // Card width + gap
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    const openVideo = (video: YouTubeVideo) => {
        setSelectedVideo(video);
        document.body.style.overflow = 'hidden';
    };

    const closeVideo = () => {
        setSelectedVideo(null);
        document.body.style.overflow = 'auto';
    };

    return (
        <section id="portfolio-audiovisual" className="py-20 bg-brand-dark relative overflow-hidden border-t border-white/5">
            <div className="container mx-auto px-4">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                    <div className="max-w-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-red-600/10 p-2 rounded-lg border border-red-600/20">
                                <Youtube className="text-red-600" size={24} />
                            </div>
                            <h2 className="text-3xl md:text-4xl font-black font-heading tracking-tight">Portfólio Audiovisual PHD Studio</h2>
                        </div>
                        <p className="text-gray-400 text-lg font-light">
                            Produções de alto impacto que conectam sua marca ao público certo. Confira nossos últimos vídeos.
                        </p>
                    </div>

                    <a
                        href="https://www.youtube.com/@phdstudiobr"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-2 text-white font-bold bg-brand-gray border border-white/10 px-6 py-3 rounded-lg hover:bg-red-600 hover:border-red-600 transition-all shadow-lg hover:shadow-red-600/20 text-sm uppercase tracking-wide"
                    >
                        <span>Ver Canal Completo</span>
                        <ExternalLink size={18} className="group-hover:translate-x-1 transition-transform" />
                    </a>
                </div>

                {/* Carousel Container */}
                <div className="relative group/nav">
                    {!loading && videos.length > 0 && (
                        <>
                            <button
                                onClick={() => scroll('left')}
                                className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 bg-black/80 border border-white/10 p-3 rounded-full text-white shadow-xl hover:bg-red-600 hover:border-red-600 transition-all opacity-0 group-hover/nav:opacity-100 backdrop-blur-sm"
                                aria-label="Vídeo anterior"
                            >
                                <ChevronLeft size={24} />
                            </button>
                            <button
                                onClick={() => scroll('right')}
                                className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 bg-black/80 border border-white/10 p-3 rounded-full text-white shadow-xl hover:bg-red-600 hover:border-red-600 transition-all opacity-0 group-hover/nav:opacity-100 backdrop-blur-sm"
                                aria-label="Próximo vídeo"
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
                            // Skeleton Loaders
                            Array(4).fill(0).map((_, i) => (
                                <div key={i} className="flex-shrink-0 w-[320px] aspect-video rounded-xl bg-white/5 animate-pulse border border-white/10" />
                            ))
                        ) : videos.length > 0 ? (
                            videos.map((video) => (
                                <div
                                    key={video.id}
                                    onClick={() => openVideo(video)}
                                    className="relative flex-shrink-0 snap-center group w-[320px] cursor-pointer"
                                >
                                    <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10 bg-brand-gray shadow-lg mb-4">
                                        {/* Thumbnail */}
                                        <img
                                            src={video.thumbnail}
                                            alt={video.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            loading="lazy"
                                        />

                                        {/* Duration Badge */}
                                        <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 border border-white/10">
                                            <Clock size={10} />
                                            {video.duration}
                                        </div>

                                        {/* Play Overlay */}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                            <div className="bg-red-600 text-white p-4 rounded-full shadow-2xl transform scale-75 group-hover:scale-100 transition-transform duration-300">
                                                <Play size={28} fill="currentColor" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Video Info */}
                                    <h3 className="text-white font-bold text-sm line-clamp-2 leading-relaxed group-hover:text-red-500 transition-colors">
                                        {video.title}
                                    </h3>
                                </div>
                            ))
                        ) : (
                            <div className="w-full py-12 flex flex-col items-center justify-center text-gray-500 bg-white/5 rounded-2xl border border-dashed border-white/10">
                                <Youtube size={48} className="mb-4 opacity-20" />
                                <p>Nenhum vídeo encontrado na playlist ou API não configurada.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile Swipe Hint */}
                {videos.length > 0 && (
                    <div className="md:hidden flex justify-center mt-2 gap-1.5 focus:outline-none" aria-hidden="true">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-600/40"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-red-600/40"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-red-600/40"></div>
                    </div>
                )}
            </div>

            {/* Video Modal */}
            {selectedVideo && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-8"
                    onClick={closeVideo}
                >
                    <div className="absolute inset-0 bg-black/95 backdrop-blur-sm"></div>

                    <div
                        className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10 animate-fade-in-up"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            onClick={closeVideo}
                            className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-red-600 text-white p-2 rounded-full transition-colors"
                            aria-label="Fechar vídeo"
                        >
                            <X size={24} />
                        </button>

                        {/* iframe */}
                        <iframe
                            width="100%"
                            height="100%"
                            src={`https://www.youtube.com/embed/${selectedVideo.id}?autoplay=1`}
                            title={selectedVideo.title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="w-full h-full"
                        ></iframe>
                    </div>
                </div>
            )}
        </section>
    );
};

export default YouTubeCarousel;
