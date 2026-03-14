import React from 'react';
import { Instagram, ExternalLink } from 'lucide-react';

/**
 * Bloco de CTA para o Instagram (sem carrossel).
 * Mantém apenas o título, descrição e link para o perfil.
 */
const InstagramLeadCarousel: React.FC = () => {
  return (
    <section
      className="py-20 bg-brand-dark relative overflow-hidden border-t border-white/5"
      aria-labelledby="instagram-leads-title"
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-brand-red/10 p-2 rounded-lg border border-brand-red/20">
                <Instagram className="text-brand-red" size={24} aria-hidden />
              </div>
              <h2
                id="instagram-leads-title"
                className="text-3xl md:text-4xl font-black font-heading tracking-tight"
              >
                Siga a PHD Studio no Instagram
              </h2>
            </div>
            <p className="text-gray-400 text-lg font-light">
              Veja como pensamos estratégia, marketing e automação na prática. Explore os últimos
              posts do nosso Instagram e descubra insights que podem acelerar o seu negócio.
            </p>
          </div>

          <a
            href="https://www.instagram.com/phdstudiooficial"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 text-white font-bold bg-brand-gray border border-white/10 px-6 py-3 rounded-lg hover:bg-brand-red hover:border-brand-red transition-all shadow-lg hover:shadow-brand-red/20 text-sm uppercase tracking-wide shrink-0"
          >
            <span className="hidden sm:inline">Ver perfil no Instagram</span>
            <span className="sm:hidden">@phdstudiooficial</span>
            <ExternalLink size={18} className="group-hover:translate-x-1 transition-transform" aria-hidden />
          </a>
        </div>
      </div>
    </section>
  );
};

export default InstagramLeadCarousel;
