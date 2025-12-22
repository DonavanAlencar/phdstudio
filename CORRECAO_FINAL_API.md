# 🔧 Correção Final - URL da API

## Problema Identificado

1. **URL antiga do ngrok no .env**: `https://7db794c1b6d0.ngrok-free.app`
2. **Duplicação do /api**: Se `VITE_API_URL=https://phdstudio.com.br/api` e o path é `/api/crm/v1/...`, resulta em `.../api/api/crm/v1/...`

## Correções Aplicadas

### 1. Atualizado `.env`
```env
VITE_API_URL=https://phdstudio.com.br/api
```

### 2. Corrigido `src/admin/utils/api.ts`
- Adicionada normalização para remover `/api` da base URL se presente
- A base URL agora é normalizada para não ter `/api` duplicado
- Os paths continuam usando `/api/crm/v1/...` que é o correto

## Como Funciona Agora

- **Base URL normalizada**: `https://phdstudio.com.br` (remove /api se presente)
- **Path**: `/api/crm/v1/auth/login`
- **URL final**: `https://phdstudio.com.br/api/crm/v1/auth/login` ✅

O Traefik recebe `/api/crm/v1/...` e remove o prefixo `/api`, enviando `/crm/v1/...` para a API.

## Próximo Passo

**REBUILD DO FRONTEND:**
```bash
docker compose up -d --build phdstudio
```

## Verificação

Após rebuild, o frontend deve fazer requisições para:
- `https://phdstudio.com.br/api/crm/v1/auth/login` (correto)
- Não mais para `localhost:3001` ou ngrok
