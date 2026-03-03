/**
 * Rotas públicas para sincronizar o carrossel de posts do blog
 * Fonte: https://www.phdstudio.blog.br/blog
 */

import express from 'express';
import axios from 'axios';

const router = express.Router();

/**
 * GET /api/blog/posts
 * Retorna uma lista resumida dos últimos posts do blog
 */
router.get('/posts', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 4;

    const response = await axios.get('https://www.phdstudio.blog.br/blog', {
      timeout: 8000,
      headers: {
        'User-Agent': 'phdstudio-blog-sync/1.0',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    const html = response.data as string;

    // Extração simples baseada em padrões de texto da página Wix.
    // Em produção, o ideal é substituir por uma API oficial ou RSS.
    const sections = html.split('\n').filter((line) => line.startsWith('## '));

    const posts = [];

    for (let i = 0; i < sections.length && posts.length < limit; i++) {
      const titleLine = sections[i];
      const title = titleLine.replace(/^## /, '').trim();

      // Procurar trecho de descrição logo após o título
      const titleIndex = html.indexOf(titleLine);
      if (titleIndex === -1) continue;

      const snippetStart = html.indexOf('\n', titleIndex) + 1;
      const snippetEnd = html.indexOf('\n', snippetStart);
      const rawExcerpt =
        snippetStart > 0 && snippetEnd > snippetStart
          ? html.slice(snippetStart, snippetEnd).trim()
          : '';

      const excerpt =
        rawExcerpt && !rawExcerpt.startsWith('## ')
          ? rawExcerpt
          : 'Conteúdo tecnológico de qualidade direto do PHD Insights.';

      // Mapear categorias simples pelas palavras-chave do título
      let category = 'PHD Insights';
      if (title.toLowerCase().includes('seo') || title.toLowerCase().includes('tráfego')) {
        category = 'SEO & Growth';
      } else if (title.toLowerCase().includes('científicas') || title.toLowerCase().includes('ciência')) {
        category = 'Ciência & Inovação';
      } else if (title.toLowerCase().includes('marketing ético')) {
        category = 'Estratégia & Ética';
      } else if (title.toLowerCase().includes('ia') || title.toLowerCase().includes('inteligência artificial')) {
        category = 'IA & Futuro';
      }

      posts.push({
        id: `blog-${i}`,
        title,
        excerpt,
        category,
        // Usamos imagens temáticas estáticas para manter a estética visual
        image:
          'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=800&auto=format&fit=crop',
        url: 'https://www.phdstudio.blog.br/blog',
      });
    }

    if (posts.length === 0) {
      return res.json({
        success: true,
        data: [],
      });
    }

    res.json({
      success: true,
      data: posts.slice(0, limit),
    });
  } catch (error) {
    console.error('Erro ao sincronizar posts do blog:', error.message || error);

    // Não derrubar o frontend: responder sucesso com lista vazia
    return res.json({
      success: true,
      data: [],
    });
  }
});

export default router;

