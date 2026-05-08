import React from 'react';

/** Logos armazenados localmente em /public/logos (SVG do repositório PHD). Ordem estável. */
const INSTITUTIONAL_LOGOS = [
  { src: '/logos/3-eus.svg', key: '3-eus' },
  { src: '/logos/dr-carlos.svg', key: 'dr-carlos' },
  { src: '/logos/fsalgueiro-editora.svg', key: 'fsalgueiro-editora' },
  { src: '/logos/gira-roda.svg', key: 'gira-roda' },
  { src: '/logos/ipclin.svg', key: 'ipclin' },
  { src: '/logos/is-we-tv.svg', key: 'is-we-tv' },
  { src: '/logos/le-chiq.svg', key: 'le-chiq' },
  { src: '/logos/logo-site-hajir.svg', key: 'logo-site-hajir' },
  { src: '/logos/ruvolo.svg', key: 'ruvolo' },
  { src: '/logos/sistema-gigantes.svg', key: 'sistema-gigantes' },
  { src: '/logos/ville-capital.svg', key: 'ville-capital' },
];

/**
 * Zona de desaceleração institucional: logos em silêncio, monocromáticos,
 * marquee infinito lento com loop contínuo via lista duplicada (translate -50%).
 */
export default function InstitutionalBrandsMarquee() {
  const track = [...INSTITUTIONAL_LOGOS, ...INSTITUTIONAL_LOGOS];

  return (
    <section
      className="relative overflow-hidden bg-black pt-14 pb-14 md:pt-20 md:pb-20 lg:pt-24 lg:pb-24"
      aria-label="Presença institucional acumulada"
    >
      {/* Textura computacional mínima */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:linear-gradient(to_right,rgba(255,255,255,0.028)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.028)_1px,transparent_1px)] [background-size:52px_52px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_55%_at_50%_50%,rgba(255,255,255,0.02),transparent_72%)]"
        aria-hidden
      />

      {/* Esmaecimento lateral — transição suave para o hero e para a seção seguinte */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-16 md:w-32 bg-gradient-to-r from-black to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-[1] w-16 md:w-32 bg-gradient-to-l from-black to-transparent"
        aria-hidden
      />

      <div className="relative z-[2] mx-auto w-full overflow-hidden">
        <div
          className="institutional-marquee-track flex w-max shrink-0 items-center gap-x-14 md:gap-x-24 lg:gap-x-36 will-change-transform [backface-visibility:hidden] [transform:translateZ(0)] motion-reduce:flex-wrap motion-reduce:justify-center motion-reduce:w-full motion-reduce:max-w-6xl motion-reduce:mx-auto motion-reduce:gap-x-12 motion-reduce:gap-y-8 animate-marquee-institutional-slow md:animate-marquee-institutional"
        >
          {track.map((logo, index) => (
            <div
              key={`${logo.key}-${index}`}
              className="group flex h-[3.25rem] shrink-0 items-center justify-center px-3 sm:h-14 md:h-[4.75rem] lg:h-[5.25rem] md:px-5"
            >
              <img
                src={logo.src}
                alt=""
                width={320}
                height={120}
                loading="lazy"
                decoding="async"
                draggable={false}
                className="h-full w-auto max-w-[min(220px,44vw)] object-contain brightness-0 invert opacity-[0.38] transition-[opacity,filter] duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:opacity-[0.9] group-hover:drop-shadow-[0_0_18px_rgba(229,9,20,0.24)] md:max-w-[min(260px,32vw)] lg:max-w-[min(300px,28vw)]"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
