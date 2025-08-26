# Dockerfile para projeto Fullstack (Node + Express + Vite)
# Etapa 1 - Build
FROM node:22-alpine AS builder

# Criar diretório de trabalho
WORKDIR /app

# Copiar package.json e instalar dependências
COPY package.json ./
RUN npm install

# Copiar todo o restante do código
COPY . .

# Build somente do servidor (backend)
RUN npm run build:server

# Etapa 2 - Produção
FROM node:22-alpine

WORKDIR /app

# Utilitários para healthcheck
RUN apk add --no-cache curl

# Copiar apenas os arquivos essenciais do builder
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Expor a porta usada pelo Express (8001 em produção)
EXPOSE 8001

# Iniciar a aplicação
ENV NODE_ENV=production
CMD ["node", "dist/server/production.mjs"]
