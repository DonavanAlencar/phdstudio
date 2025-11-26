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
  
  // Client Logos (Placeholders for Marquee)
  // Substitua estas URLs pelos seus SVGs no GitHub quando estiverem prontos
  clientLogos: [
    "https://placehold.co/150x80/121212/FFFFFF/png?text=CLIENTE+01",
    "https://placehold.co/150x80/121212/FFFFFF/png?text=CLIENTE+02",
    "https://placehold.co/150x80/121212/FFFFFF/png?text=CLIENTE+03",
    "https://placehold.co/150x80/121212/FFFFFF/png?text=CLIENTE+04",
    "https://placehold.co/150x80/121212/FFFFFF/png?text=CLIENTE+05",
    "https://placehold.co/150x80/121212/FFFFFF/png?text=CLIENTE+06",
  ],

  // Case Studies
  cases: [
    {
      img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop",
      logo: "FinTech Pro",
      metric: "+4.2x ROAS",
      desc: "Otimização de tráfego pago para SaaS financeiro."
    },
    {
      img: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=800&auto=format&fit=crop",
      logo: "Launch X",
      metric: "R$ 1.5M em 7 dias",
      desc: "Estrutura completa para lançamento de infoproduto."
    },
    {
      img: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?q=80&w=800&auto=format&fit=crop",
      logo: "E-comm Beauty",
      metric: "-58% CPL",
      desc: "Automação de recuperação de carrinho e leads."
    }
  ]
};

// --- Fake Data for Testimonials ---
const TESTIMONIALS = [
  {
    id: 1,
    name: "Juliana Almeida",
    role: "CEO, Tech Startup",
    quote: "O sistema da PHD transformou a minha visão de negócio. A automação que implementaram economizou horas da minha equipe e aumentou nossas vendas em 40%.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop"
  },
  {
    id: 2,
    name: "Ricardo Borges",
    role: "Infoprodutor e Mentor",
    quote: "Em um mês de parceria, escalamos meu lançamento para 6 dígitos. A estratégia de tráfego e os criativos foram impecáveis. Recomendo de olhos fechados.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop"
  },
  {
    id: 3,
    name: "Fernanda Costa",
    role: "Diretora de Marketing",
    quote: "A qualidade visual e técnica é o ponto alto. Eles entregam não só design bonito, mas páginas que convertem de verdade. O suporte é rápido e eficiente.",
    avatar: "https://images.unsplash.com/photo-1573496359-e3631dd16299?q=80&w=200&auto=format&fit=crop"
  },
  {
    id: 4,
    name: "Carlos Mendes",
    role: "Fundador E-commerce",
    quote: "Estávamos estagnados e a PHD trouxe a visão de dados que faltava. Otimizaram nosso funil e hoje temos previsibilidade de receita recorrente.",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop"
  },
  {
    id: 5,
    name: "Patricia Lima",
    role: "Especialista em Vendas",
    quote: "Profissionalismo raro no mercado. Desde o diagnóstico até a implementação, tudo foi transparente. O ROI da campanha superou todas as expectativas.",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200&auto=format&fit=crop"
  }
];

// --- Components ---

