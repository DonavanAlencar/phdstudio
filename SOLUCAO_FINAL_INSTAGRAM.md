# ✅ Solução Final - Feed do Instagram

## Status Atual

✅ **Token configurado:** Token do Instagram adicionado em `api/.env`  
✅ **Endpoint criado:** `/api/instagram/posts` funcionando  
✅ **Componente atualizado:** Frontend usando endpoint da API  
✅ **Frontend configurado:** Variáveis de ambiente configuradas  

⚠️ **API precisa ser reiniciada:** A API está rodando mas precisa reiniciar para carregar o token

## Problema Identificado

A API está rodando mas não está encontrando o token porque:
1. A API foi iniciada antes de criar o arquivo `.env`
2. O `dotenv.config()` carrega variáveis apenas na inicialização
3. A API precisa ser reiniciada para carregar o novo `.env`

## Solução: Reiniciar a API

### Opção 1: Se a API está rodando localmente (npm run dev)

1. **Encontre o terminal onde a API está rodando**
   - Procure por um terminal com `npm run dev` ou `node --watch server.js`
   - Ou verifique: `ps aux | grep "node.*server.js"`

2. **Pare a API**
   - Pressione `Ctrl+C` no terminal onde a API está rodando

3. **Reinicie a API**
   ```bash
   cd /home/donavan/phdstudio/api
   npm run dev
   ```

### Opção 2: Se a API está rodando via Docker

```bash
# Reiniciar o container da API
docker compose -f docker-compose.local.yml restart phd-api

# Ou parar e iniciar novamente
docker compose -f docker-compose.local.yml stop phd-api
docker compose -f docker-compose.local.yml up phd-api -d

# Ver logs
docker compose -f docker-compose.local.yml logs -f phd-api
```

### Opção 3: Matar o processo e reiniciar (se necessário)

```bash
# Encontrar o PID do processo
ps aux | grep "node.*server.js" | grep -v grep

# Matar o processo (substitua PID pelo número encontrado)
kill PID

# Ou matar todos os processos node server.js
pkill -f "node.*server.js"

# Reiniciar a API
cd /home/donavan/phdstudio/api
npm run dev
```

## Testar Após Reiniciar

Após reiniciar a API, teste o endpoint:

```bash
curl http://localhost:3001/api/instagram/posts
```

**Resposta esperada:**
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "media_type": "IMAGE",
      "media_url": "https://...",
      "caption": "...",
      "permalink": "https://www.instagram.com/p/...",
      "like_count": 100,
      "comments_count": 10
    }
  ],
  "count": 9
}
```

## Verificar no Navegador

1. **Abra o DevTools (F12) → Console**
2. **Recarregue a página**
3. **Procure por:**
   - `📸 Buscando posts do Instagram de: http://localhost:3001/api/instagram/posts`
   - `✅ Resposta da API do Instagram: {success: true, data: [...]}`
   - `✅ X posts do Instagram carregados com sucesso`

## Se Ainda Não Funcionar

1. **Verificar se o token está correto:**
   ```bash
   cd /home/donavan/phdstudio/api
   grep INSTAGRAM_ACCESS_TOKEN .env
   ```

2. **Verificar logs da API:**
   - Se rodando localmente: veja o terminal onde iniciou
   - Se rodando no Docker: `docker compose logs phd-api`

3. **Testar o token diretamente:**
   ```bash
   curl "https://graph.facebook.com/v22.0/17841403453191047/media?fields=id&access_token=TOKEN_AQUI&limit=1"
   ```

## Resumo das Configurações

### Backend (API)
- ✅ Arquivo: `api/.env` criado
- ✅ Token: Configurado
- ✅ Endpoint: `/api/instagram/posts` criado
- ✅ Rota: Registrada em `server.js`
- ⚠️ **Ação necessária:** Reiniciar API

### Frontend
- ✅ Componente: `InstagramCarousel.tsx` atualizado
- ✅ Variáveis: `.env.local` criado
- ✅ URL: Configurada para `http://localhost:3001/api/instagram`
- ✅ Logs: Adicionados para debug

## Próximo Passo

**REINICIAR A API** seguindo uma das opções acima, depois testar o endpoint e recarregar a página no navegador.
