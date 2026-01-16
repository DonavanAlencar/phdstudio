#!/bin/bash
# Script para testar a API PHD Products
set -euo pipefail

API_URL="${API_URL:-http://localhost:3001}"
API_KEY="${PHD_API_KEY:-}"

if [ -z "$API_KEY" ]; then
    echo "Defina a variável de ambiente PHD_API_KEY antes de rodar os testes."
    exit 1
fi

echo "🧪 Testando API PHD Products"
echo "================================"
echo ""

# Teste 1: Health Check
echo "1️⃣  Health Check..."
response=$(curl -s -w "\nHTTP_CODE:%{http_code}" "${API_URL}/health")
http_code=$(echo "$response" | grep "HTTP_CODE" | cut -d: -f2)
body=$(echo "$response" | sed '/HTTP_CODE/d')

if [ "$http_code" = "200" ]; then
    echo "✅ Health check OK"
    echo "$body" | python3 -m json.tool 2>/dev/null || echo "$body"
else
    echo "❌ Health check falhou (HTTP $http_code)"
    echo "$body"
fi
echo ""

# Teste 2: Listar Produtos
echo "2️⃣  Listar Todos os Produtos..."
response=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X GET "${API_URL}/api/phd/v1/products" \
  -H "X-PHD-API-KEY: ${API_KEY}")
http_code=$(echo "$response" | grep "HTTP_CODE" | cut -d: -f2)
body=$(echo "$response" | sed '/HTTP_CODE/d')

if [ "$http_code" = "200" ]; then
    echo "✅ Listagem OK"
    count=$(echo "$body" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('count', 0))" 2>/dev/null)
    echo "📊 Total de produtos: $count"
    echo "$body" | python3 -m json.tool 2>/dev/null | head -40 || echo "$body" | head -20
else
    echo "❌ Listagem falhou (HTTP $http_code)"
    echo "$body"
fi
echo ""

# Teste 3: Obter Produto por ID
echo "3️⃣  Obter Produto ID 1..."
response=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X GET "${API_URL}/api/phd/v1/products/1" \
  -H "X-PHD-API-KEY: ${API_KEY}")
http_code=$(echo "$response" | grep "HTTP_CODE" | cut -d: -f2)
body=$(echo "$response" | sed '/HTTP_CODE/d')

if [ "$http_code" = "200" ]; then
    echo "✅ Produto encontrado"
    echo "$body" | python3 -m json.tool 2>/dev/null || echo "$body"
else
    echo "❌ Produto não encontrado (HTTP $http_code)"
    echo "$body"
fi
echo ""

# Teste 4: Sem API Key (deve falhar)
echo "4️⃣  Teste sem API Key (deve retornar 401)..."
response=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X GET "${API_URL}/api/phd/v1/products")
http_code=$(echo "$response" | grep "HTTP_CODE" | cut -d: -f2)
body=$(echo "$response" | sed '/HTTP_CODE/d')

if [ "$http_code" = "401" ]; then
    echo "✅ Autenticação funcionando (retornou 401 como esperado)"
else
    echo "⚠️  Esperado 401, recebido HTTP $http_code"
fi
echo "$body" | head -5
echo ""

echo "================================"
echo "✅ Testes concluídos!"
