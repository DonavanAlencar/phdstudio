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
  {
    id: 'SG6l_IMqfcc',
    youtubeId: 'SG6l_IMqfcc',
    description:
      'Integração entre estética e função estratégica dentro do conteúdo.',
  },
  {
    id: 'jIMFLRKMic4',
    youtubeId: 'jIMFLRKMic4',
    description: 'Construção de cenas com foco em retenção e fluidez narrativa.',
  },
  {
    id: 'dsNZYQn8mfw',
    youtubeId: 'dsNZYQn8mfw',
    description:
      'Estratégia de conteúdo orientada à atenção em ambientes digitais competitivos.',
  },
  {
    id: 'fjvwazlv5Oo',
    youtubeId: 'fjvwazlv5Oo',
    description:
      'Execução audiovisual com apoio de IA para ganho de velocidade e escala produtiva.',
  },
  {
    id: 'jEkLEMQBdO8',
    youtubeId: 'jEkLEMQBdO8',
    description:
      'Aplicação de narrativa visual para reforçar mensagem e aumentar absorção do conteúdo.',
  },
  {
    id: 'MDfly4FDwCs',
    youtubeId: 'MDfly4FDwCs',
    description:
      'Construção visual focada em percepção de valor e posicionamento de marca.',
  },
  {
    id: 'DrHpNaw3CTQ',
    youtubeId: 'DrHpNaw3CTQ',
    description:
      'Direção de ritmo e cortes orientados para retenção e engajamento contínuo.',
  },
  {
    id: 'K7qsxIvJsOI',
    youtubeId: 'K7qsxIvJsOI',
    description:
      'Uso de inteligência artificial para escalar produção mantendo consistência visual e identidade.',
  },
  {
    id: 'E0hIW703SDQ',
    youtubeId: 'E0hIW703SDQ',
    description:
      'Estrutura narrativa aplicada para transformar um vídeo simples em uma peça estratégica de comunicação.',
  },
  {
    id: 'qE6eodyP3SU',
    youtubeId: 'qE6eodyP3SU',
    description:
      'Conteúdo construído com foco em impacto e retenção, utilizando IA e direção criativa para maximizar atenção.',
  },
];

const StrategicContentVideoSection: React.FC = () => {
  return (
    <section
      id="arquitetura-conteudo"
      className="relative py-24 bg-black/40 overflow-hidden"
      aria-labelledby="strategic-content-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/85 via-black/60 to-black/85"
        aria-hidden="true"
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="strategic-shell rounded-3xl p-8 md:p-14">
          <header className="max-w-4xl mb-12">
            <h2
              id="strategic-content-heading"
              className="text-3xl md:text-5xl font-black font-heading leading-tight text-white mb-5"
            >
              Arquitetura de Conteúdo que Gera Resultado
            </h2>
            <p className="text-gray-300 text-base md:text-lg leading-relaxed">
              Não criamos vídeos apenas para estética. Cada peça é construída com intenção estratégica, combinando inteligência artificial, narrativa e direção criativa para gerar retenção, percepção e impacto real.
            </p>
            <p className="text-gray-400 text-base md:text-lg leading-relaxed mt-4">
              Aqui estão alguns exemplos de como transformamos conteúdo em ativo de crescimento.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {STRATEGIC_VIDEOS.map((video, index) => (
              <article
                key={video.id}
                className="group rounded-2xl border border-white/10 bg-brand-gray/35 backdrop-blur-md overflow-hidden shadow-lg shadow-black/25 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-white/20 hover:shadow-xl hover:shadow-brand-red/10"
              >
                <div className="aspect-video bg-black/60">
                  <iframe
                    src={`https://www.youtube.com/embed/${video.youtubeId}?rel=0&modestbranding=1&playsinline=1`}
                    title={`Video estrategico ${index + 1}`}
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
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default StrategicContentVideoSection;
