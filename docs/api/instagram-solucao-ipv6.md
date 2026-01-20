# ✅ Solução: Problema de IPv6 na API do Instagram

## Problema

A API do Instagram estava retornando **504 Gateway Timeout** ao tentar buscar posts. O problema persistia mesmo após:
- Migração de `fetch` para `axios`
- Aumento de timeout para 60 segundos
- Configuração de DNS explícito no Docker Compose
- Múltiplas tentativas de retry

## Causa Raiz Identificada

O Node.js dentro do container Docker estava tentando **usar IPv6 primeiro** ao resolver o DNS do `graph.facebook.com`. Isso causava timeout porque:

1. O servidor ou rede pode não ter IPv6 configurado corretamente
2. O Facebook Graph API pode estar respondendo mais lentamente via IPv6
3. O container Docker pode ter problemas de roteamento IPv6

## Solução Aplicada

### 1. Forçar IPv4 no DNS do Node.js

```javascript
import dns from 'dns';

// Forçar IPv4 primeiro para evitar problemas de conectividade
dns.setDefaultResultOrder('ipv4first');
```

### 2. Configurar Axios para usar apenas IPv4

```javascript
const response = await axios.get(url, {
  timeout: timeout,
  headers: {...},
  // Forçar IPv4 para evitar problemas de conectividade
  family: 4,
  // Configurações de DNS
  lookup: dns.lookup,
  maxRedirects: 5
});
```

## Resultado

✅ **Problema resolvido!** A API do Instagram agora funciona perfeitamente:

```bash
$ curl "https://phdstudio.com.br/api/instagram/posts?limit=3"
{
  "success": true,
  "count": 3,
  "data": [...]
}
```

## Arquivos Modificados

- ✅ `backend/routes/instagram.js` - Adicionada configuração IPv4

## Lições Aprendidas

1. **Problemas de IPv6 são comuns em containers Docker**: Sempre considerar forçar IPv4 quando houver problemas de conectividade
2. **DNS resolution order importa**: O Node.js tenta IPv6 primeiro por padrão
3. **Testes diretos ajudam**: Testar com `dns.setDefaultResultOrder('ipv4first')` diretamente confirmou a solução

## Verificação

Para verificar se está funcionando:

```bash
# Testar endpoint
curl "https://phdstudio.com.br/api/instagram/posts?limit=1"

# Verificar logs
docker logs phd-api | grep -i instagram

# Testar diretamente no container
docker exec phd-api node -e "
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
const axios = require('axios');
axios.get('https://graph.facebook.com/v22.0/17841403453191047/media?access_token=TOKEN&limit=1', {family: 4, timeout: 10000})
  .then(r => console.log('✅ Success:', r.status))
  .catch(e => console.error('❌ Error:', e.code));
"
```

## Referências

- [Node.js DNS Documentation](https://nodejs.org/api/dns.html#dns_dns_setdefaultresultorder_order)
- [Axios Request Config](https://axios-http.com/docs/req_config)
