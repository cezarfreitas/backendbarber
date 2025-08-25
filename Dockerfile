# Dockerfile básico para Barbearia SaaS API
FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the project
RUN npm run build

# Expose port 80
EXPOSE 80

# Start the server
CMD ["node", "dist/server/production.mjs"]
