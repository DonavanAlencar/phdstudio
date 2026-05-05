import React from 'react';

interface StrategicVideoItem {
  id: string;
  youtubeId: string;
  description: string;
}

const STRATEGIC_VIDEOS: StrategicVideoItem[] = [
  {
    id: 'p8NgJt8nEKY',
    youtubeId: 'p8NgJt8nEKY',
    description:
      'Execução estratégica com foco em retenção, impacto e consistência.',
  },
  {
    id: 'hw6_0MmXGF8',
    youtubeId: 'hw6_0MmXGF8',
    description:
      'Construção de conteúdo voltado para percepção premium de marca.',
  },
  {
    id: 'ltEJso7TgQY',
    youtubeId: 'ltEJso7TgQY',
    description:
      'Direção criativa aplicada para gerar diferenciação visual no feed.',
  },
  {
    id: 'RY3uB1Q47VM',
    youtubeId: 'RY3uB1Q47VM',
    description:
      'Uso de IA como ferramenta de amplificação criativa e não apenas automação.',
  },
];

const FeaturedVideoCard: React.FC<{ video: StrategicVideoItem }> = ({ video }) => (
  <article
    className="group rounded-3xl border-2 border-white/15 bg-brand-gray/45 backdrop-blur-md overflow-hidden shadow-2xl shadow-black/40 transition-all duration-300 ease-out hover:border-brand-red/40"
    aria-label="Vídeo em destaque — conteúdo estruturado"
  >
    <div className="aspect-video md:aspect-[21/9] bg-black/60">
      <iframe
        src={`https://www.youtube.com/embed/${video.youtubeId}?rel=0&modestbranding=1&playsinline=1`}
        title="Conteúdo estratégico em destaque"
        className="w-full h-full"
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    </div>
    <div className="p-6 md:p-8">
      <p className="text-gray-200 text-base md:text-lg font-medium leading-relaxed">
        {video.description}
      </p>
    </div>
  </article>
);

const SecondaryVideoCard: React.FC<{ video: StrategicVideoItem; index: number }> = ({
  video,
  index,
}) => (
  <article
    className="group rounded-2xl border border-white/10 bg-brand-gray/35 backdrop-blur-md overflow-hidden shadow-lg shadow-black/25 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-white/20"
  >
    <div className="aspect-video bg-black/60">
      <iframe
        src={`https://www.youtube.com/embed/${video.youtubeId}?rel=0&modestbranding=1&playsinline=1`}
        title={`Conteúdo estratégico ${index + 2}`}
        className="w-full h-full"
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    </div>
    <div className="p-5 md:p-6">
      <p className="text-gray-300 text-sm md:text-base leading-relaxed transition-colors duration-300 group-hover:text-gray-200">
        {video.description}
      </p>
    </div>
  </article>
);

const StrategicContentVideoSection: React.FC = () => {
  const displayedVideos = STRATEGIC_VIDEOS.slice(0, 4);
  const [featured, ...secondary] = displayedVideos;

  return (
    <section
      id="arquitetura-conteudo"
      className="relative py-20 md:py-28 bg-black/40 overflow-hidden scroll-mt-28"
      aria-labelledby="strategic-content-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/85 via-black/60 to-black/85"
        aria-hidden="true"
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="strategic-shell rounded-3xl p-8 md:p-14">
          <header className="max-w-3xl mb-10 md:mb-14">
            <h2
              id="strategic-content-heading"
              className="text-3xl md:text-5xl font-black font-heading leading-tight text-white mb-6"
            >
              Arquitetura de Conteúdo que Gera Resultado
            </h2>
            <p className="text-gray-100 text-lg md:text-2xl font-semibold leading-snug">
              Isso é o que acontece quando conteúdo é estruturado com estratégia.
            </p>
          </header>

          <div className="space-y-8 md:space-y-10">
            {featured && <FeaturedVideoCard video={featured} />}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {secondary.map((video, index) => (
                <SecondaryVideoCard key={video.id} video={video} index={index} />
              ))}
            </div>
          </div>

          <div className="mt-10 md:mt-12 flex justify-center">
            <a
              href="https://www.youtube.com/@phdstudiobr"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-lg border border-white/20 bg-brand-gray/40 px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition-all hover:border-red-600 hover:bg-red-600"
            >
              Ver portfólio completo
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StrategicContentVideoSection;
