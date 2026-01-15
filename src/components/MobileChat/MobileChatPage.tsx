import React, { useState, useEffect } from 'react';
import MobileChatLogin from './MobileChatLogin';
import MobileChatInterface from './MobileChatInterface';
import { saveAccessLog } from '../../utils/logsStorage';
import { getVisitorIP } from '../../utils/mobileChatUtils';

// Gerar ou obter Visitor ID único (reutilizado do App.tsx)
const getOrCreateVisitorId = (): string => {
  const storageKey = 'phdstudio_visitor_id';
  let visitorId = localStorage.getItem(storageKey);

  if (!visitorId) {
    visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(storageKey, visitorId);
  }

  return visitorId;
};

// Obter dados do visitante (reutilizado do App.tsx)
const getVisitorData = () => {
  const visitorId = getOrCreateVisitorId();
  const storageKey = `phdstudio_visitor_${visitorId}`;
  const stored = localStorage.getItem(storageKey);

  if (stored) {
    try {
      const data = JSON.parse(stored);
      data.lastVisit = new Date().toISOString();
      data.visitCount = (data.visitCount || 0) + 1;
      localStorage.setItem(storageKey, JSON.stringify(data));
      return data;
    } catch {
      // Se falhar, criar novo
    }
  }

  const now = new Date().toISOString();
  const data = {
    visitorId,
    firstVisit: now,
    lastVisit: now,
    visitCount: 1
  };
  localStorage.setItem(storageKey, JSON.stringify(data));
  return data;
};

