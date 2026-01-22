# 🔧 Correção: Erros de Rede no MobileChat

## Problema Identificado

O mobilechat estava apresentando erros de rede frequentes ao tentar comunicar com o webhook do n8n. Os principais problemas eram:

1. **Timeout muito curto**: 10 segundos pode não ser suficiente para webhooks que processam mensagens
2. **Sem retry logic**: Se uma requisição falhasse, não havia tentativas automáticas
3. **Tratamento de erros limitado**: Alguns erros de rede não eram detectados corretamente
4. **Validação de origem muito restritiva**: Podia bloquear requisições legítimas

## Soluções Implementadas

### 1. ✅ Timeout Aumentado e Retry Logic

**Arquivo**: `src/utils/mobileChatUtils.ts`

- **Timeout aumentado**: De 10s para 15s
- **Retry automático**: 2 retries (total de 3 tentativas)
- **Exponential backoff**: Espera progressiva entre tentativas (1s, 2s, max 5s)
- **Retry inteligente**: Apenas erros de rede/timeout fazem retry (não erros 4xx)

```typescript
export const fetchWithTimeout = async (
  url: string,
  options: RequestInit = {},
  timeout: number = 15000, // Aumentado de 10s
  retries: number = 2 // Adicionado retry
): Promise<Response>
```

### 2. ✅ Melhor Tratamento de Erros

**Arquivo**: `src/components/MobileChat/MobileChatInterface.tsx`

- **Detecção melhorada de erros de rede**: Agora detecta mais tipos de erros
- **Mensagens mais informativas**: Usuário recebe mensagens mais claras sobre o problema
- **Logging em desenvolvimento**: Erros detalhados no console para diagnóstico

**Tipos de erros detectados**:
- Mixed Content (HTTP em página HTTPS)
- CORS (Cross-Origin Resource Sharing)
- Timeout/Network (falhas de conexão)
- HTTP Errors (4xx, 5xx)

### 3. ✅ Validação de Origem Melhorada

**Arquivo**: `src/utils/mobileChatUtils.ts`

- **Suporte a subdomínios**: Agora permite subdomínios dos domínios permitidos
- **Suporte a desenvolvimento**: Permite HTTP em localhost durante desenvolvimento
- **Domínios adicionais**: Adicionados mais serviços de webhook conhecidos

**Domínios permitidos**:
- `n8n.546digitalservices.com` e `546digitalservices.com`
- `webhook.site`
- `hook.integromat.com`
- `n8n.io`
- `make.com`
- `zapier.com`
- `ifttt.com`

### 4. ✅ Headers Melhorados

Adicionados headers padrão para melhorar compatibilidade:
- `Accept: application/json`
- `Cache-Control: no-cache`

## Resultados Esperados

Após essas melhorias:

1. ✅ **Maior taxa de sucesso**: Retry automático aumenta chances de sucesso
2. ✅ **Melhor experiência do usuário**: Mensagens de erro mais claras
3. ✅ **Mais resiliente**: Sistema aguenta melhor instabilidades de rede
4. ✅ **Melhor diagnóstico**: Logs detalhados em desenvolvimento

## Como Testar

1. **Teste de timeout**: Simular conexão lenta e verificar se retry funciona
2. **Teste de erro de rede**: Desconectar internet e verificar mensagem de erro
3. **Teste de webhook indisponível**: Verificar se mensagem é clara

## Configuração do Webhook

Certifique-se de que o webhook está configurado corretamente:

```bash
# Verificar se webhook está acessível
curl -X POST "https://n8n.546digitalservices.com/webhook/32f58b69-ef50-467f-b884-50e72a5eefa2" \
  -H "Authentication: T!Hm9Y1Sc#0!F2ZxVZvvS2@#UQ5bqqQKly" \
  -H "Content-Type: application/json" \
  -d '{"input_text":"teste","session_id":"test123"}'
```

## Próximos Passos (Opcional)

Se os erros persistirem:

1. **Verificar status do webhook n8n**: O servidor pode estar offline
2. **Verificar firewall**: Pode estar bloqueando conexões
3. **Considerar proxy reverso**: Se o webhook estiver em rede privada
4. **Monitorar logs**: Verificar padrões de erro para identificar problemas recorrentes

## Arquivos Modificados

- ✅ `src/utils/mobileChatUtils.ts` - Adicionado retry e melhorado timeout
- ✅ `src/components/MobileChat/MobileChatInterface.tsx` - Melhorado tratamento de erros
- ✅ `docs/mobilechat-erros-rede.md` - Esta documentação
