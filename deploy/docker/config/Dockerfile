# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Argumentos de build para variáveis de ambiente
ARG GEMINI_API_KEY
ARG VITE_EMAILJS_SERVICE_ID
ARG VITE_EMAILJS_TEMPLATE_ID
ARG VITE_EMAILJS_PUBLIC_KEY
ARG VITE_RECIPIENT_EMAIL
ARG VITE_CHAT_WEBHOOK_URL
ARG VITE_CHAT_AUTH_TOKEN
ARG VITE_API_URL
ARG VITE_INSTAGRAM_API_URL
ARG VITE_YOUTUBE_API_KEY
ARG VITE_YOUTUBE_PLAYLIST_ID
ARG VITE_YOUTUBE_CHANNEL_ID

# Copiar arquivos de dependências
COPY package.json package-lock.json ./

# Instalar dependências (incluindo devDependencies para o build)
# NODE_ENV não é definido aqui para garantir que devDependencies sejam instaladas
# Tenta npm ci primeiro, se falhar usa npm install
RUN npm ci || npm install

# Copiar código fonte
COPY . .

# Criar arquivo .env.local com todas as variáveis de ambiente
RUN echo "GEMINI_API_KEY=${GEMINI_API_KEY:-}" > .env.local && \
    echo "VITE_EMAILJS_SERVICE_ID=${VITE_EMAILJS_SERVICE_ID:-}" >> .env.local && \
    echo "VITE_EMAILJS_TEMPLATE_ID=${VITE_EMAILJS_TEMPLATE_ID:-}" >> .env.local && \
    echo "VITE_EMAILJS_PUBLIC_KEY=${VITE_EMAILJS_PUBLIC_KEY:-}" >> .env.local && \
    echo "VITE_RECIPIENT_EMAIL=${VITE_RECIPIENT_EMAIL:-}" >> .env.local && \
    echo "VITE_CHAT_WEBHOOK_URL=${VITE_CHAT_WEBHOOK_URL:-}" >> .env.local && \
    echo "VITE_CHAT_AUTH_TOKEN=${VITE_CHAT_AUTH_TOKEN:-}" >> .env.local && \
    echo "VITE_API_URL=${VITE_API_URL:-https://phdstudio.com.br/api}" >> .env.local && \
    echo "VITE_INSTAGRAM_API_URL=${VITE_INSTAGRAM_API_URL:-https://phdstudio.com.br/api/instagram}" >> .env.local && \
    echo "VITE_YOUTUBE_API_KEY=${VITE_YOUTUBE_API_KEY:-}" >> .env.local && \
    echo "VITE_YOUTUBE_PLAYLIST_ID=${VITE_YOUTUBE_PLAYLIST_ID:-}" >> .env.local && \
    echo "VITE_YOUTUBE_CHANNEL_ID=${VITE_YOUTUBE_CHANNEL_ID:-}" >> .env.local

# Build da aplicação
RUN npm run build

# Stage 2: Production
FROM nginx:alpine

# Copiar build da aplicação
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuração inicial do nginx (será substituída após obter certificados)
COPY deploy/docker/config/nginx-init.conf /etc/nginx/conf.d/default.conf

# Expor portas 80 (HTTP) e 443 (HTTPS)
EXPOSE 80 443

# Comando para iniciar nginx
CMD ["nginx", "-g", "daemon off;"]
