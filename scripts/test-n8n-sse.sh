#!/bin/bash

# Script para testar o webhook SSE do n8n
# Uso: ./scripts/test-n8n-sse.sh

set -e

URL="https://n8n.546digitalservices.com/google-ads-tool-mcp/sse"
EXIT_CODE=0

echo "🔍 Testando webhook SSE do n8n..."
echo "📍 URL: $URL"
echo ""

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Teste 1: Verificar se o servidor está acessível
echo "1️⃣ Testando conectividade básica..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$URL" 2>/dev/null || echo "000")

if [ "$HTTP_CODE" = "000" ]; then
    echo -e "${RED}❌ Erro: Não foi possível conectar ao servidor${NC}"
    echo "   Verifique sua conexão com a internet"
    EXIT_CODE=1
elif [ "$HTTP_CODE" = "404" ]; then
    echo -e "${YELLOW}⚠️  Servidor respondeu com 404${NC}"
    echo "   O webhook não está registrado/ativo"
    EXIT_CODE=1
elif [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Servidor está respondendo (HTTP 200)${NC}"
else
    echo -e "${YELLOW}⚠️  Servidor respondeu com HTTP $HTTP_CODE${NC}"
    EXIT_CODE=1
fi

echo ""

# Teste 2: Verificar resposta completa
echo "2️⃣ Verificando resposta do servidor..."
RESPONSE=$(curl -s -w "\n%{http_code}" "$URL" 2>&1 || echo -e "\n000")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "404" ]; then
    echo -e "${RED}❌ Webhook não registrado${NC}"
    echo ""
    echo -e "${BLUE}Resposta do servidor:${NC}"
    if command -v jq &> /dev/null; then
        echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
    else
        echo "$BODY"
    fi
    echo ""
    echo -e "${YELLOW}Possíveis causas:${NC}"
    echo "   - Workflow não está ATIVO no n8n"
    echo "   - Workflow está em modo de teste"
    echo "   - Path do webhook está incorreto"
    echo ""
    echo -e "${YELLOW}Solução:${NC}"
    echo "   1. Acesse: https://n8n.546digitalservices.com"
    echo "   2. Abra o workflow 'google-ads-tool-mcp'"
    echo "   3. Clique no botão 'Active' para ativar o workflow"
    echo "   4. Verifique o path do webhook no nó Webhook"
    EXIT_CODE=1
elif [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Webhook está ativo e respondendo${NC}"
    if [ -n "$BODY" ]; then
        echo ""
        echo -e "${BLUE}Primeiros bytes da resposta:${NC}"
        echo "$BODY" | head -5
    fi
else
    echo -e "${YELLOW}⚠️  Resposta inesperada (HTTP $HTTP_CODE)${NC}"
    if [ -n "$BODY" ]; then
        echo ""
        echo -e "${BLUE}Resposta:${NC}"
        echo "$BODY" | head -10
    fi
    EXIT_CODE=1
fi

echo ""

# Teste 3: Testar SSE (Server-Sent Events) - apenas se não houver 404
if [ "$HTTP_CODE" != "404" ]; then
    echo "3️⃣ Testando conexão SSE..."
    echo "   (Isso pode levar alguns segundos...)"
    echo ""
    
    TIMEOUT=10
    SSE_OUTPUT=$(curl -N -s \
      -H "Accept: text/event-stream" \
      -H "Cache-Control: no-cache" \
      --max-time "$TIMEOUT" \
      "$URL" 2>&1 | head -20 || true)
    
    if [ -n "$SSE_OUTPUT" ]; then
        echo -e "${GREEN}✅ Recebendo eventos SSE:${NC}"
        echo "$SSE_OUTPUT"
    else
        echo -e "${YELLOW}⚠️  Nenhum evento SSE recebido no timeout de ${TIMEOUT}s${NC}"
        echo "   Isso pode ser normal se o servidor não enviar eventos imediatamente"
    fi
    
    echo ""
    echo ""
else
    echo "3️⃣ Teste SSE pulado (webhook não está ativo)"
    echo ""
fi

# Teste 4: Verificar headers CORS
echo "4️⃣ Verificando headers CORS..."
CORS_HEADERS=$(curl -s -I -X OPTIONS \
  -H "Origin: https://phdstudio.com.br" \
  -H "Access-Control-Request-Method: GET" \
  "$URL" 2>&1 | grep -i "access-control" || echo "Nenhum header CORS encontrado")

if [ -z "$CORS_HEADERS" ] || echo "$CORS_HEADERS" | grep -q "Nenhum"; then
    echo -e "${YELLOW}⚠️  Headers CORS não encontrados${NC}"
    echo "   Isso pode causar problemas em requisições do navegador"
    echo "   Configure CORS no n8n se necessário"
else
    echo -e "${GREEN}✅ Headers CORS encontrados:${NC}"
    echo "$CORS_HEADERS"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Resumo:"
echo ""

if [ "$EXIT_CODE" = "0" ]; then
    echo -e "${GREEN}✅ Webhook está funcionando!${NC}"
    echo "   - Servidor respondendo corretamente"
    echo "   - Pronto para receber requisições SSE"
    echo ""
    echo "💡 Para testar no Postman:"
    echo "   - Método: GET"
    echo "   - URL: $URL"
    echo "   - Headers: Accept: text/event-stream"
else
    echo -e "${RED}❌ Webhook não está ativo${NC}"
    echo ""
    echo "📝 Próximos passos:"
    echo "   1. Acesse: https://n8n.546digitalservices.com"
    echo "   2. Abra o workflow 'google-ads-tool-mcp'"
    echo "   3. Clique no botão 'Active' para ativar o workflow"
    echo "   4. Verifique o path do webhook no nó Webhook"
    echo "   5. Execute este script novamente para verificar"
fi

echo ""
echo "📖 Documentação:"
echo "   - Troubleshooting: docs/TROUBLESHOOTING_N8N_SSE.md"
echo "   - Guia Postman: docs/GUIA_POSTMAN_N8N_SSE.md"
echo "   - Coleção Postman: docs/POSTMAN_COLLECTION_N8N_SSE.json"
echo ""

exit $EXIT_CODE
