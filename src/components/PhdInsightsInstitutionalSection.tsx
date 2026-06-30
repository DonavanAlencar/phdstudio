import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Container, Section, Heading, Body, Label } from '@/src/dds';

const PhdInsightsInstitutionalSection: React.FC = () => {
  return (
    <Section
      id="insights-crescimento"
      className="py-24 md:py-32"
      labelledBy="phd-insights-heading"
      decor={
        <>
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-amber-950/50 via-neutral-950 to-black"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_100%_70%_at_50%_15%,rgba(245,158,11,0.18),transparent_55%)]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_80%_90%,rgba(59,130,246,0.12),transparent_50%)]"
            aria-hidden
          />
        </>
      }
    >
      <Container variant="wide" paddingX="compact" className="relative z-phd-raised">
        <div
          className="relative rounded-3xl border-2 border-amber-400/35 bg-gradient-to-b from-amber-500/[0.08] via-white/[0.04] to-black/50 p-8 md:p-12 lg:p-16 shadow-[0_0_80px_-12px_rgba(245,158,11,0.35),0_25px_50px_-12px_rgba(0,0,0,0.75)] ring-1 ring-sky-500/10 motion-safe:animate-fade-in-up"
          style={{
            animationDuration: '0.85s',
          }}
        >
          <Label spacing="none" className="text-center lg:text-left mb-6 lg:mb-8">
            Núcleo institucional de inteligência
          </Label>

          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            <div className="space-y-5 md:space-y-6 order-2 lg:order-1">
              <Heading level={2} scale="display" spacing="none" id="phd-insights-heading">
                PHD Insights
              </Heading>
              <Heading level={3} spacing="none">
                Tecnologia. Inteligência. Estratégia.
              </Heading>
              <Body size="lg" spacing="none" className="max-w-xl">
                Conteúdo de alto impacto sobre IA, inovação, negócios e o futuro das empresas.
              </Body>
              <Body muted spacing="none" className="max-w-xl border-l-2 border-amber-500/40 pl-4 md:pl-5">
                Visão estratégica e inteligência aplicada para quem lidera com autoridade — sem ruído de
                feed, com profundidade que posiciona marcas e decisores à frente do mercado.
              </Body>
              <a
                href="https://www.phdstudio.blog.br"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-500 px-8 py-4 md:px-10 md:py-5 rounded-xl shadow-xl shadow-amber-900/40 ring-2 ring-amber-300/30 transition-all duration-300 hover:brightness-110 hover:shadow-amber-500/25 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
              >
                <Body as="span" className="font-phd-semibold text-phd-inverse">
                  Explorar o PHD Insights
                </Body>
                <ArrowRight
                  size={18}
                  className="transition-transform duration-300 group-hover:translate-x-0.5"
                  aria-hidden
                />
              </a>
            </div>

            <div className="order-1 lg:order-2">
              <div
                className="relative rounded-xl ring-2 ring-amber-500/30 overflow-hidden bg-black/50 flex items-center justify-center transition-transform duration-500 hover:ring-amber-400/45"
                style={{
                  boxShadow:
                    '0 28px 64px -20px rgba(0,0,0,0.85), 0 0 48px -12px rgba(245, 158, 11, 0.22)',
                }}
              >
                <img
                  src="/banners/phd-insights.jpeg"
                  alt="PHD Insights — inteligência estratégica, IA aplicada, inovação e liderança em negócios"
                  className="w-full max-w-full h-auto max-h-[min(72vh,640px)] lg:max-h-[min(520px,55vh)] object-contain object-center align-middle"
                  width={1600}
                  height={1000}
                  loading="lazy"
                  decoding="async"
                  fetchPriority="low"
                />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
};

export default PhdInsightsInstitutionalSection;
