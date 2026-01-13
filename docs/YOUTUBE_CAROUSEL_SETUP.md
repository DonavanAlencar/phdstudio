# YouTube Carousel - Guia de Configuração Completo

## 📋 Visão Geral

O carrossel de vídeos do YouTube está totalmente integrado ao site da PHD Studio. Ele sincroniza automaticamente com sua playlist ou canal do YouTube, exibindo os vídeos mais recentes sem necessidade de atualização manual.

## 🔑 Pré-requisitos

### 1. Obter YouTube Data API Key

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Crie um novo projeto ou selecione um existente
3. Ative a **YouTube Data API v3**:
   - Vá em "APIs e Serviços" → "Biblioteca"
   - Busque por "YouTube Data API v3"
   - Clique em "Ativar"
4. Crie credenciais:
   - Vá em "APIs e Serviços" → "Credenciais"
   - Clique em "+ CRIAR CREDENCIAIS" → "Chave de API"
   - Copie a chave gerada

### 2. Configurar Restrições da API Key (Recomendado)

Para segurança, configure restrições de HTTP Referrer:

1. No Google Cloud Console, clique na chave de API criada
2. Em "Restrições da aplicação", selecione "Referenciadores HTTP"
3. Adicione seus domínios:
   ```
   https://phdstudio.com.br/*
   http://localhost:*/*
   https://localhost:*/*
   ```
4. Em "Restrições de API", selecione "Restringir chave"
5. Marque apenas "YouTube Data API v3"
6. Salve as alterações

### 3. Obter IDs do YouTube

#### Playlist ID (Opcional)
- Formato: `PLxxxxxxxxxx`
- Como obter:
  1. Acesse sua playlist no YouTube
  2. Copie o ID da URL: `youtube.com/playlist?list=PLZ_eiyZByK0GPtwxJspv8n9tkkKYFmXYa`
  3. O ID é: `PLZ_eiyZByK0GPtwxJspv8n9tkkKYFmXYa`

