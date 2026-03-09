#!/usr/bin/env bash
# Diagnóstico rápido para erro 502 no PHD Studio (containers e API).

set -e

echo "=========================================="
echo "  PHD Studio - Diagnóstico 502"
echo "=========================================="
echo ""

echo "1. Containers PHD (frontend e API):"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null | grep -E "NAMES|phdstudio|phd-api" || echo "   Nenhum container phd encontrado."
echo ""

echo "2. Últimas linhas do log da API (phd-api):"
docker logs phd-api --tail 30 2>/dev/null || echo "   Container phd-api não encontrado ou sem logs."
echo ""

echo "3. Teste de health da API (de dentro da rede):"
(docker exec phdstudio-app wget -qO- --timeout=3 http://phd-api:3001/api/crm/v1/health 2>/dev/null && echo "   OK - API respondeu.") || echo "   FALHA - API não respondeu (502 pode vir daqui)."
echo ""

echo "4. Traefik (proxy reverso):"
docker ps --format "table {{.Names}}\t{{.Status}}" 2>/dev/null | grep -E "NAMES|traefik" || echo "   Traefik não encontrado."
echo ""

echo "=========================================="
echo "  Se phd-api ou phdstudio-app estiverem parados, rode no servidor:"
echo "  cd /root/phdstudio && ./deploy/docker/scripts/deploy-remote.sh"
echo "  Consulte: docs/troubleshooting-502.md"
echo "=========================================="
