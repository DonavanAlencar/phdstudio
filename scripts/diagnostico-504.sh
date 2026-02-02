#!/bin/bash

# Script de diagnóstico para erro 504 Gateway Timeout
# Uso: ./scripts/diagnostico-504.sh

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Diagnóstico: Erro 504 Gateway Timeout ===${NC}"
echo ""

# 1. Verificar container phd-api
echo -e "${BLUE}1. Verificando container phd-api...${NC}"
if docker ps | grep -q phd-api; then
    echo -e "${GREEN}✅ Container phd-api está rodando${NC}"
    STATUS=$(docker ps --format "table {{.Names}}\t{{.Status}}" | grep phd-api)
    echo "   Status: $STATUS"
else
    echo -e "${RED}❌ Container phd-api NÃO está rodando!${NC}"
    echo "   Tentando verificar se existe mas está parado..."
    if docker ps -a | grep -q phd-api; then
        echo -e "${YELLOW}   Container existe mas está parado. Últimos logs:${NC}"
        docker logs phd-api --tail 10 2>&1 || true
    else
        echo -e "${RED}   Container não existe!${NC}"
    fi
fi
echo ""

# 2. Verificar healthcheck interno
echo -e "${BLUE}2. Verificando healthcheck interno do container...${NC}"
if docker ps | grep -q phd-api; then
    if docker exec phd-api wget -qO- --timeout=5 http://127.0.0.1:3001/api/crm/v1/health 2>/dev/null; then
        echo -e "${GREEN}✅ Healthcheck interno OK${NC}"
    else
        echo -e "${RED}❌ Healthcheck interno FALHOU${NC}"
        echo "   O container não está respondendo na porta 3001"
    fi
else
    echo -e "${YELLOW}⚠️  Pulando (container não está rodando)${NC}"
fi
echo ""

# 3. Verificar banco de dados
echo -e "${BLUE}3. Verificando container do banco de dados...${NC}"
if docker ps | grep -q phd-crm-db; then
    echo -e "${GREEN}✅ Container phd-crm-db está rodando${NC}"
else
    echo -e "${RED}❌ Container phd-crm-db NÃO está rodando!${NC}"
fi
echo ""

# 4. Verificar tabela global_settings
echo -e "${BLUE}4. Verificando tabela global_settings...${NC}"
if docker ps | grep -q phd-crm-db; then
    TABLE_EXISTS=$(docker exec phd-crm-db psql -U phd_crm_user -d phd_crm -tAc "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'global_settings');" 2>&1)
    if [ "$TABLE_EXISTS" = "t" ]; then
        echo -e "${GREEN}✅ Tabela global_settings existe${NC}"
    else
        echo -e "${RED}❌ Tabela global_settings NÃO existe!${NC}"
        echo -e "${YELLOW}   Execute o script de criação da tabela (ver docs/DIAGNOSTICO_504_CHAT_SETTINGS.md)${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Pulando (container do banco não está rodando)${NC}"
fi
echo ""

# 5. Verificar conectividade de rede
echo -e "${BLUE}5. Verificando conectividade de rede...${NC}"
if docker ps | grep -q phd-api && docker ps | grep -q phd-crm-db; then
    if docker exec phd-api ping -c 2 -W 2 phd-crm-db >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Container phd-api consegue alcançar phd-crm-db${NC}"
    else
        echo -e "${RED}❌ Container phd-api NÃO consegue alcançar phd-crm-db${NC}"
        echo "   Verifique se estão na mesma rede Docker"
    fi
else
    echo -e "${YELLOW}⚠️  Pulando (containers não estão rodando)${NC}"
fi
echo ""

# 6. Verificar logs recentes
echo -e "${BLUE}6. Últimos logs do phd-api (últimas 20 linhas)...${NC}"
if docker ps | grep -q phd-api; then
    docker logs phd-api --tail 20 2>&1 | head -20
else
    echo -e "${YELLOW}⚠️  Container não está rodando, mostrando últimos logs salvos:${NC}"
    docker logs phd-api --tail 20 2>&1 | head -20 || echo "Nenhum log disponível"
fi
echo ""

# 7. Testar endpoint externo
echo -e "${BLUE}7. Testando endpoint externo...${NC}"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 https://phdstudio.com.br/api/crm/v1/chat-settings 2>&1 || echo "000")
if [ "$RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ Endpoint respondeu com 200 OK${NC}"
elif [ "$RESPONSE" = "504" ]; then
    echo -e "${RED}❌ Endpoint retornou 504 Gateway Timeout${NC}"
    echo "   O Traefik não consegue se comunicar com o container phd-api"
elif [ "$RESPONSE" = "000" ]; then
    echo -e "${RED}❌ Falha ao conectar (timeout ou erro de rede)${NC}"
else
    echo -e "${YELLOW}⚠️  Endpoint retornou código HTTP: $RESPONSE${NC}"
fi
echo ""

# Resumo
echo -e "${BLUE}=== Resumo ===${NC}"
echo ""
echo "Se o container phd-api não está rodando:"
echo "  docker restart phd-api"
echo ""
echo "Se a tabela global_settings não existe:"
echo "  Ver docs/DIAGNOSTICO_504_CHAT_SETTINGS.md - Solução 2"
echo ""
echo "Para ver logs em tempo real:"
echo "  docker logs phd-api -f"
echo ""
echo "Para mais informações, consulte:"
echo "  docs/DIAGNOSTICO_504_CHAT_SETTINGS.md"
echo ""
