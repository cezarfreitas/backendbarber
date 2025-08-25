# Simple Dockerfile for Barbearia SaaS API
FROM node:22-alpine

# Install basic tools
RUN apk add --no-cache curl

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install pnpm and dependencies
RUN npm install -g pnpm && \
    pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the server
RUN pnpm run build:server

# Expose port
EXPOSE 80

# Simple health check
HEALTHCHECK --interval=60s --timeout=30s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:80/health || exit 1

# Start the server
CMD ["node", "dist/server/production.mjs"]
