import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import { BrowserRouter, Link, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu, X, Phone, Check, ChevronRight, ChevronDown, ChevronLeft,
  TrendingUp, Rocket, Cpu, BarChart3, Users, Zap, Target, ArrowRight, Quote, LogIn, Lock, TrendingDown
} from 'lucide-react';
import emailjs from '@emailjs/browser';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  XAxis,
  YAxis,
  CartesianGrid,
  FunnelChart,
  Funnel,
  LabelList
} from 'recharts';

// --- Assets Configuration ---
const ASSETS = {
  // Link direto para a nova imagem do logo no GitHub
  logo: "https://raw.githubusercontent.com/PHDStudioBR/PHDStudioImages/main/Logo%20Novo%202.png", 

  // Video mock (using high quality tech image for background) - Otimizado para performance
  heroBg: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop", 
  
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
    avatar: "https://raw.githubusercontent.com/PHDStudioBR/PHDStudioImages/main/Fabio%20Salgueiro.png"
  },
  {
    id: 2,
    name: "Lucas Battistoni",
    role: "Especialista em Liderança de Marketing Multinível",
    quote: "Trabalhar com a PHD Studio na gestão de tráfego transformou meu negócio. As estratégias bem estruturadas aumentaram nossa visibilidade e conversões. Uma parceria confiável, com resultados reais. Estou muito satisfeito.",
    avatar: "https://raw.githubusercontent.com/PHDStudioBR/PHDStudioImages/main/Lucas.png"
  },
  {
    id: 3,
    name: "Fernanda Daud",
    role: "Farmacêutica",
    quote: "Gravei um vídeo para minhas aulas de pós-graduação com a PHD Studio e fiquei muito satisfeita! Ficou didático, com música e imagens em total harmonia. Meus alunos adoraram. Super recomendo!",
    avatar: "https://raw.githubusercontent.com/PHDStudioBR/PHDStudioImages/main/Fernanda.png"
  },
  {
    id: 4,
    name: "Maria Eduarda Chamelete",
    role: "Especialista em e-commerce e estratégias digitais da Ruvollo",
    quote: "A parceria com a PHD Studio foi fundamental para o crescimento da Ruvolo Glass Company. Os vídeos promocionais ficaram impecáveis e reforçaram nossa identidade visual. A gestão de tráfego trouxe mais visibilidade e vendas. Excelente profissionalismo.",
    avatar: "https://raw.githubusercontent.com/PHDStudioBR/PHDStudioImages/main/Duda.png"
  }
];

