# 🔧 Correção - URL da API

## Problema Identificado

O frontend estava tentando acessar `localhost:3001` mas deveria usar `https://phdstudio.com.br/api`.

**Causa:**
- O arquivo `.env` tinha uma URL antiga do ngrok: `https://7db794c1b6d0.ngrok-free.app`
- O frontend foi buildado com essa URL incorreta
- Variáveis `VITE_*` são embutidas no build em tempo de compilação

## Correção Aplicada

✅ **Atualizado `.env`:**
```env
VITE_API_URL=https://phdstudio.com.br/api
```

## Próximo Passo

**REBUILD DO FRONTEND** para aplicar a mudança:

```bash
docker compose up -d --build phdstudio
```

## Nota Importante

Variáveis `VITE_*` são processadas em **build time**, não em runtime. Isso significa:
- Qualquer mudança em `VITE_API_URL` requer rebuild do frontend
- O valor é embutido no JavaScript gerado
- Não é possível mudar sem rebuild

## Verificação Pós-Rebuild

Após o rebuild, verifique:
1. Login funcionando: `https://phdstudio.com.br/admin/login`
2. Console do navegador sem erros de conexão
3. Requisições indo para `https://phdstudio.com.br/api/crm/v1/...`
