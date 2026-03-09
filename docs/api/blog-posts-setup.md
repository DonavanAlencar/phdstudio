# Carrossel de blog – fonte dos posts

O **site principal (phdstudio.com.br) é React**. O carrossel "PHD Insights" na home busca os posts de uma fonte externa configurável.

## Ordem de uso no backend

A API `GET /api/blog/posts` usa, nesta ordem:

1. **`BLOG_API_URL`** (opcional) – URL de uma API JSON que devolve os posts (blog em React, Headless CMS, etc.).
2. **`WP_URL`** (opcional) – WordPress: REST API `wp-json/wp/v2/posts` e depois RSS `.../feed/`.
3. **`BLOG_RSS_URL`** (opcional) – URL direta de um feed RSS (usado como fallback quando há `WP_URL` ou como fonte única se não houver WordPress).

## Variáveis de ambiente (container `phd-api`)

| Variável       | Descrição |
|----------------|-----------|
| `BLOG_API_URL` | URL da API do blog (ex.: `https://www.phdstudio.blog.br/api/posts`). Resposta esperada: JSON com array em `data` ou raiz, cada item com `id`, `title`, `excerpt`, `url`, `featured_image`, `publish_date` (ou `date`). Quando definida, esta fonte é tentada primeiro. |
| `BLOG_RSS_URL` | URL do feed RSS (ex.: `https://www.phdstudio.blog.br/feed/`). Usado como fallback ou fonte única. |
| `WP_URL`       | Base do WordPress (ex.: `https://www.phdstudio.blog.br`). Só é usado se `BLOG_API_URL` não resolver; tenta `wp-json/wp/v2/posts` e depois `.../feed/`. |
| `BLOG_CACHE_TTL` | TTL do cache em ms (padrão: 600000 = 10 min). |

## Exemplo: blog em React com API própria

Se o blog estiver em React e expuser algo como `GET /api/posts` retornando:

```json
{
  "data": [
    {
      "id": "1",
      "title": "Título",
      "excerpt": "Resumo...",
      "url": "https://www.phdstudio.blog.br/post/1",
      "featured_image": "https://...",
      "publish_date": "2025-03-09T12:00:00.000Z"
    }
  ]
}
```

No servidor, defina no ambiente do `phd-api`:

```bash
BLOG_API_URL=https://www.phdstudio.blog.br/api/posts
```

Assim o carrossel do site React principal passa a usar apenas essa API, sem WordPress.

## Fallback no frontend

Se `/api/blog/posts` retornar 502 ou erro, o frontend tenta carregar os posts diretamente via RSS no navegador (URL configurada em `src/utils/blog.ts`), para o carrossel continuar funcionando mesmo com a API indisponível.
