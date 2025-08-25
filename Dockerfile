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

# Install all dependencies (including devDependencies for build)
RUN pnpm install --frozen-lockfile

# ================================
# Build stage  
# ================================
FROM base AS builder

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm run build

# ================================
# Production stage
# ================================
FROM node:22-alpine AS production

# Install pnpm in production image
RUN npm install -g pnpm@10.14.0

# Set working directory
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install only production dependencies
RUN pnpm install --prod --frozen-lockfile && \
    pnpm store prune && \
    rm -rf ~/.pnpm-store

# Copy built application from builder stage
COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist

# Copy any additional necessary files
COPY --chown=nextjs:nodejs server/config ./server/config
COPY --chown=nextjs:nodejs shared ./shared

# Create .env file with default values (can be overridden by environment variables)
RUN echo "NODE_ENV=production" > .env && \
    echo "PORT=3000" >> .env && \
    chown nextjs:nodejs .env

# Set user
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "fetch('http://localhost:3000/api/ping').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Start the application
CMD ["node", "dist/server/production.mjs"]
