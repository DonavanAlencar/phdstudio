import React from 'react';

/** Logos em /public/logos. `tuning` = escala óptica opcional (0.86–1.08) sem distorcer SVG. */
const INSTITUTIONAL_LOGOS: {
  src: string;
  key: string;
  tuning?: number;
}[] = [
  { src: '/logos/3-eus.svg', key: '3-eus', tuning: 0.96 },
  { src: '/logos/dr-carlos.svg', key: 'dr-carlos' },
  { src: '/logos/dr-ricardo-piva.svg', key: 'dr-ricardo-piva', tuning: 0.9 },
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
    <div className="institutional-band relative overflow-hidden bg-phd-surface-obsidian py-14 sm:py-16 md:py-20 lg:py-24">
      <section
        className="relative z-phd-raised mx-auto w-full overflow-hidden"
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
