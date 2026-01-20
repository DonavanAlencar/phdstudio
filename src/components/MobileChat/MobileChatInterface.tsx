import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, X, AlertCircle } from 'lucide-react';
import MobileChatMessage, { Message } from './MobileChatMessage';
import {
  checkRateLimit,
  getRateLimitTimeRemaining,
  validateAndSanitizeInput,
  validateOrigin,
  fetchWithTimeout,
  sanitizeText
} from '../../utils/mobileChatUtils';

// Função para gerar ou obter ID de sessão do browser (reutilizada do ChatWidget)
const getSessionId = (): string => {
  const STORAGE_KEY = 'phdstudio_chat_session_id';
  
  let sessionId = sessionStorage.getItem(STORAGE_KEY);
  
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem(STORAGE_KEY, sessionId);
  }
  
  return sessionId;
};

// Função para detectar e corrigir Mixed Content (reutilizada do ChatWidget)
const fixMixedContent = (url: string): { url: string; hasMixedContent: boolean } => {
  const isHttpsPage = window.location.protocol === 'https:';
  const isHttpUrl = url.startsWith('http://');
  
  if (isHttpsPage && isHttpUrl) {
    const httpsUrl = url.replace('http://', 'https://');
    return { url: httpsUrl, hasMixedContent: true };
  }
  
  return { url, hasMixedContent: false };
};

// Obter configurações de variáveis de ambiente ou usar padrões (reutilizada do ChatWidget)
const getWebhookConfig = () => {
  const envWebhookUrl = import.meta.env.VITE_CHAT_WEBHOOK_URL;
  const envAuthToken = import.meta.env.VITE_CHAT_AUTH_TOKEN;
  
  return {
    webhookUrl: envWebhookUrl || 'https://n8n.546digitalservices.com/webhook/32f58b69-ef50-467f-b884-50e72a5eefa2',
    authToken: envAuthToken || 'T!Hm9Y1Sc#0!F2ZxVZvvS2@#UQ5bqqQKly',
    usingEnvVars: !!(envWebhookUrl || envAuthToken)
  };
};

interface MobileChatInterfaceProps {
  onClose?: () => void;
}

