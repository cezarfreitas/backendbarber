# Use Node.js 22 LTS (Alpine for smaller image size)
FROM node:22-alpine AS base

# Install pnpm globally
RUN npm install -g pnpm@10.14.0

# Set working directory
WORKDIR /app

# Install system dependencies needed for building
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    && ln -sf python3 /usr/bin/python

# ================================
# Dependencies stage
# ================================
FROM base AS deps

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies (including devDependencies for build)
RUN pnpm install --frozen-lockfile

# ================================
# Build stage  
# ================================
FROM base AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

# Copy only necessary source files for server build
COPY server/ ./server/
COPY shared/ ./shared/
COPY vite.config.server.ts ./
COPY tsconfig.json ./

# Build only the server (backend API)
RUN pnpm run build:server

# Verify build output
RUN ls -la dist/server/ && \
    test -f dist/server/production.mjs || (echo "Build failed: production.mjs not found" && exit 1)

# ================================
# Production stage
# ================================
FROM node:22-alpine AS production

# Install pnpm and curl (needed for health check)
RUN npm install -g pnpm@10.14.0 && \
    apk add --no-cache curl

# Set working directory
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install ALL dependencies (not just production) to ensure cors is available
RUN pnpm install --frozen-lockfile && \
    pnpm store prune && \
    rm -rf ~/.pnpm-store

# Copy built application from builder stage
COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist

# Copy shared folder if needed at runtime
COPY --chown=nextjs:nodejs shared ./shared

# Create .env file with default values (can be overridden by environment variables)
RUN echo "NODE_ENV=production" > .env && \
    echo "PORT=80" >> .env && \
    chown nextjs:nodejs .env

# Set user
USER nextjs

# Expose port
EXPOSE 80

# Health check using curl (installed earlier as root)
# Increased start-period and timeout for better reliability on EasyPanel
HEALTHCHECK --interval=30s --timeout=15s --start-period=120s --retries=5 \
    CMD curl -f -s http://localhost:80/api/ping || curl -f -s http://0.0.0.0:80/api/ping || exit 1

# Set environment variables
ENV NODE_ENV=production
ENV PORT=80

# Start the application
CMD ["node", "dist/server/production.mjs"]
