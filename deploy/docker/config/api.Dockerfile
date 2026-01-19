FROM node:20-alpine

WORKDIR /app

# Copiar arquivos de dependências da API
COPY backend/package.json backend/package-lock.json* ./

# Instalar dependências
RUN npm ci --only=production || npm install --only=production

# Copiar código fonte da API
COPY backend/. .

# Expor porta
EXPOSE 3001

# Comando para iniciar
CMD ["node", "server.js"]
