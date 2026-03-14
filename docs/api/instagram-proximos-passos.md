# Próximos passos – Carrossel do Instagram

Para o carrossel exibir os posts reais do Instagram em **desenvolvimento local**, é preciso ter **frontend e API rodando ao mesmo tempo**.

---

## Passo 1: Subir a API (obrigatório)

O frontend (Vite) faz as requisições do Instagram pelo **proxy** para `http://localhost:3001`. Se a API não estiver rodando, o carrossel cai no fallback (os dois cards genéricos).

**Opção A – Dois terminais (recomendado)**

1. **Terminal 1 – Frontend** (já deve estar rodando):
   ```bash
   npm run dev
   ```
   → Front em http://localhost:3000

2. **Terminal 2 – API**:
   ```bash
   npm run api
   ```
   ou, manualmente:
   ```bash
   cd backend
   npm run dev
   ```
   → API em http://localhost:3001

**Opção B – Um terminal com concorrência**  
Se tiver `concurrently` ou similar, pode subir os dois com um único comando (ex.: `npm run dev` + `npm run api` em paralelo).

---

## Passo 2: Conferir o token

A API lê o token do arquivo **`backend/.env`** (não é commitado).

- Deve existir a linha:  
  `INSTAGRAM_ACCESS_TOKEN=seu_token_aqui`
- Depois de alterar o `.env`, **reinicie a API** (Ctrl+C no terminal da API e rodar de novo `npm run api` ou `cd backend && npm run dev`).

---

## Passo 3: Testar a API

Com a API rodando:

1. **Status (token configurado?)**  
   Abra no navegador: http://localhost:3001/api/instagram/status  
   → Deve retornar `"configured": true`.

2. **Posts**  
   Abra: http://localhost:3001/api/instagram/posts?limit=2  
   → Deve retornar `"success": true` e um array `data` com posts.

Se um dos dois falhar, o problema está na API ou no token (veja `instagram-problemas-carrossel.md`).

---

## Passo 4: Recarregar o site

Com a API no ar, abra (ou recarregue) http://localhost:3000, vá até a seção do Instagram e confira se o carrossel mostra os posts reais.

- Se ainda aparecerem os dois cards genéricos: abra o DevTools (F12) → **Rede** → recarregue e veja a requisição para `/api/instagram/posts`. Confira se o status é 200 e se a resposta traz `data` com posts.

---

## Resumo

| O que                      | Comando / Onde                          |
|---------------------------|------------------------------------------|
| Frontend                  | `npm run dev` (porta 3000)              |
| API                       | `npm run api` ou `cd backend && npm run dev` (porta 3001) |
| Token                     | `backend/.env` → `INSTAGRAM_ACCESS_TOKEN` |
| Testar token              | http://localhost:3001/api/instagram/status |
| Testar posts              | http://localhost:3001/api/instagram/posts?limit=2 |

Em **produção**, a API já deve estar no ar no servidor; basta que `INSTAGRAM_ACCESS_TOKEN` esteja definido no ambiente da API e que o build do front use a URL correta (`VITE_INSTAGRAM_API_URL` ou `VITE_API_URL`).
