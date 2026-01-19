/**
 * Rotas do Instagram Feed
 * Busca posts do Instagram via Facebook Graph API
 */

import express from 'express';

const router = express.Router();

// Instagram User ID (phdstudiooficial)
const IG_USER_ID = process.env.INSTAGRAM_USER_ID || "17841403453191047";

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
    const limit = parseInt(req.query.limit) || 9;
    
    const url = `https://graph.facebook.com/${apiVersion}/${IG_USER_ID}/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,like_count,comments_count&access_token=${accessToken}&limit=${limit}`;

    console.log(`📸 [Instagram] Buscando posts do Instagram de: ${IG_USER_ID}`);
    
    // Função para fazer requisição com retry
    const fetchWithRetry = async (url, retries = 2, timeout = 30000) => {
      for (let attempt = 0; attempt < retries; attempt++) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), timeout);
          
          if (attempt > 0) {
            console.log(`🔄 [Instagram] Tentativa ${attempt + 1}/${retries}...`);
            // Esperar antes de tentar novamente (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          }
          
          const response = await fetch(url, {
            signal: controller.signal,
            // Adicionar headers adicionais para melhorar conexão
            headers: {
              'Connection': 'keep-alive',
              'User-Agent': 'phdstudio-instagram-feed/1.0'
            }
          });
          
          clearTimeout(timeoutId);
          return response;
        } catch (fetchError) {
          if (attempt === retries - 1) {
            throw fetchError;
          }
          console.warn(`⚠️ [Instagram] Tentativa ${attempt + 1} falhou, tentando novamente...`);
        }
      }
    };
    
    // Fazer requisição com retry e timeout de 30 segundos
    let response;
    try {
      response = await fetchWithRetry(url, 2, 30000);
    } catch (fetchError) {
      
      // Log detalhado do erro
      console.error('❌ [Instagram] Erro ao buscar posts:', {
        name: fetchError.name,
        message: fetchError.message,
        code: fetchError.code,
        cause: fetchError.cause?.code,
        causeMessage: fetchError.cause?.message,
        stack: fetchError.stack?.substring(0, 500)
      });
      
      if (fetchError.name === 'AbortError' || fetchError.cause?.name === 'AbortError') {
        console.error('❌ [Instagram] Timeout ao buscar posts');
        return res.status(504).json({
          success: false,
          error: 'Timeout ao buscar posts do Instagram',
          message: 'A requisição demorou muito para responder. Tente novamente.'
        });
      }
      
      // Tratar erros de rede (ETIMEDOUT, ECONNREFUSED, etc)
      const errorMessage = fetchError.message?.toLowerCase() || '';
      const errorCode = fetchError.cause?.code || fetchError.code;
      const errorCauseCode = fetchError.cause?.cause?.code || fetchError.cause?.code;
      
      // Verificar se é erro de timeout ou conexão falhada
      const isTimeoutError = errorCode === 'ETIMEDOUT' || 
                             errorCauseCode === 'ETIMEDOUT' ||
                             errorCode === 'ECONNREFUSED' ||
                             errorCauseCode === 'ECONNREFUSED' ||
                             errorCode === 'ENOTFOUND' ||
                             errorCauseCode === 'ENOTFOUND' ||
                             errorMessage.includes('timeout') || 
                             errorMessage.includes('fetch failed') ||
                             errorMessage.includes('network') ||
                             fetchError.message === 'fetch failed';
      
      if (isTimeoutError) {
        console.error('❌ [Instagram] Erro de conexão:', errorCode || errorMessage);
        return res.status(503).json({
          success: false,
          error: 'Serviço temporariamente indisponível',
          message: 'Não foi possível conectar à API do Instagram. Tente novamente mais tarde.',
          details: process.env.NODE_ENV === 'development' ? {
            errorCode,
            errorMessage: fetchError.message
          } : undefined
        });
      }
      
      console.error('❌ [Instagram] Erro inesperado:', fetchError);
      throw fetchError;
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      return res.status(response.status).json({
        success: false,
        error: 'Erro ao buscar posts do Instagram',
        message: errorData.error?.message || 'Falha na comunicação com a API do Instagram',
        details: errorData.error
      });
    }

    const data = await response.json();
    
    if (!data.data || !Array.isArray(data.data)) {
      return res.status(500).json({
        success: false,
        error: 'Resposta inválida da API do Instagram',
        message: 'Formato de dados inesperado'
      });
    }

    // Formatar dados para o frontend
    const posts = data.data.map(post => ({
      id: post.id,
      media_type: post.media_type || 'IMAGE',
      media_url: post.media_url || '',
      thumbnail_url: post.thumbnail_url || post.media_url || '',
      caption: post.caption || '',
      permalink: post.permalink || `https://www.instagram.com/phdstudiooficial`,
      like_count: post.like_count || 0,
      comments_count: post.comments_count || 0
    }));

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
    
    // Verificar se é erro de timeout ou conexão no catch externo também
    const errorCode = error.cause?.code || error.cause?.cause?.code || error.code;
    const errorMessage = error.message?.toLowerCase() || '';
    
    if (errorCode === 'ETIMEDOUT' || errorMessage.includes('fetch failed')) {
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
