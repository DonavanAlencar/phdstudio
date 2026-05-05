import React from 'react';

interface InsightItem {
  title: string;
  text: string;
  link: string;
}

const INSIGHT_ITEMS: InsightItem[] = [
  {
    title: 'Por que a maioria das empresas usa IA errado (e paga por isso)',
    text: 'Volume sem estratégia não vira resultado — o gargalo raramente é a ferramenta.',
    link: 'https://www.phdstudio.blog.br/',
  },
  {
    title: 'Mais conteúdo não significa mais resultado',
    text: 'Intenção e direção batem cadência sem propósito.',
    link: 'https://www.phdstudio.blog.br/',
  },
  {
    title: 'O erro invisível que destrói a performance de campanhas',
    text: 'Quando a estrutura falha, nenhuma mídia segura a conta.',
    link: 'https://www.phdstudio.blog.br/',
  },
];

const StrategicBlogInsightsSection: React.FC = () => {
  return (
    <section
      id="insights-crescimento"
      className="relative py-20 md:py-28 bg-black/40 overflow-hidden scroll-mt-28"
      aria-labelledby="insights-crescimento-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/85 via-black/60 to-black/85"
        aria-hidden="true"
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="strategic-shell rounded-3xl p-8 md:p-14">
          <header className="max-w-3xl mb-10 md:mb-12">
            <h2
              id="insights-crescimento-heading"
              className="text-3xl md:text-5xl font-black font-heading leading-tight text-white mb-4"
            >
              Insights que Direcionam Crescimento
            </h2>
            <p className="text-gray-300 text-base md:text-lg leading-relaxed">
              Ideias aplicáveis sobre estrutura, conteúdo e performance — direto ao ponto no blog PHD Studio.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {INSIGHT_ITEMS.map((item) => (
              <a
                key={item.title}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group strategic-card rounded-2xl p-7 md:p-8 cursor-pointer transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-[0_0_32px_rgba(229,9,20,0.15)] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red/60"
                aria-label={`${item.title} - Ler análise completa`}
              >
                <article className="h-full flex flex-col">
                  <h3 className="text-xl md:text-2xl font-bold leading-snug text-white mb-4">
                    {item.title}
                  </h3>
                  <p className="text-gray-300 leading-relaxed mb-6">
                    {item.text}
                  </p>
                  <span className="mt-auto inline-flex items-center text-sm md:text-base font-semibold text-red-300 transition-colors duration-300 group-hover:text-red-200">
                    Ler análise completa
                  </span>
                </article>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default StrategicBlogInsightsSection;
