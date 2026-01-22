# ✅ Migração: fetch → axios para API do Instagram

## Resumo

Migração concluída com sucesso da API do Instagram do `fetch` nativo do Node.js para `axios`, visando melhorar a compatibilidade de rede e tratamento de erros.

## Mudanças Implementadas

### 1. Dependência Adicionada

✅ **Axios 1.6.2** adicionado ao `package.json`:
```json
"dependencies": {
  "axios": "^1.6.2",
  ...
}
```

### 2. Código Migrado

**Arquivo**: `backend/routes/instagram.js`

#### Antes (fetch):
```javascript
const response = await fetch(url, {
  signal: controller.signal,
  headers: {...}
});
```

#### Depois (axios):
```javascript
const response = await axios.get(url, {
  timeout: timeout,
  headers: {...},
  validateStatus: (status) => status >= 200 && status < 500,
  maxRedirects: 5
});
```

### 3. Melhorias no Tratamento de Erros

✅ **Erros específicos do axios identificados**:
- `ECONNABORTED` - Timeout
- `ETIMEDOUT` - Timeout de conexão
- `ECONNREFUSED` - Conexão recusada
- `ENOTFOUND` - DNS não encontrado
- `ECONNRESET` - Conexão resetada
- `ENETUNREACH` - Rede inacessível

✅ **Melhor log de erros** com informações da resposta do axios

### 4. Correção no Docker Compose

✅ **Problema identificado e corrigido**:
- A variável `INSTAGRAM_ACCESS_TOKEN` no `environment` estava sobrescrevendo o valor do `env_file` com string vazia
- **Solução**: Removida a linha do `environment`, deixando apenas o `env_file` carregar a variável

**Antes**:
```yaml
environment:
  - INSTAGRAM_ACCESS_TOKEN=${INSTAGRAM_ACCESS_TOKEN:-}  # ❌ Sobrescrevia com vazio
```

**Depois**:
```yaml
# Instagram Feed (valores vêm do env_file - não sobrescrever aqui)
# As variáveis são carregadas automaticamente do arquivo ../../config/shared/.env
```

## Status Atual

### ✅ Funcionando
- ✅ Axios instalado e configurado (versão 1.13.2)
- ✅ Código migrado com sucesso
- ✅ Token sendo carregado corretamente do `.env`
- ✅ Tratamento de erros melhorado
- ✅ Retry logic mantido (3 tentativas, 60s timeout)
- ✅ **FORÇADO IPv4** para resolver problemas de conectividade
- ✅ **API funcionando perfeitamente!** ✅

### 🔧 Solução Final Aplicada

**Problema Identificado**: O Node.js estava tentando usar IPv6 primeiro, causando timeout na conexão com o Facebook Graph API.

**Solução**:
1. Forçar IPv4 primeiro no DNS:
```javascript
import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');
```

2. Forçar IPv4 na requisição axios:
```javascript
const response = await axios.get(url, {
  family: 4,  // Forçar IPv4
  lookup: dns.lookup,
  // ... outras opções
});
```

## Vantagens do Axios

1. **Melhor compatibilidade**: Usa o módulo `http/https` nativo do Node.js
2. **Melhor tratamento de erros**: Erros mais descritivos e estruturados
3. **Configuração mais flexível**: Mais opções de configuração de timeout, redirects, etc.
4. **Melhor para proxies**: Melhor suporte a configuração de proxy
5. **Interceptors**: Permite adicionar interceptors no futuro se necessário

## Próximos Passos

1. **Resolver problema de conectividade de rede**:
   - Verificar firewall do servidor
   - Verificar configurações de rede do Docker
   - Considerar usar proxy se necessário

2. **Após resolver conectividade**: A API do Instagram deve funcionar normalmente com axios

## Arquivos Modificados

- ✅ `backend/package.json` - Adicionado axios
- ✅ `backend/routes/instagram.js` - Migrado de fetch para axios
- ✅ `deploy/docker/config/docker-compose.yml` - Corrigido carregamento do token
- ✅ `docs/api/instagram-migracao-axios.md` - Esta documentação

## Testes

```bash
# Testar endpoint
curl https://phdstudio.com.br/api/instagram/posts?limit=1

# Verificar logs
docker logs phd-api | grep -i instagram

# Verificar se token está carregado
docker exec phd-api env | grep INSTAGRAM_ACCESS_TOKEN
```

## Notas

- O axios oferece melhor compatibilidade e deve resolver problemas de conectividade quando a rede estiver configurada corretamente
- O timeout atual é de 60 segundos (aumentado de 30s)
- Retry automático: 3 tentativas com exponential backoff
