import React from 'react';

const BlogCarousel: React.FC = () => (
  <section
    className="py-20 bg-brand-dark relative overflow-hidden border-t border-white/5"
    aria-labelledby="blog-insights-title"
  >
    <div className="container mx-auto px-4">
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-brand-red/10 p-2 rounded-lg border border-brand-red/20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-sparkles text-brand-red"
                aria-hidden="true"
              >
                <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"></path>
                <path d="M20 2v4"></path>
                <path d="M22 4h-4"></path>
                <circle cx="4" cy="20" r="2"></circle>
              </svg>
            </div>
            <h2
              id="blog-insights-title"
              className="text-3xl md:text-4xl font-black font-heading tracking-tight"
            >
              PHD Insights: Inteligência e Estratégia
            </h2>
          </div>
          <p className="text-gray-400 text-lg font-light">
            Fique por dentro das últimas tendências em Marketing, Automação e IA para escalar seu
            negócio.
          </p>
        </div>
        <a
          href="https://www.phdstudio.blog.br/blog"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-2 text-white font-bold bg-brand-gray border border-white/10 px-6 py-3 rounded-lg hover:bg-brand-red hover:border-brand-red transition-all shadow-lg hover:shadow-brand-red/20 text-sm uppercase tracking-wide"
        >
          <span className="hidden sm:inline">Ver todos os artigos</span>
          <span className="sm:hidden">Ir para o Blog</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-external-link group-hover:translate-x-1 transition-transform"
            aria-hidden="true"
          >
            <path d="M15 3h6v6"></path>
            <path d="M10 14 21 3"></path>
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
          </svg>
        </a>
      </div>
      <div className="relative group/nav">
        <button
          className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 bg-black/80 border border-white/10 p-3 rounded-full text-white shadow-xl hover:bg-brand-red hover:border-brand-red transition-all opacity-0 group-hover/nav:opacity-100 backdrop-blur-sm"
          aria-label="Artigo anterior"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-chevron-left"
            aria-hidden="true"
          >
            <path d="m15 18-6-6 6-6"></path>
          </svg>
        </button>
        <button
          className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 bg-black/80 border border-white/10 p-3 rounded-full text-white shadow-xl hover:bg-brand-red hover:border-brand-red transition-all opacity-0 group-hover/nav:opacity-100 backdrop-blur-sm"
          aria-label="Próximo artigo"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-chevron-right"
            aria-hidden="true"
          >
            <path d="m9 18 6-6-6-6"></path>
          </svg>
        </button>
        <div
          className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-hide px-4 md:px-0 -mx-4 md:mx-0"
          role="list"
          aria-label="Artigos recentes do blog PHD Insights"
          style={{ scrollbarWidth: 'none' as any }}
        >
          <article
            className="flex-shrink-0 w-[280px] sm:w-[320px] lg:w-[360px] snap-center rounded-2xl overflow-hidden border border-white/10 bg-brand-gray shadow-lg hover:shadow-brand-red/20 transition-shadow duration-300"
            role="listitem"
          >
            <div className="relative aspect-[16/10] overflow-hidden">
              <img
                alt="Seu site está perdendo tráfego? A culpa é do Zero-Click Search (E como o SEO para IA (GEO) muda tudo)"
                className="w-full h-full object-cover transition-transform duration-700 group-hover/nav:scale-110"
                loading="lazy"
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              <div className="absolute top-3 left-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/70 border border-white/10 text-[11px] font-bold uppercase tracking-wide text-white/90">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-book-open-text"
                  aria-hidden="true"
                >
                  <path d="M12 7v14"></path>
                  <path d="M16 12h2"></path>
                  <path d="M16 8h2"></path>
                  <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"></path>
                  <path d="M6 12h2"></path>
                  <path d="M6 8h2"></path>
                </svg>
                <span>SEO &amp; Growth</span>
              </div>
            </div>
            <div className="p-5 flex flex-col h-full">
              <h3 className="text-white font-semibold text-base md:text-lg leading-snug mb-2 line-clamp-2">
                Seu site está perdendo tráfego? A culpa é do Zero-Click Search (E como o SEO para IA
                (GEO) muda tudo)
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-3">
                Você já parou para olhar os dados do seu tráfego orgânico recentemente? Se as impressões
                seguem altas e os cliques caem, o Zero-Click Search pode ser o vilão — e o SEO para IA
                (GEO) a resposta.
              </p>
              <div className="mt-auto pt-2">
                <a
                  href="https://www.phdstudio.blog.br/blog"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-brand-red font-semibold text-sm hover:text-red-400 transition-colors"
                >
                  <span>Ler artigo</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-external-link"
                    aria-hidden="true"
                  >
                    <path d="M15 3h6v6"></path>
                    <path d="M10 14 21 3"></path>
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  </svg>
                </a>
              </div>
            </div>
          </article>
          <article
            className="flex-shrink-0 w-[280px] sm:w-[320px] lg:w-[360px] snap-center rounded-2xl overflow-hidden border border-white/10 bg-brand-gray shadow-lg hover:shadow-brand-red/20 transition-shadow duration-300"
            role="listitem"
          >
            <div className="relative aspect-[16/10] overflow-hidden">
              <img
                alt="IA e Novas Descobertas Científicas: O Motor da Inovação"
                className="w-full h-full object-cover transition-transform duration-700 group-hover/nav:scale-110"
                loading="lazy"
                src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=800&auto=format&fit=crop"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              <div className="absolute top-3 left-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/70 border border-white/10 text-[11px] font-bold uppercase tracking-wide text-white/90">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-book-open-text"
                  aria-hidden="true"
                >
                  <path d="M12 7v14"></path>
                  <path d="M16 12h2"></path>
                  <path d="M16 8h2"></path>
                  <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"></path>
                  <path d="M6 12h2"></path>
                  <path d="M6 8h2"></path>
                </svg>
                <span>Ciência &amp; Inovação</span>
              </div>
            </div>
            <div className="p-5 flex flex-col h-full">
              <h3 className="text-white font-semibold text-base md:text-lg leading-snug mb-2 line-clamp-2">
                IA e Novas Descobertas Científicas: O Motor da Inovação
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-3">
                Como a inteligência artificial se consolidou como parte essencial da infraestrutura da
                ciência moderna, acelerando pesquisas e abrindo caminhos antes inimagináveis.
              </p>
              <div className="mt-auto pt-2">
                <a
                  href="https://www.phdstudio.blog.br/blog"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-brand-red font-semibold text-sm hover:text-red-400 transition-colors"
                >
                  <span>Ler artigo</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-external-link"
                    aria-hidden="true"
                  >
                    <path d="M15 3h6v6"></path>
                    <path d="M10 14 21 3"></path>
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  </svg>
                </a>
              </div>
            </div>
          </article>
          <article
            className="flex-shrink-0 w-[280px] sm:w-[320px] lg:w-[360px] snap-center rounded-2xl overflow-hidden border border-white/10 bg-brand-gray shadow-lg hover:shadow-brand-red/20 transition-shadow duration-300"
            role="listitem"
          >
            <div className="relative aspect-[16/10] overflow-hidden">
              <img
                alt="IA e Novas Gerações: Aceleradora ou Atrofiante?"
                className="w-full h-full object-cover transition-transform duration-700 group-hover/nav:scale-110"
                loading="lazy"
                src="https://images.unsplash.com/photo-1516838088174-1d98506b8e28?q=80&w=800&auto=format&fit=crop"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              <div className="absolute top-3 left-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/70 border border-white/10 text-[11px] font-bold uppercase tracking-wide text-white/90">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-book-open-text"
                  aria-hidden="true"
                >
                  <path d="M12 7v14"></path>
                  <path d="M16 12h2"></path>
                  <path d="M16 8h2"></path>
                  <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"></path>
                  <path d="M6 12h2"></path>
                  <path d="M6 8h2"></path>
                </svg>
                <span>Sociedade &amp; Futuro</span>
              </div>
            </div>
            <div className="p-5 flex flex-col h-full">
              <h3 className="text-white font-semibold text-base md:text-lg leading-snug mb-2 line-clamp-2">
                IA e Novas Gerações: Aceleradora ou Atrofiante?
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-3">
                A IA pode ser uma aliada poderosa ou uma muleta perigosa para as novas gerações — tudo
                depende de como é ensinada e integrada ao cotidiano.
              </p>
              <div className="mt-auto pt-2">
                <a
                  href="https://www.phdstudio.blog.br/blog"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-brand-red font-semibold text-sm hover:text-red-400 transition-colors"
                >
                  <span>Ler artigo</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-external-link"
                    aria-hidden="true"
                  >
                    <path d="M15 3h6v6"></path>
                    <path d="M10 14 21 3"></path>
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  </svg>
                </a>
              </div>
            </div>
          </article>
          <article
            className="flex-shrink-0 w-[280px] sm:w-[320px] lg:w-[360px] snap-center rounded-2xl overflow-hidden border border-white/10 bg-brand-gray shadow-lg hover:shadow-brand-red/20 transition-shadow duration-300"
            role="listitem"
          >
            <div className="relative aspect-[16/10] overflow-hidden">
              <img
                alt="Marketing Ético em 2026: Marcas que Integram Dados, Criatividade e Responsabilidade"
                className="w-full h-full object-cover transition-transform duration-700 group-hover/nav:scale-110"
                loading="lazy"
                src="https://images.unsplash.com/photo-1526498460520-4c246339dccb?q=80&w=800&auto=format&fit=crop"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              <div className="absolute top-3 left-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/70 border border-white/10 text-[11px] font-bold uppercase tracking-wide text-white/90">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-book-open-text"
                  aria-hidden="true"
                >
                  <path d="M12 7v14"></path>
                  <path d="M16 12h2"></path>
                  <path d="M16 8h2"></path>
                  <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"></path>
                  <path d="M6 12h2"></path>
                  <path d="M6 8h2"></path>
                </svg>
                <span>Estratégia &amp; Ética</span>
              </div>
            </div>
            <div className="p-5 flex flex-col h-full">
              <h3 className="text-white font-semibold text-base md:text-lg leading-snug mb-2 line-clamp-2">
                Marketing Ético em 2026: Marcas que Integram Dados, Criatividade e Responsabilidade
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-3">
                Em um cenário onde a disputa é por confiança, marcas que equilibram performance com
                transparência, privacidade e inclusão saem na frente.
              </p>
              <div className="mt-auto pt-2">
                <a
                  href="https://www.phdstudio.blog.br/blog"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-brand-red font-semibold text-sm hover:text-red-400 transition-colors"
                >
                  <span>Ler artigo</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-external-link"
                    aria-hidden="true"
                  >
                    <path d="M15 3h6v6"></path>
                    <path d="M10 14 21 3"></path>
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  </svg>
                </a>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  </section>
);

export default BlogCarousel;

