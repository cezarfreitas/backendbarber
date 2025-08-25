#!/bin/bash

# Script para verificar se as correções de deadlock estão funcionando

echo "🔍 Verificando correções de deadlock MySQL..."

# Verificar se o build funciona
echo "📦 1. Testando build..."
rm -rf dist/
if pnpm run build:server > /dev/null 2>&1; then
    echo "✅ Build: OK"
    file_size=$(stat -c%s "dist/server/production.mjs" 2>/dev/null || stat -f%z "dist/server/production.mjs" 2>/dev/null || echo "0")
    echo "✅ Tamanho: ${file_size} bytes (~209KB esperado)"
else
    echo "❌ Build: FALHOU"
    exit 1
fi

# Verificar se a execução forçada foi removida
echo "🔄 2. Verificando remoção de execução forçada..."
if grep -q "await initializeTables();" server/index.ts && grep -q "console.log.*pulando inicialização" server/index.ts; then
    echo "❌ Ainda contém execução forçada em server/index.ts"
    exit 1
elif grep -q "pulando inicialização para evitar conflitos" server/index.ts; then
    echo "✅ Execução forçada removida: OK"
else
    echo "❌ Correção não encontrada em server/index.ts"
    exit 1
fi

# Verificar se retry foi adicionado
echo "🔁 3. Verificando retry para deadlocks..."
if grep -q "executeQueryWithRetry" server/config/init-database.ts && grep -q "ER_LOCK_DEADLOCK" server/config/init-database.ts; then
    echo "✅ Retry para deadlocks: OK"
else
    echo "❌ Retry não encontrado em init-database.ts"
    exit 1
fi

# Verificar verificação de dados existentes
echo "📊 4. Verificando proteção de dados existentes..."
if grep -q "checkDataExists" server/config/init-database.ts && grep -q "Dados já existem.*pulando inserção" server/config/init-database.ts; then
    echo "✅ Verificação de dados existentes: OK"
else
    echo "❌ Verificação de dados não encontrada"
    exit 1
fi

# Verificar se proteção contra execução desnecessária foi adicionada
echo "🛡️ 5. Verificando proteção contra execução desnecessária..."
if grep -q "Dados já existem no banco.*pulando inicialização completa" server/config/init-database.ts; then
    echo "✅ Proteção contra execução desnecessária: OK"
else
    echo "❌ Proteção não encontrada"
    exit 1
fi

# Verificar se curl está no Dockerfile
echo "🔧 6. Verificando Dockerfile..."
if grep -q "apk add --no-cache curl" Dockerfile && grep -q "curl -f http://localhost:80/api/ping" Dockerfile; then
    echo "✅ Health check com curl: OK"
else
    echo "❌ Health check com curl não encontrado"
    exit 1
fi

# Verificar se cors está nas dependencies
echo "📦 7. Verificando dependências..."
if grep -A 10 '"dependencies"' package.json | grep -q '"cors"'; then
    echo "✅ CORS nas dependencies: OK"
else
    echo "❌ CORS não encontrado nas dependencies"
    exit 1
fi

echo ""
echo "🎉 TODAS AS CORREÇÕES VERIFICADAS COM SUCESSO!"
echo ""
echo "🚀 Ready for EasyPanel deployment:"
echo "1. Push code changes (button at top of interface)"
echo "2. Force rebuild on EasyPanel"
echo "3. Container should start without deadlocks"
echo "4. Test endpoints:"
echo "   • https://ide-barber-back.jzo3qo.easypanel.host/api/ping"
echo "   • https://ide-barber-back.jzo3qo.easypanel.host/api/docs"
echo "   • https://ide-barber-back.jzo3qo.easypanel.host/api/diretorio/barbearias/todas"
echo ""
echo "✅ Deadlock issues should be resolved!"
