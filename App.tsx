import React, { useState, useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  Menu, X, Phone, Check, ChevronRight, ChevronDown, ChevronLeft,
  TrendingUp, Rocket, Cpu, BarChart3, Users, Zap, Target, ArrowRight, Quote 
} from 'lucide-react';

// --- Assets Configuration ---
const ASSETS = {
  // Link direto para a nova imagem do logo no GitHub
  logo: "https://raw.githubusercontent.com/PHDStudioBR/PHDStudioImages/main/Logo%20Novo%202.png", 

  // Video mock (using high quality tech image for background)
  heroBg: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop", 
  
  // Specific contextual images
  recurringBg: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=800&auto=format&fit=crop",
  launchBg: "https://images.unsplash.com/photo-1642427749670-f20e2e76ed8c?q=80&w=800&auto=format&fit=crop",
  
  // Client Logos (URLs reais do GitHub)
  clientLogos: [
    "https://raw.githubusercontent.com/PHDStudioBR/PHDStudioImages/main/3%20Eus.svg",
    "https://raw.githubusercontent.com/PHDStudioBR/PHDStudioImages/main/FSalgueiro%20Editora.svg",
    "https://raw.githubusercontent.com/PHDStudioBR/PHDStudioImages/main/Gira%20Roda.svg",
    "https://raw.githubusercontent.com/PHDStudioBR/PHDStudioImages/main/IPClin.svg",
    "https://raw.githubusercontent.com/PHDStudioBR/PHDStudioImages/main/Le%20Chiq.svg",
    "https://raw.githubusercontent.com/PHDStudioBR/PHDStudioImages/main/Ville%20Capital.svg",
    "https://raw.githubusercontent.com/PHDStudioBR/PHDStudioImages/main/IS%20WE%20TV.svg",
    "https://raw.githubusercontent.com/PHDStudioBR/PHDStudioImages/main/Ruvolo.svg",
    "https://raw.githubusercontent.com/PHDStudioBR/PHDStudioImages/main/Sistema%20Gigantes.svg",
    "https://raw.githubusercontent.com/PHDStudioBR/PHDStudioImages/main/Dr%20Carlos.svg"
  ],

  // Case Studies
  cases: [
    {
      img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop",
      logo: "Optimization Pro",
      metric: "+4.2x ROAS",
      desc: "Otimização de tráfego pago para SaaS financeiro."
    },
    {
      img: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=800&auto=format&fit=crop",
      logo: "Launch X",
      metric: "+3 meses",
      desc: "Estrutura completa para lançamento de infoproduto."
    },
    {
      img: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?q=80&w=800&auto=format&fit=crop",
      logo: "E-commerce Monitoring",
      metric: "-58% CPL",
      desc: "Automação de recuperação de carrinho e leads."
    }
  ]
};

// --- Fake Data for Testimonials ---
const TESTIMONIALS = [
  {
    id: 1,
    name: "Fabio Salgueiro",
    role: "Escritor e Palestrante",
    quote: "A PHD Studio foi essencial na criação das capas de mais de sete livros da FSalgueiro Editora. A estética e a criatividade da equipe deram vida às obras e transmitiram exatamente a mensagem que eu desejava. Recomendo pela qualidade e profissionalismo.",
    avatar: "https://raw.githubusercontent.com/PHDStudioBR/PHDStudioImages/main/Fabio-Salgueiro.svg"
  },
  {
    id: 2,
    name: "Lucas Battistoni",
    role: "Especialista em Liderança de Marketing Multinível",
    quote: "Trabalhar com a PHD Studio na gestão de tráfego transformou meu negócio. As estratégias bem estruturadas aumentaram nossa visibilidade e conversões. Uma parceria confiável, com resultados reais. Estou muito satisfeito.",
    avatar: "https://raw.githubusercontent.com/PHDStudioBR/PHDStudioImages/main/Lucas.svg"
  },
  {
    id: 3,
    name: "Fernanda Daud",
    role: "Farmacêutica",
    quote: "Gravei um vídeo para minhas aulas de pós-graduação com a PHD Studio e fiquei muito satisfeita! Ficou didático, com música e imagens em total harmonia. Meus alunos adoraram. Super recomendo!",
    avatar: "https://raw.githubusercontent.com/PHDStudioBR/PHDStudioImages/main/Fernanda.svg"
  },
  {
    id: 4,
    name: "Maria Eduarda Chamelete",
    role: "Especialista em e-commerce e estratégias digitais da Ruvollo",
    quote: "A parceria com a PHD Studio foi fundamental para o crescimento da Ruvolo Glass Company. Os vídeos promocionais ficaram impecáveis e reforçaram nossa identidade visual. A gestão de tráfego trouxe mais visibilidade e vendas. Excelente profissionalismo.",
    avatar: "https://raw.githubusercontent.com/PHDStudioBR/PHDStudioImages/main/Duda.svg"
  }
];

