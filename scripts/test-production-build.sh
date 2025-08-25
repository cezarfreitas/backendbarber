#!/bin/bash

# Teste do build de produção
# Este script verifica se o build do servidor está funcionando corretamente

echo "🔧 Testando build de produção..."

# Limpar build anterior
echo "📦 Limpando build anterior..."
rm -rf dist/

# Fazer build do servidor
echo "🏗️ Fazendo build do servidor..."
pnpm run build:server

# Verificar se o arquivo foi criado
if [ -f "dist/server/production.mjs" ]; then
    echo "✅ production.mjs criado com sucesso!"
    ls -la dist/server/production.mjs
else
    echo "❌ Erro: production.mjs não foi criado!"
    exit 1
fi

# Verificar tamanho do arquivo (deve ter pelo menos 200KB)
file_size=$(stat -c%s "dist/server/production.mjs" 2>/dev/null || stat -f%z "dist/server/production.mjs" 2>/dev/null || echo "0")
min_size=200000  # 200KB

if [ "$file_size" -gt "$min_size" ]; then
    echo "✅ Tamanho do arquivo OK: $file_size bytes"
else
    echo "⚠️ Arquivo muito pequeno: $file_size bytes (esperado > $min_size)"
fi

# Verificar se o arquivo contém código válido
if grep -q "createServer" dist/server/production.mjs; then
    echo "✅ Arquivo contém código do servidor"
else
    echo "❌ Arquivo não contém código esperado"
    exit 1
fi

echo ""
echo "🎉 Build de produção testado com sucesso!"
echo "🚀 Pronto para deploy no EasyPanel"
echo ""
echo "📝 Para usar no EasyPanel:"
echo "1. Fazer push das alterações"
echo "2. Rebuild no EasyPanel"
echo "3. O arquivo production.mjs será encontrado corretamente"
