#!/bin/bash

echo "🔄 Restarting Barbearia API Service..."
echo "====================================="

# Parar processos existentes na porta 80
echo "🛑 Stopping existing processes on port 80..."
lsof -ti:80 | xargs kill -9 2>/dev/null || echo "No processes found on port 80"

# Aguardar um momento
sleep 2

# Build se necessário
if [ ! -f "dist/server/production.mjs" ]; then
    echo "📦 Building server application..."
    pnpm run build:server
fi

# Definir variáveis de ambiente
export NODE_ENV=production
export PORT=80
export PING_MESSAGE="API Barbearia SaaS Online!"

# Iniciar o serviço
echo "🚀 Starting service..."
node dist/server/production.mjs &

# Obter o PID do processo
SERVICE_PID=$!
echo "✅ Service started with PID: $SERVICE_PID"

# Aguardar um pouco e testar
sleep 5

# Testar se o serviço está respondendo
echo "🔍 Testing service..."
curl -f http://localhost:80/api/ping || echo "❌ Service health check failed"

echo "====================================="
echo "🎉 Service restart completed!"
echo "📊 Check status: curl http://localhost:80/api/ping"
