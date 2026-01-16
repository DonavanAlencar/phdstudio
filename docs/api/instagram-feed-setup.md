# Configuração do Feed do Instagram

## Problema Resolvido

O feed do Instagram parou de funcionar porque o token de acesso expirou. A solução implementada:

1. ✅ Criado endpoint na API (`/api/instagram/posts`) para buscar posts do Instagram
2. ✅ Token movido para variável de ambiente (não mais hardcoded no frontend)
3. ✅ Componente atualizado para usar o endpoint da API
4. ✅ Segurança melhorada (token não exposto no frontend)

## Como Obter um Novo Token do Instagram

### Opção 1: Facebook Graph API Explorer (Recomendado)

1. Acesse: https://developers.facebook.com/tools/explorer/
2. Selecione seu App do Facebook (ou crie um novo)
3. Selecione a página do Instagram Business conectada
4. Adicione as seguintes permissões:
   - `instagram_basic`
   - `pages_read_engagement`
   - `pages_show_list`
5. Gere um token de acesso
6. Para um token de longa duração (60 dias):
   - Acesse: https://developers.facebook.com/tools/accesstoken/
   - Clique em "Extend Access Token"
   - Copie o token estendido

### Opção 2: Token de Longa Duração via API

```bash
# 1. Obtenha um token de curta duração (1-2 horas) do Graph API Explorer
# 2. Use este comando para estender para 60 dias:

curl -X GET "https://graph.facebook.com/v22.0/oauth/access_token?grant_type=fb_exchange_token&client_id=SEU_APP_ID&client_secret=SEU_APP_SECRET&fb_exchange_token=TOKEN_CURTA_DURACAO"
```

## Configuração

### 1. Adicionar Token no Ambiente

**Produção** (arquivo `.env` na raiz do projeto):
```bash
INSTAGRAM_ACCESS_TOKEN=seu_token_aqui
INSTAGRAM_USER_ID=17841403453191047
INSTAGRAM_API_VERSION=v22.0
```

**Desenvolvimento** (arquivo `api/env.dev`):
```bash
INSTAGRAM_ACCESS_TOKEN=seu_token_aqui
INSTAGRAM_USER_ID=17841403453191047
INSTAGRAM_API_VERSION=v22.0
```

### 2. Frontend (opcional)

Se quiser usar uma URL customizada da API:
```bash
VITE_INSTAGRAM_API_URL=https://phdstudio.com.br/api/instagram
```

### 3. Reiniciar a API

Após adicionar o token, reinicie o servidor da API:

```bash
# Docker
docker-compose restart phd-api

# Ou localmente
cd api && npm start
```

## Testando

### Testar o Endpoint

```bash
curl https://phdstudio.com.br/api/instagram/posts
```

**Resposta esperada:**
```json
{
  "success": true,
  "data": [
    {
      "id": "123456789",
      "media_type": "IMAGE",
      "media_url": "https://...",
      "caption": "Texto do post...",
      "permalink": "https://www.instagram.com/p/...",
      "like_count": 100,
      "comments_count": 10
    }
  ],
  "count": 9
}
```

### Verificar Logs

Se houver erro, verifique os logs da API:
```bash
docker-compose logs -f phd-api
```

## Troubleshooting

### Erro: "Session has expired"
- **Solução**: O token expirou. Obtenha um novo token seguindo as instruções acima.

### Erro: "Invalid OAuth access token"
- **Solução**: Verifique se o token está correto e se tem as permissões necessárias.

### Erro: "User does not have permission"
- **Solução**: Verifique se a página do Instagram Business está conectada ao App do Facebook e se tem as permissões corretas.

### Feed não aparece no site
- **Solução**: 
  1. Verifique se o token está configurado no `.env`
  2. Verifique os logs da API para erros
  3. Abra o console do navegador (F12) e verifique se há erros de rede
  4. Verifique se a URL da API está correta: `VITE_INSTAGRAM_API_URL`

## Notas Importantes

- ⚠️ Tokens de curta duração expiram em 1-2 horas
- ✅ Tokens de longa duração expiram em 60 dias
- 🔄 Configure um lembrete para renovar o token antes de expirar
- 🔒 O token agora está seguro no backend (não exposto no frontend)

## Estrutura de Arquivos

```
api/
  routes/
    instagram.js          # Endpoint da API do Instagram
  server.js              # Registro da rota
  env.dev                # Variáveis de ambiente (dev)

src/
  components/
    InstagramCarousel.tsx # Componente React atualizado

env.example              # Template de variáveis de ambiente
env.dev                  # Variáveis de ambiente frontend (dev)
```
