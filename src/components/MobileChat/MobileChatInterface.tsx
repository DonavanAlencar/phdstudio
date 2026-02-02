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

type WebhookConfig = {
  webhookUrl: string;
  authToken?: string;
  usingEnvVars: boolean;
};

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

// Obter configuração padrão de webhook
const getDefaultWebhookConfig = (): WebhookConfig => {
  const envWebhookUrl = import.meta.env.VITE_CHAT_WEBHOOK_URL;
  const envAuthToken = import.meta.env.VITE_CHAT_AUTH_TOKEN;
  
  return {
    webhookUrl: envWebhookUrl || 'https://n8n.546digitalservices.com/webhook/32f58b69-ef50-467f-b884-50e72a5eefa2',
    authToken: envAuthToken,
    usingEnvVars: !!(envWebhookUrl || envAuthToken)
  };
};

// Buscar configuração específica do cliente
const fetchClientMobilechatConfig = async (): Promise<{ webhookUrl: string; authToken?: string } | null> => {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      if (import.meta.env.DEV) {
        console.warn('[MobileChat] Token de acesso não encontrado');
      }
      return null;
    }

    // Adicionar timeout reduzido (5s) - backend responde rapidamente quando token é inválido
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos
    
    try {
      const response = await fetch('/api/crm/v1/client-mobilechat/my-config', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        // Log sempre ativo para diagnóstico
        console.log('[MobileChat] Configuração do cliente encontrada:', {
          webhookUrl: data.data.n8n_webhook_url,
          hasAuthToken: !!data.data.n8n_auth_token,
          isActive: data.data.is_active
        });
        return {
          webhookUrl: data.data.n8n_webhook_url,
          authToken: data.data.n8n_auth_token
        };
      } else {
        // Log detalhado do erro (sempre ativo)
        const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
        console.error('[MobileChat] Erro ao buscar configuração:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
          url: '/api/crm/v1/client-mobilechat/my-config'
        });
        
        // Se for 401, token inválido/expirado - não tentar novamente
        if (response.status === 401) {
          console.warn('[MobileChat] Token inválido ou expirado - usando configuração padrão');
          // Marcar cache como token inválido para evitar tentativas futuras
          cachedClientConfig = 'invalid_token';
          return null; // Retornar null para usar configuração padrão
        }
        
        // Se for 404, o cliente não tem configuração (não é erro crítico)
        if (response.status === 404) {
          console.warn('[MobileChat] Cliente não possui configuração de mobilechat');
        } else if (response.status === 504 || response.status === 503) {
          console.error('[MobileChat] Gateway timeout - API pode estar sobrecarregada ou indisponível');
        }
      }
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      // Log sempre ativo para diagnóstico
      console.error('[MobileChat] Erro ao buscar configuração:', {
        error: error?.message || error,
        name: error?.name,
        code: error?.code,
        isTimeout: error?.name === 'AbortError',
        url: '/api/crm/v1/client-mobilechat/my-config'
      });
      
      // Se for timeout, avisar
      if (error?.name === 'AbortError') {
        console.error('[MobileChat] Timeout ao buscar configuração - API não respondeu em 5 segundos');
      }
    }
    
    return null;
  } catch (error: any) {
    // Erro no try externo (ex: problema ao acessar localStorage)
    console.error('[MobileChat] Erro ao buscar configuração (erro externo):', error);
    return null;
  }
};

// Cache simples para evitar múltiplas chamadas quando token é inválido
let cachedClientConfig: { webhookUrl: string; authToken?: string } | null | 'invalid_token' = null;

