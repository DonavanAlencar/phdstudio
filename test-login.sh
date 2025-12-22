#!/bin/bash
echo "Testando login direto na API..."
echo ""

# Testar via Traefik (produção)
echo "1. Via Traefik (produção):"
curl -X POST https://phdstudio.com.br/api/crm/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@phdstudio.com.br","password":"5uAyNqmfYy4ssDN3uPgZYPaY9SrmNrZ"}' \
  2>&1 | jq . 2>/dev/null || curl -X POST https://phdstudio.com.br/api/crm/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@phdstudio.com.br","password":"5uAyNqmfYy4ssDN3uPgZYPaY9SrmNrZ"}' \
  2>&1

echo ""
echo "2. Via localhost (direto):"
curl -X POST http://localhost:3001/api/crm/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@phdstudio.com.br","password":"5uAyNqmfYy4ssDN3uPgZYPaY9SrmNrZ"}' \
  2>&1 | jq . 2>/dev/null || curl -X POST http://localhost:3001/api/crm/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@phdstudio.com.br","password":"5uAyNqmfYy4ssDN3uPgZYPaY9SrmNrZ"}' \
  2>&1
