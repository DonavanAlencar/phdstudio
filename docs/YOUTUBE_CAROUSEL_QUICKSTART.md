# YouTube Carousel - Quick Start Guide

## ⚡ Quick Setup (5 minutos)

### 1. Obter API Key do YouTube

1. Acesse: https://console.cloud.google.com/apis/credentials
2. Crie um projeto ou selecione existente
3. Ative a **YouTube Data API v3**
4. Crie uma **Chave de API**
5. Copie a chave gerada

### 2. Configurar Restrições (Segurança)

Na mesma página da API Key:
- **Restrições da aplicação** → "Referenciadores HTTP"
- Adicione:
  ```
  https://phdstudio.com.br/*
  http://localhost:*/*
  ```
- **Restrições de API** → Marque apenas "YouTube Data API v3"
- Salve

### 3. Adicionar ao Projeto

Crie arquivo `.env` na raiz do projeto:

```bash
cp .env.example .env
```

Edite `.env` e adicione sua chave:

```env
VITE_YOUTUBE_API_KEY=SUA_CHAVE_AQUI
VITE_YOUTUBE_PLAYLIST_ID=PLZ_eiyZByK0GPtwxJspv8n9tkkKYFmXYa
VITE_YOUTUBE_CHANNEL_ID=UCxasZ2ECtL0RH4iV6Cjsv3g
```

### 4. Testar

```bash
npm run dev
```

Acesse http://localhost:5173 e verifique se os vídeos aparecem! 🎉

---

## 📍 Onde está o carrossel?

O carrossel está integrado na página inicial, entre as seções de **Cases** e **Depoimentos**.

**Arquivo:** `App.tsx` (linha 2675)

---

## 🎨 Personalização Rápida

### Alterar quantidade de vídeos

Edite `src/components/YouTubeCarousel.tsx` linha 14:

```typescript
const data = await fetchPlaylistVideos(9); // Altere o número aqui
```

### Alterar cor (vermelho → azul)

Busque e substitua no arquivo `YouTubeCarousel.tsx`:
- `bg-red-600` → `bg-blue-600`
- `text-red-600` → `text-blue-600`
- `hover:bg-red-600` → `hover:bg-blue-600`

---

## ❓ Problemas Comuns

### Vídeos não aparecem

**Verifique:**
1. ✅ API Key está no `.env`
2. ✅ Playlist ID ou Channel ID está correto
3. ✅ Console do navegador (F12) não mostra erros

### Erro: API_KEY_HTTP_REFERRER_BLOCKED

**Solução:** Adicione seu domínio às restrições de HTTP Referrer no Google Cloud Console

---

## 📚 Documentação Completa

Para mais detalhes, consulte:
- [docs/YOUTUBE_CAROUSEL_SETUP.md](file:///d:/Phellipe/PHD/Clientes/Projetos%20Git/phdstudio/docs/YOUTUBE_CAROUSEL_SETUP.md)

---

**Desenvolvido por:** PHD Studio  
**Última atualização:** Janeiro 2026
