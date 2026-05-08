import React from 'react';

/** Logos em /public/logos. `tuning` = escala óptica opcional (0.86–1.08) sem distorcer SVG. */
const INSTITUTIONAL_LOGOS: {
  src: string;
  key: string;
  tuning?: number;
}[] = [
  { src: '/logos/3-eus.svg', key: '3-eus', tuning: 0.96 },
  { src: '/logos/dr-carlos.svg', key: 'dr-carlos' },
  { src: '/logos/fsalgueiro-editora.svg', key: 'fsalgueiro-editora', tuning: 0.94 },
  { src: '/logos/gira-roda.svg', key: 'gira-roda', tuning: 0.9 },
  { src: '/logos/ipclin.svg', key: 'ipclin' },
  { src: '/logos/is-we-tv.svg', key: 'is-we-tv', tuning: 0.98 },
  { src: '/logos/le-chiq.svg', key: 'le-chiq' },
  { src: '/logos/logo-site-hajir.svg', key: 'logo-site-hajir', tuning: 0.92 },
  { src: '/logos/ruvolo.svg', key: 'ruvolo', tuning: 0.93 },
  { src: '/logos/sistema-gigantes.svg', key: 'sistema-gigantes', tuning: 0.91 },
  { src: '/logos/ville-capital.svg', key: 'ville-capital' },
];

/**
 * Faixa operacional silenciosa: integração atmosférica com hero e problema,
 * loop cinematográfico e normalização óptica dos SVGs (sem deformação).
 */
export default function InstitutionalBrandsMarquee() {
  const track = [...INSTITUTIONAL_LOGOS, ...INSTITUTIONAL_LOGOS];

  return (
    <div className="institutional-band relative -mt-16 overflow-hidden pt-20 pb-20 sm:pt-24 sm:pb-24 md:-mt-20 md:pt-24 md:pb-28 lg:pt-28 lg:pb-32">
      {/* Continuidade com o hero: mesma família de luz e temperatura */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-neutral-950/90 via-[#030303] to-[#000000]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_45%_at_50%_-8%,rgba(229,9,20,0.075),transparent_58%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_108%,rgba(255,255,255,0.028),transparent_55%)]"
        aria-hidden
      />
      {/* Ponte com a seção problema: continuidade editorial escura */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-40 bg-gradient-to-t from-black/90 via-black/35 to-transparent md:h-48"
        aria-hidden
      />

      {/* Ruído + grade: quase imperceptíveis */}
      <div className="institutional-noise pointer-events-none absolute inset-0 z-[1] opacity-[0.45] mix-blend-overlay" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 z-[1] opacity-[0.28] [background-image:linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] [background-size:64px_64px] md:[background-size:72px_72px]"
        aria-hidden
      />
      {/* Micro varredura estática (sem animação de sci-fi) */}
      <div className="institutional-scan pointer-events-none absolute inset-0 z-[1]" aria-hidden />

      {/* Fade lateral cinematográfico */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-[2] w-20 bg-gradient-to-r from-black via-black/70 to-transparent sm:w-28 md:w-40 lg:w-52"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-[2] w-20 bg-gradient-to-l from-black via-black/70 to-transparent sm:w-28 md:w-40 lg:w-52"
        aria-hidden
      />

      <section
        className="relative z-[3] mx-auto w-full overflow-hidden"
        aria-label="Presença institucional acumulada"
      >
        <div className="institutional-marquee-gpu relative mx-auto overflow-hidden px-1 md:px-2">
          <div className="institutional-marquee-track flex w-max shrink-0 items-center justify-center motion-reduce:flex-wrap motion-reduce:justify-center motion-reduce:w-full motion-reduce:max-w-6xl motion-reduce:mx-auto motion-reduce:gap-x-14 motion-reduce:gap-y-10 sm:gap-x-20 md:gap-x-32 lg:gap-x-40 xl:gap-x-48">
            {track.map((logo, index) => {
              const scale = logo.tuning ?? 1;
              return (
                <div
                  key={`${logo.key}-${index}`}
                  className="institutional-logo-cell group flex shrink-0 items-center justify-center"
                >
                  <div
                    className="institutional-logo-frame flex h-[2.75rem] w-[min(11.5rem,42vw)] shrink-0 items-center justify-center sm:h-12 sm:w-[min(12.75rem,38vw)] md:h-[4.125rem] md:w-[min(14rem,32vw)] lg:h-[4.375rem] lg:w-[min(15rem,28vw)]"
                    style={scale !== 1 ? { transform: `scale(${scale})` } : undefined}
                  >
                    <img
                      src={logo.src}
                      alt=""
                      width={320}
                      height={120}
                      loading="lazy"
                      decoding="async"
                      draggable={false}
                      className="institutional-logo-img max-h-full max-w-full object-contain object-center"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
