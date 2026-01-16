FROM node:20-alpine

WORKDIR /app

# Copiar arquivos de dependências da API
COPY api/package.json api/package-lock.json* ./

# Instalar dependências
RUN npm ci --only=production || npm install --only=production

# Copiar código fonte da API
COPY api/. .

# Expor porta
EXPOSE 3001

# Comando para iniciar
CMD ["node", "server.js"]
