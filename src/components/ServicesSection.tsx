import React from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Share2,
  TrendingUp,
  Search,
  GitBranch,
  Rocket,
  Film,
  Layout,
  MessageCircle,
  Bot,
  Network,
  Target,
  Video,
  ShieldCheck,
  Palette,
  Repeat,
  Shield,
  Headphones,
} from 'lucide-react';

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  nucleus?: string;
}

const SERVICES: ServiceItem[] = [
  // Núcleo de Marketing Recorrente
  {
    id: 'gestao-redes-sociais',
    title: 'Gestão Estratégica de Redes Sociais',
    description:
      'Planejamento estratégico de conteúdo para gerar autoridade de marca, presença digital e relacionamento contínuo com o público.',
    icon: Share2,
    nucleus: 'Núcleo de Marketing Recorrente',
  },
  {
    id: 'trafego-pago',
    title: 'Tráfego Pago Contínuo',
    description:
      'Gestão de campanhas em Meta e Google com testes rápidos, otimização constante e foco em alto retorno sobre investimento.',
    icon: TrendingUp,
    nucleus: 'Núcleo de Marketing Recorrente',
  },
  {
    id: 'seo-autoridade',
    title: 'SEO e Autoridade',
    description:
      'Otimização para mecanismos de busca visando crescimento orgânico sustentável e posicionamento estratégico no Google.',
    icon: Search,
    nucleus: 'Núcleo de Marketing Recorrente',
  },
  {
    id: 'funis-crm',
    title: 'Funis de Conversão & CRM',
    description:
      'Estruturação de automações inteligentes, dashboards e recuperação de leads para maximizar conversões.',
    icon: GitBranch,
    nucleus: 'Núcleo de Marketing Recorrente',
  },
  // Núcleo de Lançamentos Digitais
  {
    id: 'lancamento-full',
    title: 'Estrutura de Lançamento Full',
    description:
      'Planejamento completo de pré-lançamento, campanhas estratégicas e estratégias de escala.',
    icon: Rocket,
    nucleus: 'Núcleo de Lançamentos Digitais',
  },
  {
    id: 'criativos-performance',
    title: 'Criativos de Alta Performance',
    description:
      'Produção de VSLs, criativos e cortes dinâmicos focados em conversão e performance em anúncios.',
    icon: Film,
    nucleus: 'Núcleo de Lançamentos Digitais',
  },
  {
    id: 'landing-pages',
    title: 'Landing Pages de Alta Conversão',
    description:
      'Desenvolvimento de páginas rápidas, responsivas e otimizadas para conversão.',
    icon: Layout,
    nucleus: 'Núcleo de Lançamentos Digitais',
  },
  {
    id: 'automacao-whatsapp-ia',
    title: 'Automação Avançada WhatsApp + IA',
    description:
      'Bots inteligentes para atendimento, recuperação de carrinho e gestão de leads em escala.',
    icon: MessageCircle,
    nucleus: 'Núcleo de Lançamentos Digitais',
  },
  // Núcleo de Tecnologia e IA
  {
    id: 'agentes-ia-sdr',
    title: 'Agentes IA SDR',
    description:
      'Implementação de agentes autônomos que qualificam leads 24/7 e registram dados automaticamente no CRM.',
    icon: Bot,
    nucleus: 'Núcleo de Tecnologia e IA',
  },
  {
    id: 'arquitetura-mcp',
    title: 'Arquitetura MCP',
    description:
      'Integração da IA com CRM, analytics, pricing e automação para criar um ecossistema inteligente de vendas.',
    icon: Network,
    nucleus: 'Núcleo de Tecnologia e IA',
  },
  {
    id: 'diagnostico-estrategico',
    title: 'Diagnóstico Estratégico',
    description:
      'Análise profunda do modelo de negócio, público e concorrência para orientar decisões estratégicas.',
    icon: Target,
    nucleus: 'Núcleo de Tecnologia e IA',
  },
  {
    id: 'videos-promocionais',
    title: 'Vídeos Promocionais e Didáticos',
    description:
      'Produção de vídeos com roteiro estratégico, edição dinâmica e foco em comunicação clara.',
    icon: Video,
    nucleus: 'Núcleo de Tecnologia e IA',
  },
  // Soluções Tech / SaaS
  {
    id: 'audit-ai',
    title: 'Audit.AI',
    description:
      'Auditoria automatizada de SEO e performance de sites utilizando inteligência artificial.',
    icon: ShieldCheck,
    nucleus: 'Soluções Tech / SaaS',
  },
  {
    id: 'creative-flow',
    title: 'CreativeFlow',
    description:
      'Sistema de assinatura de criação de assets visuais gerados ou assistidos por IA.',
    icon: Palette,
    nucleus: 'Soluções Tech / SaaS',
  },
  {
    id: 'social-loop',
    title: 'SocialLoop',
    description:
      'Motor de conteúdo que transforma vídeos longos em múltiplos cortes otimizados para redes sociais.',
    icon: Repeat,
    nucleus: 'Soluções Tech / SaaS',
  },
  {
    id: 'site-guard',
    title: 'SiteGuard',
    description:
      'Monitoramento de segurança e manutenção de sites em tempo real via IA.',
    icon: Shield,
    nucleus: 'Soluções Tech / SaaS',
  },
  {
    id: 'recepcionistas-virtuais',
    title: 'Recepcionistas Virtuais White-Label',
    description:
      'Sistemas de voz automatizados para atendimento e qualificação de leads em empresas.',
    icon: Headphones,
    nucleus: 'Soluções Tech / SaaS',
  },
];

const ServicesSection: React.FC = () => {
  return (
    <section
      id="services"
      className="py-20 bg-brand-dark/40 relative overflow-hidden border-t border-white/5"
      aria-labelledby="services-heading"
    >
      <div className="container mx-auto px-4">
        <header className="max-w-3xl mb-14">
          <h2
            id="services-heading"
            className="text-3xl md:text-4xl font-black font-heading tracking-tight text-white mb-4"
          >
            Nossas Soluções para Crescimento Digital
          </h2>
          <p className="text-gray-400 text-lg font-light leading-relaxed">
            Conheça os serviços que combinam estratégia, tecnologia e criatividade para acelerar o seu negócio.
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SERVICES.map((service) => {
            const Icon = service.icon;
            return (
              <article
                key={service.id}
                className="group relative rounded-2xl border border-white/10 bg-brand-gray/40 backdrop-blur-sm p-6 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-red/10 hover:border-white/20"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" aria-hidden />
                <div className="relative">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-red/10 border border-brand-red/20 text-brand-red mb-4 transition-transform duration-300 group-hover:scale-105">
                    <Icon size={24} aria-hidden />
                  </div>
                  <h3 className="text-white font-bold font-heading text-lg leading-snug mb-2">
                    {service.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {service.description}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