const MobileChatPage: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // IMPORTANTE: Todos os hooks devem ser chamados antes de qualquer early return
  // Verificar autenticação ao montar
  useEffect(() => {
    const checkAuth = () => {
      const authStatus = localStorage.getItem('isAuthenticated');
      const username = localStorage.getItem('username');
      
      if (authStatus === 'true' && (username === 'vexin' || username === 'phdstudioadmin')) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
      setIsChecking(false);
    };

    checkAuth();

    // Registrar acesso (não bloqueante)
    const logAccess = async () => {
      const visitorData = getVisitorData();
      const userAgent = navigator.userAgent;
      const timestamp = new Date().toISOString();

      // Obter IP de forma não bloqueante (retorna 'unknown' imediatamente, tenta obter em background)
      const ip = await getVisitorIP();
      
      // Salvar log imediatamente (não bloqueia - IP pode ser 'unknown')
      // Se IP real for obtido em background, será cacheado para próxima vez
      const logEntry = {
        visitorId: visitorData.visitorId,
        page: '/mobilechat',
        ip,
        userAgent,
        timestamp,
        referrer: document.referrer || 'direct'
      };

      await saveAccessLog(logEntry).catch(() => {
        // Silenciar erros de logging
      });
    };

    logAccess();
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  // Ocultar elementos globais e aplicar estilos fullscreen
  useEffect(() => {
    // Ocultar elementos globais que podem aparecer
    const hideGlobalElements = () => {
      // Ocultar Navbar, Footer, CookieBanner, ChatWidget, etc.
      const selectors = [
        'nav',
        'footer',
        '[class*="cookie"]',
        '[class*="Cookie"]',
        '[class*="ChatWidget"]',
        'button[aria-label*="chat" i]',
        'button[aria-label*="Abrir chat"]',
        'a[href*="wa.me"]', // Botão WhatsApp
        '[class*="whatsapp"]',
        '[class*="WhatsApp"]',
        // Seletores específicos do ChatWidget
        'button:has(svg[class*="MessageCircle"])',
        '[class*="fixed"][class*="bottom-24"][class*="right-6"]'
      ];
      
      selectors.forEach(selector => {
        try {
          const elements = document.querySelectorAll(selector);
          elements.forEach(el => {
            const htmlEl = el as HTMLElement;
            htmlEl.style.display = 'none';
            htmlEl.style.visibility = 'hidden';
            htmlEl.style.opacity = '0';
            htmlEl.style.pointerEvents = 'none';
          });
        } catch (e) {
          // Ignorar seletores inválidos
        }
      });

      // Ocultar especificamente botões flutuantes de chat
      // IMPORTANTE: Não ocultar elementos do MobileChatInterface
      const allButtons = document.querySelectorAll('button');
      allButtons.forEach(btn => {
        // Verificar se o botão está dentro do MobileChatInterface
        const isInMobileChat = btn.closest('[class*="MobileChat"]') || 
                               btn.closest('div[class*="bg-brand-dark"][class*="border-t"]') ||
                               btn.getAttribute('aria-label')?.toLowerCase().includes('enviar mensagem');
        
        // Se estiver no chat mobile, não ocultar
        if (isInMobileChat) {
          return;
        }
        
        const classes = btn.className || '';
        const ariaLabel = btn.getAttribute('aria-label') || '';
        const isFixed = btn.style.position === 'fixed' || classes.includes('fixed');
        const isBottomRight = classes.includes('bottom-') && classes.includes('right-');
        
        if ((isFixed && isBottomRight && ariaLabel.toLowerCase().includes('chat')) ||
            (classes.includes('MessageCircle') && isFixed)) {
          (btn as HTMLElement).style.display = 'none';
          (btn as HTMLElement).style.visibility = 'hidden';
          (btn as HTMLElement).style.opacity = '0';
          (btn as HTMLElement).style.pointerEvents = 'none';
        }
      });
      
      // Garantir que inputs e botões do chat mobile sejam sempre visíveis
      const mobileChatInputs = document.querySelectorAll('input[type="text"][placeholder*="mensagem" i], input[type="text"][placeholder*="Digite sua mensagem"]');
      mobileChatInputs.forEach(input => {
        const htmlEl = input as HTMLElement;
        htmlEl.style.display = 'block';
        htmlEl.style.visibility = 'visible';
        htmlEl.style.opacity = '1';
        htmlEl.style.pointerEvents = 'auto';
      });
      
      const mobileChatButtons = document.querySelectorAll('button[aria-label*="Enviar mensagem" i], button:has(svg[class*="Send"])');
      mobileChatButtons.forEach(btn => {
        const htmlEl = btn as HTMLElement;
        // Verificar se não é um botão fixo flutuante (ChatWidget)
        const isFixed = htmlEl.style.position === 'fixed' || htmlEl.className.includes('fixed');
        const isBottomRight = htmlEl.className.includes('bottom-') && htmlEl.className.includes('right-');
        if (!(isFixed && isBottomRight)) {
          htmlEl.style.display = 'flex';
          htmlEl.style.visibility = 'visible';
          htmlEl.style.opacity = '1';
          htmlEl.style.pointerEvents = 'auto';
        }
      });
    };

    hideGlobalElements();
    
    // Executar novamente após delays para garantir que elementos dinâmicos sejam ocultados
    const timeoutId1 = setTimeout(hideGlobalElements, 100);
    const timeoutId2 = setTimeout(hideGlobalElements, 500);
    const timeoutId3 = setTimeout(hideGlobalElements, 1000);
    
    // Observar mudanças no DOM
    const observer = new MutationObserver(() => {
      hideGlobalElements();
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Viewport otimizado para iOS e Android
    const viewport = document.querySelector('meta[name="viewport"]');
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    
    if (viewport) {
      // Para iOS, adicionar viewport-fit=cover para suportar safe-area
      const content = isIOS 
        ? 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
        : 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
      viewport.setAttribute('content', content);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = isIOS 
        ? 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
        : 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
      document.head.appendChild(meta);
    }

    // Adicionar estilo CSS global para ocultar ChatWidget
    const styleId = 'mobile-chat-hide-widgets';
    let styleElement = document.getElementById(styleId);
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      styleElement.textContent = `
        /* Ocultar ChatWidget e botões flutuantes na rota /mobilechat */
        /* IMPORTANTE: Não ocultar botões dentro de formulários de login nem do chat mobile */
        button[aria-label*="chat" i]:not(form button):not([aria-label*="Enviar mensagem" i]),
        button[aria-label*="Abrir chat"]:not(form button):not([aria-label*="Enviar mensagem" i]),
        button[aria-label*="abrir chat"]:not(form button):not([aria-label*="Enviar mensagem" i]),
        button[aria-label*="chat"]:not(form button):not([aria-label*="Enviar mensagem" i]),
        .fixed.bottom-24.right-6:not(form),
        .fixed.bottom-24.right-6 button:not(form button),
        .fixed.bottom-24.right-6 > *:not(form *),
        button.fixed.bottom-24.right-6:not(form button),
        nav,
        footer,
        [class*="cookie" i],
        [class*="Cookie"],
        a[href*="wa.me"],
        a[href*="whatsapp"],
        /* Seletores específicos do ChatWidget - excluir formulários */
        button:has(svg[class*="MessageCircle"]):not(form button),
        button[class*="fixed"][class*="bottom"][class*="right"]:not(form button) {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
          z-index: -9999 !important;
          position: absolute !important;
          left: -9999px !important;
        }
        
        /* Ocultar especificamente botões com MessageCircle - excluir formulários */
        button svg[class*="MessageCircle"]:not(form svg),
        svg[class*="MessageCircle"]:not(form svg),
        button .w-6.h-6.group-hover\\:rotate-12:not(form *),
        /* Ocultar qualquer botão fixo no canto inferior direito - excluir formulários */
        button.fixed[class*="bottom"][class*="right"]:not(form button),
        div.fixed[class*="bottom"][class*="right"] button:not(form button) {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
        }
        
        /* Garantir que botões de formulário sejam visíveis */
        form button[type="submit"],
        form button[type="button"],
        button[type="submit"],
        button[type="button"]:not(.fixed) {
          display: flex !important;
          visibility: visible !important;
          opacity: 1 !important;
          pointer-events: auto !important;
          position: relative !important;
          left: auto !important;
          z-index: 1 !important;
        }
        
        /* GARANTIR VISIBILIDADE DOS ELEMENTOS DO CHAT MOBILE */
        /* Input do chat mobile - sempre visível */
        input[type="text"][placeholder*="mensagem" i],
        input[type="text"][placeholder*="Digite sua mensagem"],
        input[aria-label*="mensagem" i],
        /* Container do input do chat mobile */
        div[class*="bg-brand-dark"][class*="border-t"] input,
        div[class*="bg-brand-dark"][class*="border-t"] button,
        /* Botão de enviar do chat mobile */
        button[aria-label*="Enviar mensagem" i],
        button[aria-label*="enviar mensagem"],
        button:has(svg[class*="Send"]):not(.fixed),
        /* Garantir que todos os elementos dentro do MobileChatInterface sejam visíveis */
        [class*="MobileChat"] input,
        [class*="MobileChat"] button:not(.fixed),
        [class*="MobileChat"] textarea {
          display: flex !important;
          visibility: visible !important;
          opacity: 1 !important;
          pointer-events: auto !important;
          position: relative !important;
          left: auto !important;
          z-index: 99999 !important;
        }
        
        /* Input específico - garantir que seja visível */
        input[type="text"].flex-1.bg-brand-gray {
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
          pointer-events: auto !important;
          -webkit-appearance: none !important;
          -webkit-user-select: text !important;
          user-select: text !important;
        }
        
        /* Container do input fixo no iOS */
        div[class*="bg-brand-dark"][class*="border-t"][style*="position: fixed"],
        div[class*="bg-brand-dark"][class*="border-t"][style*="position:fixed"] {
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
          pointer-events: auto !important;
          position: fixed !important;
          bottom: env(safe-area-inset-bottom, 0px) !important;
          left: 0 !important;
          right: 0 !important;
          width: 100% !important;
          z-index: 99999 !important;
        }
        
        /* Suporte para safe-area no iOS */
        @supports (padding: max(0px)) {
          div[class*="bg-brand-dark"][class*="border-t"] {
            padding-bottom: max(1rem, env(safe-area-inset-bottom)) !important;
          }
        }
      `;
      document.head.appendChild(styleElement);
    }

    // Aplicar estilos fullscreen no body, html e root
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.overflow = 'hidden';
    document.body.style.width = '100%';
    document.body.style.height = '100%';
    document.documentElement.style.margin = '0';
    document.documentElement.style.padding = '0';
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.width = '100%';
    document.documentElement.style.height = '100%';
    
    // Aplicar no root também
    const root = document.getElementById('root');
    if (root) {
      root.style.margin = '0';
      root.style.padding = '0';
      root.style.width = '100%';
      root.style.height = '100%';
      root.style.overflow = 'hidden';
    }

    // Referrer Policy (único meta tag de segurança que funciona)
    let referrerMeta = document.querySelector('meta[name="referrer"]');
    if (!referrerMeta) {
      referrerMeta = document.createElement('meta');
      referrerMeta.setAttribute('name', 'referrer');
      document.head.appendChild(referrerMeta);
    }
    referrerMeta.setAttribute('content', 'strict-origin-when-cross-origin');
    
    // Nota: X-Frame-Options, X-Content-Type-Options e X-XSS-Protection
    // só podem ser definidos via headers HTTP no servidor (nginx.conf)
    // Meta tags não funcionam para esses headers

    // Prevenir zoom em double tap (mobile)
    let lastTouchEnd = 0;
    const preventZoom = (e: TouchEvent) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    };

    document.addEventListener('touchend', preventZoom, { passive: false });

    return () => {
      clearTimeout(timeoutId1);
      clearTimeout(timeoutId2);
      clearTimeout(timeoutId3);
      observer.disconnect();
      document.removeEventListener('touchend', preventZoom);
      // Restaurar estilos ao desmontar
      document.body.style.margin = '';
      document.body.style.padding = '';
      document.body.style.overflow = '';
      document.body.style.width = '';
      document.body.style.height = '';
      document.documentElement.style.margin = '';
      document.documentElement.style.padding = '';
      document.documentElement.style.overflow = '';
      document.documentElement.style.width = '';
      document.documentElement.style.height = '';
      
      const root = document.getElementById('root');
      if (root) {
        root.style.margin = '';
        root.style.padding = '';
        root.style.width = '';
        root.style.height = '';
        root.style.overflow = '';
      }
      
      // Remover estilo CSS global
      const styleElement = document.getElementById('mobile-chat-hide-widgets');
      if (styleElement) {
        styleElement.remove();
      }
      
      // Restaurar elementos ocultos
      const selectors = [
        'nav',
        'footer',
        '[class*="cookie"]',
        '[class*="Cookie"]',
        '[class*="ChatWidget"]',
        'a[href*="wa.me"]',
        '[class*="whatsapp"]',
        '[class*="WhatsApp"]'
      ];
      selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          const htmlEl = el as HTMLElement;
          htmlEl.style.display = '';
          htmlEl.style.visibility = '';
        });
      });
    };
  }, []);

  // Atualizar título da página e verificar rota
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.title = 'Chat Mobile - PHD Studio';
      
      // Redirecionar se acessar com typo
      if (window.location.pathname === '/modilechat') {
        window.history.replaceState({}, '', '/mobilechat');
      }
    }
  }, []);

  // IMPORTANTE: Early return APÓS todos os hooks serem chamados
  // Isso garante que os hooks sejam sempre chamados na mesma ordem (regra dos hooks do React)
  if (isChecking) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center" 
        style={{ 
          backgroundColor: '#0A0A0A', 
          minHeight: '100vh',
          width: '100vw',
          margin: 0,
          padding: 0
        }}
      >
        <div className="text-center">
          <div 
            className="w-12 h-12 border-4 rounded-full animate-spin mx-auto mb-4" 
            style={{ 
              borderColor: '#EF4444',
              borderTopColor: 'transparent'
            }}
          />
          <p style={{ color: '#9CA3AF' }}>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 w-full h-full overflow-hidden" 
      style={{ 
        margin: 0, 
        padding: 0,
        backgroundColor: '#0A0A0A', // brand-dark fallback
        minHeight: '100vh',
        minWidth: '100vw'
      }}
    >
      {!isAuthenticated ? (
        <MobileChatLogin onLoginSuccess={handleLoginSuccess} />
      ) : (
        <MobileChatInterface />
      )}
    </div>
  );
};

export default MobileChatPage;

