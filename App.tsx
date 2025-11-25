import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  Menu, X, Phone, Check, ChevronRight, ChevronDown, 
  TrendingUp, Rocket, Cpu, BarChart3, Users, Zap, Target, ArrowRight 
} from 'lucide-react';

// --- Assets Configuration (Updated for Agency/Tech Vibe) ---
const ASSETS = {
  // Video mock (using high quality tech image for background)
  heroBg: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop", 
  
  // Specific contextual images
  recurringBg: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=800&auto=format&fit=crop",
  launchBg: "https://images.unsplash.com/photo-1642427749670-f20e2e76ed8c?q=80&w=800&auto=format&fit=crop",
  
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

// --- Components ---

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setIsOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-brand-dark/95 backdrop-blur-md border-b border-white/10 py-4' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <Link to="/" className="text-2xl font-heading font-black tracking-tighter flex items-center gap-1 group">
          <span className="text-white">phd</span>
          <span className="text-brand-red">STUDIO</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-8">
          {['Soluções', 'Metodologia', 'Cases', 'FAQ'].map((item) => (
            <button 
              key={item} 
              onClick={() => scrollToSection(item.toLowerCase())}
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              {item}
            </button>
          ))}
          <a 
            href="#contact"
            className="bg-white text-black hover:bg-brand-red hover:text-white font-bold py-2.5 px-6 rounded-lg transition-all text-sm"
          >
            Diagnóstico Gratuito
          </a>
        </div>

        {/* Mobile Toggle */}
        <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden text-white">
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Nav */}
      <div className={`lg:hidden absolute top-full left-0 w-full bg-brand-dark border-b border-white/10 transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="flex flex-col p-6 gap-4">
          {['Soluções', 'Metodologia', 'Cases', 'FAQ'].map((item) => (
            <button 
              key={item} 
              onClick={() => scrollToSection(item.toLowerCase())}
              className="text-left text-lg font-medium text-gray-300 hover:text-brand-red"
            >
              {item}
            </button>
          ))}
          <a href="#contact" className="bg-brand-red text-white font-bold py-3 px-6 rounded-lg text-center mt-2">
            Diagnóstico Gratuito
          </a>
        </div>
      </div>
    </nav>
  );
};

const Footer = () => (
  <footer className="bg-black border-t border-white/10 py-16">
    <div className="max-w-7xl mx-auto px-6">
      <div className="grid md:grid-cols-4 gap-12 mb-12">
        <div className="col-span-1 md:col-span-2">
          <h3 className="text-3xl font-heading font-black text-white mb-4">phd<span className="text-brand-red">STUDIO</span></h3>
          <p className="text-gray-400 max-w-sm mb-6">
            Agência de tecnologia e marketing focada em escala e previsibilidade.
            Transformamos dados em receita.
          </p>
          <div className="flex gap-4">
            {/* Social Placeholders */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-10 h-10 bg-white/5 rounded-full hover:bg-brand-red transition-colors flex items-center justify-center cursor-pointer">
                <span className="w-4 h-4 bg-white/50 rounded-full"></span>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="font-bold text-white mb-4">Soluções</h4>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li><a href="#" className="hover:text-brand-red">Tráfego Pago</a></li>
            <li><a href="#" className="hover:text-brand-red">Lançamentos</a></li>
            <li><a href="#" className="hover:text-brand-red">Automação & CRM</a></li>
            <li><a href="#" className="hover:text-brand-red">Web Design</a></li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-bold text-white mb-4">Contato</h4>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li>contato@phdstudio.com.br</li>
            <li>+55 11 97215 8877</li>
            <li>São Paulo, SP</li>
          </ul>
        </div>
      </div>
      
      <div className="pt-8 border-t border-white/5 text-center md:text-left flex flex-col md:flex-row justify-between items-center text-gray-600 text-sm">
        <p>© {new Date().getFullYear()} PHD Studio. Todos os direitos reservados.</p>
        <div className="flex gap-6 mt-4 md:mt-0">
          <a href="#" className="hover:text-white">Termos</a>
          <a href="#" className="hover:text-white">Privacidade</a>
        </div>
      </div>
    </div>
  </footer>
);

// --- Custom Hook for Fade In Animation ---
const useFadeIn = () => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) setIsVisible(true);
      });
    });
    if (domRef.current) observer.observe(domRef.current);
    return () => {
      if (domRef.current) observer.unobserve(domRef.current);
    };
  }, []);

  return { domRef, isVisible };
};

const FadeInSection: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => {
  const { domRef, isVisible } = useFadeIn();
  return (
    <div
      ref={domRef}
      className={`fade-in-section ${isVisible ? 'is-visible' : ''} ${className}`}
    >
      {children}
    </div>
  );
};

const MetricCard = ({ value, label, icon: Icon }: { value: string, label: string, icon: any }) => (
  <div className="glass-card p-6 rounded-xl flex items-center gap-4 hover:border-brand-red/50 transition-colors">
    <div className="p-3 bg-brand-red/10 rounded-lg text-brand-red">
      <Icon size={24} />
    </div>
    <div>
      <h4 className="text-2xl font-bold text-white">{value}</h4>
      <p className="text-sm text-gray-400">{label}</p>
    </div>
  </div>
);

const FaqItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="border-b border-white/10">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex justify-between items-center text-left hover:text-brand-red transition-colors"
      >
        <span className="text-lg font-medium text-white">{question}</span>
        <ChevronDown className={`transition-transform duration-300 ${isOpen ? 'rotate-180 text-brand-red' : 'text-gray-500'}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-48 opacity-100 mb-6' : 'max-h-0 opacity-0'}`}>
        <p className="text-gray-400 leading-relaxed pr-8">{answer}</p>
      </div>
    </div>
  );
};