// --- Authentication Context ---
interface AuthContextType {
  isAuthenticated: boolean;
  username: string | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });
  const [username, setUsername] = useState<string | null>(() => {
    return localStorage.getItem('username');
  });

  const login = (username: string, password: string): boolean => {
    if (username === 'vexin' && password === '@v3xiN!') {
      setIsAuthenticated(true);
      setUsername('vexin');
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('username', 'vexin');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUsername(null);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('username');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, username, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// --- Cookie Banner ---
const COOKIE_STORAGE_KEY = 'phdstudio_cookies_accepted';

const CookieBanner = () => {
  const [accepted, setAccepted] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem(COOKIE_STORAGE_KEY) === 'true';
  });

  const handleAccept = () => {
    localStorage.setItem(COOKIE_STORAGE_KEY, 'true');
    setAccepted(true);
  };

  if (accepted) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50">
      <div className="mx-auto max-w-4xl mb-4 px-4">
        <div className="bg-black/90 border border-white/10 rounded-2xl p-4 md:p-5 shadow-2xl backdrop-blur">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4">
            <div className="flex-1">
              <p className="text-xs md:text-sm text-gray-300">
                Usamos cookies e tecnologias semelhantes para melhorar sua experiência, analisar desempenho
                e personalizar conteúdos e anúncios. Ao continuar navegando, você concorda com nossa{' '}
                <Link
                  to="/politica-de-privacidade"
                  className="underline underline-offset-2 text-brand-red hover:text-red-400"
                >
                  Política de Privacidade
                </Link>
                .
              </p>
            </div>
            <button
              onClick={handleAccept}
              className="mt-2 md:mt-0 px-5 py-2 rounded-lg bg-brand-red text-white text-xs md:text-sm font-semibold uppercase tracking-wide hover:bg-red-700 transition-colors"
            >
              Aceitar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

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
        loading="lazy"
        decoding="async"
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
  const { isAuthenticated, username, logout } = useAuth();

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
    { name: 'Blog', href: 'https://www.phdstudio.blog.br/', external: true },
  ];

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-black/90 backdrop-blur-lg border-b border-white/10 py-3' : 'bg-transparent py-6'}`}>
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Botão Área do Cliente / Sair - Lado Esquerdo */}
        {isAuthenticated && username === 'vexin' ? (
          <button
            onClick={logout}
            className="hidden md:flex bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg font-bold text-sm uppercase tracking-wider transition-all duration-300 shadow-lg shadow-red-600/30 items-center gap-2 relative z-50"
          >
            <X size={16} />
            Sair
          </button>
        ) : (
          <Link 
            to="/login" 
            className="hidden md:flex bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg font-bold text-sm uppercase tracking-wider transition-all duration-300 shadow-lg shadow-red-600/30 items-center gap-2 relative z-50"
          >
            <Lock size={16} />
            Área do Cliente
          </Link>
        )}

        <Link to="/" className="relative z-50 block">
           <img 
             src={ASSETS.logo} 
             alt="PHD Studio" 
             className="h-10 w-auto object-contain md:h-12"
             width="200"
             height="48"
             loading="eager"
           />
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          {isAuthenticated && username === 'vexin' ? (
            <>
              <Link to="/funil_vexin" className="text-sm font-medium text-gray-300 hover:text-brand-red transition-colors uppercase tracking-wider">
                Funil
              </Link>
              <Link to="/projecao_vexin" className="text-sm font-medium text-gray-300 hover:text-brand-red transition-colors uppercase tracking-wider">
                Projeção
              </Link>
            </>
          ) : (
            navLinks.map((link) => 
              link.external ? (
                <a 
                  key={link.name} 
                  href={link.href} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-gray-300 hover:text-brand-red transition-colors uppercase tracking-wider"
                >
                  {link.name}
                </a>
              ) : (
                <a key={link.name} href={link.href} className="text-sm font-medium text-gray-300 hover:text-brand-red transition-colors uppercase tracking-wider">
                  {link.name}
                </a>
              )
            )
          )}
        </div>

        {/* Mobile Toggle */}
        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden z-50 text-white">
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* Mobile Menu */}
        <div className={`fixed inset-0 bg-black z-40 flex flex-col justify-center items-center gap-8 transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          {isAuthenticated && username === 'vexin' ? (
            <>
              <Link
                to="/funil_vexin"
                onClick={() => setIsOpen(false)}
                className="text-2xl font-bold text-white hover:text-brand-red"
              >
                Funil
              </Link>
              <Link
                to="/projecao_vexin"
                onClick={() => setIsOpen(false)}
                className="text-2xl font-bold text-white hover:text-brand-red"
              >
                Projeção
              </Link>
              <button
                onClick={() => {
                  setIsOpen(false);
                  logout();
                }}
                className="mt-4 bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-bold text-lg uppercase tracking-wider shadow-lg shadow-red-600/30 flex items-center gap-2"
              >
                <X size={20} />
                Sair
              </button>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                onClick={() => setIsOpen(false)} 
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-bold text-lg uppercase tracking-wider shadow-lg shadow-red-600/30 flex items-center gap-2"
              >
                <Lock size={20} />
                Área do Cliente
              </Link>

              {navLinks.map((link) => 
                link.external ? (
                  <a 
                    key={link.name} 
                    href={link.href} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    onClick={() => setIsOpen(false)} 
                    className="text-2xl font-bold text-white hover:text-brand-red"
                  >
                    {link.name}
                  </a>
                ) : (
                  <a key={link.name} href={link.href} onClick={() => setIsOpen(false)} className="text-2xl font-bold text-white hover:text-brand-red">
                    {link.name}
                  </a>
                )
              )}
            </>
          )}
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
          loading="eager"
          fetchpriority="high"
          width="1200"
          height="800"
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
                src="https://www.youtube.com/embed/doxJNgoy87E"
                title="PHD Studio - Marketing e Tecnologia"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const ClientMarquee = () => {
  // Repetimos o array várias vezes para garantir que não haja “buracos” na animação,
  // mesmo em telas muito largas.
  const logos = Array(4).fill(ASSETS.clientLogos).flat();

  return (
    <div className="bg-brand-gray border-y border-white/5 py-8 overflow-hidden relative group">
      {/* Gradientes de borda */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-brand-gray to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-brand-gray to-transparent" />

      {/* Faixa contínua de logos */}
      <div className="flex items-center animate-marquee whitespace-nowrap group-hover:[animation-play-state:paused]">
        {logos.map((logo, index) => (
          <div
            key={`${logo}-${index}`}
            className="flex-shrink-0 px-10 flex items-center justify-center opacity-40 hover:opacity-100 transition-opacity duration-300"
          >
            <img
              src={logo}
              alt={`Logomarca de cliente ${index + 1}`}
              className="h-12 w-auto object-contain brightness-0 invert"
              loading="lazy"
              decoding="async"
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
               <img src={ASSETS.recurringBg} className="w-full h-full object-cover opacity-10 group-hover:scale-105 transition-transform duration-700" alt="Marketing Recorrente" loading="lazy" decoding="async" />
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
            </div>
          </div>

          {/* Bloco 2 - Lançamentos Digitais */}
          <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-brand-gray hover:border-brand-red/50 transition-all duration-300">
            <div className="absolute inset-0">
               <img src={ASSETS.launchBg} className="w-full h-full object-cover opacity-10 group-hover:scale-105 transition-transform duration-700" alt="Lançamentos Digitais" loading="lazy" decoding="async" />
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
              <img src={c.img} className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700" alt={c.logo} loading="lazy" decoding="async" />
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
  /*
   * ⚠️ CONFIGURAÇÃO DO TEMPLATE NO EMAILJS ⚠️
   * 
   * IMPORTANTE: O template no EmailJS DEVE ter EXATAMENTE estas variáveis:
   * 
   * Subject: Novo Lead - {{from_name}}
   * 
   * Body (conteúdo do e-mail):
   * Nome: {{from_name}}
   * E-mail: {{from_email}}
   * WhatsApp: {{phone}}
   * Mensagem: {{message}}
   * 
   * Para responder, use: {{reply_to}}
   * 
   * ⚠️ ATENÇÃO:
   * - Os nomes das variáveis devem ser EXATAMENTE: from_name, from_email, phone, message, reply_to
   * - Não use espaços ou caracteres especiais nos nomes das variáveis
   * - O template deve estar ATIVO no painel do EmailJS
   * - O e-mail destinatário (to_email) pode ser configurado no template ou será enviado para o e-mail conectado
   */
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Apenas o email destinatário precisa ser configurado
  const RECIPIENT_EMAIL = import.meta.env.VITE_RECIPIENT_EMAIL || '';

  // Configurações do EmailJS (configure uma vez no painel e copie aqui)
  // Ou deixe vazio e configure via variáveis de ambiente
  const EMAILJS_CONFIG = {
    serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID || '',
    templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '',
    publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '',
  };

  useEffect(() => {
    // Log das configurações ao montar o componente (apenas em desenvolvimento)
    console.log('🔍 Verificando configurações EmailJS ao montar:', {
      serviceId: EMAILJS_CONFIG.serviceId || 'NÃO CONFIGURADO',
      templateId: EMAILJS_CONFIG.templateId || 'NÃO CONFIGURADO',
      publicKey: EMAILJS_CONFIG.publicKey ? `${EMAILJS_CONFIG.publicKey.substring(0, 5)}...` : 'NÃO CONFIGURADO',
      recipientEmail: RECIPIENT_EMAIL || 'NÃO CONFIGURADO',
      envVars: {
        VITE_EMAILJS_SERVICE_ID: import.meta.env.VITE_EMAILJS_SERVICE_ID || 'não definida',
        VITE_EMAILJS_TEMPLATE_ID: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'não definida',
        VITE_EMAILJS_PUBLIC_KEY: import.meta.env.VITE_EMAILJS_PUBLIC_KEY ? 'definida' : 'não definida',
        VITE_RECIPIENT_EMAIL: import.meta.env.VITE_RECIPIENT_EMAIL || 'não definida'
      }
    });

    // Inicializar EmailJS
    if (EMAILJS_CONFIG.publicKey) {
      try {
        emailjs.init(EMAILJS_CONFIG.publicKey);
        console.log('✅ EmailJS inicializado com sucesso');
      } catch (error) {
        console.error('❌ Erro ao inicializar EmailJS:', error);
      }
    } else {
      console.warn('⚠️ Public Key do EmailJS não configurada');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!RECIPIENT_EMAIL) {
      alert('Por favor, configure o VITE_RECIPIENT_EMAIL no arquivo .env');
      return;
    }

    setIsLoading(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    // Parâmetros do template (declarado fora do try para estar disponível no catch)
    // IMPORTANTE: Os nomes das variáveis devem corresponder EXATAMENTE ao template do EmailJS
    // Baseado na imagem, o template usa: from_name, from_email, phone, message, reply_to
    // E o campo "To Email" no template usa {{email}}, então vamos enviar como "email"
    const templateParams = {
      from_name: formData.name,
      from_email: formData.email,
      phone: formData.phone,
      message: formData.message || 'Sem mensagem adicional',
      reply_to: formData.email,
      // O template tem "To Email" com {{email}}, então enviamos como "email"
      email: RECIPIENT_EMAIL,
    };

    try {
      // Log das configurações (apenas em desenvolvimento)
      console.log('🔧 Configurações EmailJS:', {
        hasServiceId: !!EMAILJS_CONFIG.serviceId,
        hasTemplateId: !!EMAILJS_CONFIG.templateId,
        hasPublicKey: !!EMAILJS_CONFIG.publicKey,
        recipientEmail: RECIPIENT_EMAIL,
        serviceId: EMAILJS_CONFIG.serviceId,
        templateId: EMAILJS_CONFIG.templateId,
        publicKeyLength: EMAILJS_CONFIG.publicKey?.length || 0
      });

      // Verificar configurações
      if (!EMAILJS_CONFIG.serviceId || !EMAILJS_CONFIG.templateId || !EMAILJS_CONFIG.publicKey) {
        const missing = [];
        if (!EMAILJS_CONFIG.serviceId) missing.push('VITE_EMAILJS_SERVICE_ID');
        if (!EMAILJS_CONFIG.templateId) missing.push('VITE_EMAILJS_TEMPLATE_ID');
        if (!EMAILJS_CONFIG.publicKey) missing.push('VITE_EMAILJS_PUBLIC_KEY');
        
        const errorMsg = `EmailJS não configurado. Variáveis faltando: ${missing.join(', ')}`;
        console.error('❌', errorMsg);
        throw new Error(errorMsg);
      }

      console.log('📧 Enviando e-mail com parâmetros:', {
        serviceId: EMAILJS_CONFIG.serviceId,
        templateId: EMAILJS_CONFIG.templateId,
        templateParams: templateParams,
        recipientEmail: RECIPIENT_EMAIL
      });

      // Enviar e-mail via EmailJS
      const response = await emailjs.send(
        EMAILJS_CONFIG.serviceId,
        EMAILJS_CONFIG.templateId,
        templateParams
      );

      console.log('✅ E-mail enviado com sucesso:', response);
      
      // Enviar evento de conversão para Google Analytics
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'form_submission', {
          event_category: 'Contact Form',
          event_label: 'Lead Form Submission',
          value: 1,
          send_to: 'G-VFKC64NZHH'
        });
        
        // Evento de conversão (pode ser usado para Goals no GA4)
        (window as any).gtag('event', 'conversion', {
          send_to: 'G-VFKC64NZHH',
          event_category: 'Lead',
          event_label: 'Contact Form',
          value: 1
        });
        
        console.log('📊 Evento de conversão enviado para Google Analytics');
      }
      
      setSubmitStatus('success');
      setFormData({ name: '', email: '', phone: '', message: '' });
      
      setTimeout(() => {
        setSubmitStatus('idle');
      }, 5000);
    } catch (error: any) {
      // Log detalhado do erro
      console.error('❌ Erro ao enviar e-mail:', {
        error,
        message: error?.message || 'Erro desconhecido',
        text: error?.text || 'Sem detalhes adicionais',
        status: error?.status || 'N/A',
        statusText: error?.statusText || 'N/A',
        stack: error?.stack || 'Sem stack trace',
        config: {
          serviceId: EMAILJS_CONFIG.serviceId,
          templateId: EMAILJS_CONFIG.templateId,
          hasPublicKey: !!EMAILJS_CONFIG.publicKey
        },
        // Informações adicionais do EmailJS
        response: error?.response || 'N/A'
      });

      // Mensagem de erro mais descritiva baseada no status
      let userErrorMessage = 'Erro ao enviar. Por favor, tente novamente ou entre em contato pelo WhatsApp.';
      
      // Tratamento específico para erro 422 (Unprocessable Entity)
      if (error?.status === 422) {
        userErrorMessage = 'Erro 422: Parâmetros inválidos. Verifique se o template do EmailJS está configurado corretamente com as variáveis: from_name, from_email, phone, message, reply_to, email';
        console.error('🔴 ERRO 422 - Possíveis causas:');
        console.error('  1. Template do EmailJS não tem as variáveis corretas');
        console.error('  2. Nomes das variáveis no template não correspondem aos parâmetros enviados');
        console.error('  3. Template não está ativo ou não existe');
        console.error('  Parâmetros enviados:', templateParams);
      } else if (error?.text) {
        userErrorMessage = error.text;
      } else if (error?.message) {
        userErrorMessage = error.message;
      }

      // Mostrar erro no console para debug
      console.error('💬 Mensagem de erro para o usuário:', userErrorMessage);
      
      setErrorMessage(userErrorMessage);
      setSubmitStatus('error');
      
      setTimeout(() => {
        setSubmitStatus('idle');
      }, 5000);
    } finally {
      setIsLoading(false);
    }
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
          
          <div className="space-y-3">
            <div className="flex items-start gap-2 text-xs text-gray-500">
              <input
                id="lgpd-consent"
                type="checkbox"
                required
                className="mt-1 h-4 w-4 rounded border-white/20 bg-brand-gray text-brand-red focus:ring-brand-red"
              />
              <label htmlFor="lgpd-consent">
                Autorizo o uso dos meus dados para contato comercial e envio de comunicações da PHD Studio.
                Li e concordo com a{' '}
                <Link to="/politica-de-privacidade" className="underline underline-offset-2 hover:text-brand-red">
                  Política de Privacidade
                </Link>.
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-brand-red text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-red-700 transition-colors shadow-lg shadow-brand-red/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Enviando...
                </>
              ) : (
                'Enviar solicitação'
              )}
            </button>
          </div>

          {/* Mensagens de feedback - Sucesso */}
          {submitStatus === 'success' && (
            <div className="mt-6 p-6 bg-gradient-to-r from-green-500/30 to-emerald-500/30 border-2 border-green-500 rounded-xl text-green-300 text-center shadow-lg shadow-green-500/20 animate-pulse">
              <div className="flex flex-col items-center justify-center gap-3">
                <div className="flex items-center gap-3">
                  <div className="bg-green-500/20 p-3 rounded-full animate-bounce">
                    <Check size={28} className="text-green-400" strokeWidth={3} />
                  </div>
                  <span className="text-xl font-bold text-green-200">✓ E-mail enviado com sucesso!</span>
                </div>
                <p className="text-base text-green-400/90 mt-2 font-medium">
                  Recebemos sua mensagem e entraremos em contato em breve.
                </p>
                <div className="mt-3 flex items-center gap-2 text-sm text-green-400/80 bg-green-500/10 px-4 py-2 rounded-lg">
                  <Phone size={16} />
                  <span>Ou entre em contato pelo WhatsApp se preferir</span>
                </div>
              </div>
            </div>
          )}

          {/* Mensagens de feedback - Erro */}
          {submitStatus === 'error' && (
            <div className="mt-6 p-6 bg-gradient-to-r from-red-500/30 to-rose-500/30 border-2 border-red-500 rounded-xl text-red-300 text-center shadow-lg shadow-red-500/20">
              <div className="flex flex-col items-center justify-center gap-3">
                <div className="flex items-center gap-3">
                  <div className="bg-red-500/20 p-3 rounded-full">
                    <X size={28} className="text-red-400" strokeWidth={3} />
                  </div>
                  <span className="text-xl font-bold text-red-200">✗ Erro ao enviar e-mail</span>
                </div>
                {errorMessage && (
                  <div className="mt-3 p-4 bg-red-500/20 border border-red-500/50 rounded-lg w-full">
                    <p className="text-sm text-red-200 font-semibold">{errorMessage}</p>
                  </div>
                )}
                <div className="mt-4 flex flex-col gap-3 text-sm w-full">
                  <p className="text-red-300/90 font-medium">
                    Por favor, tente novamente em alguns instantes.
                  </p>
                  <div className="flex items-center justify-center gap-2 text-red-400/90 bg-red-500/10 px-4 py-2 rounded-lg">
                    <Phone size={18} />
                    <span className="font-medium">Ou entre em contato diretamente pelo WhatsApp</span>
                  </div>
                </div>
                <p className="text-xs text-red-400/60 mt-3 italic">
                  (Verifique o console do navegador para mais detalhes técnicos)
                </p>
              </div>
            </div>
          )}
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
            width="200"
            height="48"
            loading="lazy"
            decoding="async"
          />
          <p className="text-gray-400 max-w-sm">
            Agência híbrida de Marketing + IA + Tecnologia. Transformamos estratégias em vendas recorrentes e lançamentos de sucesso.
          </p>
        </div>

        <div className="bg-brand-gray p-8 rounded-2xl border border-white/10 text-center md:text-right w-full md:w-auto">
          <h4 className="text-xl font-bold mb-2">Pronto para escalar?</h4>
          <p className="text-gray-400 mb-6 text-sm">Receba um diagnóstico gratuito em 48h.</p>
          <a
            href="#contato"
            className="bg-brand-red text-white w-full px-8 py-4 rounded-lg font-bold hover:bg-red-700 transition-colors shadow-lg shadow-brand-red/20 text-center block"
          >
            QUERO MEU DIAGNÓSTICO
          </a>
        </div>
      </div>

      <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-600 gap-4">
        <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
          <p>&copy; 2024 PHD Studio. Todos os direitos reservados.</p>
          <Link
            to="/politica-de-privacidade"
            className="text-xs md:text-sm text-gray-500 hover:text-white underline underline-offset-4"
          >
            Política de Privacidade
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <span className="uppercase tracking-wider text-xs text-gray-500 hidden md:inline">Siga a PHD</span>
          <div className="flex gap-4">
            <a
              href="https://www.instagram.com/phdstudiooficial"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram PHD Studio"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M7 2C4.24 2 2 4.24 2 7v10c0 2.76 2.24 5 5 5h10c2.76 0 5-2.24 5-5V7c0-2.76-2.24-5-5-5H7zm0 2h10c1.66 0 3 1.34 3 3v10c0 1.66-1.34 3-3 3H7c-1.66 0-3-1.34-3-3V7c0-1.66 1.34-3 3-3zm9 1a1 1 0 100 2 1 1 0 000-2zM12 7a5 5 0 100 10 5 5 0 000-10zm0 2a3 3 0 110 6 3 3 0 010-6z" />
              </svg>
            </a>
            <a
              href="https://www.facebook.com/PHDStudioOficial"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook PHD Studio"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M13 3h4a1 1 0 110 2h-3v3h2.5a1 1 0 01.97 1.243l-.5 2A1 1 0 0115 12h-1v8a1 1 0 01-1 1h-2a1 1 0 01-1-1v-8H8a1 1 0 01-1-1V9a1 1 0 011-1h2V5a2 2 0 012-2z" />
              </svg>
            </a>
            <a
              href="https://www.tiktok.com/@phdstudiooficial"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok PHD Studio"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M16 3a1 1 0 01.89.55 4.4 4.4 0 003.11 2.3A1 1 0 0120 7v3a1 1 0 01-1.18.98A6.4 6.4 0 0116 10.5V15a5 5 0 11-5-5 1 1 0 010 2 3 3 0 103 3V4a1 1 0 011-1z" />
              </svg>
            </a>
            <a
              href="https://www.youtube.com/@phdstudiobr"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube PHD Studio"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M10 9.5l4.5 2.5L10 14.5v-5z" />
                <path d="M5 4h14a3 3 0 013 3v10a3 3 0 01-3 3H5a3 3 0 01-3-3V7a3 3 0 013-3zm0 2a1 1 0 00-1 1v10a1 1 0 001 1h14a1 1 0 001-1V7a1 1 0 00-1-1H5z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  </footer>
);

// --- Privacy Policy Page ---
const PrivacyPolicyPage = () => {
  return (
    <section className="pt-24 pb-20 bg-brand-dark">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-black font-heading mb-6">
          Política de Privacidade – PHD Studio
        </h1>
        <p className="text-gray-400 mb-8 text-sm md:text-base">
          Esta Política de Privacidade explica como a PHD Studio coleta, usa e protege os dados pessoais
          de visitantes e clientes em seus sites, landing pages, campanhas de marketing e canais digitais.
        </p>

        <div className="space-y-8 text-gray-300 text-sm md:text-base leading-relaxed">
          <div>
            <h2 className="text-xl font-bold mb-2">1. Dados que coletamos</h2>
            <p>
              Coletamos informações fornecidas diretamente por você, como nome, e-mail, telefone,
              empresa e outras informações que você insere em formulários, chats, páginas de captura
              ou ao solicitar contato com nossa equipe.
            </p>
            <p className="mt-2">
              Também podemos coletar dados de navegação de forma automática, como IP, tipo de
              dispositivo, navegador, páginas acessadas e interações com nossos conteúdos – sempre
              de forma agregada e com foco em analytics e melhoria de performance.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-2">2. Como usamos seus dados</h2>
            <p>Utilizamos seus dados para:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Responder solicitações de contato, propostas e diagnósticos;</li>
              <li>Enviar conteúdos, materiais educativos e comunicações de marketing;</li>
              <li>Melhorar a experiência em nossos sites e campanhas;</li>
              <li>Mensurar resultados de campanhas e funis de vendas;</li>
              <li>Cumprir obrigações legais e regulatórias, quando aplicável.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-2">3. Cookies e tecnologias similares</h2>
            <p>
              Utilizamos cookies, pixels e tecnologias semelhantes (como Google Analytics, Meta Pixel
              e outras ferramentas de mensuração) para entender o comportamento de navegação e
              melhorar campanhas e conteúdos. Você pode gerenciar cookies diretamente nas
              configurações do seu navegador.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-2">4. Compartilhamento de informações</h2>
            <p>
              Não vendemos seus dados pessoais. Podemos compartilhá-los com parceiros de
              tecnologia e prestadores de serviço (por exemplo: ferramentas de e-mail marketing,
              CRM, automação, anúncios) apenas quando necessário para a entrega dos serviços
              contratados ou para execução de nossas estratégias de marketing.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-2">5. Direitos do titular de dados</h2>
            <p>
              Você pode solicitar, a qualquer momento, a atualização, correção ou exclusão de seus
              dados, bem como a revogação de consentimentos de comunicação. Para isso, basta
              entrar em contato pelos canais oficiais da PHD Studio.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-2">6. Segurança das informações</h2>
            <p>
              Adotamos boas práticas de segurança para proteger seus dados contra acessos não
              autorizados, alterações indevidas ou destruição. Ainda assim, nenhum ambiente digital é
              100% isento de riscos, e recomendamos que você também proteja seus dispositivos e
              credenciais de acesso.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-2">7. Atualizações desta política</h2>
            <p>
              Esta Política de Privacidade pode ser atualizada periodicamente para refletir ajustes
              legais, técnicos ou operacionais. A versão mais recente estará sempre disponível neste
              endereço.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-2">8. Contato</h2>
            <p>
              Em caso de dúvidas sobre esta política ou sobre o uso dos seus dados pessoais, você
              pode entrar em contato com a PHD Studio pelos canais oficiais disponíveis em nosso
              site e redes sociais.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

// --- Login Page ---
const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (login(username, password)) {
      // Se usuário for vexin, redirecionar para funil_vexin
      if (username === 'vexin') {
        navigate('/funil_vexin', { replace: true });
      } else {
        navigate(from || '/', { replace: true });
      }
    } else {
      setError('Usuário ou senha incorretos');
    }
  };

  return (
    <div className="font-sans bg-brand-dark min-h-screen text-white selection:bg-brand-red selection:text-white">
      <Navbar />
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        {/* Background with overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src={ASSETS.heroBg} 
            alt="Background" 
            className="w-full h-full object-cover opacity-20"
            loading="eager"
            fetchpriority="high"
            width="1200"
            height="800"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-dark via-brand-dark/80 to-brand-dark"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10 flex justify-center items-center">
          <div className="w-full max-w-md">
            <div className="bg-brand-gray border border-white/10 rounded-2xl p-8 md:p-10 shadow-2xl">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-red/10 rounded-full mb-4 border border-brand-red/20">
                  <LogIn className="text-brand-red" size={32} />
                </div>
                <h1 className="text-3xl md:text-4xl font-black font-heading mb-2">
                  Área do Cliente
                </h1>
                <p className="text-gray-400">Faça login para acessar</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                    Usuário
                  </label>
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full bg-brand-dark border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-red transition-colors"
                    placeholder="Digite seu usuário"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                    Senha
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-brand-dark border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-red transition-colors"
                    placeholder="Digite sua senha"
                  />
                </div>

                {error && (
                  <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-300 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-brand-red text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-red-700 transition-colors shadow-lg shadow-brand-red/20 flex items-center justify-center gap-2"
                >
                  <LogIn size={20} />
                  Entrar
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};


// Hook para carregar dados de projeções
const useProjecoesData = (planoSelecionado: 'start' | 'premium' = 'premium') => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/data/projecoes_faturamento_vendas.json');
        const jsonData = await response.json();
        setData(jsonData);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Determinar qual cenário usar baseado no plano selecionado
  const nomeCenario = planoSelecionado === 'start' ? 'Conservador' : 'Base';
  const cenarioAtivo = data?.cenarios?.find((c: any) => c.nome === nomeCenario) || data?.cenarios?.find((c: any) => c.nome === 'Base');
  const dadosAdicionais = data?.dadosAdicionais;
  
  const calcularAgregados = () => {
    if (!cenarioAtivo) return null;
    
    // Usar agregados do JSON se disponíveis, senão calcular
    if (cenarioAtivo.agregados) {
      return {
        totalLeads: cenarioAtivo.agregados.totalLeads,
        totalVendas: cenarioAtivo.agregados.totalVendas,
        totalTrafego: cenarioAtivo.agregados.totalTrafego,
        cpaMedio: cenarioAtivo.agregados.cpaMedio
      };
    }
    
    // Fallback: calcular se não estiver no JSON
    const totalLeads = cenarioAtivo.dadosMensais.reduce((sum: number, m: any) => sum + m.leads, 0);
    const totalVendas = cenarioAtivo.dadosMensais.reduce((sum: number, m: any) => sum + m.vendas, 0);
    const totalTrafego = cenarioAtivo.dadosMensais.reduce((sum: number, m: any) => sum + m.trafego, 0);
    const totalInvestimento = cenarioAtivo.dadosMensais.reduce((sum: number, m: any) => sum + m.investimentoMidia, 0);
    const cpaMedio = totalInvestimento / totalVendas || 0;
    
    return { totalLeads, totalVendas, totalTrafego, cpaMedio };
  };

  return { 
    data: cenarioAtivo, 
    agregados: calcularAgregados(), 
    dadosAdicionais,
    loading,
    todosOsCenarios: data?.cenarios || []
  };
};

// --- Funil Vexin Page ---
const FunilVexinPage = () => {
  const [planoSelecionado, setPlanoSelecionado] = useState<'start' | 'premium'>('premium');
  const { data, agregados, dadosAdicionais, loading } = useProjecoesData(planoSelecionado);

  if (loading || !agregados || !data || !dadosAdicionais) {
    return (
      <div className="font-sans bg-brand-dark min-h-screen text-white">
        <Navbar />
        <div className="pt-24 md:pt-28 p-8">
          <div className="animate-pulse">Carregando...</div>
        </div>
      </div>
    );
  }

  // KPIs - dados do JSON
  const tendencias = dadosAdicionais.funil.tendencias;
  const periodos = dadosAdicionais.periodos;
  const mensagensEnviadas = dadosAdicionais.funil.mensagensEnviadas;
  const planos = dadosAdicionais.planos;
  const estruturaCanais = dadosAdicionais.estruturaCanais;
  
  // Usar plano selecionado pelo usuário
  const planoAtual = planos[planoSelecionado];
  
  const kpis = [
    {
      label: 'Leads',
      value: agregados.totalLeads.toLocaleString('pt-BR'),
      periodo: periodos.leads,
      trend: tendencias.leads.valor,
      positive: tendencias.leads.positiva
    },
    {
      label: 'Conversões',
      value: agregados.totalVendas.toLocaleString('pt-BR'),
      periodo: periodos.conversoes,
      trend: tendencias.conversoes.valor,
      positive: tendencias.conversoes.positiva
    },
    {
      label: 'CPA',
      value: `R$ ${agregados.cpaMedio.toFixed(2)}`,
      periodo: periodos.cpa,
      trend: tendencias.cpa.valor,
      positive: tendencias.cpa.positiva
    },
    {
      label: 'Mensagens enviadas',
      value: mensagensEnviadas.valor.toLocaleString('pt-BR'),
      periodo: mensagensEnviadas.periodo,
      trend: tendencias.mensagensEnviadas.valor,
      positive: tendencias.mensagensEnviadas.positiva
    }
  ];

  // Funil de conversão - usar valores do JSON se disponíveis
  const valoresFunil = dadosAdicionais.funil.valoresFunil?.[planoSelecionado];
  const trafegoTotal = valoresFunil?.trafegoTotal || agregados.totalTrafego;
  const leads = valoresFunil?.leads || agregados.totalLeads;
  const conversoes = valoresFunil?.conversoes || Math.floor(agregados.totalLeads * dadosAdicionais.funil.taxaConversaoLeads);
  const vendas = valoresFunil?.vendas || agregados.totalVendas;
  
  const funilData = [
    { name: 'Tráfego Total', value: trafegoTotal },
    { name: 'Leads', value: leads },
    { name: 'Conversões', value: conversoes },
    { name: 'Vendas', value: vendas }
  ];

  // Origem dos leads - dados do JSON
  const origemLeads = dadosAdicionais.funil.origemLeads.map((item: any) => ({
    name: item.nome,
    value: item.percentual,
    color: item.cor
  }));

  return (
    <div className="font-sans bg-brand-dark min-h-screen text-white selection:bg-brand-red selection:text-white">
      <Navbar />
      <div className="pt-24 md:pt-28 p-6 md:p-8 mt-4">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Comparação de Planos - TOPO */}
          <div className="bg-[#121212] border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Comparação de Planos</h3>
            <p className="text-xs text-gray-400 mb-4">Clique em um plano para visualizar seus dados</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(planos).map(([key, plano]: [string, any]) => {
                const isAtivo = key === planoSelecionado;
                return (
                  <div
                    key={plano.nome}
                    onClick={() => setPlanoSelecionado(key as 'start' | 'premium')}
                    className={`p-4 rounded-lg border cursor-pointer transition-all hover:scale-[1.02] ${
                      isAtivo
                        ? 'border-red-500/50 bg-red-500/10 shadow-lg shadow-red-500/20'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{plano.nome}</span>
                        {isAtivo && (
                          <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded">ATIVO</span>
                        )}
                      </div>
                      <span className="text-sm text-gray-400">R$ {plano.totalMensal.toLocaleString('pt-BR')}/mês</span>
                    </div>
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>Setup: R$ {plano.setupInicial.toLocaleString('pt-BR')}</div>
                      <div>Mídia: R$ {plano.midiaMensal.toLocaleString('pt-BR')}/mês</div>
                      <div>Mínimo: {plano.tempoMinimo} meses</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Informações do Plano */}
          <div className="bg-gradient-to-r from-red-500/10 to-red-600/10 border border-red-500/30 rounded-xl p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Plano {planoAtual.nome} - {planoAtual.descricao}</h2>
                <p className="text-gray-300 text-sm mb-1">{planoAtual.objetivo}</p>
                <p className="text-xs text-gray-400">Use os cards abaixo para alternar entre os planos</p>
              </div>
              <div className="bg-[#121212] rounded-lg p-4 border border-white/10">
                <div className="text-xs text-gray-400 mb-1">Investimento Mensal</div>
                <div className="text-2xl font-bold text-red-400">R$ {planoAtual.totalMensal.toLocaleString('pt-BR')}</div>
                <div className="text-xs text-gray-500 mt-1">
                  Gestão: R$ {planoAtual.gestaoMensal.toLocaleString('pt-BR')} + Mídia: R$ {planoAtual.midiaMensal.toLocaleString('pt-BR')}
                </div>
              </div>
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map((kpi, idx) => (
              <div
                key={idx}
                className="bg-[#121212] border border-white/10 rounded-xl p-6 hover:border-red-500/50 transition-all"
              >
                <div className="text-sm text-gray-400 mb-2">{kpi.label}</div>
                <div className="text-3xl font-bold text-white mb-1">{kpi.value}</div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{kpi.periodo}</span>
                  <span className={`text-sm font-semibold flex items-center gap-1 ${
                    kpi.positive ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {kpi.positive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    {Math.abs(kpi.trend)}%
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Funil de Conversão */}
            <div className="bg-[#121212] border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-bold mb-6 text-white">FUNIL DE CONVERSÃO</h3>
              <ResponsiveContainer width="100%" height={300}>
                <FunnelChart>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid rgba(229, 9, 20, 0.3)',
                      borderRadius: '0.5rem',
                      color: '#fff'
                    }}
                    formatter={(value: number) => value.toLocaleString('pt-BR')}
                  />
                  <Funnel
                    dataKey="value"
                    data={funilData}
                    isAnimationActive
                    stroke="#E50914"
                    fill="#E50914"
                  >
                    <LabelList
                      position="right"
                      fill="#fff"
                      stroke="none"
                      dataKey="value"
                      formatter={(value: number) => value.toLocaleString('pt-BR')}
                    />
                  </Funnel>
                </FunnelChart>
              </ResponsiveContainer>
            </div>

            {/* Leads por Canal */}
            <div className="bg-[#121212] border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-bold mb-6 text-white">LEADS POR CANAL</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={origemLeads}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {origemLeads.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid rgba(229, 9, 20, 0.3)',
                      borderRadius: '0.5rem',
                      color: '#fff'
                    }}
                  />
                  <Legend
                    wrapperStyle={{ color: '#cbd5e1', fontSize: '12px' }}
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Resumo da Estratégia de Canais */}
          <div className="bg-[#121212] border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Detalhamento da Estratégia de Canais</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-semibold">Meta Ads (Instagram/Facebook)</span>
                  <span className="text-red-400 font-bold text-lg">{estruturaCanais.metaAds.percentual}%</span>
                </div>
                <div className="text-xs text-gray-400 mb-2">
                  Investimento: R$ {(estruturaCanais.metaAds.investimentoPorPlano?.[planoSelecionado] || Math.round(planoAtual.midiaMensal * estruturaCanais.metaAds.percentual / 100)).toLocaleString('pt-BR')}/mês
                </div>
                <p className="text-xs text-gray-500">{estruturaCanais.metaAds.objetivo}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-semibold">Google Ads (Rede de Pesquisa)</span>
                  <span className="text-red-400 font-bold text-lg">{estruturaCanais.googleAds.percentual}%</span>
                </div>
                <div className="text-xs text-gray-400 mb-2">
                  Investimento: R$ {(estruturaCanais.googleAds.investimentoPorPlano?.[planoSelecionado] || Math.round(planoAtual.midiaMensal * estruturaCanais.googleAds.percentual / 100)).toLocaleString('pt-BR')}/mês
                </div>
                <p className="text-xs text-gray-500">{estruturaCanais.googleAds.objetivo}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-semibold">Remarketing</span>
                  <span className="text-red-400 font-bold text-lg">{estruturaCanais.remarketing.percentual}%</span>
                </div>
                <div className="text-xs text-gray-400 mb-2">
                  Investimento: R$ {(estruturaCanais.remarketing.investimentoPorPlano?.[planoSelecionado] || Math.round(planoAtual.midiaMensal * estruturaCanais.remarketing.percentual / 100)).toLocaleString('pt-BR')}/mês
                </div>
                <p className="text-xs text-gray-500">{estruturaCanais.remarketing.objetivo}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Projecao Vexin Page ---
const ProjecaoVexinPage = () => {
  const [planoSelecionado, setPlanoSelecionado] = useState<'start' | 'premium'>('premium');
  const { data, agregados, dadosAdicionais, loading } = useProjecoesData(planoSelecionado);

  if (loading || !agregados || !data || !dadosAdicionais) {
    return (
      <div className="font-sans bg-brand-dark min-h-screen text-white">
        <Navbar />
        <div className="pt-24 md:pt-28 p-8">
          <div className="animate-pulse">Carregando...</div>
        </div>
      </div>
    );
  }

  // Preparar dados para o gráfico
  // ROAS será multiplicado por 100 para aparecer no eixo direito (escala 0-100 similar a porcentagem)
  const chartData = data.dadosMensais.map((mes: any) => ({
    mes: mes.mes.replace('Mês ', ''),
    CPA: mes.cac,
    ROAS: mes.roas * 100, // Multiplica por 100 para usar eixo direito (0-100)
    Conversao: mes.taxaConversao
  }));

  // KPIs - dados do JSON
  const projecao = dadosAdicionais.projecao;
  const ctr = projecao.ctr;
  // Usar valor do JSON se disponível, senão calcular
  const conversaoMedia = projecao.conversao.valoresPorPlano?.[planoSelecionado] 
    ? projecao.conversao.valoresPorPlano[planoSelecionado].toFixed(3)
    : (agregados.totalVendas / agregados.totalLeads * 100).toFixed(3);
  const planos = dadosAdicionais.planos;
  const estruturaCanais = dadosAdicionais.estruturaCanais;
  const fases = dadosAdicionais.fases;
  
  // Usar plano selecionado pelo usuário
  const planoAtual = planos[planoSelecionado];
  
  const kpis = [
    {
      title: 'CPA',
      value: `R$ ${agregados.cpaMedio.toFixed(2)}`,
      description: projecao.cpa.descricao,
      color: '#E50914'
    },
    {
      title: 'CTR',
      value: `${ctr.valor}${ctr.unidade}`,
      description: ctr.descricao,
      color: '#FF4444'
    },
    {
      title: 'CONVERSÃO',
      value: `${conversaoMedia}%`,
      description: projecao.conversao.descricao,
      color: '#FF6B6B'
    }
  ];

  return (
    <div className="font-sans bg-brand-dark min-h-screen text-white selection:bg-brand-red selection:text-white">
      <Navbar />
      <div className="pt-24 md:pt-28 p-6 md:p-8 mt-4">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Comparação de Planos - TOPO */}
          <div className="bg-gradient-to-br from-[#1a1a1a] to-[#121212] border border-white/10 rounded-2xl p-6 shadow-2xl">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">Comparação de Planos</h3>
              <p className="text-sm text-gray-400">Clique em um plano para visualizar seus dados</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(planos).map(([key, plano]: [string, any]) => {
                const isAtivo = key === planoSelecionado;
                return (
                  <div
                    key={plano.nome}
                    onClick={() => setPlanoSelecionado(key as 'start' | 'premium')}
                    className={`relative p-5 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:scale-[1.02] overflow-hidden ${
                      isAtivo
                        ? 'border-red-500 bg-gradient-to-br from-red-500/20 to-red-900/10 shadow-2xl shadow-red-500/30'
                        : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10'
                    }`}
                  >
                    {isAtivo && (
                      <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                    )}
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${isAtivo ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`}></div>
                          <span className="text-xl font-bold text-white">{plano.nome}</span>
                          {isAtivo && (
                            <span className="text-xs bg-red-500 text-white px-3 py-1 rounded-full font-semibold shadow-lg">ATIVO</span>
                          )}
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${isAtivo ? 'text-red-400' : 'text-gray-300'}`}>
                            R$ {plano.totalMensal.toLocaleString('pt-BR')}
                          </div>
                          <div className="text-xs text-gray-400">/mês</div>
                        </div>
                      </div>
                      <div className="space-y-2.5 pt-3 border-t border-white/10">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-400">Setup</span>
                          <span className={`text-sm font-semibold ${isAtivo ? 'text-white' : 'text-gray-300'}`}>
                            R$ {plano.setupInicial.toLocaleString('pt-BR')}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-400">Mídia</span>
                          <span className={`text-sm font-semibold ${isAtivo ? 'text-white' : 'text-gray-300'}`}>
                            R$ {plano.midiaMensal.toLocaleString('pt-BR')}/mês
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-400">Mínimo</span>
                          <span className={`text-sm font-semibold ${isAtivo ? 'text-white' : 'text-gray-300'}`}>
                            {plano.tempoMinimo} meses
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card de Plano Atual */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Plano Atual */}
            <div className="bg-gradient-to-br from-red-500/10 via-[#1a1a1a] to-[#121212] border-2 border-red-500/30 rounded-2xl p-6 shadow-2xl shadow-red-500/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-bold text-white">Plano {planoAtual.nome}</h3>
                      <span className="bg-red-500 text-white text-xs px-3 py-1 rounded-full font-semibold shadow-lg">ATIVO</span>
                    </div>
                    <p className="text-base text-gray-300 font-medium">{planoAtual.descricao}</p>
                  </div>
                </div>
                <div className="space-y-4 mt-6">
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/10">
                    <span className="text-gray-300 text-sm font-medium">Setup Inicial</span>
                    <span className="text-white font-bold text-lg">R$ {planoAtual.setupInicial.toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/10">
                    <span className="text-gray-300 text-sm font-medium">Gestão Mensal</span>
                    <span className="text-white font-bold text-lg">R$ {planoAtual.gestaoMensal.toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/10">
                    <span className="text-gray-300 text-sm font-medium">Mídia Mensal</span>
                    <span className="text-white font-bold text-lg">R$ {planoAtual.midiaMensal.toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="border-t-2 border-red-500/30 pt-4 mt-4 bg-gradient-to-r from-red-500/10 to-transparent p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-200 font-semibold text-base">Total Mensal</span>
                      <span className="text-red-400 text-3xl font-bold">R$ {planoAtual.totalMensal.toLocaleString('pt-BR')}</span>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
                    <p className="text-xs text-gray-400 leading-relaxed">{planoAtual.objetivo}</p>
                  </div>
                </div>

                {/* Detalhamento Expandível */}
                {planoAtual.setupDetalhado && (
                  <details className="mt-6 group">
                    <summary className="cursor-pointer flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 text-sm font-semibold text-gray-300 hover:text-white transition-all">
                      <span className="flex items-center gap-2">
                        <Target size={16} className="text-red-400" />
                        Ver Detalhamento do Setup
                      </span>
                      <ChevronDown className="transform group-open:rotate-180 transition-transform text-red-400" size={18} />
                    </summary>
                    <div className="mt-4 space-y-3 pt-4 border-t border-white/10">
                      {planoAtual.setupDetalhado.itens.map((item: any, idx: number) => (
                        <div key={idx} className="bg-gradient-to-r from-white/5 to-white/0 rounded-lg p-4 border border-white/10 hover:border-red-500/30 transition-colors">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <Check size={16} className="text-green-400 flex-shrink-0" />
                              <span className="text-white text-sm font-medium">{item.nome}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {item.valor > 0 && (
                                <span className="text-gray-300 text-xs font-semibold">R$ {item.valor.toLocaleString('pt-BR')}</span>
                              )}
                              {item.incluso && (
                                <span className="text-green-400 text-xs bg-green-400/20 px-2 py-1 rounded-full font-semibold">Incluído</span>
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-gray-400 ml-6 leading-relaxed">{item.descricao}</p>
                        </div>
                      ))}
                      <div className="border-t-2 border-red-500/30 pt-3 mt-3 bg-gradient-to-r from-red-500/10 to-transparent p-3 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-200 font-semibold">Total Setup</span>
                          <span className="text-red-400 font-bold text-lg">R$ {planoAtual.setupDetalhado.total.toLocaleString('pt-BR')}</span>
                        </div>
                      </div>
                    </div>
                  </details>
                )}

                {/* Detalhamento Fee Mensal */}
                {planoAtual.feeMensalDetalhado && (
                  <details className="mt-4 group">
                    <summary className="cursor-pointer flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 text-sm font-semibold text-gray-300 hover:text-white transition-all">
                      <span className="flex items-center gap-2">
                        <BarChart3 size={16} className="text-red-400" />
                        Ver Detalhamento da Gestão Mensal
                      </span>
                      <ChevronDown className="transform group-open:rotate-180 transition-transform text-red-400" size={18} />
                    </summary>
                    <div className="mt-4 space-y-3 pt-4 border-t border-white/10">
                      {planoAtual.feeMensalDetalhado.itens.map((item: any, idx: number) => (
                        <div key={idx} className="bg-gradient-to-r from-white/5 to-white/0 rounded-lg p-4 border border-white/10 hover:border-red-500/30 transition-colors">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <Check size={16} className="text-green-400 flex-shrink-0" />
                              <span className="text-white text-sm font-medium">{item.nome}</span>
                            </div>
                            {item.incluso && (
                              <span className="text-green-400 text-xs bg-green-400/20 px-2 py-1 rounded-full font-semibold">Incluído</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 ml-6 leading-relaxed">{item.descricao}</p>
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            </div>

          </div>

          {/* Estratégia de Canais */}
          <div className="bg-[#121212] border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-6">Estratégia de Distribuição de Mídia</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-semibold">Meta Ads</span>
                  <span className="text-red-400 font-bold">{estruturaCanais.metaAds.percentual}%</span>
                </div>
                <div className="text-xs text-gray-400 mb-2">
                  Investimento: R$ {(estruturaCanais.metaAds.investimentoPorPlano?.[planoSelecionado] || Math.round(planoAtual.midiaMensal * estruturaCanais.metaAds.percentual / 100)).toLocaleString('pt-BR')}/mês
                </div>
                <p className="text-xs text-gray-500">{estruturaCanais.metaAds.objetivo}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-semibold">Google Ads</span>
                  <span className="text-red-400 font-bold">{estruturaCanais.googleAds.percentual}%</span>
                </div>
                <div className="text-xs text-gray-400 mb-2">
                  Investimento: R$ {(estruturaCanais.googleAds.investimentoPorPlano?.[planoSelecionado] || Math.round(planoAtual.midiaMensal * estruturaCanais.googleAds.percentual / 100)).toLocaleString('pt-BR')}/mês
                </div>
                <p className="text-xs text-gray-500">{estruturaCanais.googleAds.objetivo}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-semibold">Remarketing</span>
                  <span className="text-red-400 font-bold">{estruturaCanais.remarketing.percentual}%</span>
                </div>
                <div className="text-xs text-gray-400 mb-2">
                  Investimento: R$ {(estruturaCanais.remarketing.investimentoPorPlano?.[planoSelecionado] || Math.round(planoAtual.midiaMensal * estruturaCanais.remarketing.percentual / 100)).toLocaleString('pt-BR')}/mês
                </div>
                <p className="text-xs text-gray-500">{estruturaCanais.remarketing.objetivo}</p>
              </div>
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {kpis.map((kpi, idx) => (
              <div
                key={idx}
                className="bg-[#121212] border border-white/10 rounded-xl p-6 hover:border-red-500/50 transition-all"
              >
                <div className="text-sm text-gray-400 mb-2">{kpi.title}</div>
                <div className="text-3xl font-bold mb-2" style={{ color: kpi.color }}>
                  {kpi.value}
                </div>
                <div className="text-xs text-gray-500">{kpi.description}</div>
              </div>
            ))}
          </div>

          {/* Fases do Projeto - Conceitual */}
          <div className="bg-[#121212] border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-6">Fases do Projeto (Conceitual)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.values(fases).map((fase: any, idx: number) => (
                <div key={idx} className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-red-400"></div>
                    <span className="text-white font-semibold">{fase.nome}</span>
                  </div>
                  <p className="text-xs text-gray-400 mb-2">{fase.duracao}</p>
                  <p className="text-xs text-gray-500">{fase.foco}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Cronograma Detalhado do Plano Atual */}
          {planoAtual.atividades && (
            <div className="bg-[#121212] border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">Cronograma Detalhado - Plano {planoAtual.nome}</h3>
                <span className="text-xs text-gray-400 bg-white/5 px-3 py-1 rounded">
                  {planoAtual.atividades.length} fases
                </span>
              </div>
              <div className="space-y-4">
                {planoAtual.atividades.map((fase: any, idx: number) => (
                  <details key={idx} className="group bg-white/5 rounded-lg border border-white/10">
                    <summary className="cursor-pointer p-4 flex items-center justify-between hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 font-bold text-sm">
                          {idx + 1}
                        </div>
                        <div>
                          <h4 className="text-white font-semibold">{fase.fase}</h4>
                          <p className="text-xs text-gray-400">{fase.duracao}</p>
                        </div>
                      </div>
                      <ChevronDown className="transform group-open:rotate-180 transition-transform text-gray-400" size={20} />
                    </summary>
                    <div className="px-4 pb-4 pt-2 space-y-3">
                      <div>
                        <p className="text-xs text-gray-400 mb-2 font-semibold">ATIVIDADES:</p>
                        <ul className="space-y-1.5">
                          {fase.atividades.map((atividade: string, actIdx: number) => (
                            <li key={actIdx} className="text-sm text-gray-300 flex items-start gap-2">
                              <Check size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                              <span>{atividade}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="pt-2 border-t border-white/10">
                        <p className="text-xs text-gray-400 mb-2 font-semibold">RESPONSÁVEIS:</p>
                        <div className="flex flex-wrap gap-2">
                          {fase.responsaveis.map((resp: string, respIdx: number) => (
                            <span key={respIdx} className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded">
                              {resp}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          )}

          {/* Comparação Completa de Planos */}
          <div className="bg-[#121212] border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-6">Comparação Completa dos Planos</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-gray-400 font-semibold">Item</th>
                    <th className="text-center py-3 px-4 text-red-400 font-semibold">START</th>
                    <th className="text-center py-3 px-4 text-red-400 font-semibold">PREMIUM</th>
                  </tr>
                </thead>
                <tbody className="text-gray-300">
                  <tr className="border-b border-white/5">
                    <td className="py-3 px-4">Setup Inicial</td>
                    <td className="py-3 px-4 text-center">R$ {planos.start.setupInicial.toLocaleString('pt-BR')}</td>
                    <td className="py-3 px-4 text-center">R$ {planos.premium.setupInicial.toLocaleString('pt-BR')}</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-3 px-4">Fee Mensal (Gestão)</td>
                    <td className="py-3 px-4 text-center">R$ {planos.start.gestaoMensal.toLocaleString('pt-BR')}</td>
                    <td className="py-3 px-4 text-center">R$ {planos.premium.gestaoMensal.toLocaleString('pt-BR')}</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-3 px-4">Mídia Mensal Recomendada</td>
                    <td className="py-3 px-4 text-center">R$ {planos.start.midiaMensal.toLocaleString('pt-BR')}</td>
                    <td className="py-3 px-4 text-center">R$ {planos.premium.midiaMensal.toLocaleString('pt-BR')}</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-3 px-4 font-semibold">Total Mensal</td>
                    <td className="py-3 px-4 text-center font-bold text-red-400">R$ {planos.start.totalMensal.toLocaleString('pt-BR')}</td>
                    <td className="py-3 px-4 text-center font-bold text-red-400">R$ {planos.premium.totalMensal.toLocaleString('pt-BR')}</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-3 px-4">Tempo Mínimo Recomendado</td>
                    <td className="py-3 px-4 text-center">{planos.start.tempoMinimo} meses</td>
                    <td className="py-3 px-4 text-center">{planos.premium.tempoMinimo} meses</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">Objetivo</td>
                    <td className="py-3 px-4 text-center text-xs">{planos.start.objetivo}</td>
                    <td className="py-3 px-4 text-center text-xs">{planos.premium.objetivo}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Gráfico de Evolução */}
          <div className="bg-[#121212] border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-bold mb-6 text-white">EVOLUÇÃO DOS KPIS</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <defs>
                  <linearGradient id="cpaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#E50914" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#E50914" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="roasGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF4444" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#FF4444" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="conversaoGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF6B6B" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#FF6B6B" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis
                  dataKey="mes"
                  stroke="#9ca3af"
                  tickLine={false}
                  axisLine={false}
                  style={{ fontSize: '12px' }}
                />
                <YAxis
                  yAxisId="left"
                  stroke="#9ca3af"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `R$ ${value}`}
                  style={{ fontSize: '12px' }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#9ca3af"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}%`}
                  style={{ fontSize: '12px' }}
                />
                <YAxis
                  yAxisId="roas"
                  orientation="right"
                  stroke="#FF4444"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${(value / 100).toFixed(2)}x`}
                  style={{ fontSize: '12px' }}
                  domain={[50, 100]}
                  width={60}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid rgba(229, 9, 20, 0.3)',
                    borderRadius: '0.5rem',
                    color: '#fff'
                  }}
                  formatter={(value: number, name: string) => {
                    if (name === 'CPA') return [`R$ ${value.toFixed(2)}`, 'CPA'];
                    if (name === 'ROAS') return [`${(value / 100).toFixed(2)}x`, 'ROAS'];
                    return [`${value.toFixed(2)}%`, 'Conversão'];
                  }}
                />
                <Legend
                  wrapperStyle={{ color: '#cbd5e1', paddingTop: '20px' }}
                  iconType="line"
                />
                <Line
                  type="monotone"
                  dataKey="CPA"
                  stroke="#E50914"
                  strokeWidth={3}
                  dot={{ fill: '#E50914', r: 4 }}
                  activeDot={{ r: 6 }}
                  yAxisId="left"
                  name="CPA (R$)"
                />
                <Line
                  type="monotone"
                  dataKey="ROAS"
                  stroke="#FF4444"
                  strokeWidth={3}
                  dot={{ fill: '#FF4444', r: 4 }}
                  activeDot={{ r: 6 }}
                  strokeDasharray="5 5"
                  yAxisId="roas"
                  name="ROAS (x)"
                />
                <Line
                  type="monotone"
                  dataKey="Conversao"
                  stroke="#FF6B6B"
                  strokeWidth={3}
                  dot={{ fill: '#FF6B6B', r: 4 }}
                  activeDot={{ r: 6 }}
                  strokeDasharray="2 2"
                  yAxisId="right"
                  name="Conversão (%)"
                />
              </LineChart>
            </ResponsiveContainer>
            {/* Legendas das Siglas */}
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="text-center">
                  <div className="text-white font-semibold mb-1">CPA (R$)</div>
                  <div className="text-gray-400">Custo por Aquisição</div>
                </div>
                <div className="text-center">
                  <div className="text-white font-semibold mb-1">Conversão (%)</div>
                  <div className="text-gray-400">Taxa de Conversão</div>
                </div>
                <div className="text-center">
                  <div className="text-white font-semibold mb-1">ROAS (x)</div>
                  <div className="text-gray-400">Retorno sobre Investimento em Publicidade</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Home Page Layout ---
const HomePage = () => (
  <>
    <Hero />
    <ClientMarquee />
    <GrowthType />
    <Solutions />
    <Methodology />
    <Cases />
    <Testimonials /> 
    <FAQ />
    <ContactForm />
  </>
);

// --- Main App ---
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="font-sans bg-brand-dark min-h-screen text-white selection:bg-brand-red selection:text-white">
          <CookieBanner />
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <Navbar />
                  <main>
                    <HomePage />
                  </main>
                  <Footer />
                  {/* Floating WhatsApp Button */}
                  <a
                    href="https://wa.me/5511971490549"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="fixed bottom-8 right-8 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center justify-center"
                    aria-label="Falar no WhatsApp"
                  >
                    <Phone size={28} fill="currentColor" />
                  </a>
                </>
              }
            />
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/politica-de-privacidade"
              element={
                <>
                  <Navbar />
                  <main>
                    <PrivacyPolicyPage />
                  </main>
                  <Footer />
                </>
              }
            />
            <Route
              path="/funil_vexin"
              element={
                <ProtectedRoute>
                  <Navbar />
                  <main>
                    <FunilVexinPage />
                  </main>
                </ProtectedRoute>
              }
            />
            <Route
              path="/projecao_vexin"
              element={
                <ProtectedRoute>
                  <Navbar />
                  <main>
                    <ProjecaoVexinPage />
                  </main>
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;