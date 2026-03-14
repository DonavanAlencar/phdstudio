# Problemas que impedem o carrossel do Instagram de atualizar

Quando o carrossel mostra **apenas os dois cards genéricos** (laptop e barraca com texto “Conteúdo estratégico…” e “Cases reais, bastidores…”), o frontend está em **fallback**: a API não está devolvendo posts reais. Abaixo estão as causas mais comuns e como verificar/corrigir.

---

## 1. Token não configurado ou não carregado no servidor (503 – MISSING_TOKEN)

**O que acontece:** O backend responde 503 com `meta.reason: 'MISSING_TOKEN'` e o frontend exibe os posts de fallback.

**Como verificar:**

- Abra no navegador (troque o domínio se a API for outra):
  - `https://phdstudio.com.br/api/instagram/status`
- Se `configured` for `false`, o processo da API **não** está vendo `INSTAGRAM_ACCESS_TOKEN`.

**O que fazer:**

- Definir `INSTAGRAM_ACCESS_TOKEN` no ambiente **em que o processo Node da API roda**:
  - Se a API usa um `.env` na pasta do backend, coloque a variável nesse arquivo e **reinicie a API**.
  - Se usa PM2, Docker ou outro, defina a variável nesse ambiente (env do container, `ecosystem.config`, etc.).
- Garantir que o servidor é iniciado a partir do diretório onde está o `.env` (o `dotenv` usa o diretório de trabalho atual por padrão).
- Depois de alterar o `.env`, **sempre reiniciar** o processo da API.

---

## 2. CORS bloqueando a origem do site

**O que acontece:** O navegador bloqueia a resposta da API e o frontend não recebe dados (erro de rede/CORS no console). O carrossel cai no fallback.

**Como verificar:**

- Abra o DevTools (F12) → Aba **Rede** → recarregue a página.
- Procure a requisição para `.../api/instagram/posts` (ou a URL que o front usa).
- Se aparecer erro de CORS (origem não permitida), a origem do site não está na lista do backend.

**O que fazer:**

- O backend usa `ALLOWED_ORIGINS` ou, se não estiver definido, uma lista padrão (incluindo `https://phdstudio.com.br` e `https://www.phdstudio.com.br`).
- Se o site for servido em outro domínio (ex.: `www.outrosite.com`), adicione essa origem:
  - Ex.: `ALLOWED_ORIGINS=https://phdstudio.com.br,https://www.phdstudio.com.br,https://www.outrosite.com`
- Reinicie a API após alterar variáveis de ambiente.

---

## 3. URL da API errada no frontend (build)

**O que acontece:** O frontend chama `localhost` ou outro host que não é o da API em produção, a requisição falha e o carrossel fica em fallback.

**Como verificar:**

- No DevTools → Rede, veja para qual URL está indo o request de “instagram”/“posts”.
- Se for `http://localhost:3001/...` com o site em produção, a URL está errada no build.

**O que fazer:**

- As variáveis `VITE_INSTAGRAM_API_URL` e `VITE_API_URL` são **embutidas no build**. Elas precisam ser definidas **no momento do build** do frontend.
- No build de produção, defina por exemplo:
  - `VITE_INSTAGRAM_API_URL=https://phdstudio.com.br/api/instagram`
  - ou a URL base da API que o usuário final usa.
- Fazer um **novo build** e publicar de novo. Só alterar o `.env` no servidor sem rebuild não muda a URL que o frontend já compilou.

---

## 4. Token expirado ou sem permissões (Graph API – AUTH_ERROR)

**O que acontece:** O backend tem token, mas a Graph API responde 400/401/403. O backend devolve 503 e o front continua em fallback.

**Como verificar:**

- Logs do servidor da API: procure mensagens como `[instagram/posts] Graph API retornou erro HTTP` com `status` e `errorMessage`.
- Testar o token manualmente (no servidor ou em máquina com o token):
  ```bash
  curl -s "https://graph.facebook.com/v22.0/17841403453191047/media?fields=id&access_token=SEU_TOKEN"
  ```
  - Se vier erro de acesso ou “invalid token”, o token ou as permissões estão incorretos.

**O que fazer:**

- Gerar novo token no [Graph API Explorer](https://developers.facebook.com/tools/explorer/) com o App correto e a **página do Instagram Business** (@phdstudiooficial) selecionada.
- Incluir permissões: `instagram_basic`, `pages_read_engagement`, `pages_show_list`.
- Preferir **token de longa duração** (ex.: estender em [Access Token Tool](https://developers.facebook.com/tools/accesstoken/)).
- Atualizar `INSTAGRAM_ACCESS_TOKEN` no ambiente da API e reiniciar.

---

## 5. INSTAGRAM_USER_ID incorreto

**O que acontece:** O token é válido mas para outra página/conta, ou o ID usado não é o da conta Instagram Business ligada ao App. A Graph API pode retornar vazio ou erro.

**Como verificar:**

- O backend usa `INSTAGRAM_USER_ID` (padrão `17841403453191047`). Esse ID deve ser o da **conta Instagram Business** conectada à página do Facebook que o token usa.
- No Graph API Explorer, ao gerar o token, confirme qual “Instagram Account” está selecionada e compare o ID com o configurado.

**O que fazer:**

- Definir `INSTAGRAM_USER_ID` no mesmo `.env` (ou ambiente) da API com o ID correto da conta @phdstudiooficial e reiniciar.

---

## 6. Cache antigo no navegador (localStorage)

**O que acontece:** Mesmo após corrigir a API, o front pode continuar mostrando dados antigos ou fallback se ainda houver cache local.

**O que fazer:**

- O frontend limpa o cache quando recebe 503. Se a API já estiver respondendo 200 com posts, um **hard refresh** (Ctrl+F5) ou abrir em aba anônima pode ajudar a ver o novo comportamento.
- Para garantir: DevTools → Application → Local Storage → remover a chave `instagram_leads_carousel_cache` do site e recarregar.

---

## Ordem sugerida de verificação

1. Abrir `https://phdstudio.com.br/api/instagram/status` (ou a URL da sua API) e ver se `configured === true`.
2. Abrir `https://phdstudio.com.br/api/instagram/posts?limit=2` e ver se retorna `success: true` e um array `data` com posts.
3. No site, abrir DevTools → Rede e ver se a requisição a `/api/instagram/posts` vai para a URL correta e retorna 200 com dados.
4. Se o status estiver `configured: true` mas `/posts` retornar 503, conferir os logs da API e o token/ID no Graph API (itens 4 e 5).

Com isso, o carrossel deixa de depender do fallback e passa a exibir os posts reais do Instagram quando a API e o token estiverem corretos.
