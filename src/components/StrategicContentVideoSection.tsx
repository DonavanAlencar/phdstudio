import React from 'react';
import { Surface, Container, Section, SectionHeader, Body, Button, VideoCard } from '@/src/dds';
import { staggerDelay } from '@/src/dds/motion';

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

const StrategicContentVideoSection: React.FC = () => {
  const displayedVideos = STRATEGIC_VIDEOS.slice(0, 4);
  const [featured, ...secondary] = displayedVideos;

  return (
    <Section
      id="arquitetura-conteudo"
      className="py-20 md:py-28"
      labelledBy="strategic-content-heading"
    >
      <Container variant="wide" paddingX="compact" className="relative z-phd-raised">
        <Surface material="graphite-raised" padding="default" chamfer="lg" className="md:p-phd-spacious">
          <SectionHeader className="max-w-3xl mb-10 md:mb-14">
            <SectionHeader.Title id="strategic-content-heading">
              Arquitetura de Conteúdo que Gera Resultado
            </SectionHeader.Title>
            <SectionHeader.Description emphasis muted={false} size="lg" className="mt-6">
              Isso é o que acontece quando conteúdo é estruturado com estratégia.
            </SectionHeader.Description>
          </SectionHeader>

          <div className="space-y-8 md:space-y-10">
            {featured && (
              <VideoCard
                featured
                youtubeId={featured.youtubeId}
                title="Conteúdo estratégico em destaque"
                description={
                  <Body size="lg" spacing="none">
                    {featured.description}
                  </Body>
                }
              />
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {secondary.map((video, index) => (
                <VideoCard
                  key={video.id}
                  youtubeId={video.youtubeId}
                  title={`Conteúdo estratégico ${index + 2}`}
                  className="motion-safe:animate-phd-emerge-subtle"
                  style={{ animationDelay: staggerDelay(index + 1) }}
                  description={
                    <Body size="sm" muted spacing="none">
                      {video.description}
                    </Body>
                  }
                />
              ))}
            </div>
          </div>

          <div className="mt-10 md:mt-12 flex justify-center">
            <Button
              as="a"
              href="https://www.youtube.com/@phdstudiobr"
              target="_blank"
              rel="noopener noreferrer"
              variant="secondary"
            >
              <Body as="span" className="font-phd-semibold">
                Ver portfólio completo
              </Body>
            </Button>
          </div>
        </Surface>
      </Container>
    </Section>
  );
};

export default StrategicContentVideoSection;
