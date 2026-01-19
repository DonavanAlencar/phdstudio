#!/bin/bash

# Script para bloquear qualquer tentativa de deploy no Vercel
# Este projeto usa apenas Docker/Docker Compose

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${RED}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${RED}║                                                            ║${NC}"
echo -e "${RED}║  🚫 BLOQUEIO DE DEPLOY NO VERCEL                          ║${NC}"
echo -e "${RED}║                                                            ║${NC}"
echo -e "${RED}║  Este projeto NÃO deve ser publicado no Vercel.          ║${NC}"
echo -e "${RED}║  Use apenas Docker/Docker Compose para deploy.           ║${NC}"
echo -e "${RED}║                                                            ║${NC}"
echo -e "${RED}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Verificar se está tentando fazer deploy no Vercel
if [ -n "$VERCEL" ] || [ -n "$VERCEL_ENV" ] || [ -n "$VERCEL_URL" ]; then
    echo -e "${RED}❌ ERRO: Ambiente Vercel detectado!${NC}"
    echo -e "${YELLOW}Este projeto não suporta deploy no Vercel.${NC}"
    exit 1
fi

# Verificar se o comando vercel está sendo executado
if command -v vercel &> /dev/null; then
    # Verificar se há arquivo .vercel (projeto vinculado)
    if [ -d ".vercel" ] || [ -f ".vercel/project.json" ]; then
        echo -e "${RED}❌ ERRO: Projeto vinculado ao Vercel detectado!${NC}"
        echo -e "${YELLOW}Removendo vinculação...${NC}"
        rm -rf .vercel
        echo -e "${GREEN}✅ Vinculação removida.${NC}"
    fi
fi

# Verificar se há vercel.json
if [ -f "vercel.json" ]; then
    echo -e "${YELLOW}⚠️  Arquivo vercel.json encontrado. Removendo...${NC}"
    rm -f vercel.json
    echo -e "${GREEN}✅ Arquivo vercel.json removido.${NC}"
fi

echo -e "${GREEN}✅ Verificação concluída. Projeto seguro para deploy Docker.${NC}"
exit 0
