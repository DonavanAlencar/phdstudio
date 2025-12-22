#!/bin/bash

# Script para verificar status do deploy
# Uso: ./scripts/check-deploy.sh

set -e

echo "=========================================="
echo "  Verificação de Deploy - PHD Studio"
echo "=========================================="
echo ""

# Verificar containers
echo "📦 Containers:"
if docker ps --format 'table {{.Names}}\t{{.Status}}' | grep -E "phdstudio-app|phd-api|phd-crm-db"; then
    echo "✅ Todos os containers estão rodando"
else
    echo "❌ Algum container não está rodando"
fi
echo ""

# Verificar frontend
echo "🌐 Frontend:"
if curl -s -o /dev/null -w "%{http_code}" http://localhost:80 | grep -q "200\|301\|302"; then
    echo "✅ Frontend respondendo"
else
    echo "❌ Frontend não está respondendo"
fi
echo ""

# Verificar API
echo "🔌 API:"
API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/crm/v1/health 2>/dev/null || echo "000")
if [ "$API_STATUS" = "200" ]; then
    echo "✅ API respondendo (HTTP $API_STATUS)"
else
    echo "❌ API não está respondendo (HTTP $API_STATUS)"
fi
echo ""

# Verificar banco de dados
echo "🗄️  Banco de Dados:"
if docker exec phd-crm-db pg_isready -U phd_crm_user -d phd_crm > /dev/null 2>&1; then
    echo "✅ PostgreSQL está rodando e acessível"
    
    # Verificar tabelas
    TABLE_COUNT=$(docker exec phd-crm-db psql -U phd_crm_user -d phd_crm -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | tr -d ' ')
    echo "   Tabelas criadas: $TABLE_COUNT"
else
    echo "❌ PostgreSQL não está acessível"
fi
echo ""

# Verificar logs recentes
echo "📋 Logs Recentes (últimas 5 linhas de cada container):"
echo ""
echo "Frontend:"
docker logs --tail 5 phdstudio-app 2>&1 | tail -5 || echo "Não disponível"
echo ""
echo "API:"
docker logs --tail 5 phd-api 2>&1 | tail -5 || echo "Não disponível"
echo ""
echo "Database:"
docker logs --tail 5 phd-crm-db 2>&1 | tail -5 || echo "Não disponível"
echo ""

# Verificar uso de recursos
echo "💻 Recursos:"
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" phdstudio-app phd-api phd-crm-db 2>/dev/null || echo "Não disponível"
echo ""

echo "=========================================="
echo "✅ Verificação concluída"
echo "=========================================="

