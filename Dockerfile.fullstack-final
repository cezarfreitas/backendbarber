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

# Gerar build do cliente e do servidor
RUN npm run build:client && npm run build:server

# Etapa 2 - Produção
FROM node:22-alpine

WORKDIR /app

# Copiar apenas os arquivos essenciais do builder
COPY --from=builder package.json ./
COPY --from=builder node_modules ./node_modules
COPY --from=builder dist ./dist

# Expor a porta usada pelo Express (EasyPanel usa 80)
EXPOSE 80

# Iniciar a aplicação
CMD ["node", "dist/server/production.mjs"]
