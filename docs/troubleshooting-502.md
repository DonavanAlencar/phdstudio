# Troubleshooting: erro 502 (Bad Gateway)

Quando o site ou as chamadas para `/api` retornam **502**, o proxy (Traefik) está recebendo resposta inválida ou não consegue falar com o backend.

## Causas comuns

1. **Container da API (`phd-api`) parado ou em crash**  
   - A API Node depende do PostgreSQL (`phd-crm-db`). Se o banco não estiver acessível, a API pode falhar ao iniciar ou ao responder.

2. **Container do frontend (`phdstudio-app`) parado**  
   - O Nginx que serve o React precisa estar rodando.

3. **Rede Docker**  
   - Traefik e os containers precisam estar na mesma rede (`n8n_default`). Se o container não estiver nessa rede, o Traefik retorna 502.

4. **Banco PostgreSQL (`phd-crm-db`) indisponível**  
   - O `docker-compose.yml` do deploy usa `CRM_DB_HOST=phd-crm-db`. Esse serviço precisa existir e estar na rede `phd_crm_network`.

## Diagnóstico rápido (no servidor)

Rode no servidor onde o Docker está rodando (ex.: onde você faz o deploy):

```bash
# 1. Containers do PHD estão rodando?
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "phdstudio|phd-api"

# 2. Logs da API (erros de conexão com DB, crash)
docker logs phd-api --tail 80

# 3. Health da API (dentro da rede; só funciona se phd-api estiver na mesma rede)
docker exec phdstudio-app wget -qO- http://phd-api:3001/api/crm/v1/health 2>/dev/null || echo "Falha ao conectar na API"

# 4. Traefik está rodando? (necessário para rotear phdstudio.com.br)
docker ps | grep traefik
```

## O que fazer

### Se `phd-api` não estiver rodando ou estiver em crash

- Verifique se o PostgreSQL está acessível (container `phd-crm-db` ou equivalente na rede `phd_crm_network`).
- Confira `deploy/config/shared/.env`: `CRM_DB_HOST`, `CRM_DB_PORT`, `CRM_DB_USER`, `CRM_DB_PASSWORD`, `CRM_DB_NAME`.
- Suba o banco (se for outro compose) e depois recrie os containers do deploy:

```bash
cd /root/phdstudio   # ou o caminho do seu repositório
./deploy/docker/scripts/deploy-remote.sh
```

### Se `phdstudio-app` não estiver rodando

- Rodar de novo o script de deploy (acima) sobe o frontend e a API.

### Se o 502 for só em requisições para `/api`

- O frontend (Nginx) está OK; o problema é a API ou o roteamento do Traefik para ela.
- Confirme que `phd-api` está na rede `n8n_default` e que o Traefik está rodando.
- Veja os logs: `docker logs phd-api --tail 100`.

## Script de diagnóstico

Foi adicionado o script `scripts/check-502.sh`, que roda os comandos acima e resume o status. No servidor:

```bash
./scripts/check-502.sh
```