const TestimonialCard: React.FC<{ data: typeof TESTIMONIALS[0] }> = ({ data }) => (
  <div className="bg-[#121212] border border-white/10 p-8 rounded-2xl min-w-[320px] md:min-w-[400px] flex-shrink-0 snap-center hover:border-brand-red/50 transition-colors duration-300 flex flex-col justify-between h-full group">
    <div>
      <Quote className="text-brand-red w-8 h-8 mb-6 opacity-50 group-hover:opacity-100 transition-opacity" />
      <p className="text-gray-300 text-lg leading-relaxed italic mb-8 font-light">
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
        <h4 className="text-white font-bold font-heading">{data.name}</h4>
        <p className="text-sm text-gray-500">{data.role}</p>
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
          <a href="#contato" className="bg-brand-red text-white px-6 py-2 rounded-full font-bold text-sm hover:bg-red-700 transition-all transform hover:scale-105 flex items-center gap-2">
            AUDITORIA GRATUITA
          </a>
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
          <a href="#contato" onClick={() => setIsOpen(false)} className="bg-brand-red text-white px-8 py-3 rounded-full font-bold text-lg">
            AUDITORIA GRATUITA
          </a>
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
            Marketing que gera <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-red to-red-500">vendas</span> todos os dias.
          </h1>
          
          <p className="text-xl text-gray-400 font-light max-w-lg leading-relaxed">
            Criativos, campanhas e automações inteligentes para negócios que querem crescer com consistência ou escalar lançamentos.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <a href="#recorrente" className="bg-brand-red text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-red-700 transition-all text-center flex items-center justify-center gap-2 shadow-lg shadow-brand-red/20">
              Quero crescer agora
              <ArrowRight size={20} />
            </a>
            <a href="#diagnostico" className="bg-transparent border border-white/20 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white/5 transition-all text-center">
              Auditar meu marketing
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

        {/* Right side visual */}
        <div className="relative hidden md:block animate-fade-in-up" style={{animationDelay: '0.2s'}}>
          <div className="relative z-10 bg-brand-gray border border-white/10 rounded-2xl p-2 shadow-2xl transform rotate-[-2deg] hover:rotate-0 transition-transform duration-500">
            <img 
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000&auto=format&fit=crop" 
              alt="Dashboard" 
              className="rounded-xl opacity-80"
            />
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
            
            <div className="absolute -bottom-8 -left-8 bg-[#1A1A1A] p-4 rounded-xl border border-white/10 shadow-xl" style={{animationDelay: '1s'}}>
              <div className="flex items-center gap-3">
                <div className="bg-brand-red/20 p-2 rounded-lg">
                  <Zap className="text-brand-red" size={20} />
                </div>
                <div>
                  <div className="text-xs text-gray-400">Leads Gerados</div>
                  <div className="text-lg font-bold text-white">15.4k+</div>
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

const AudienceSplit = () => {
  return (
    <section className="py-20 bg-brand-dark">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Card Recorrente */}
          <div id="recorrente" className="group relative overflow-hidden rounded-2xl border border-white/10 bg-brand-gray hover:border-brand-red/50 transition-all duration-300">
            <div className="absolute inset-0">
               <img src={ASSETS.recurringBg} className="w-full h-full object-cover opacity-10 group-hover:scale-105 transition-transform duration-700" alt="Recorrente" />
               <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent"></div>
            </div>
            <div className="relative p-10 h-full flex flex-col items-start">
              <div className="bg-blue-500/10 p-3 rounded-xl mb-6 border border-blue-500/20">
                <TrendingUp className="text-blue-500" size={32} />
              </div>
              <h3 className="text-3xl font-bold font-heading mb-4">Crescimento Recorrente</h3>
              <p className="text-gray-400 mb-8 flex-grow">
                Para negócios que buscam previsibilidade, leads qualificados todos os dias e construção de marca sólida no longo prazo.
              </p>
              <ul className="space-y-3 mb-8 text-sm text-gray-300">
                <li className="flex gap-2"><Check size={16} className="text-brand-red" /> Tráfego Pago Perpétuo</li>
                <li className="flex gap-2"><Check size={16} className="text-brand-red" /> Gestão de Redes Sociais</li>
                <li className="flex gap-2"><Check size={16} className="text-brand-red" /> CRM & Vendas</li>
              </ul>
              <button className="w-full bg-white text-black font-bold py-4 rounded-lg hover:bg-gray-200 transition-colors">
                Quero crescimento diário
              </button>
            </div>
          </div>

          {/* Card Lançamento */}
          <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-brand-gray hover:border-brand-red/50 transition-all duration-300">
            <div className="absolute inset-0">
               <img src={ASSETS.launchBg} className="w-full h-full object-cover opacity-10 group-hover:scale-105 transition-transform duration-700" alt="Lançamento" />
               <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent"></div>
            </div>
            <div className="relative p-10 h-full flex flex-col items-start">
              <div className="bg-brand-red/10 p-3 rounded-xl mb-6 border border-brand-red/20">
                <Rocket className="text-brand-red" size={32} />
              </div>
              <h3 className="text-3xl font-bold font-heading mb-4">Lançamentos Digitais</h3>
              <p className="text-gray-400 mb-8 flex-grow">
                Para infoprodutores e experts que querem escalar seus resultados com picos de vendas explosivos e estratégia validada.
              </p>
              <ul className="space-y-3 mb-8 text-sm text-gray-300">
                <li className="flex gap-2"><Check size={16} className="text-brand-red" /> Estratégia de Lançamento</li>
                <li className="flex gap-2"><Check size={16} className="text-brand-red" /> Captura de Leads em Massa</li>
                <li className="flex gap-2"><Check size={16} className="text-brand-red" /> Design de Alta Conversão</li>
              </ul>
              <button className="w-full bg-brand-red text-white font-bold py-4 rounded-lg hover:bg-red-700 transition-colors">
                Quero escalar lançamento
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Solutions = () => {
  const solutions = [
    {
      icon: <Target className="text-brand-red" size={24} />,
      title: "Performance & Tráfego",
      desc: "Anúncios ultra-segmentados no Meta, Google e TikTok Ads para colocar sua oferta na frente de quem compra.",
    },
    {
      icon: <Cpu className="text-brand-red" size={24} />,
      title: "Automação & IA",
      desc: "Implementação de CRMs, chatbots e fluxos automáticos para recuperar vendas e qualificar leads 24/7.",
    },
    {
      icon: <Users className="text-brand-red" size={24} />,
      title: "Criação & Branding",
      desc: "Identidade visual forte, vídeos que prendem a atenção e design que transmite autoridade imediata.",
    },
    {
      icon: <BarChart3 className="text-brand-red" size={24} />,
      title: "Web & Landing Pages",
      desc: "Páginas de alta conversão, otimizadas para velocidade e mobile, prontas para receber tráfego pesado.",
    },
  ];

  return (
    <section id="solucoes" className="py-20 bg-[#0A0A0A]">
      <div className="container mx-auto px-4">
        <SectionTitle 
          title="Soluções Integradas" 
          subtitle="Um ecossistema completo para resolver gargalos e acelerar seu faturamento." 
          centered 
        />
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {solutions.map((sol, index) => (
            <div key={index} className="bg-brand-gray border border-white/5 p-8 rounded-xl hover:border-brand-red/30 hover:-translate-y-2 transition-all duration-300 group">
              <div className="bg-white/5 w-14 h-14 rounded-lg flex items-center justify-center mb-6 group-hover:bg-brand-red/10 transition-colors">
                {sol.icon}
              </div>
              <h4 className="text-xl font-bold font-heading mb-3">{sol.title}</h4>
              <p className="text-gray-400 text-sm leading-relaxed">
                {sol.desc}
              </p>
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
      <SectionTitle title="Método PHD" subtitle="Como transformamos desconhecidos em clientes fiéis." />
      
      <div className="grid md:grid-cols-3 gap-8 mt-16 relative">
        <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-brand-red/50 to-transparent"></div>
        
        {[
          { step: "01", title: "Diagnóstico Profundo", desc: "Entendemos seu modelo de negócio, margens e público para traçar a rota segura." },
          { step: "02", title: "Implementação Ágil", desc: "Configuramos campanhas, criativos e automações em tempo recorde para testar rápido." },
          { step: "03", title: "Escala & Otimização", desc: "Com dados em mãos, aumentamos o investimento onde traz retorno e cortamos o desperdício." }
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
           <p className="text-gray-400">Não vendemos promessas. Vendemos performance comprovada.</p>
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
      const scrollAmount = 400; // estimated card width
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
              title="O que os Gigantes dizem" 
              subtitle="Resultados reais de membros da nossa comunidade." 
              centered 
            />
            
            <div className="relative group/nav">
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
    { q: "Qual o investimento mínimo para começar?", a: "Recomendamos um budget de mídia a partir de R$ 1.500/mês para testes consistentes, mas nossos pacotes de gestão se adaptam ao seu momento." },
    { q: "Vocês atendem quais nichos?", a: "Somos especialistas em Negócios Locais, Infoprodutos, E-commerce e Serviços B2B que buscam escala." },
    { q: "Em quanto tempo vejo resultados?", a: "Primeiras vitórias costumam aparecer em 15-30 dias. A maturação e escala consistente ocorrem entre o 2º e 3º mês." },
    { q: "Fazem apenas o tráfego?", a: "Não. Somos uma assessoria completa. Entregamos criativos, landing pages e setup de CRM para garantir que o tráfego converta." }
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
            Agência especializada em transformar cliques em clientes através de dados, criatividade e tecnologia.
          </p>
        </div>
        
        <div className="bg-brand-gray p-8 rounded-2xl border border-white/10 text-center md:text-right w-full md:w-auto">
          <h4 className="text-xl font-bold mb-2">Pronto para escalar?</h4>
          <p className="text-gray-400 mb-6 text-sm">Receba um diagnóstico gratuito em 48h.</p>
          <button className="bg-brand-red text-white w-full px-8 py-4 rounded-lg font-bold hover:bg-red-700 transition-colors shadow-lg shadow-brand-red/20">
            QUERO MEU DIAGNÓSTICO
          </button>
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
          <AudienceSplit />
          <Solutions />
          <Methodology />
          <Cases />
          <Testimonials /> 
          <FAQ />
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