// --- Components ---

const TestimonialCard: React.FC<{ data: typeof TESTIMONIALS[0] }> = ({ data }) => (
  <div className="bg-[#121212] border border-white/10 p-8 rounded-2xl w-[300px] md:w-[320px] flex-shrink-0 snap-center hover:border-brand-red/50 transition-colors duration-300 flex flex-col justify-between h-full group">
    <div>
      <Quote className="text-brand-red w-8 h-8 mb-6 opacity-50 group-hover:opacity-100 transition-opacity" />
      <p className="text-gray-300 text-base leading-relaxed italic mb-8 font-light">
        "{data.quote}"
      </p>
    </div>
    <div className="flex items-center gap-4 border-t border-white/5 pt-6">
      <img 
        src={data.avatar} 
        alt={data.name} 
        className="w-12 h-12 rounded-full object-cover ring-2 ring-brand-red/20 group-hover:ring-brand-red/50 transition-all"
      />
      <div>
        <h4 className="text-white font-bold font-heading text-sm">{data.name}</h4>
        <p className="text-xs text-gray-500">{data.role}</p>
      </div>
    </div>
  </div>
);

const SectionTitle = ({ title, subtitle, centered = false }: { title: string, subtitle?: string, centered?: boolean }) => (
  <div className={`mb-12 ${centered ? 'text-center' : ''}`}>
    <h2 className="text-3xl md:text-4xl font-black font-heading tracking-tight mb-4">
      {title}
    </h2>
    {subtitle && (
      <p className="text-gray-400 text-lg max-w-2xl mx-auto font-light">
        {subtitle}
      </p>
    )}
  </div>
);

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Soluções', href: '#solucoes' },
    { name: 'Metodologia', href: '#metodologia' },
    { name: 'Cases', href: '#cases' },
    { name: 'Depoimentos', href: '#depoimentos' },
    { name: 'FAQ', href: '#faq' },
  ];

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-black/90 backdrop-blur-lg border-b border-white/10 py-3' : 'bg-transparent py-6'}`}>
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="relative z-50 block">
           <img 
             src={ASSETS.logo} 
             alt="PHD Studio" 
             className="h-10 w-auto object-contain md:h-12"
           />
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a key={link.name} href={link.href} className="text-sm font-medium text-gray-300 hover:text-brand-red transition-colors uppercase tracking-wider">
              {link.name}
            </a>
          ))}
        </div>

        {/* Mobile Toggle */}
        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden z-50 text-white">
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* Mobile Menu */}
        <div className={`fixed inset-0 bg-black z-40 flex flex-col justify-center items-center gap-8 transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          {navLinks.map((link) => (
            <a key={link.name} href={link.href} onClick={() => setIsOpen(false)} className="text-2xl font-bold text-white hover:text-brand-red">
              {link.name}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
};

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background with overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={ASSETS.heroBg} 
          alt="Background" 
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-dark via-brand-dark/80 to-brand-dark"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10 grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-8 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full text-brand-red text-sm font-bold tracking-wide">
            <span className="w-2 h-2 bg-brand-red rounded-full animate-pulse"></span>
            MARKETING + TECNOLOGIA
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black font-heading leading-tight">
            Marketing que gera <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-red to-red-500">vendas</span> — todos os dias.
          </h1>
          
          <p className="text-xl text-gray-400 font-light max-w-lg leading-relaxed">
            Criativos, campanhas e automações inteligentes para negócios que querem crescer com consistência ou escalar lançamentos.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <a href="#contato" className="bg-brand-red text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-red-700 transition-all text-center flex items-center justify-center gap-2 shadow-lg shadow-brand-red/20">
              Quero crescer agora
              <ArrowRight size={20} />
            </a>
          </div>

          <div className="pt-8 flex items-center gap-8 text-sm text-gray-500 font-medium">
            <div className="flex items-center gap-2">
              <Check size={16} className="text-brand-red" />
              Gestão de Tráfego
            </div>
            <div className="flex items-center gap-2">
              <Check size={16} className="text-brand-red" />
              Automação & CRM
            </div>
            <div className="flex items-center gap-2">
              <Check size={16} className="text-brand-red" />
              Lançamentos
            </div>
          </div>
        </div>

        {/* Right side video */}
        <div className="relative hidden md:block animate-fade-in-up" style={{animationDelay: '0.2s'}}>
          <div className="relative z-10 bg-brand-gray border border-white/10 rounded-2xl p-2 shadow-2xl transform rotate-[-2deg] hover:rotate-0 transition-transform duration-500 overflow-hidden">
            <div className="relative w-full aspect-video rounded-xl overflow-hidden">
              <iframe
                src="https://www.youtube.com/embed/McLwhMRAjaU"
                title="PHD Studio - Marketing e Tecnologia"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              ></iframe>
            </div>
            {/* Floating Cards */}
            <div className="absolute -top-12 -right-12 bg-[#1A1A1A] p-4 rounded-xl border border-white/10 shadow-xl animate-pulse-slow">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-green-500/20 p-2 rounded-lg">
                  <TrendingUp className="text-green-500" size={20} />
                </div>
                <div>
                  <div className="text-xs text-gray-400">ROAS Médio</div>
                  <div className="text-lg font-bold text-white">+480%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const ClientMarquee = () => {
  const logos = [...ASSETS.clientLogos, ...ASSETS.clientLogos];

  return (
    <div className="bg-brand-gray border-y border-white/5 py-8 overflow-hidden relative group">
       <div className="absolute left-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-r from-brand-gray to-transparent"></div>
       <div className="absolute right-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-l from-brand-gray to-transparent"></div>
       
       <div className="flex gap-16 animate-marquee whitespace-nowrap group-hover:[animation-play-state:paused]">
         {logos.map((logo, index) => (
           <div key={index} className="flex-shrink-0 flex items-center justify-center opacity-40 hover:opacity-100 transition-opacity duration-300">
             <img 
              src={logo} 
              alt={`Cliente ${index}`} 
              className="h-12 w-auto object-contain brightness-0 invert" 
             />
           </div>
         ))}
       </div>
    </div>
  );
};

const GrowthType = () => {
  return (
    <section id="recorrente" className="py-20 bg-brand-dark">
      <div className="container mx-auto px-4">
        <SectionTitle 
          title="Escolha seu tipo de crescimento" 
          subtitle="Dois caminhos, um objetivo: resultados que transformam seu negócio." 
          centered 
        />
        <div className="grid md:grid-cols-2 gap-8 mt-12">
          {/* Bloco 1 - Marketing Recorrente */}
          <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-brand-gray hover:border-brand-red/50 transition-all duration-300">
            <div className="absolute inset-0">
               <img src={ASSETS.recurringBg} className="w-full h-full object-cover opacity-10 group-hover:scale-105 transition-transform duration-700" alt="Marketing Recorrente" />
               <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent"></div>
            </div>
            <div className="relative p-10 h-full flex flex-col items-start">
              <div className="bg-blue-500/10 p-3 rounded-xl mb-6 border border-blue-500/20">
                <TrendingUp className="text-blue-500" size={32} />
              </div>
              <h3 className="text-3xl font-bold font-heading mb-4">Para negócios que querem crescer todos os dias</h3>
              <ul className="space-y-3 mb-8 text-sm text-gray-300 flex-grow">
                <li className="flex gap-2"><Check size={16} className="text-brand-red flex-shrink-0 mt-0.5" /> Gestão estratégica de redes sociais</li>
                <li className="flex gap-2"><Check size={16} className="text-brand-red flex-shrink-0 mt-0.5" /> Tráfego contínuo</li>
                <li className="flex gap-2"><Check size={16} className="text-brand-red flex-shrink-0 mt-0.5" /> SEO e autoridade</li>
                <li className="flex gap-2"><Check size={16} className="text-brand-red flex-shrink-0 mt-0.5" /> Funis de conversão</li>
                <li className="flex gap-2"><Check size={16} className="text-brand-red flex-shrink-0 mt-0.5" /> Conteúdo profissional</li>
                <li className="flex gap-2"><Check size={16} className="text-brand-red flex-shrink-0 mt-0.5" /> Email marketing</li>
                <li className="flex gap-2"><Check size={16} className="text-brand-red flex-shrink-0 mt-0.5" /> Automação e CRM</li>
              </ul>
              <div className="w-full text-white text-center font-bold py-4 text-lg">
                Quero crescimento diário
              </div>
            </div>
          </div>

          {/* Bloco 2 - Lançamentos Digitais */}
          <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-brand-gray hover:border-brand-red/50 transition-all duration-300">
            <div className="absolute inset-0">
               <img src={ASSETS.launchBg} className="w-full h-full object-cover opacity-10 group-hover:scale-105 transition-transform duration-700" alt="Lançamentos Digitais" />
               <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent"></div>
            </div>
            <div className="relative p-10 h-full flex flex-col items-start">
              <div className="bg-brand-red/10 p-3 rounded-xl mb-6 border border-brand-red/20">
                <Rocket className="text-brand-red" size={32} />
              </div>
              <h3 className="text-3xl font-bold font-heading mb-4">Para quem trabalha com lançamentos</h3>
              <ul className="space-y-3 mb-8 text-sm text-gray-300 flex-grow">
                <li className="flex gap-2"><Check size={16} className="text-brand-red flex-shrink-0 mt-0.5" /> Criativos de alta performance</li>
                <li className="flex gap-2"><Check size={16} className="text-brand-red flex-shrink-0 mt-0.5" /> VSL, cortes e anúncios</li>
                <li className="flex gap-2"><Check size={16} className="text-brand-red flex-shrink-0 mt-0.5" /> Funil de pré-lançamento</li>
                <li className="flex gap-2"><Check size={16} className="text-brand-red flex-shrink-0 mt-0.5" /> Campanhas agressivas</li>
                <li className="flex gap-2"><Check size={16} className="text-brand-red flex-shrink-0 mt-0.5" /> Landing pages otimizadas</li>
                <li className="flex gap-2"><Check size={16} className="text-brand-red flex-shrink-0 mt-0.5" /> Automação avançada (WhatsApp + IA)</li>
                <li className="flex gap-2"><Check size={16} className="text-brand-red flex-shrink-0 mt-0.5" /> Pós-lançamento inteligente</li>
              </ul>
              <div className="w-full text-white text-center font-bold py-4 text-lg">
                Quero escalar meu lançamento
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Solutions = () => {
  const solutionsBlocks = [
    {
      title: "Soluções para Vendas (Performance)",
      icon: <Target className="text-brand-red" size={28} />,
      items: [
        "Criativos de anúncio",
        "Tráfego pago",
        "Landing pages",
        "Funis",
        "Copywriting de conversão"
      ]
    },
    {
      title: "Soluções para Crescimento Contínuo",
      icon: <TrendingUp className="text-brand-red" size={28} />,
      items: [
        "Redes sociais",
        "Conteúdo",
        "SEO",
        "Email marketing",
        "Branding"
      ]
    },
    {
      title: "Soluções em Tecnologia + Automação",
      icon: <Cpu className="text-brand-red" size={28} />,
      items: [
        "CRM",
        "Integrações",
        "Automação IA",
        "Bots inteligentes",
        "Dashboards"
      ]
    }
  ];

  return (
    <section id="solucoes" className="py-20 bg-[#0A0A0A]">
      <div className="container mx-auto px-4">
        <SectionTitle 
          title="Soluções Orientadas a Resultado" 
          subtitle="Um ecossistema completo para resolver gargalos e acelerar seu faturamento." 
          centered 
        />
        <div className="grid md:grid-cols-3 gap-8 mt-12">
          {solutionsBlocks.map((block, index) => (
            <div key={index} className="bg-brand-gray border border-white/5 p-8 rounded-xl hover:border-brand-red/30 hover:-translate-y-2 transition-all duration-300 group">
              <div className="bg-white/5 w-16 h-16 rounded-lg flex items-center justify-center mb-6 group-hover:bg-brand-red/10 transition-colors">
                {block.icon}
              </div>
              <h4 className="text-xl font-bold font-heading mb-6">{block.title}</h4>
              <ul className="space-y-3">
                {block.items.map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-300 text-sm">
                    <Check size={16} className="text-brand-red flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <a href="#contato" className="inline-block mt-6 text-brand-red text-sm font-bold uppercase tracking-wider hover:underline">
                Saber mais
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Methodology = () => (
  <section id="metodologia" className="py-20 bg-brand-dark border-t border-white/5">
    <div className="container mx-auto px-4">
      <SectionTitle title="Método PHD" subtitle="Como transformamos estratégias em resultados reais e mensuráveis." />
      
      <div className="grid md:grid-cols-3 gap-8 mt-16 relative">
        <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-brand-red/50 to-transparent"></div>
        
        {[
          { step: "01", title: "Diagnóstico Estratégico", desc: "Analisamos seu modelo de negócio, público e concorrência para traçar a rota mais eficiente rumo aos resultados." },
          { step: "02", title: "Implementação Rápida", desc: "Configuramos campanhas, criativos e automações em tempo recorde. Testamos rápido para validar o que funciona." },
          { step: "03", title: "Escala Inteligente", desc: "Com dados reais em mãos, escalamos o que funciona e eliminamos o desperdício. Resultados que se multiplicam." }
        ].map((item, i) => (
          <div key={i} className="relative bg-brand-dark z-10 p-6 border-l-2 md:border-l-0 md:border-t-0 border-brand-red/30 pl-8 md:pl-0 md:pt-8 md:text-center">
            <div className="md:mx-auto bg-brand-red text-white w-12 h-12 rounded-full flex items-center justify-center font-black text-lg mb-6 shadow-lg shadow-brand-red/30">
              {item.step}
            </div>
            <h4 className="text-2xl font-bold font-heading mb-3">{item.title}</h4>
            <p className="text-gray-400">
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const Cases = () => (
  <section id="cases" className="py-20 bg-brand-gray">
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-end mb-12">
        <div className="max-w-2xl">
           <h2 className="text-3xl md:text-4xl font-black font-heading tracking-tight mb-4">Resultados Reais</h2>
           <p className="text-gray-400">Performance comprovada que transforma números em crescimento real.</p>
        </div>
        <a href="#contato" className="hidden md:flex items-center gap-2 text-brand-red font-bold hover:underline">
          Ver todos os cases <ArrowRight size={16} />
        </a>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {ASSETS.cases.map((c, i) => (
          <div key={i} className="group cursor-pointer">
            <div className="overflow-hidden rounded-xl mb-6 relative">
              <div className="absolute top-4 right-4 bg-brand-red text-white text-xs font-bold px-3 py-1 rounded-full z-20">
                CASE SUCESSO
              </div>
              <img src={c.img} className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700" alt={c.logo} />
              <div className="absolute inset-0 bg-black/50 group-hover:bg-black/30 transition-colors"></div>
            </div>
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-2xl font-bold font-heading text-white">{c.logo}</h3>
              <span className="text-brand-red font-black text-xl">{c.metric}</span>
            </div>
            <p className="text-gray-400 text-sm border-l-2 border-white/10 pl-4">
              {c.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const Testimonials = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 340; // 320 card + 20 gap approx
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section id="depoimentos" className="py-20 bg-brand-dark relative overflow-hidden border-t border-white/5">
        <div className="container mx-auto px-4">
        <SectionTitle 
          title="O que nossos clientes dizem" 
          subtitle="Resultados reais de quem confiou na PHD Studio para transformar seus negócios." 
          centered 
        />
            
            <div className="relative group/nav flex justify-center">
                {/* Navigation Arrows (Desktop) */}
                <button 
                  onClick={() => scroll('left')} 
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 bg-brand-red/80 p-3 rounded-full text-white shadow-lg hover:bg-brand-red transition opacity-0 group-hover/nav:opacity-100 hidden md:block backdrop-blur-sm"
                >
                    <ChevronLeft size={24} />
                </button>
                <button 
                  onClick={() => scroll('right')} 
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 bg-brand-red/80 p-3 rounded-full text-white shadow-lg hover:bg-brand-red transition opacity-0 group-hover/nav:opacity-100 hidden md:block backdrop-blur-sm"
                >
                    <ChevronRight size={24} />
                </button>

                {/* Scroll Container */}
                <div 
                  ref={scrollRef} 
                  className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-hide px-4 md:px-0" 
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {TESTIMONIALS.map(t => (
                        <TestimonialCard key={t.id} data={t} />
                    ))}
                </div>
            </div>
        </div>
    </section>
  )
};

const FAQ = () => {
  const faqs = [
    { q: "Qual o investimento mínimo para começar?", a: "Recomendamos um budget de mídia a partir de R$ 1.500/mês para testes consistentes. Nossos pacotes se adaptam ao seu momento e objetivos." },
    { q: "Vocês atendem quais nichos?", a: "Somos especialistas em Marketing Recorrente (empresas que querem crescer todos os dias) e Lançamentos Digitais (infoprodutores, experts e coprodutores)." },
    { q: "Em quanto tempo vejo resultados?", a: "Primeiros resultados aparecem em 15-30 dias. A maturação e escala consistente ocorrem entre o 2º e 3º mês, com otimização contínua." },
    { q: "Fazem apenas o tráfego?", a: "Não. Somos uma agência completa: Marketing + IA + Tecnologia. Entregamos criativos, landing pages, automações e CRM para garantir que cada real investido converta." }
  ];

  return (
    <section id="faq" className="py-20 bg-[#0A0A0A]">
      <div className="container mx-auto px-4 max-w-4xl">
        <SectionTitle title="Perguntas Frequentes" centered />
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="border border-white/10 rounded-lg bg-brand-gray overflow-hidden">
              <details className="group">
                <summary className="flex justify-between items-center p-6 cursor-pointer list-none">
                  <span className="font-bold text-lg">{faq.q}</span>
                  <ChevronDown className="transform group-open:rotate-180 transition-transform text-brand-red" />
                </summary>
                <div className="px-6 pb-6 text-gray-400 leading-relaxed">
                  {faq.a}
                </div>
              </details>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui você pode adicionar a lógica para enviar os dados
    console.log('Form data:', formData);
    alert('Obrigado! Entraremos em contato em breve.');
    setFormData({ name: '', email: '', phone: '', message: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <section id="contato" className="py-20 bg-brand-gray">
      <div className="container mx-auto px-4 max-w-2xl">
        <SectionTitle 
          title="Vamos transformar seu negócio?" 
          subtitle="Preencha o formulário e receba um diagnóstico gratuito em 48h." 
          centered 
        />
        <form onSubmit={handleSubmit} className="bg-brand-dark border border-white/10 rounded-2xl p-8 md:p-10 space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
              Nome completo
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full bg-brand-gray border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-red transition-colors"
              placeholder="Seu nome"
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              E-mail
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full bg-brand-gray border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-red transition-colors"
              placeholder="seu@email.com"
            />
          </div>
          
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
              WhatsApp
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full bg-brand-gray border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-red transition-colors"
              placeholder="(11) 99999-9999"
            />
          </div>
          
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
              Mensagem (opcional)
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={4}
              className="w-full bg-brand-gray border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-red transition-colors resize-none"
              placeholder="Conte-nos sobre seu negócio..."
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-brand-red text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-red-700 transition-colors shadow-lg shadow-brand-red/20"
          >
            Enviar solicitação
          </button>
        </form>
      </div>
    </section>
  );
};

const Footer = () => (
  <footer className="bg-black border-t border-white/10 pt-20 pb-10">
    <div className="container mx-auto px-4">
      <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-16">
        <div className="text-center md:text-left">
           <img 
             src={ASSETS.logo} 
             alt="PHD Studio" 
             className="h-16 w-auto object-contain mx-auto md:mx-0 mb-6"
           />
          <p className="text-gray-400 max-w-sm">
            Agência híbrida de Marketing + IA + Tecnologia. Transformamos estratégias em vendas recorrentes e lançamentos de sucesso.
          </p>
        </div>
        
        <div className="bg-brand-gray p-8 rounded-2xl border border-white/10 text-center md:text-right w-full md:w-auto">
          <h4 className="text-xl font-bold mb-2">Pronto para escalar?</h4>
          <p className="text-gray-400 mb-6 text-sm">Receba um diagnóstico gratuito em 48h.</p>
          <a href="#contato" className="bg-brand-red text-white w-full px-8 py-4 rounded-lg font-bold hover:bg-red-700 transition-colors shadow-lg shadow-brand-red/20 text-center block">
            QUERO MEU DIAGNÓSTICO
          </a>
        </div>
      </div>
      
      <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-600">
        <p>&copy; 2024 PHD Studio. Todos os direitos reservados.</p>
        <div className="flex gap-6 mt-4 md:mt-0">
          <a href="#" className="hover:text-white transition-colors">Instagram</a>
          <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
          <a href="#" className="hover:text-white transition-colors">WhatsApp</a>
        </div>
      </div>
    </div>
  </footer>
);

// --- Main App ---
function App() {
  return (
    <HashRouter>
      <div className="font-sans bg-brand-dark min-h-screen text-white selection:bg-brand-red selection:text-white">
        <Navbar />
        <main>
          <Hero />
          <ClientMarquee />
          <GrowthType />
          <Solutions />
          <Methodology />
          <Cases />
          <Testimonials /> 
          <FAQ />
          <ContactForm />
        </main>
        <Footer />
        
        {/* Floating WhatsApp Button */}
        <a 
          href="https://wa.me/5511972158877" 
          target="_blank" 
          rel="noopener noreferrer"
          className="fixed bottom-8 right-8 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center justify-center"
          aria-label="Falar no WhatsApp"
        >
          <Phone size={28} fill="currentColor" />
        </a>
      </div>
    </HashRouter>
  );
}

export default App;