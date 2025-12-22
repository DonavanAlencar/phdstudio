# Configuração da API REST - PHD Studio

## ✅ Configuração Atual

A API REST está configurada para ser acessada via **path prefix** no mesmo domínio:

- **URL da API**: `https://phdstudio.com.br/api`
- **Health Check**: `https://phdstudio.com.br/api/health`
- **Produtos**: `https://phdstudio.com.br/api/api/phd/v1/products`

## 🔧 Como Funciona

### Traefik Routing

A API está exposta via Traefik usando path prefix:
- **Rota**: `Host(phdstudio.com.br) && PathPrefix(/api)`
- **Middleware**: Remove o prefixo `/api` antes de encaminhar para o container
- **Container**: Recebe requisições na porta 3001

### Frontend

O código React usa path relativo:
```typescript
const API_BASE_URL = `${window.location.protocol}//${window.location.host}/api`
```

Isso significa:
- Em produção: `https://phdstudio.com.br/api`
- Em desenvolvimento: `http://localhost:3000/api` (se proxy configurado)

## 🔐 CORS

A API está configurada para aceitar requisições de:
- `https://phdstudio.com.br`
- `http://phdstudio.com.br`

Configurado via variável `ALLOWED_ORIGINS` no docker-compose.yml.

## 🚀 Testar

```bash
# Health check
curl https://phdstudio.com.br/api/health

# Listar produtos (com API Key)
curl -X GET https://phdstudio.com.br/api/api/phd/v1/products \
  -H "X-PHD-API-KEY: sua-api-key"
```

## ⚠️ Nota Importante

O path da API tem `/api/api/phd/v1/products` porque:
1. Traefik remove o primeiro `/api` (middleware stripprefix)
2. O código da API espera `/api/phd/v1/products`

Se quiser simplificar, pode ajustar o código da API para não usar `/api` no início.

## 🔄 Alternativa: Subdomínio

Se preferir usar subdomínio (`api.phdstudio.com.br`):

1. Configure DNS: `api.phdstudio.com.br` → IP do servidor
2. Atualize docker-compose.yml:
```yaml
- "traefik.http.routers.phd-api.rule=Host(`api.phdstudio.com.br`)"
```
3. Atualize productsApi.ts:
```typescript
const API_BASE_URL = 'https://api.phdstudio.com.br'
```



