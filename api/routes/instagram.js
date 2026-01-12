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
      console.warn('⚠️  INSTAGRAM_ACCESS_TOKEN não configurado');
      return res.status(503).json({
        success: false,
        error: 'Instagram feed não configurado',
        message: 'Token de acesso do Instagram não está configurado'
      });
    }

    const apiVersion = process.env.INSTAGRAM_API_VERSION || 'v22.0';
    const limit = parseInt(req.query.limit) || 9;
    
    const url = `https://graph.facebook.com/${apiVersion}/${IG_USER_ID}/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,like_count,comments_count&access_token=${accessToken}&limit=${limit}`;

    // Fazer requisição para Facebook Graph API
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Erro ao buscar posts do Instagram:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      
      return res.status(response.status).json({
        success: false,
        error: 'Erro ao buscar posts do Instagram',
        message: errorData.error?.message || 'Falha na comunicação com a API do Instagram',
        details: errorData.error
      });
    }

    const data = await response.json();
    
    if (!data.data || !Array.isArray(data.data)) {
      console.error('❌ Resposta inválida da API do Instagram:', data);
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
    console.error('❌ Erro ao processar requisição do Instagram:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno ao buscar posts do Instagram',
      message: error.message
    });
  }
});

export default router;
