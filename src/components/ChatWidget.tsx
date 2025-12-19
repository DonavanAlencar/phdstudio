import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, AlertCircle } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatWidgetProps {
  webhookUrl?: string;
  authToken?: string;
}

// Função para gerar ou obter ID de sessão do browser
const getSessionId = (): string => {
  const STORAGE_KEY = 'phdstudio_chat_session_id';
  
  // Tentar obter do sessionStorage (mantém durante a sessão do browser)
  let sessionId = sessionStorage.getItem(STORAGE_KEY);
  
  if (!sessionId) {
    // Gerar novo ID único: timestamp + random string
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem(STORAGE_KEY, sessionId);
  }
  
  return sessionId;
};

// Função para detectar e corrigir Mixed Content (HTTP em página HTTPS)
const fixMixedContent = (url: string): { url: string; hasMixedContent: boolean } => {
  const isHttpsPage = window.location.protocol === 'https:';
  const isHttpUrl = url.startsWith('http://');
  
  if (isHttpsPage && isHttpUrl) {
    // Tentar converter para HTTPS
    const httpsUrl = url.replace('http://', 'https://');
    return { url: httpsUrl, hasMixedContent: true };
  }
  
  return { url, hasMixedContent: false };
};

// Obter configurações de variáveis de ambiente ou usar padrões
const getWebhookConfig = () => {
  const envWebhookUrl = import.meta.env.VITE_CHAT_WEBHOOK_URL;
  const envAuthToken = import.meta.env.VITE_CHAT_AUTH_TOKEN;
  
  return {
    webhookUrl: envWebhookUrl || 'http://148.230.79.105:5679/webhook/32f58b69-ef50-467f-b884-50e72a5eefa2',
    authToken: envAuthToken || 'T!Hm9Y1Sc#0!F2ZxVZvvS2@#UQ5bqqQKly',
    usingEnvVars: !!(envWebhookUrl || envAuthToken)
  };
};

const ChatWidget: React.FC<ChatWidgetProps> = ({ 
  webhookUrl: propWebhookUrl,
  authToken: propAuthToken
}) => {
  // Usar props ou variáveis de ambiente ou valores padrão
  const config = getWebhookConfig();
  const finalWebhookUrl = propWebhookUrl || config.webhookUrl;
  const finalAuthToken = propAuthToken || config.authToken;
  
  // Corrigir Mixed Content se necessário
  const { url: safeWebhookUrl, hasMixedContent } = fixMixedContent(finalWebhookUrl);
  
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Olá! Sou o assistente virtual da PHD Studio. Como posso ajudá-lo hoje?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Olá! Sou o assistente virtual da PHD Studio. Como posso ajudá-lo hoje?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Obter ou gerar sessionId uma vez quando o componente monta
  const sessionId = getSessionId();

  // Scroll automático para a última mensagem
  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Focar no input quando o chat abrir
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    setConnectionError(null);

    try {
      const response = await fetch(safeWebhookUrl, {
        method: 'POST',
        headers: {
          'Authentication': finalAuthToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input_text: userMessage.text,
          session_id: sessionId
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Extrair a resposta do bot do campo "output"
      let botResponseText = 'Desculpe, não consegui processar sua mensagem.';
      
      if (data.output) {
        botResponseText = data.output;
      } else if (data.response || data.message || data.text) {
        // Fallback para outros formatos possíveis
        botResponseText = data.response || data.message || data.text;
      } else if (typeof data === 'string') {
        botResponseText = data;
      } else if (data.output_text) {
        botResponseText = data.output_text;
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponseText,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error: any) {
      console.error('Erro ao enviar mensagem:', error);
      
      // Detectar tipo de erro específico
      let errorMessage = 'Desculpe, ocorreu um erro ao comunicar com o assistente.';
      
      if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
        if (hasMixedContent) {
          errorMessage = 'Erro de conexão: O servidor do webhook precisa estar configurado com HTTPS para funcionar em páginas seguras. Entre em contato com o suporte.';
          setConnectionError('MIXED_CONTENT');
        } else {
          errorMessage = 'Erro de conexão: Não foi possível conectar ao servidor. Verifique sua conexão com a internet.';
          setConnectionError('NETWORK_ERROR');
        }
      } else if (error.message?.includes('CORS')) {
        errorMessage = 'Erro de CORS: O servidor não permite requisições deste domínio.';
        setConnectionError('CORS_ERROR');
      } else {
        errorMessage = `Erro: ${error.message || 'Erro desconhecido'}. Por favor, tente novamente.`;
        setConnectionError('UNKNOWN_ERROR');
      }
      
      const errorBotMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: errorMessage,
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

  return (
    <>
      {/* Botão flutuante para abrir o chat */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-24 right-6 z-50 w-14 h-14 bg-brand-red hover:bg-red-600 text-white rounded-full shadow-2xl shadow-brand-red/50 flex items-center justify-center transition-all duration-300 hover:scale-110 group"
          aria-label="Abrir chat"
        >
          <MessageCircle className="w-6 h-6 group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full animate-pulse"></span>
        </button>
      )}

      {/* Widget de chat */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[90vw] max-w-md h-[600px] flex flex-col bg-brand-dark border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-lg">
          {/* Header */}
          <div className="bg-gradient-to-r from-brand-red to-red-600 px-6 py-4 flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg font-heading">Assistente Virtual</h3>
                <p className="text-white/80 text-xs">PHD Studio</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
              aria-label="Fechar chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Aviso de Mixed Content */}
          {hasMixedContent && (
            <div className="bg-yellow-500/20 border-b border-yellow-500/30 px-4 py-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
              <p className="text-yellow-300 text-xs">
                Aviso: Tentando conexão HTTPS. Se o erro persistir, o servidor precisa estar configurado com HTTPS.
              </p>
            </div>
          )}

          {/* Área de mensagens */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-brand-gray/50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.sender === 'user'
                      ? 'bg-brand-red text-white rounded-br-none'
                      : 'bg-white/10 text-gray-100 border border-white/10 rounded-bl-none'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                    {message.text}
                  </p>
                  <span className={`text-xs mt-1 block ${
                    message.sender === 'user' ? 'text-white/70' : 'text-gray-400'
                  }`}>
                    {message.timestamp.toLocaleTimeString('pt-BR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
              </div>
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

          {/* Input area */}
          <div className="p-4 bg-brand-dark border-t border-white/10">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua mensagem..."
                disabled={isLoading}
                className="flex-1 bg-brand-gray border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-red transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isLoading}
                className="w-12 h-12 bg-brand-red hover:bg-red-600 text-white rounded-lg flex items-center justify-center transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                aria-label="Enviar mensagem"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Pressione Enter para enviar
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;