#### Channel ID (Opcional)
- Formato: `UCxxxxxxxxxx`
- Como obter:
  1. Acesse [YouTube Studio](https://studio.youtube.com/)
  2. Vá em "Configurações" → "Canal" → "Configurações avançadas"
  3. Copie o "ID do canal"
  4. Ou use: `UCxasZ2ECtL0RH4iV6Cjsv3g` (PHD Studio)

## ⚙️ Configuração

### 1. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto (se ainda não existir):

```bash
# Copiar do exemplo
cp .env.example .env
```

Edite o arquivo `.env` e adicione suas credenciais:

```env
# YouTube API Configuration
VITE_YOUTUBE_API_KEY=SUA_CHAVE_API_AQUI

# Playlist ID (opcional se usar Channel ID)
VITE_YOUTUBE_PLAYLIST_ID=PLZ_eiyZByK0GPtwxJspv8n9tkkKYFmXYa

# Channel ID (usado como fallback)
VITE_YOUTUBE_CHANNEL_ID=UCxasZ2ECtL0RH4iV6Cjsv3g
```

### 2. Comportamento da Configuração

O carrossel funciona com três modos:

| Configuração | Comportamento |
|--------------|---------------|
| **API Key + Playlist ID** | Exibe vídeos da playlist específica |
| **API Key + Channel ID** | Exibe todos os uploads do canal |
| **API Key + Ambos** | Usa Playlist ID (prioridade) |
| **Sem API Key** | Exibe mensagem de erro amigável |

## 🎨 Personalização

### Alterar Quantidade de Vídeos

Edite `src/components/YouTubeCarousel.tsx`:

```typescript
// Linha 14 - Altere o número 9 para a quantidade desejada
const data = await fetchPlaylistVideos(9); // Altere aqui
```

### Alterar Cores

Substitua as classes do Tailwind no componente:

```typescript
// Vermelho da marca → Azul
className="bg-red-600" → className="bg-blue-600"
className="text-red-600" → className="text-blue-600"
className="hover:bg-red-600" → className="hover:bg-blue-600"
```

### Alterar Largura dos Cards

Edite `src/components/YouTubeCarousel.tsx`:

```typescript
// Linha 24 - Altere scrollAmount
const scrollAmount = 340; // Largura do card (320px) + gap (20px)

// Linha 106 - Altere largura do card
className="w-[320px]" // Altere para w-[400px], por exemplo
```

### Alterar Textos

```typescript
// Linha 52 - Título da seção
<h2>Portfólio Audiovisual PHD Studio</h2>

// Linha 54-56 - Descrição
<p>Produções de alto impacto que conectam sua marca ao público certo.</p>

// Linha 60 - Link do canal
href="https://www.youtube.com/@phdstudiobr"
```

## 🚀 Execução Local

### Instalar Dependências

```bash
npm install
```

### Iniciar Servidor de Desenvolvimento

```bash
npm run dev
```

Acesse: http://localhost:5173

### Build para Produção

```bash
npm run build
```

## ✅ Verificação

### Checklist de Funcionamento

- [ ] Seção do carrossel aparece na página
- [ ] Thumbnails dos vídeos carregam corretamente
- [ ] Duração aparece em cada vídeo
- [ ] Botões de navegação funcionam (desktop)
- [ ] Swipe funciona (mobile)
- [ ] Modal abre ao clicar em um vídeo
- [ ] Vídeo toca automaticamente no modal
- [ ] Botão "Ver Canal Completo" redireciona corretamente

### Testar sem API Key

1. Remova `VITE_YOUTUBE_API_KEY` do `.env`
2. Recarregue a página
3. Deve exibir: "Nenhum vídeo encontrado na playlist ou API não configurada"

### Verificar Console do Navegador

Abra DevTools (F12) e verifique:

**Com API Key válida:**
```
✅ Nenhum erro relacionado ao YouTube
```

**Sem API Key:**
```
⚠️ VITE_YOUTUBE_API_KEY não configurada. O carrossel do YouTube não funcionará.
```

## 🐛 Troubleshooting

### Erro: `API_KEY_HTTP_REFERRER_BLOCKED`

**Causa:** Restrições de HTTP Referrer bloqueando a requisição

**Solução:**
1. Acesse [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Edite sua API Key
3. Adicione seu domínio às restrições de HTTP Referrer
4. Inclua também `http://localhost:*/*` para desenvolvimento local

### Vídeos não aparecem

**Verificar:**
1. ✅ API Key está correta no `.env`
2. ✅ Playlist ID ou Channel ID está correto
3. ✅ Console do navegador não mostra erros
4. ✅ Quota da API não foi excedida (10.000 unidades/dia)

**Testar API manualmente:**
```bash
# Substitua YOUR_API_KEY e YOUR_PLAYLIST_ID
curl "https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=5&playlistId=YOUR_PLAYLIST_ID&key=YOUR_API_KEY"
```

### Performance lenta

**Otimizações:**

1. **Reduzir quantidade de vídeos:**
   ```typescript
   const data = await fetchPlaylistVideos(6); // Menos vídeos
   ```

2. **Implementar cache (opcional):**
   ```typescript
   // Adicionar em src/utils/youtube.ts
   const CACHE_KEY = 'youtube_videos_cache';
   const CACHE_DURATION = 1000 * 60 * 30; // 30 minutos
   
   // Verificar cache antes de fazer requisição
   const cached = localStorage.getItem(CACHE_KEY);
   if (cached) {
     const { data, timestamp } = JSON.parse(cached);
     if (Date.now() - timestamp < CACHE_DURATION) {
       return data;
     }
   }
   ```

### Quota da API excedida

**Uso por requisição:**
- `playlistItems.list`: 1 unidade
- `videos.list`: 1 unidade
- **Total por carregamento:** ~2-3 unidades

**Limite diário:** 10.000 unidades (suficiente para ~3.000-5.000 visualizações/dia)

**Solução se exceder:**
1. Implementar cache com localStorage
2. Aumentar quota no Google Cloud Console (pode ter custo)
3. Reduzir frequência de atualização

### Modal não abre no mobile

**Verificar:**
1. Certifique-se de que não há conflitos com outros event listeners
2. Teste em diferentes navegadores mobile
3. Verifique se há erros no console

### Vídeo não toca automaticamente

**Causa:** Políticas de autoplay dos navegadores

**Solução:** O vídeo está configurado com `autoplay=1` no iframe. Alguns navegadores podem bloquear autoplay com som. Isso é comportamento esperado e não pode ser contornado.

## 📊 Uso da API

### Monitorar Quota

1. Acesse [Google Cloud Console](https://console.cloud.google.com/apis/api/youtube.googleapis.com/quotas)
2. Visualize o uso em tempo real
3. Configure alertas se necessário

### Custos

- **Quota gratuita:** 10.000 unidades/dia
- **Custo adicional:** Consulte a [tabela de preços do Google](https://developers.google.com/youtube/v3/determine_quota_cost)

## 🔗 Recursos Adicionais

- [YouTube Data API Documentation](https://developers.google.com/youtube/v3)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Quota Calculator](https://developers.google.com/youtube/v3/determine_quota_cost)

## 📝 Notas Importantes

> **⚠️ Segurança**
> - Nunca commite o arquivo `.env` com suas credenciais
> - Use sempre restrições de HTTP Referrer na API Key
> - Rotacione a API Key periodicamente

> **💡 Dica**
> - A playlist é atualizada automaticamente quando você adiciona novos vídeos
> - Não é necessário fazer deploy ou atualizar código
> - O cache do navegador pode demorar alguns minutos para atualizar

---

**Desenvolvido por:** PHD Studio  
**Última atualização:** Janeiro 2026
