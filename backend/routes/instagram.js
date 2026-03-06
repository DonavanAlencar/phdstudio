/**
 * Rotas do Instagram Feed
 * Busca posts do Instagram via Facebook Graph API
 */

import express from 'express';
import axios from 'axios';
import dns from 'dns';

// Forçar IPv4 primeiro para evitar problemas de conectividade
dns.setDefaultResultOrder('ipv4first');

const router = express.Router();

// Instagram User ID (phdstudiooficial)
const IG_USER_ID = process.env.INSTAGRAM_USER_ID || "17841403453191047";

// Cache simples em memória
let cache = {
  ts: 0,
  data: null
};
const CACHE_TTL_MS = parseInt(process.env.INSTAGRAM_CACHE_TTL || '300000', 10); // 5 minutos

/**
 * GET /api/instagram/posts
 * Busca posts do Instagram
 * Público (sem autenticação necessária)
 */
router.get('/posts', async (req, res) => {
  try {
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
    
    if (!accessToken) {
      return res.status(503).json({
        success: false,
        error: 'Instagram feed não configurado',
        message: 'Token de acesso do Instagram não está configurado'
      });
    }

    const apiVersion = process.env.INSTAGRAM_API_VERSION || 'v22.0';
    const limit = Math.min(parseInt(req.query.limit) || 8, 12);
    const now = Date.now();
    if (cache.data && now - cache.ts < CACHE_TTL_MS) {
      const sliced = cache.data.slice(0, limit);
      return res.json({ success: true, data: sliced, count: sliced.length });
    }
    
    const url = `https://graph.facebook.com/${apiVersion}/${IG_USER_ID}/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,like_count,comments_count,timestamp&access_token=${accessToken}&limit=${limit}&v=${Date.now()}`;

    console.log(`📸 [Instagram] Buscando posts do Instagram de: ${IG_USER_ID}`);
    
    // Função para fazer requisição com retry usando axios
    // Axios oferece melhor compatibilidade e tratamento de erros
    const axiosWithRetry = async (url, retries = 3, timeout = 60000) => {
      for (let attempt = 0; attempt < retries; attempt++) {
        try {
          if (attempt > 0) {
            console.log(`🔄 [Instagram] Tentativa ${attempt + 1}/${retries}...`);
            // Esperar antes de tentar novamente (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
          }
          
          const response = await axios.get(url, {
            timeout: timeout,
            headers: {
              'User-Agent': 'phdstudio-instagram-feed/1.0',
              'Accept': 'application/json',
              'Accept-Encoding': 'gzip, deflate',
              'Connection': 'keep-alive'
            },
            // Configurações adicionais para melhorar conectividade
            validateStatus: (status) => status >= 200 && status < 500, // Não lançar erro para 4xx
            // Axios usa http/https do Node.js nativo que pode ter melhor compatibilidade
            maxRedirects: 5,
            // Forçar IPv4 para evitar problemas de conectividade
            family: 4,
            // Configurações de DNS
            lookup: dns.lookup
          });
          
          return response;
        } catch (axiosError) {
          // Se é a última tentativa, lançar o erro
          if (attempt === retries - 1) {
            throw axiosError;
          }
          
          // Log do erro (mas não finalizar ainda)
          console.warn(`⚠️ [Instagram] Tentativa ${attempt + 1} falhou: ${axiosError.code || axiosError.message}`);
        }
      }
    };
    
    // Fazer requisição com retry e timeout de 60 segundos usando axios
    let response;
    try {
      response = await axiosWithRetry(url, 3, 60000);
    } catch (axiosError) {
      // Log detalhado do erro
      console.error('❌ [Instagram] Erro ao buscar posts:', {
        message: axiosError.message,
        code: axiosError.code,
        response: axiosError.response?.status,
        responseData: axiosError.response?.data,
        stack: axiosError.stack?.substring(0, 500)
      });
      
      // Verificar se é erro de timeout
      if (axiosError.code === 'ECONNABORTED' || axiosError.code === 'ETIMEDOUT') {
        console.error('❌ [Instagram] Timeout ao buscar posts');
        return res.status(504).json({
          success: false,
          error: 'Timeout ao buscar posts do Instagram',
          message: 'A requisição demorou muito para responder. Tente novamente.'
        });
      }
      
      // Verificar se é erro de conexão/rede
      const errorMessage = axiosError.message?.toLowerCase() || '';
      const errorCode = axiosError.code;
      
      const isNetworkError = errorCode === 'ETIMEDOUT' || 
                             errorCode === 'ECONNREFUSED' ||
                             errorCode === 'ENOTFOUND' ||
                             errorCode === 'ECONNRESET' ||
                             errorCode === 'ENETUNREACH' ||
                             errorMessage.includes('timeout') || 
                             errorMessage.includes('network') ||
                             errorMessage.includes('getaddrinfo') ||
                             errorMessage.includes('connect');
      
      if (isNetworkError) {
        console.error('❌ [Instagram] Erro de conexão:', errorCode || errorMessage);
        return res.status(503).json({
          success: false,
          error: 'Serviço temporariamente indisponível',
          message: 'Não foi possível conectar à API do Instagram. Tente novamente mais tarde.',
          details: process.env.NODE_ENV === 'development' ? {
            errorCode,
            errorMessage: axiosError.message
          } : undefined
        });
      }
      
      // Verificar se é erro da API do Facebook (4xx, 5xx)
      if (axiosError.response) {
        const errorData = axiosError.response.data || {};
        return res.status(axiosError.response.status).json({
          success: false,
          error: 'Erro ao buscar posts do Instagram',
          message: errorData.error?.message || 'Falha na comunicação com a API do Instagram',
          details: errorData.error
        });
      }
      
      console.error('❌ [Instagram] Erro inesperado:', axiosError);
      throw axiosError;
    }
    
    // Extrair dados da resposta do axios
    const data = response.data;
    
    if (!data.data || !Array.isArray(data.data)) {
      return res.status(500).json({
        success: false,
        error: 'Resposta inválida da API do Instagram',
        message: 'Formato de dados inesperado'
      });
    }

    // Formatar dados para o frontend
    const posts = data.data
      .map(post => ({
        id: post.id,
        media_type: post.media_type || 'IMAGE',
        media_url: post.media_url || '',
        thumbnail_url: post.thumbnail_url || post.media_url || '',
        caption: post.caption || '',
        permalink: post.permalink || `https://www.instagram.com/phdstudiooficial`,
        like_count: post.like_count || 0,
        comments_count: post.comments_count || 0,
        timestamp: post.timestamp || null
      }))
      .sort((a, b) => {
        const ta = a.timestamp ? new Date(a.timestamp).getTime() : 0;
        const tb = b.timestamp ? new Date(b.timestamp).getTime() : 0;
        return tb - ta;
      });

    cache = { ts: now, data: posts };

    res.json({
      success: true,
      data: posts,
      count: posts.length
    });
  } catch (error) {
    // Se já foi enviada resposta, não enviar novamente
    if (res.headersSent) {
      return;
    }

    // Log detalhado do erro no handler externo
    const isAxiosError = error.isAxiosError || !!error.response || !!error.request;
    if (isAxiosError) {
      console.error('❌ [Instagram] Erro no handler externo /posts:', {
        message: error.message,
        code: error.code,
        responseStatus: error.response?.status,
        responseData: error.response?.data,
        requestUrl: error.config?.url,
        requestMethod: error.config?.method,
        stack: error.stack?.substring(0, 500)
      });
    } else {
      console.error('❌ [Instagram] Erro inesperado no handler externo /posts:', {
        message: error.message,
        code: error.code,
        stack: error.stack?.substring(0, 500)
      });
    }

    // Verificar se é erro de timeout ou conexão no catch externo também
    const errorCode = error.code || error.cause?.code || error.cause?.cause?.code;
    const errorMessage = error.message?.toLowerCase() || '';
    
    // Tratar erros específicos do axios
    if (errorCode === 'ETIMEDOUT' || 
        errorCode === 'ECONNABORTED' ||
        errorCode === 'ECONNREFUSED' ||
        errorCode === 'ENOTFOUND' ||
        errorMessage.includes('timeout') || 
        errorMessage.includes('network')) {
      return res.status(503).json({
        success: false,
        error: 'Serviço temporariamente indisponível',
        message: 'Não foi possível conectar à API do Instagram. Tente novamente mais tarde.'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Erro interno ao buscar posts do Instagram',
      message: error.message
    });
  }
});

export default router;
