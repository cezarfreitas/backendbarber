# Dockerfile básico para Barbearia SaaS API
FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN npm install -g pnpm && \
    pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the server
RUN pnpm run build:server

# Expose port 80
EXPOSE 80

# Start the server
CMD ["node", "dist/server/production.mjs"]