// Obter configurações considerando role do usuário
const getWebhookConfig = async (): Promise<WebhookConfig> => {
  const userRole = localStorage.getItem('userRole');
  
  if (userRole === 'client') {
    // Se já sabemos que o token é inválido, não tentar novamente
    if (cachedClientConfig === 'invalid_token') {
      return getDefaultWebhookConfig();
    }
    
    // Se já temos cache válido, usar
    if (cachedClientConfig !== null) {
      return {
        ...cachedClientConfig,
        usingEnvVars: false
      };
    }
    
    const clientConfig = await fetchClientMobilechatConfig();
    
    // Cachear resultado
    if (clientConfig === null) {
      // Marcar como token inválido para não tentar novamente
      cachedClientConfig = 'invalid_token';
    } else {
      cachedClientConfig = clientConfig;
    }
    
    if (clientConfig) {
      return {
        ...clientConfig,
        usingEnvVars: false
      };
    }
  }
  
  return getDefaultWebhookConfig();
};

interface MobileChatInterfaceProps {
  onClose?: () => void;
}

const MobileChatInterface: React.FC<MobileChatInterfaceProps> = ({ onClose }) => {
  // Na página mobile dedicada, não há necessidade de botão de fechar
  const isMobilePage = window.location.pathname === '/mobilechat';
  const [webhookConfig, setWebhookConfig] = useState<WebhookConfig>(getDefaultWebhookConfig());
  const [hasClientConfig, setHasClientConfig] = useState<boolean | null>(null); // null = ainda verificando
  const { url: safeWebhookUrl, hasMixedContent } = fixMixedContent(webhookConfig.webhookUrl);
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

  useEffect(() => {
    let isMounted = true;

    const loadConfig = async () => {
      const userRole = localStorage.getItem('userRole');
      const token = localStorage.getItem('accessToken');
      
      // Log para diagnóstico
      console.log('[MobileChat] Carregando configuração:', {
        userRole,
        hasToken: !!token,
        timestamp: new Date().toISOString()
      });
      
      const config = await getWebhookConfig();
      
      if (isMounted) {
        setWebhookConfig(config);
        
        // Verificar se usuário cliente tem configuração válida
        // Reutilizar o resultado já obtido em getWebhookConfig() para evitar chamada duplicada
        if (userRole === 'client') {
          // Usar cache já preenchido por getWebhookConfig()
          const clientConfig = cachedClientConfig && cachedClientConfig !== 'invalid_token' 
            ? cachedClientConfig 
            : null;
          
          const hasConfig = clientConfig !== null && !!clientConfig?.webhookUrl;
          console.log('[MobileChat] Configuração do cliente:', {
            found: clientConfig !== null,
            hasWebhookUrl: !!clientConfig?.webhookUrl,
            webhookUrl: clientConfig?.webhookUrl,
            hasAuthToken: !!clientConfig?.authToken,
            tokenInvalid: cachedClientConfig === 'invalid_token'
          });
          setHasClientConfig(hasConfig);
        } else {
          setHasClientConfig(true); // Admin/outros roles podem usar config padrão
        }
      }
    };

    loadConfig();

    return () => {
      isMounted = false;
    };
  }, []);

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

    // Verificar se usuário cliente tem configuração válida
    const userRole = localStorage.getItem('userRole');
    if (userRole === 'client') {
      if (hasClientConfig === null) {
        // Ainda verificando configuração
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: '⏳ Verificando configuração... Aguarde um momento.',
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
        return;
      }
      
      if (hasClientConfig === false) {
        // Cliente sem configuração
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: '⚠️ Configuração de chat não encontrada. Entre em contato com o administrador para configurar o webhook.',
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
        return;
      }
      
      // Validar se a URL do webhook está presente
      if (!webhookConfig.webhookUrl || !safeWebhookUrl) {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: '⚠️ URL do webhook não configurada. Entre em contato com o administrador para configurar o webhook na tela de Logs.',
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
        return;
      }

      // Log da configuração carregada (apenas em desenvolvimento)
      if (import.meta.env.DEV) {
        console.log('[MobileChat] Configuração carregada:', {
          webhookUrl: safeWebhookUrl,
          hasAuthToken: !!webhookConfig.authToken,
          usingEnvVars: webhookConfig.usingEnvVars,
          hasClientConfig: hasClientConfig
        });
      }
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
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // n8n geralmente aceita Authorization ou Authentication
      // Tentar Authorization primeiro (padrão HTTP), depois Authentication como fallback
      if (webhookConfig.authToken) {
        // Se o token já começa com "Bearer ", usar como está
        if (webhookConfig.authToken.startsWith('Bearer ')) {
          headers['Authorization'] = webhookConfig.authToken;
        } else {
          // Caso contrário, tentar Authorization primeiro
          headers['Authorization'] = `Bearer ${webhookConfig.authToken}`;
          // Também enviar Authentication como fallback (alguns webhooks podem esperar isso)
          headers['Authentication'] = webhookConfig.authToken;
        }
      }

      // n8n espera: message, user (ou sessionId)
      // Enviar ambos os formatos para garantir compatibilidade
      const payload = {
        message: sanitizedInput,      // Formato esperado pelo n8n
        input_text: sanitizedInput,   // Compatibilidade
        sessionId: sessionId,         // n8n espera sessionId (camelCase)
        session_id: sessionId,         // Compatibilidade
        user: sessionId               // Alguns workflows podem esperar 'user'
      };

      // Log para diagnóstico (sempre ativo para debug)
      console.log('[MobileChat] Enviando requisição:', {
        url: safeWebhookUrl,
        hasAuth: !!webhookConfig.authToken,
        authTokenLength: webhookConfig.authToken?.length || 0,
        payload,
        headers: Object.keys(headers)
      });

      const response = await fetchWithTimeout(
        safeWebhookUrl,
        {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        },
        15000, // 15 segundos de timeout (aumentado)
        2 // 2 retries (total de 3 tentativas)
      );

      if (!response.ok) {
        // Tentar obter mais detalhes do erro
        let errorDetails = '';
        try {
          const errorData = await response.text();
          errorDetails = errorData ? ` - ${errorData.substring(0, 200)}` : '';
        } catch {
          // Ignorar se não conseguir ler o erro
        }
        throw new Error(`Erro ${response.status}: ${response.statusText}${errorDetails}`);
      }

      let responseData;
      let text = '';
      
      try {
        text = await response.text();
        console.log('[MobileChat] Texto bruto da resposta:', {
          length: text.length,
          isEmpty: !text.trim(),
          preview: text.substring(0, 100)
        });
      } catch (textError) {
        console.error('[MobileChat] Erro ao ler texto da resposta:', textError);
        throw new Error('Não foi possível ler a resposta do servidor');
      }
      
      // Tentar parsear como JSON
      if (text.trim()) {
        try {
          responseData = JSON.parse(text);
          console.log('[MobileChat] JSON parseado com sucesso:', responseData);
        } catch (parseError) {
          // Se não for JSON válido, usar o texto como resposta
          console.log('[MobileChat] Não é JSON válido, usando texto direto:', text);
          responseData = text;
        }
      } else {
        // Resposta vazia - pode ser problema de CORS ou servidor não retornou nada
        console.warn('[MobileChat] Resposta vazia recebida. Possíveis causas: CORS, servidor não retornou dados, ou resposta foi bloqueada.');
        console.log('[MobileChat] Detalhes da resposta:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          ok: response.ok,
          type: response.type
        });
        
        // Se for status 200 mas resposta vazia, pode ser CORS
        if (response.status === 200 && response.ok) {
          throw new Error('Resposta vazia do servidor (possível problema de CORS - o servidor precisa configurar headers CORS para permitir leitura da resposta)');
        }
        
        throw new Error('Resposta vazia do servidor');
      }
      
      // Se a resposta for um array, extrair o primeiro elemento
      const data = Array.isArray(responseData) ? responseData[0] : responseData;
      
      // Extrair a resposta do bot - n8n pode retornar em vários formatos
      let botResponseText = 'Desculpe, não consegui processar sua mensagem.';
      
      // Tratar diferentes tipos de resposta
      if (typeof data === 'string') {
        botResponseText = data;
      } else if (typeof data === 'number') {
        // Se for apenas um número, converter para string
        botResponseText = String(data);
      } else if (typeof data === 'boolean') {
        // Se for booleano, converter para string
        botResponseText = data ? 'Sim' : 'Não';
      } else if (data && typeof data === 'object') {
        // Tentar vários campos comuns do n8n
        botResponseText = data.output || 
                        data.response || 
                        data.message || 
                        data.text || 
                        data.output_text ||
                        data.data?.output ||
                        data.data?.response ||
                        data.data?.message ||
                        // Se o objeto tiver apenas uma propriedade, usar o valor
                        (Object.keys(data).length === 1 ? Object.values(data)[0] : null) ||
                        // Se não encontrar, tentar stringify do objeto
                        (JSON.stringify(data).length < 200 ? JSON.stringify(data) : botResponseText);
      } else if (data !== null && data !== undefined) {
        // Qualquer outro tipo, converter para string
        botResponseText = String(data);
      }
      
      // Se ainda não encontrou resposta válida, usar o texto original
      if (!botResponseText || botResponseText === 'Desculpe, não consegui processar sua mensagem.') {
        // Tentar usar o responseData original como fallback
        if (typeof responseData === 'string' || typeof responseData === 'number') {
          botResponseText = String(responseData);
        }
      }
      
      // Log da resposta (sempre ativo para debug)
      console.log('[MobileChat] Resposta recebida:', {
        status: response.status,
        statusText: response.statusText,
        data: responseData,
        dataType: typeof responseData,
        extracted: botResponseText,
        isArray: Array.isArray(responseData),
        rawText: text.substring(0, 200) // Primeiros 200 caracteres do texto bruto
      });

      // Sanitizar resposta do bot antes de exibir
      const sanitizedResponse = sanitizeText(botResponseText);
      
      // Log final antes de exibir
      console.log('[MobileChat] Mensagem do bot preparada:', {
        original: botResponseText,
        sanitized: sanitizedResponse,
        length: sanitizedResponse.length
      });

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
      if (import.meta.env.DEV) {
        console.error('[MobileChat] Erro detalhado:', {
          message: error?.message,
          name: error?.name,
          code: error?.code,
          url: safeWebhookUrl,
          hasAuth: !!webhookConfig.authToken,
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
               errorMessageStr.includes('preflight') ||
               (errorNameStr === 'typeerror' && errorMessageStr.includes('fetch'))) {
        errorType = 'cors';
        errorText = '⚠️ Erro de conexão (CORS): O servidor n8n não está permitindo requisições do navegador. Verifique se o webhook do n8n está configurado para aceitar requisições do domínio phdstudio.com.br. O webhook precisa ter CORS habilitado.';
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
        } else if (statusCode === '401' || statusCode === '403') {
          errorText = `⚠️ Erro de autenticação (${statusCode}): Verifique se sua configuração de webhook está correta na tela de Logs.`;
        } else if (statusCode === '404') {
          errorText = `⚠️ Webhook não encontrado (${statusCode}): Verifique se a URL do webhook está correta na configuração.`;
        } else {
          errorText = `⚠️ Erro do servidor (${statusCode}): ${error.message}. Por favor, tente novamente.`;
        }
      }
      
      // Log completo do erro para diagnóstico (sempre ativo)
      console.error('[MobileChat] Erro completo:', {
        errorType,
        error: error?.message,
        name: error?.name,
        code: error?.code,
        url: safeWebhookUrl,
        hasAuth: !!webhookConfig.authToken,
        webhookConfig: {
          webhookUrl: webhookConfig.webhookUrl,
          hasAuthToken: !!webhookConfig.authToken,
          usingEnvVars: webhookConfig.usingEnvVars
        },
        stack: error?.stack?.substring(0, 500)
      });
      
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
