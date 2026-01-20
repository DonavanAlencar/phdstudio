# 🔧 Problema: API do Instagram Perde Comunicação Após Deploy

## Problema Identificado

Ao fazer deploy em uma nova máquina, a API do Instagram retorna erro **503** com a mensagem:
```
Instagram feed não configurado
Token de acesso do Instagram não está configurado
```

## Causa Raiz

No arquivo `deploy/docker/config/docker-compose.yml`, a variável de ambiente `INSTAGRAM_ACCESS_TOKEN` estava faltando na seção `environment` do serviço `phd-api`.

Embora o token estivesse configurado no arquivo `deploy/config/shared/.env`, o Docker Compose não estava passando explicitamente essa variável para dentro do container. O Docker Compose só passa automaticamente variáveis que:
1. Estão explicitamente listadas na seção `environment`, OU
2. São referenciadas via `${VAR_NAME}` na seção `environment`

## Solução Aplicada

✅ **Correção no `docker-compose.yml`:**

Adicionada a linha `INSTAGRAM_ACCESS_TOKEN` na seção `environment` do serviço `phd-api`:

```yaml
# Instagram Feed (configure no .env - valores vêm do env_file)
- INSTAGRAM_ACCESS_TOKEN=${INSTAGRAM_ACCESS_TOKEN:-}
- INSTAGRAM_USER_ID=${INSTAGRAM_USER_ID:-17841403453191047}
- INSTAGRAM_API_VERSION=${INSTAGRAM_API_VERSION:-v22.0}
```

## Checklist para Novos Deploys

Para garantir que o feed do Instagram funcione após deploy em uma nova máquina:

### ✅ 1. Verificar Arquivo de Configuração

Certifique-se de que o arquivo `deploy/config/shared/.env` existe e contém:

```bash
INSTAGRAM_ACCESS_TOKEN=seu_token_aqui
INSTAGRAM_USER_ID=17841403453191047
INSTAGRAM_API_VERSION=v22.0
```

### ✅ 2. Verificar Docker Compose

Confirme que o `docker-compose.yml` inclui `INSTAGRAM_ACCESS_TOKEN` na seção `environment`:

```yaml
environment:
  - INSTAGRAM_ACCESS_TOKEN=${INSTAGRAM_ACCESS_TOKEN:-}
```

### ✅ 3. Obter/Atualizar Token do Instagram

Se o token expirou ou você não tem um:

1. Acesse: https://developers.facebook.com/tools/explorer/
2. Selecione seu App do Facebook
3. Selecione a página do Instagram Business (@phdstudiooficial)
4. Adicione permissões:
   - `instagram_basic`
   - `pages_read_engagement`
   - `pages_show_list`
5. Gere o token
6. Para token de longa duração (60 dias), estenda em: https://developers.facebook.com/tools/accesstoken/

### ✅ 4. Testar Após Deploy

Após fazer deploy, teste o endpoint:

```bash
curl https://phdstudio.com.br/api/instagram/posts?limit=9
```

Deve retornar JSON com os posts do Instagram, não erro 503.

## Arquivos Modificados

- ✅ `deploy/docker/config/docker-compose.yml` - Adicionado `INSTAGRAM_ACCESS_TOKEN` na seção environment

## Problema Adicional: Conectividade de Rede

Após corrigir a configuração do token, pode aparecer um erro `ETIMEDOUT` ao tentar conectar com a API do Facebook Graph API. Isso indica problema de conectividade de rede do container.

### Sintomas

- Container recebe requisições corretamente
- Token configurado corretamente
- Erro: `ETIMEDOUT` ou `Não foi possível conectar à API do Instagram`

### Causas Possíveis

1. **Firewall bloqueando conexões de saída**
2. **Problema de DNS no container**
3. **Configuração de rede do Docker restritiva**
4. **Problema de proxy/rede no servidor**

### Diagnóstico

```bash
# Verificar conectividade do container
docker exec phd-api ping -c 3 graph.facebook.com

# Verificar DNS
docker exec phd-api nslookup graph.facebook.com

# Testar conexão HTTPS
docker exec phd-api wget -O- --timeout=10 https://graph.facebook.com/v22.0/17841403453191047/media?limit=1
```

### Soluções

#### 1. Verificar Firewall

```bash
# Verificar regras de firewall
sudo iptables -L -n | grep OUTPUT

# Permitir conexões HTTPS de saída (se necessário)
sudo iptables -A OUTPUT -p tcp --dport 443 -j ACCEPT
```

#### 2. Verificar Configuração de Rede do Docker

```bash
# Verificar se o container está na rede correta
docker inspect phd-api | grep -A 10 "Networks"

# Verificar DNS do Docker
docker exec phd-api cat /etc/resolv.conf
```

#### 3. Configurar DNS Manualmente (se necessário)

Se o DNS não estiver funcionando, configure no `docker-compose.yml`:

```yaml
services:
  phd-api:
    dns:
      - 8.8.8.8
      - 8.8.4.4
```

#### 4. Aumentar Timeout (temporário)

Se a conexão for muito lenta mas funcional, pode aumentar o timeout em `backend/routes/instagram.js`:

```javascript
const fetchWithRetry = async (url, retries = 3, timeout = 60000) => {
  // timeout de 60 segundos ao invés de 30
```

## Notas Importantes

⚠️ **IMPORTANTE**: Sempre que adicionar novas variáveis de ambiente que precisam estar disponíveis no container, adicione-as explicitamente na seção `environment` do `docker-compose.yml`, mesmo que estejam no `env_file`.

🔐 **SEGURANÇA**: O token do Instagram é uma informação sensível. Certifique-se de:
- Não commitar o arquivo `deploy/config/shared/.env` no Git (já está no `.gitignore`)
- Usar tokens de longa duração em produção
- Renovar tokens antes de expirarem (tokens de longa duração expiram em 60 dias)

🌐 **REDE**: Se o problema persistir após verificar firewall e DNS:
1. Verifique se o servidor tem acesso à internet
2. Verifique se há proxy corporativo que precisa ser configurado
3. Verifique logs do Traefik/Docker para erros de rede
