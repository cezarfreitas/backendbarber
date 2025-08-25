# 🔧 Correções do Dockerfile

## ❌ Problemas no seu Dockerfile:

1. **Porta incorreta**: 3000 → **deve ser 80**
2. **Arquivo incorreto**: `dist/index.js` → **deve ser `dist/server/production.mjs`**
3. **Health check na porta errada**: localhost:3000 → **deve ser localhost:80**

## ✅ Opções corrigidas:

### 1. **Dockerfile.corrected** (com health check)
```dockerfile
# Exposição na porta 80
EXPOSE 80

# Health check na porta correta
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:80/api/ping || exit 1

# Arquivo correto
CMD ["node", "dist/server/production.mjs"]
```

### 2. **Dockerfile.safe** (SEM health check - RECOMENDADO)
```dockerfile
# Exposição na porta 80
EXPOSE 80

# SEM health check para evitar restart loops
# Arquivo correto
CMD ["node", "dist/server/production.mjs"]
```

### 3. **Dockerfile.ultra-minimal** (mais simples)
```dockerfile
# Build otimizado + servidor básico
RUN pnpm run build:simple
CMD ["node", "dist/server/simple.mjs"]
```

## 🚀 Para EasyPanel:

**RECOMENDADO: Use `Dockerfile.safe`**

**Configuração:**
- Dockerfile: `Dockerfile.safe`
- Port: `80`
- Environment Variables:
  ```
  NODE_ENV=production
  PORT=80
  DB_HOST=server.idenegociosdigitais.com.br
  DB_USER=seu_usuario
  DB_PASSWORD=sua_senha
  DB_NAME=seu_database
  JWT_SECRET=seu_jwt_secret
  ```

## 🔍 Por que seu Dockerfile não funcionava:

1. **Porta 3000**: EasyPanel espera porta 80
2. **dist/index.js**: Este arquivo não existe! O build gera `dist/server/production.mjs`
3. **Health check**: Pode causar restart loops no EasyPanel

## 📋 Teste local:

```bash
# Veja o que o build gera:
pnpm run build:server && ls -R dist

# Resultado esperado:
# dist/server/production.mjs ← Este é o arquivo correto!
```

**Use o `Dockerfile.safe` - é a opção mais estável para EasyPanel.**
