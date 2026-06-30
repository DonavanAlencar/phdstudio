import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Container, Section, Surface, Heading, Body, Label, Button } from '@/src/dds';

const PhdInsightsInstitutionalSection: React.FC = () => {
  return (
    <Section
      id="insights-crescimento"
      className="py-24 md:py-32"
      labelledBy="phd-insights-heading"
    >
      <Container variant="wide" paddingX="compact" className="relative z-phd-raised">
        <Surface
          material="graphite-raised"
          chamfer="lg"
          padding="spacious"
          className="shadow-phd-elevated motion-safe:animate-phd-emerge"
        >
          <Label spacing="none" className="text-phd-accent-insights text-center lg:text-left mb-6 lg:mb-8">
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
              <Body
                muted
                spacing="none"
                className="max-w-xl border-l-2 border-phd-accent-insights pl-4 md:pl-5"
              >
                Visão estratégica e inteligência aplicada para quem lidera com autoridade — sem ruído de
                feed, com profundidade que posiciona marcas e decisores à frente do mercado.
              </Body>
              <Button
                as="a"
                href="https://www.phdstudio.blog.br"
                target="_blank"
                rel="noopener noreferrer"
                variant="secondary"
                size="lg"
                iconRight={
                  <ArrowRight
                    size={18}
                    className="phd-transition-fast ease-phd-standard group-hover:translate-x-0.5"
                    aria-hidden
                  />
                }
                className="group"
              >
                <Body as="span" className="font-phd-semibold">
                  Explorar o PHD Insights
                </Body>
              </Button>
            </div>

            <div className="order-1 lg:order-2">
              <div className="relative phd-chamfer-md border border-phd-border-default shadow-phd-elevated overflow-hidden bg-phd-surface-obsidian flex items-center justify-center">
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
        </Surface>
      </Container>
    </Section>
  );
};

export default PhdInsightsInstitutionalSection;
