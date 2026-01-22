// Utilitários para o módulo de chat mobile
// Rate limiting, sanitização, validação e segurança

// Rate limiting: máximo de 10 mensagens por minuto
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW = 60000; // 1 minuto em milissegundos
const RATE_LIMIT_STORAGE_KEY = 'mobile_chat_rate_limit';

interface RateLimitEntry {
  timestamps: number[];
}

/**
 * Verifica se o usuário pode enviar uma mensagem (rate limiting)
 * @returns true se pode enviar, false se excedeu o limite
 */
export const checkRateLimit = (): boolean => {
  try {
    const stored = sessionStorage.getItem(RATE_LIMIT_STORAGE_KEY);
    const now = Date.now();
    
    if (!stored) {
      // Primeira mensagem
      const entry: RateLimitEntry = {
        timestamps: [now]
      };
      sessionStorage.setItem(RATE_LIMIT_STORAGE_KEY, JSON.stringify(entry));
      return true;
    }
    
    const entry: RateLimitEntry = JSON.parse(stored);
    
    // Remover timestamps antigos (fora da janela de 1 minuto)
    entry.timestamps = entry.timestamps.filter(
      timestamp => now - timestamp < RATE_LIMIT_WINDOW
    );
    
    // Verificar se excedeu o limite
    if (entry.timestamps.length >= RATE_LIMIT_MAX) {
      return false;
    }
    
    // Adicionar timestamp atual
    entry.timestamps.push(now);
    sessionStorage.setItem(RATE_LIMIT_STORAGE_KEY, JSON.stringify(entry));
    return true;
  } catch (error) {
    // Em caso de erro, permitir envio (fail open)
    return true;
  }
};

/**
 * Obtém o tempo restante até poder enviar novamente
 * @returns tempo em segundos ou 0 se pode enviar
 */
export const getRateLimitTimeRemaining = (): number => {
  try {
    const stored = sessionStorage.getItem(RATE_LIMIT_STORAGE_KEY);
    if (!stored) return 0;
    
    const entry: RateLimitEntry = JSON.parse(stored);
    const now = Date.now();
    
    // Remover timestamps antigos
    entry.timestamps = entry.timestamps.filter(
      timestamp => now - timestamp < RATE_LIMIT_WINDOW
    );
    
    if (entry.timestamps.length < RATE_LIMIT_MAX) {
      return 0;
    }
    
    // Calcular tempo até o timestamp mais antigo expirar
    const oldestTimestamp = Math.min(...entry.timestamps);
    const timeRemaining = RATE_LIMIT_WINDOW - (now - oldestTimestamp);
    return Math.ceil(timeRemaining / 1000); // Converter para segundos
  } catch (error) {
    return 0;
  }
};

/**
 * Sanitiza texto removendo HTML e scripts (prevenção XSS)
 * @param text - Texto a ser sanitizado
 * @returns Texto sanitizado
 */
export const sanitizeText = (text: string): string => {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  // Escape de caracteres HTML especiais
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  
  let sanitized = text.replace(/[&<>"'/]/g, (s) => map[s] || s);
  
  // Remover qualquer script tag que possa ter sido inserida
  sanitized = sanitized
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/data:text\/html/gi, '');
  
  return sanitized;
};

/**
 * Valida e sanitiza input do usuário antes de enviar
 * @param input - Input do usuário
 * @returns Input validado e sanitizado ou null se inválido
 */
export const validateAndSanitizeInput = (input: string): string | null => {
  if (!input || typeof input !== 'string') {
    return null;
  }
  
  // Remover espaços em branco
  const trimmed = input.trim();
  
  // Verificar comprimento mínimo e máximo
  if (trimmed.length === 0 || trimmed.length > 2000) {
    return null;
  }
  
  // Sanitizar
  return sanitizeText(trimmed);
};

/**
 * Valida origem das requisições (mesmo domínio ou webhooks permitidos)
 * @param url - URL a ser validada
 * @returns true se a URL é do mesmo domínio ou é um webhook permitido
 */
export const validateOrigin = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    const currentOrigin = window.location.origin;
    
    // Permitir mesmo domínio
    if (urlObj.origin === currentOrigin) {
      return true;
    }
    
    // Permitir apenas HTTPS (segurança)
    if (urlObj.protocol !== 'https:') {
      // Em desenvolvimento, permitir HTTP para localhost
      if (process.env.NODE_ENV === 'development' && 
          (urlObj.hostname === 'localhost' || urlObj.hostname === '127.0.0.1')) {
        return true;
      }
      return false;
    }
    
    // Permitir webhooks n8n e outros serviços conhecidos
    const allowedDomains = [
      'n8n.546digitalservices.com',
      '546digitalservices.com', // Permitir domínio base também
      'webhook.site',
      'hook.integromat.com',
      'n8n.io',
      'make.com',
      'zapier.com',
      'ifttt.com'
    ];
    
    // Verificar se o hostname corresponde a algum domínio permitido
    const hostname = urlObj.hostname.toLowerCase();
    return allowedDomains.some(domain => {
      // Permitir domínio exato ou subdomínios
      return hostname === domain || hostname.endsWith('.' + domain);
    });
  } catch (error) {
    // Em caso de erro ao parsear URL, retornar false por segurança
    return false;
  }
};

