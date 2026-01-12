# 🔧 Correção Rápida - Feed do Instagram

## Problema Identificado

O feed do Instagram não está aparecendo porque:
1. ❌ A API não está rodando em `localhost:3001`
2. ❌ O token do Instagram não está configurado
3. ⚠️ O componente está usando imagens de fallback (Unsplash)

## Solução Rápida

### Opção 1: Rodar API Localmente (Recomendado para Desenvolvimento)

```bash
# 1. Navegar para a pasta da API
cd /home/donavan/phdstudio/api

# 2. Instalar dependências (se necessário)
npm install

# 3. Configurar token do Instagram no arquivo api/env.dev
# Adicione esta linha (substitua SEU_TOKEN_AQUI pelo token real):
echo "INSTAGRAM_ACCESS_TOKEN=SEU_TOKEN_AQUI" >> env.dev

# 4. Iniciar a API
npm run dev
# ou
npm start
```

A API deve iniciar na porta 3001.

### Opção 2: Usar Docker (Se preferir)

```bash
# 1. Adicionar token no arquivo api/env.dev
echo "INSTAGRAM_ACCESS_TOKEN=SEU_TOKEN_AQUI" >> api/env.dev

# 2. Iniciar apenas a API
docker compose -f docker-compose.local.yml up phd-api -d

# 3. Ver logs
docker compose -f docker-compose.local.yml logs -f phd-api
```

### Opção 3: Usar API de Produção (Temporário)

Se você não quiser rodar a API localmente agora, pode temporariamente apontar para produção:

1. Edite `env.dev` na raiz do projeto:
```bash
VITE_INSTAGRAM_API_URL=https://phdstudio.com.br/api/instagram
```

2. Reinicie o frontend (Vite)

**⚠️ ATENÇÃO:** Isso só funcionará se o token estiver configurado na produção!

## Como Obter o Token do Instagram

### Método Rápido:

1. Acesse: https://developers.facebook.com/tools/explorer/
2. Selecione seu App do Facebook
3. Selecione a página do Instagram Business (@phdstudiooficial)
4. Adicione permissões:
   - `instagram_basic`
   - `pages_read_engagement`
   - `pages_show_list`
5. Clique em "Generate Access Token"
6. Copie o token gerado

### Estender Token para 60 dias:

1. Acesse: https://developers.facebook.com/tools/accesstoken/
2. Clique em "Extend Access Token" ao lado do token
3. Copie o token estendido

## Testar o Endpoint

Após iniciar a API e configurar o token:

```bash
# Testar endpoint
curl http://localhost:3001/api/instagram/posts

# Deve retornar algo como:
# {
#   "success": true,
#   "data": [...],
#   "count": 9
# }
```

## Verificar no Navegador

1. Abra o DevTools (F12)
2. Vá na aba "Console"
3. Recarregue a página
4. Procure por mensagens como:
   - `📸 Buscando posts do Instagram de: ...`
   - `✅ X posts do Instagram carregados com sucesso`
   - `❌ Erro ao buscar posts do Instagram: ...`

## Se Ainda Não Funcionar

1. **Verifique se a API está rodando:**
   ```bash
   curl http://localhost:3001/api/crm/v1/health
   ```

2. **Verifique os logs da API:**
   - Se rodando localmente: veja o terminal onde iniciou
   - Se rodando no Docker: `docker compose logs phd-api`

3. **Verifique se o token está configurado:**
   ```bash
   grep INSTAGRAM_ACCESS_TOKEN api/env.dev
   ```

4. **Teste o token diretamente:**
   ```bash
   # Substitua TOKEN pelo seu token
   curl "https://graph.facebook.com/v22.0/17841403453191047/media?fields=id&access_token=TOKEN"
   ```

## Status Atual

- ✅ Endpoint criado: `/api/instagram/posts`
- ✅ Componente atualizado para usar o endpoint
- ✅ Logs de debug adicionados
- ⚠️ **Falta:** Iniciar a API e configurar o token
