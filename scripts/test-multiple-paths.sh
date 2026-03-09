#!/bin/bash

# Script para testar múltiplos paths do webhook MCP
# Uso: ./scripts/test-multiple-paths.sh

BASE_URL="https://n8n.546digitalservices.com"

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "🔍 Testando múltiplos paths do webhook MCP..."
echo "📍 Base URL: $BASE_URL"
echo ""

# Lista de paths para testar
PATHS=(
    "/mcp-test/google-ads-tool-mcp/sse"
    "/google-ads-tool-mcp/sse"
    "/webhook/google-ads-tool-mcp"
    "/mcp/google-ads-tool-mcp/sse"
    "/webhook/google-ads-tool-mcp-server"
    "/mcp-test/google-ads-tool-mcp"
    "/webhook/mcp-test/google-ads-tool-mcp/sse"
)

FOUND=0

for path in "${PATHS[@]}"; do
    URL="$BASE_URL$path"
    echo -n "Testando: $path ... "
    
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$URL" 2>/dev/null || echo "000")
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}✅ SUCESSO! (HTTP 200)${NC}"
        echo ""
        echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${GREEN}✅ PATH CORRETO ENCONTRADO!${NC}"
        echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        echo -e "${BLUE}URL completa:${NC} $URL"
        echo ""
        echo "Teste completo com SSE:"
        echo "curl -N -H 'Accept: text/event-stream' '$URL'"
        echo ""
        FOUND=1
        break
    elif [ "$HTTP_CODE" = "404" ]; then
        echo -e "${RED}❌ Não encontrado (404)${NC}"
    elif [ "$HTTP_CODE" = "000" ]; then
        echo -e "${YELLOW}⚠️  Erro de conexão${NC}"
    else
        echo -e "${YELLOW}⚠️  HTTP $HTTP_CODE${NC}"
        # Mesmo que não seja 200, pode ser útil
        RESPONSE=$(curl -s "$URL" 2>/dev/null | head -3)
        if [ -n "$RESPONSE" ]; then
            echo "   Resposta: $RESPONSE"
        fi
    fi
done

echo ""

if [ "$FOUND" = "0" ]; then
    echo -e "${RED}❌ Nenhum path funcionou${NC}"
    echo ""
    echo -e "${YELLOW}Possíveis causas:${NC}"
    echo "   1. O path do webhook é diferente dos testados"
    echo "   2. O workflow não está realmente ativo"
    echo "   3. O webhook precisa ser configurado no nó MCP Trigger"
    echo ""
    echo -e "${YELLOW}Próximos passos:${NC}"
    echo "   1. Abra o nó 'Google Ads Tool MCP Server' no n8n"
    echo "   2. Procure por 'Webhook URL' ou 'Production URL'"
    echo "   3. Copie a URL EXATA mostrada no nó"
    echo "   4. Teste essa URL com:"
    echo "      curl -v -N -H 'Accept: text/event-stream' [URL-COPIA-DO-NO]"
    echo ""
    echo "📖 Guia completo: docs/COMO_OBTER_URL_WEBHOOK_MCP.md"
fi