// --- HomePage ---

const HomePage = () => {
  return (
    <main className="min-h-screen">
      
      {/* 1. HERO SECTION */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-black/60 z-10"></div>
          {/* Simulated Video Background */}
          <img 
            src={ASSETS.heroBg}
            alt="Marketing Dashboard Background" 
            className="w-full h-full object-cover opacity-40"
          />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-20 w-full grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-red/10 border border-brand-red/20 text-brand-red text-xs font-bold tracking-wide uppercase">
              <span className="w-2 h-2 rounded-full bg-brand-red animate-pulse"></span>
              Agência de Performance
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-heading font-black leading-[1.1] text-white">
              Marketing que <br />
              gera <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-red to-red-400">vendas</span> — <br />
              todos os dias.
            </h1>
            
            <p className="text-gray-300 text-lg lg:text-xl max-w-xl leading-relaxed">
              Criativos, campanhas e automações inteligentes para negócios que querem crescer com consistência ou escalar lançamentos digitais.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <a 
                href="#contact" 
                className="bg-brand-red hover:bg-red-700 text-white font-bold py-4 px-8 rounded-lg text-center transition-all transform hover:translate-y-[-2px] hover:shadow-lg hover:shadow-red-900/40"
              >
                Quero crescer agora
              </a>
              <a 
                href="#contact" 
                className="bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold py-4 px-8 rounded-lg text-center transition-all flex items-center justify-center gap-2"
              >
                <Target size={18} />
                Auditar meu marketing
              </a>
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-gray-500">
          <ChevronDown size={24} />
        </div>
      </section>

      {/* 2. AUDIENCE SPLIT */}
      <section className="py-20 px-6 bg-brand-dark border-b border-white/5">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8 -mt-24 relative z-30">
          
          {/* Card 1: Recorrência */}
          <div className="group relative overflow-hidden rounded-2xl bg-brand-gray border border-white/10 p-8 hover:border-brand-red transition-all duration-300">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <TrendingUp size={120} />
            </div>
            <div className="relative z-10 space-y-4">
              <div className="w-12 h-12 bg-brand-red/10 rounded-lg flex items-center justify-center text-brand-red mb-4">
                <TrendingUp size={24} />
              </div>
              <h3 className="text-2xl font-bold text-white">Marketing Recorrente</h3>
              <p className="text-gray-400 h-16">
                Para negócios, e-commerces e serviços que buscam previsibilidade e crescimento diário de vendas.
              </p>
              <ul className="space-y-2 text-sm text-gray-300 mb-6">
                <li className="flex items-center gap-2"><Check size={16} className="text-brand-red"/> Tráfego Pago (Ads)</li>
                <li className="flex items-center gap-2"><Check size={16} className="text-brand-red"/> Gestão de Redes Sociais</li>
                <li className="flex items-center gap-2"><Check size={16} className="text-brand-red"/> CRM e Vendas</li>
              </ul>
              <button className="w-full py-3 rounded-lg border border-white/20 text-white hover:bg-white hover:text-black font-bold transition-colors">
                Quero crescimento diário
              </button>
            </div>
          </div>

          {/* Card 2: Lançamentos */}
          <div className="group relative overflow-hidden rounded-2xl bg-brand-gray border border-white/10 p-8 hover:border-brand-red transition-all duration-300">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <Rocket size={120} />
            </div>
            <div className="relative z-10 space-y-4">
              <div className="w-12 h-12 bg-brand-red/10 rounded-lg flex items-center justify-center text-brand-red mb-4">
                <Rocket size={24} />
              </div>
              <h3 className="text-2xl font-bold text-white">Lançamentos Digitais</h3>
              <p className="text-gray-400 h-16">
                Para infoprodutores e experts que desejam escalar seus lançamentos com estrutura profissional.
              </p>
              <ul className="space-y-2 text-sm text-gray-300 mb-6">
                <li className="flex items-center gap-2"><Check size={16} className="text-brand-red"/> Estratégia de Lançamento</li>
                <li className="flex items-center gap-2"><Check size={16} className="text-brand-red"/> Páginas de Alta Conversão</li>
                <li className="flex items-center gap-2"><Check size={16} className="text-brand-red"/> Automação de E-mail/Wpp</li>
              </ul>
              <button className="w-full py-3 rounded-lg border border-white/20 text-white hover:bg-white hover:text-black font-bold transition-colors">
                Quero escalar meu lançamento
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* 3. SOCIAL PROOF & METRICS */}
      <section className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-6">
          <FadeInSection>
            <div className="text-center mb-12">
              <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Resultados que falam por si</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard value="+4.2x" label="Média de ROAS" icon={BarChart3} />
                <MetricCard value="-58%" label="Redução no CPL" icon={TrendingUp} />
                <MetricCard value="+15k" label="Leads Captados/Mês" icon={Users} />
              </div>
            </div>

            {/* Client Logos Strip (Simulated) */}
            <div className="border-y border-white/10 py-8 overflow-hidden relative">
              <div className="flex justify-between items-center opacity-40 grayscale hover:grayscale-0 transition-all duration-500 px-4">
                 <span className="text-2xl font-black font-heading">EMPRESA<span className="text-brand-red">ONE</span></span>
                 <span className="text-2xl font-black font-heading">TECH<span className="text-white">CORP</span></span>
                 <span className="text-2xl font-black font-heading">START<span className="text-brand-red">UP</span></span>
                 <span className="text-2xl font-black font-heading hidden md:inline">ECOMM<span className="text-white">PRO</span></span>
                 <span className="text-2xl font-black font-heading hidden md:inline">DIGITAL<span className="text-brand-red">X</span></span>
              </div>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* 4. SOLUTIONS BY BENEFIT */}
      <section id="soluções" className="py-24 px-6 bg-brand-dark relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-red/10 via-brand-dark to-brand-dark pointer-events-none"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <FadeInSection className="mb-16">
            <h2 className="text-3xl md:text-5xl font-heading font-bold text-white mb-6">
              Soluções Integradas <br/> para <span className="text-brand-red">Resultados Reais</span>
            </h2>
            <p className="text-gray-400 max-w-2xl text-lg">
              Deixamos a parte técnica e estratégica conosco, para que você foque apenas em entregar o seu melhor produto ou serviço.
            </p>
          </FadeInSection>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Solution 1 */}
            <FadeInSection className="delay-100">
              <div className="bg-brand-gray rounded-xl p-8 h-full border border-white/5 hover:border-brand-red/50 transition-colors group">
                <div className="w-14 h-14 bg-brand-red/20 text-brand-red rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Target size={32} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Performance & Vendas</h3>
                <p className="text-gray-400 mb-6 text-sm leading-relaxed">
                  Gestão profissional de tráfego pago (Meta, Google, TikTok) focada em conversão. Criativos que vendem e copy persuasiva.
                </p>
                <a href="#contact" className="text-brand-red font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                  Ver solução <ArrowRight size={16} />
                </a>
              </div>
            </FadeInSection>

            {/* Solution 2 */}
            <FadeInSection className="delay-200">
              <div className="bg-brand-gray rounded-xl p-8 h-full border border-white/5 hover:border-brand-red/50 transition-colors group">
                <div className="w-14 h-14 bg-brand-red/20 text-brand-red rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Zap size={32} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Tecnologia & Automação</h3>
                <p className="text-gray-400 mb-6 text-sm leading-relaxed">
                  Implementação de CRM, automação de e-mail marketing, chatbots e recuperação de vendas. Sua máquina de vendas rodando 24/7.
                </p>
                <a href="#contact" className="text-brand-red font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                  Ver solução <ArrowRight size={16} />
                </a>
              </div>
            </FadeInSection>

            {/* Solution 3 */}
            <FadeInSection className="delay-300">
              <div className="bg-brand-gray rounded-xl p-8 h-full border border-white/5 hover:border-brand-red/50 transition-colors group">
                <div className="w-14 h-14 bg-brand-red/20 text-brand-red rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Cpu size={32} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Web & Design</h3>
                <p className="text-gray-400 mb-6 text-sm leading-relaxed">
                  Landing Pages de alta conversão, identidade visual estratégica e sites institucionais velozes. Design feito para vender.
                </p>
                <a href="#contact" className="text-brand-red font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                  Ver solução <ArrowRight size={16} />
                </a>
              </div>
            </FadeInSection>
          </div>
        </div>
      </section>

      {/* 5. METHODOLOGY */}
      <section id="metodologia" className="py-24 px-6 bg-black border-y border-white/10">
        <div className="max-w-7xl mx-auto text-center">
          <FadeInSection className="mb-16">
            <h2 className="text-3xl font-heading font-bold text-white mb-4">Como trabalhamos</h2>
            <p className="text-gray-400">Um processo validado para garantir resultados previsíveis.</p>
          </FadeInSection>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connector Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-brand-red/50 to-transparent"></div>

            {[
              { step: "01", title: "Diagnóstico Profundo", desc: "Analisamos seus dados, concorrentes e gargalos atuais." },
              { step: "02", title: "Implementação Ágil", desc: "Configuração de campanhas, pixels, páginas e automações." },
              { step: "03", title: "Escala & Otimização", desc: "Análise diária de métricas para aumentar o ROI continuamente." }
            ].map((item, idx) => (
              <FadeInSection key={idx} className={`relative z-10 delay-${idx * 200}`}>
                <div className="w-24 h-24 bg-brand-dark border-2 border-brand-red rounded-full flex items-center justify-center text-3xl font-black text-white mx-auto mb-6 shadow-[0_0_20px_rgba(229,9,20,0.3)]">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm max-w-xs mx-auto">{item.desc}</p>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CASES */}
      <section id="cases" className="py-24 px-6 bg-brand-dark">
        <div className="max-w-7xl mx-auto">
          <FadeInSection className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl font-heading font-bold text-white mb-2">Cases de Sucesso</h2>
              <p className="text-gray-400">Histórias reais de crescimento.</p>
            </div>
          </FadeInSection>

          <div className="grid md:grid-cols-3 gap-8">
            {ASSETS.cases.map((item, idx) => (
              <FadeInSection key={idx}>
                <div className="group rounded-xl overflow-hidden bg-brand-gray border border-white/5 hover:border-brand-red transition-all">
                  <div className="h-48 overflow-hidden relative">
                    <img src={item.img} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={item.logo} />
                    <div className="absolute inset-0 bg-black/50"></div>
                    <div className="absolute bottom-4 left-4">
                      <p className="text-xs font-bold text-brand-red uppercase mb-1">{item.logo}</p>
                      <p className="text-2xl font-black text-white">{item.metric}</p>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-gray-400 text-sm">{item.desc}</p>
                  </div>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* 7. FAQ */}
      <section id="faq" className="py-24 px-6 bg-black">
        <div className="max-w-3xl mx-auto">
          <FadeInSection className="text-center mb-12">
            <h2 className="text-3xl font-heading font-bold text-white">Perguntas Frequentes</h2>
          </FadeInSection>
          
          <div className="space-y-2">
            <FaqItem 
              question="Vocês atendem quais nichos?" 
              answer="Atendemos principalmente prestadores de serviços, e-commerces, infoprodutores e negócios locais que buscam escala. Se você tem um produto validado, podemos acelerar." 
            />
            <FaqItem 
              question="Quanto tempo para ver resultados?" 
              answer="Em campanhas de tráfego direto, os primeiros dados aparecem em 48h. Para otimização e escala consistente, trabalhamos com ciclos de maturação de 30 a 90 dias." 
            />
            <FaqItem 
              question="Vocês fazem os criativos?" 
              answer="Sim! Temos um time de design e motion para criar anúncios de alta conversão. Porém, também orientamos você na captação de vídeos 'orgânicos' que funcionam muito bem hoje." 
            />
            <FaqItem 
              question="Existe contrato de fidelidade?" 
              answer="Trabalhamos com contratos flexíveis, mas recomendamos um período mínimo de 3 meses para que a inteligência das campanhas e do CRM performe no seu potencial máximo." 
            />
          </div>
        </div>
      </section>

      {/* 8. FINAL CTA (CONTACT) */}
      <section id="contact" className="py-24 px-6 bg-brand-red relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-heading font-black text-white mb-6">
            Pronto para fazer seu marketing crescer de verdade?
          </h2>
          <p className="text-red-100 text-xl mb-10 max-w-2xl mx-auto">
            Receba um diagnóstico completo — criativos, campanhas, páginas e automações — e descubra onde está o dinheiro deixado na mesa.
          </p>
          
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-2xl max-w-lg mx-auto text-left">
            <form className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Nome da Empresa</label>
                <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-900 focus:border-brand-red focus:ring-1 focus:ring-brand-red outline-none transition-colors" placeholder="Sua empresa" />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Seu WhatsApp</label>
                <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-900 focus:border-brand-red focus:ring-1 focus:ring-brand-red outline-none transition-colors" placeholder="(11) 99999-9999" />
              </div>
              <button className="w-full bg-black hover:bg-gray-800 text-white font-bold py-4 rounded-lg transition-all transform hover:scale-[1.02] flex justify-center items-center gap-2 mt-4">
                Quero meu diagnóstico gratuito
                <ArrowRight size={20} />
              </button>
            </form>
            <p className="text-xs text-gray-500 mt-4 text-center">
              * Entraremos em contato em até 24h úteis.
            </p>
          </div>
        </div>
      </section>

    </main>
  );
};

// --- App Root ---

const App = () => {
  return (
    <HashRouter>
      <div className="font-sans bg-black text-white selection:bg-brand-red selection:text-white">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          {/* Kept routes structure flexible for future expansion, but centralized on Home for LP feel */}
        </Routes>
        <Footer />
      </div>
    </HashRouter>
  );
};

export default App;