const MobileChatInterface: React.FC<MobileChatInterfaceProps> = ({ onClose }) => {
  // Na página mobile dedicada, não há necessidade de botão de fechar
  const isMobilePage = window.location.pathname === '/mobilechat';
  const config = getWebhookConfig();
  const { url: safeWebhookUrl, hasMixedContent } = fixMixedContent(config.webhookUrl);
  const sessionId = getSessionId();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Vamos começar?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rateLimitError, setRateLimitError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Scroll automático para a última mensagem
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Focar no input quando o componente montar
  useEffect(() => {
    if (inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, []);

  // Ajustar altura do container quando o teclado aparecer (mobile)
  // Especialmente importante para iOS/Safari
  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    
    const handleResize = () => {
      if (messagesContainerRef.current) {
        // Para iOS, usar visualViewport que é mais preciso
        // Para outros, usar innerHeight
        let viewportHeight: number;
        
        if (isIOS && (window as any).visualViewport) {
          viewportHeight = (window as any).visualViewport.height;
        } else {
          viewportHeight = window.innerHeight;
        }
        
        // Calcular altura disponível (altura total - header - input - padding)
        // Header: ~80px, Input area: ~100px, padding: ~20px
        const headerHeight = 80;
        const inputAreaHeight = 100;
        const availableHeight = Math.max(viewportHeight - headerHeight - inputAreaHeight, 300);
        
        messagesContainerRef.current.style.height = `${availableHeight}px`;
        messagesContainerRef.current.style.maxHeight = `${availableHeight}px`;
      }
    };

    // Ajustar inicialmente
    handleResize();

    // Para iOS, usar visualViewport que é mais confiável
    if ((window as any).visualViewport) {
      (window as any).visualViewport.addEventListener('resize', handleResize);
      (window as any).visualViewport.addEventListener('scroll', handleResize);
    }
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', () => {
      setTimeout(handleResize, 100); // Delay para iOS recalcular
    });

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      if ((window as any).visualViewport) {
        (window as any).visualViewport.removeEventListener('resize', handleResize);
        (window as any).visualViewport.removeEventListener('scroll', handleResize);
      }
    };
  }, []);

  const handleSendMessage = async () => {
    // Validar e sanitizar input
    const sanitizedInput = validateAndSanitizeInput(inputText);
    if (!sanitizedInput || isLoading) {
      return;
    }

    // Verificar rate limiting
    if (!checkRateLimit()) {
      const timeRemaining = getRateLimitTimeRemaining();
      setRateLimitError(`Você excedeu o limite de mensagens. Aguarde ${timeRemaining} segundos.`);
      setTimeout(() => setRateLimitError(''), 5000);
      return;
    }

    setRateLimitError('');

    // Validar origem
    if (!validateOrigin(safeWebhookUrl)) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: '⚠️ Erro de segurança: Origem da requisição não permitida.',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: sanitizedInput,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetchWithTimeout(
        safeWebhookUrl,
        {
          method: 'POST',
          headers: {
            'Authentication': config.authToken,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            input_text: sanitizedInput,
            session_id: sessionId
          }),
        },
        15000, // 15 segundos de timeout (aumentado)
        2 // 2 retries (total de 3 tentativas)
      );

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const responseData = await response.json();
      
      // Se a resposta for um array, extrair o primeiro elemento
      const data = Array.isArray(responseData) ? responseData[0] : responseData;
      
      // Extrair a resposta do bot
      let botResponseText = 'Desculpe, não consegui processar sua mensagem.';
      
      if (data && data.output) {
        botResponseText = data.output;
      } else if (data && (data.response || data.message || data.text)) {
        botResponseText = data.response || data.message || data.text;
      } else if (typeof data === 'string') {
        botResponseText = data;
      } else if (data && data.output_text) {
        botResponseText = data.output_text;
      }

      // Sanitizar resposta do bot antes de exibir
      const sanitizedResponse = sanitizeText(botResponseText);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: sanitizedResponse,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error: any) {
      let errorType = 'unknown';
      let errorText = 'Desculpe, ocorreu um erro ao comunicar com o assistente. Por favor, tente novamente.';
      
      const errorMessageStr = error?.message?.toLowerCase() || '';
      const errorNameStr = error?.name?.toLowerCase() || '';
      const errorCode = error?.code?.toLowerCase() || '';
      
      // Log detalhado do erro para diagnóstico (apenas em desenvolvimento)
      if (process.env.NODE_ENV === 'development') {
        console.error('[MobileChat] Erro detalhado:', {
          message: error?.message,
          name: error?.name,
          code: error?.code,
          stack: error?.stack?.substring(0, 200)
        });
      }
      
      // Detectar Mixed Content
      if (errorMessageStr.includes('mixed content') || 
          errorMessageStr.includes('blocked:mixed-content') ||
          errorMessageStr.includes('mixedcontenterror')) {
        errorType = 'mixed_content';
        errorText = '⚠️ Erro de segurança detectado: O navegador bloqueou a conexão por questões de segurança. Isso geralmente acontece quando o site usa HTTPS mas tenta conectar a um servidor HTTP.';
      } 
      // Detectar CORS
      else if (errorMessageStr.includes('cors') || 
               errorMessageStr.includes('cross-origin') ||
               errorMessageStr.includes('access-control') ||
               (errorNameStr === 'typeerror' && errorMessageStr.includes('fetch'))) {
        errorType = 'cors';
        errorText = '⚠️ Erro de conexão: O servidor não permitiu a requisição. Isso pode ser um problema de configuração do servidor (CORS).';
      } 
      // Detectar falha de rede ou timeout
      else if (errorMessageStr.includes('failed to fetch') || 
               errorMessageStr.includes('networkerror') ||
               errorMessageStr.includes('network request failed') ||
               errorMessageStr.includes('timeout') ||
               errorMessageStr.includes('múltiplas tentativas') ||
               errorMessageStr.includes('aborted') ||
               errorMessageStr.includes('abort') ||
               errorCode === 'net::err_internet_disconnected' ||
               errorCode === 'net::err_network_changed' ||
               errorCode === 'net::err_connection_refused' ||
               errorCode === 'net::err_connection_timed_out' ||
               errorCode === 'net::err_name_not_resolved') {
        errorType = 'network';
        if (hasMixedContent) {
          errorText = '⚠️ Erro de conexão: O servidor do webhook precisa estar configurado com HTTPS para funcionar em páginas seguras.';
        } else {
          errorText = '⚠️ Erro de rede: Não foi possível conectar ao servidor após várias tentativas. O servidor pode estar temporariamente indisponível ou sua conexão com a internet pode estar instável. Por favor, verifique sua conexão e tente novamente.';
        }
      }
      // Erro HTTP
      else if (error?.message?.match(/erro \d{3}/i)) {
        errorType = 'http_error';
        const statusMatch = error.message.match(/\d{3}/);
        const statusCode = statusMatch ? statusMatch[0] : 'desconhecido';
        
        if (statusCode.startsWith('5')) {
          errorText = `⚠️ Erro do servidor (${statusCode}): O servidor está temporariamente indisponível. Por favor, tente novamente em alguns instantes.`;
        } else {
          errorText = `⚠️ Erro do servidor (${statusCode}): ${error.message}. Por favor, tente novamente.`;
        }
      }
      
      const errorBotMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: errorText,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorBotMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Detectar iOS para aplicar estilos específicos
  const isIOS = typeof window !== 'undefined' && 
    (/iPad|iPhone|iPod/.test(navigator.userAgent) || 
     (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));

  return (
    <div 
      className="flex flex-col h-full w-full text-white" 
      style={{ 
        height: isIOS ? '-webkit-fill-available' : '100vh',
        minHeight: isIOS ? '-webkit-fill-available' : '100vh',
        width: '100vw', 
        margin: 0, 
        padding: 0,
        backgroundColor: '#0A0A0A', // brand-dark fallback
        minWidth: '100vw',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Header fixo */}
      <div 
        className="px-4 py-4 flex items-center justify-between flex-shrink-0"
        style={{
          background: 'linear-gradient(to right, #EF4444, #DC2626)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '1rem'
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg font-heading">Assistente Virtual</h3>
            <p className="text-white/80 text-xs">PHD Studio</p>
          </div>
        </div>
        {onClose && !isMobilePage && (
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors min-w-[44px] min-h-[44px]"
            aria-label="Fechar chat"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Aviso de Mixed Content */}
      {hasMixedContent && (
        <div className="bg-yellow-500/20 border-b border-yellow-500/30 px-4 py-2 flex items-center gap-2 flex-shrink-0">
          <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
          <p className="text-yellow-300 text-xs">
            Aviso: Tentando conexão HTTPS. Se o erro persistir, o servidor precisa estar configurado com HTTPS.
          </p>
        </div>
      )}

      {/* Erro de rate limiting */}
      {rateLimitError && (
        <div className="bg-red-500/20 border-b border-red-500/30 px-4 py-2 flex items-center gap-2 flex-shrink-0">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <p className="text-red-300 text-xs">{rateLimitError}</p>
        </div>
      )}

      {/* Área de mensagens com scroll */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-brand-gray/50"
        style={{ 
          minHeight: 0,
          paddingBottom: isIOS ? '120px' : '1rem', // Espaço para input fixo no iOS
          WebkitOverflowScrolling: 'touch' // Scroll suave no iOS
        }}
      >
        {messages.map((message) => (
          <MobileChatMessage key={message.id} message={message} />
        ))}
        
        {/* Indicador de digitação */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/10 text-gray-100 border border-white/10 rounded-2xl rounded-bl-none px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input fixo na parte inferior */}
      <div 
        className="p-4 bg-brand-dark border-t border-white/10 flex-shrink-0"
        style={{
          display: 'block',
          visibility: 'visible',
          opacity: 1,
          position: isIOS ? 'fixed' : 'relative',
          bottom: isIOS ? 'env(safe-area-inset-bottom, 0px)' : 'auto',
          left: 0,
          right: 0,
          width: '100%',
          zIndex: 99999,
          pointerEvents: 'auto',
          paddingBottom: isIOS ? `calc(1rem + env(safe-area-inset-bottom, 0px))` : '1rem'
        }}
      >
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua mensagem..."
            disabled={isLoading}
            className="flex-1 bg-brand-gray border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-red transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
            style={{
              display: 'block',
              visibility: 'visible',
              opacity: 1,
              position: 'relative',
              zIndex: 100000,
              pointerEvents: 'auto',
              WebkitAppearance: 'none',
              WebkitUserSelect: 'text',
              userSelect: 'text'
            }}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isLoading}
            className="w-12 h-12 bg-brand-red hover:bg-red-600 text-white rounded-lg flex items-center justify-center transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 min-w-[48px] min-h-[48px]"
            aria-label="Enviar mensagem"
            style={{
              display: 'flex',
              visibility: 'visible',
              opacity: 1,
              position: 'relative',
              zIndex: 100000,
              pointerEvents: 'auto',
              WebkitTapHighlightColor: 'rgba(239, 68, 68, 0.3)',
              touchAction: 'manipulation'
            }}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Pressione Enter para enviar
        </p>
      </div>
    </div>
  );
};

export default MobileChatInterface;