/**
 * Cria um fetch com timeout e retry logic
 * @param url - URL da requisição
 * @param options - Opções do fetch
 * @param timeout - Timeout em milissegundos (padrão: 15 segundos)
 * @param retries - Número de tentativas (padrão: 2)
 * @returns Promise da resposta
 */
export const fetchWithTimeout = async (
  url: string,
  options: RequestInit = {},
  timeout: number = 15000, // Aumentado de 10s para 15s
  retries: number = 2 // Adicionar retry logic
): Promise<Response> => {
  let lastError: any;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      // Esperar antes de retry (exponential backoff)
      if (attempt > 0) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // Max 5s
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        // Adicionar headers para melhorar compatibilidade
        headers: {
          ...options.headers,
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      
      clearTimeout(timeoutId);
      
      // Se a resposta não for OK, mas não for erro de rede, retornar
      if (!response.ok && response.status >= 400 && response.status < 500) {
        return response; // Erros 4xx não devem fazer retry
      }
      
      // Se for sucesso ou erro 5xx, retornar (5xx pode fazer retry)
      return response;
    } catch (error: any) {
      clearTimeout(timeoutId);
      lastError = error;
      
      // Se não for timeout ou erro de rede, não fazer retry
      if (error.name !== 'AbortError' && 
          !error.message?.toLowerCase().includes('failed to fetch') &&
          !error.message?.toLowerCase().includes('network')) {
        throw error;
      }
      
      // Se for a última tentativa, lançar erro
      if (attempt === retries) {
        if (error.name === 'AbortError') {
          throw new Error('Timeout: A requisição demorou muito para responder após múltiplas tentativas');
        }
        throw error;
      }
    }
  }
  
  // Se chegou aqui, todas as tentativas falharam
  if (lastError) {
    throw lastError;
  }
  
  throw new Error('Falha na requisição após múltiplas tentativas');
};

/**
 * Obtém IP do visitante de forma não bloqueante (background)
 * Retorna 'unknown' imediatamente e tenta obter IP em background sem gerar erros no console
 * @returns 'unknown' imediatamente (não bloqueante)
 */
export const getVisitorIP = async (): Promise<string> => {
  // Verificar cache primeiro
  const cacheKey = 'phdstudio_visitor_ip';
  const cached = sessionStorage.getItem(cacheKey);
  if (cached && cached !== 'unknown') {
    return cached;
  }

  // Retornar 'unknown' imediatamente (não bloqueante)
  // Tentar obter IP em background sem gerar erros visíveis
  (async () => {
    try {
      // Usar apenas um serviço, sem headers que causam preflight CORS
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500); // 1.5s timeout (mais rápido)
      
      // Tentar serviço sem headers para evitar preflight
      const response = await fetch('https://api.ipify.org?format=json', {
        method: 'GET',
        signal: controller.signal,
        // Sem headers para evitar preflight CORS
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        try {
          const data = await response.json();
          const ip = data.ip || 'unknown';
          
          // Cachear resultado apenas se válido
          if (ip && ip !== 'unknown') {
            sessionStorage.setItem(cacheKey, ip);
          }
        } catch (parseError) {
          // Silenciar erros de parse
        }
      }
    } catch (error: any) {
      // Silenciar completamente TODOS os erros
      // Não logar, não expor, não gerar warnings no console
      // Apenas ignorar silenciosamente
    }
  })().catch(() => {
    // Silenciar qualquer erro não tratado
  });
  
  // Retornar 'unknown' imediatamente (não bloqueia)
  return 'unknown';
};

