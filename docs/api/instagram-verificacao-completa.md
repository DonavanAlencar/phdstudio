# 🔍 Verificação Completa - API do Instagram

## ✅ Verificações Realizadas

### 1. Configuração do Docker Compose
- ✅ `INSTAGRAM_ACCESS_TOKEN` está na seção `environment` do serviço `phd-api`
- ✅ `INSTAGRAM_USER_ID` e `INSTAGRAM_API_VERSION` configurados
- ✅ Roteamento Traefik configurado corretamente (`/api` removido pelo middleware)

### 2. Variáveis de Ambiente
- ✅ Token presente no arquivo `deploy/config/shared/.env`
- ✅ Token sendo passado para o container (confirmado via `docker exec phd-api env`)
- ✅ Todas as variáveis do Instagram estão presentes no container

### 3. Código da Rota
- ✅ Rota registrada em `/api/instagram` e `/instagram` (para Traefik)
- ✅ Código com retry (3 tentativas) e timeout aumentado (60s)
- ✅ Tratamento de erros adequado
- ✅ Validação do token presente

### 4. Conectividade de Rede

#### ✅ Funciona
- **wget** dentro do container consegue conectar ao Facebook Graph API
- **curl** no host consegue conectar ao Facebook Graph API
- Token é válido quando testado externamente

#### ❌ Não Funciona
- **fetch** do Node.js dá `ETIMEDOUT` (timeout)
- **https.get** do Node.js dá `ETIMEDOUT` (timeout)
- Conexão do Node.js não consegue estabelecer conexão HTTPS

### 5. Diagnóstico do Problema

**Problema Identificado**: O container tem conectividade de rede, mas especificamente as conexões HTTPS feitas pelo Node.js não conseguem estabelecer conexão com o Facebook Graph API.

**Evidências**:
1. `wget` funciona mas retorna 403 (problema de User-Agent, não de conectividade)
2. `curl` no host funciona perfeitamente
3. `https.get` do Node.js dá `ETIMEDOUT` em 5 segundos
4. `fetch` do Node.js dá `ETIMEDOUT` em 60 segundos

**Possíveis Causas**:
1. **DNS Resolution**: Node.js pode estar tentando resolver IPv6 primeiro
2. **Firewall**: Pode estar bloqueando conexões específicas do Node.js
3. **Configuração de Rede Docker**: Pode precisar de configuração adicional
4. **Problema com Undici**: O fetch do Node.js usa Undici, que pode ter problemas específicos

## 🔧 Soluções Testadas

### ✅ Implementadas
1. ✅ Adicionado `INSTAGRAM_ACCESS_TOKEN` no `docker-compose.yml`
2. ✅ Aumentado timeout de 30s para 60s
3. ✅ Aumentado retries de 2 para 3
4. ✅ Melhorado tratamento de erros

### ❌ Testadas mas Não Resolveram
1. ❌ Aumentar timeout (problema persiste)
2. ❌ Aumentar retries (problema persiste)

## 💡 Soluções Recomendadas

### Solução 1: Configurar DNS no Docker Compose

Adicionar configuração de DNS no `docker-compose.yml`:

```yaml
services:
  phd-api:
    dns:
      - 8.8.8.8
      - 8.8.4.4
    dns_search: []
```

### Solução 2: Forçar IPv4 no Node.js

Modificar a rota do Instagram para usar uma biblioteca que force IPv4 ou configurar o Node.js para usar apenas IPv4.

### Solução 3: Usar Biblioteca Alternativa

Considerar usar `axios` ou `node-fetch` em vez do fetch nativo do Node.js:

```bash
npm install axios
```

### Solução 4: Configurar Proxy (se necessário)

Se houver proxy corporativo, configurar variáveis de ambiente:

```yaml
environment:
  - HTTP_PROXY=http://proxy:port
  - HTTPS_PROXY=http://proxy:port
  - NO_PROXY=localhost,127.0.0.1
```

### Solução 5: Verificar Firewall

Verificar se o firewall está bloqueando conexões HTTPS do Node.js:

```bash
# Verificar regras do firewall
sudo iptables -L -n | grep OUTPUT

# Permitir conexões HTTPS de saída
sudo iptables -A OUTPUT -p tcp --dport 443 -j ACCEPT
```

## 📊 Status Atual

| Componente | Status | Observação |
|------------|--------|------------|
| Token configurado | ✅ | Presente no container |
| Rota registrada | ✅ | `/api/instagram` e `/instagram` |
| Código | ✅ | Com retry e timeout aumentado |
| Conectividade geral | ✅ | wget funciona |
| Node.js HTTPS | ❌ | Timeout constante |
| Token válido | ✅ | Testado externamente |

## 🎯 Próximos Passos

1. **Prioritário**: Testar solução de DNS no docker-compose.yml
2. **Alternativo**: Implementar axios como fallback se fetch falhar
3. **Diagnóstico**: Verificar logs detalhados de rede do Docker
4. **Verificação**: Confirmar se problema é específico desta máquina ou geral

## 📝 Logs Relevantes

```
❌ [Instagram] Erro de conexão: ETIMEDOUT
TypeError: fetch failed
cause: 'ETIMEDOUT'
```

O problema é **específico das conexões HTTPS do Node.js**, não de conectividade geral do container.
