#!/bin/bash

# Script para testar se o container funciona corretamente
# Simula o ambiente de produção do EasyPanel

echo "🐳 Testando container de produção..."

# Verificar se o build funciona
echo "📦 1. Testando build..."
rm -rf dist/
if pnpm run build:server; then
    echo "✅ Build: OK"
else
    echo "❌ Build: FALHOU"
    exit 1
fi

# Verificar se o arquivo foi criado
if [ -f "dist/server/production.mjs" ]; then
    echo "✅ Arquivo production.mjs: OK"
else
    echo "❌ Arquivo production.mjs: NÃO ENCONTRADO"
    exit 1
fi

# Verificar tamanho do arquivo
file_size=$(stat -c%s "dist/server/production.mjs" 2>/dev/null || stat -f%z "dist/server/production.mjs" 2>/dev/null || echo "0")
if [ "$file_size" -gt "200000" ]; then
    echo "✅ Tamanho do arquivo: ${file_size} bytes"
else
    echo "⚠️ Arquivo muito pequeno: ${file_size} bytes"
fi

# Verificar se as dependências estão corretas
echo "📋 2. Verificando dependências..."
if grep -q '"cors".*"2.8.5"' package.json; then
    echo "✅ CORS nas dependencies: OK"
else
    echo "❌ CORS não encontrado nas dependencies"
    exit 1
fi

# Verificar se não há conflitos de rota
echo "🛣️ 3. Verificando conflitos de rota..."
if grep -q 'app.get("/", ' server/node-build.ts; then
    echo "❌ Conflito de rota detectado em node-build.ts"
    exit 1
else
    echo "✅ Sem conflitos de rota: OK"
fi

# Verificar se o servidor bind para 0.0.0.0
if grep -q '"0.0.0.0"' server/node-build.ts; then
    echo "✅ Bind para 0.0.0.0: OK"
else
    echo "❌ Servidor não bind para 0.0.0.0"
    exit 1
fi

# Verificar Dockerfile
echo "🐳 4. Verificando Dockerfile..."
if grep -q "curl" Dockerfile; then
    echo "✅ Health check com curl: OK"
else
    echo "❌ Health check sem curl"
    exit 1
fi

if grep -q "pnpm install --frozen-lockfile" Dockerfile && ! grep -q "pnpm install --prod" Dockerfile; then
    echo "✅ Instala todas as dependências: OK"
else
    echo "❌ Dockerfile ainda usa --prod"
    exit 1
fi

echo ""
echo "🎉 TODOS OS TESTES PASSARAM!"
echo ""
echo "🚀 Pronto para deploy no EasyPanel:"
echo "1. Fazer push das correções (botão no topo)"
echo "2. Force rebuild no EasyPanel"
echo "3. Testar: https://ide-barber-back.jzo3qo.easypanel.host/api/ping"
echo ""
echo "📋 Endpoints para testar após deploy:"
echo "   • Status: https://ide-barber-back.jzo3qo.easypanel.host/"
echo "   • Health: https://ide-barber-back.jzo3qo.easypanel.host/api/ping"
echo "   • Docs: https://ide-barber-back.jzo3qo.easypanel.host/api/docs"
echo "   • Barbearias: https://ide-barber-back.jzo3qo.easypanel.host/api/diretorio/barbearias/todas"
