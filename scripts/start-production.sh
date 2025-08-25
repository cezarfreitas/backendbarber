#!/bin/bash

echo "🚀 Iniciando API Barbearia em modo produção..."
echo "=============================================="

# Build da aplicação servidor
echo "📦 Building server application..."
pnpm run build:server

# Verificar se o build foi criado
if [ ! -f "dist/server/production.mjs" ]; then
    echo "❌ Build failed: production.mjs not found"
    exit 1
fi

echo "✅ Build completed successfully"

# Configurar variáveis de ambiente de produção
export NODE_ENV=production
export PORT=80

# Iniciar a aplicação
echo "🔥 Starting production server on port 80..."
node dist/server/production.mjs

echo "=============================================="
echo "🎉 API Barbearia started in production mode!"
echo "🔧 API: http://localhost:80/api"
echo "📚 Docs: http://localhost:80/api/docs"
echo "🌐 Health: http://localhost:80/api/ping"
